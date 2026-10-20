import { isDirectusError } from '@directus/errors';
import type { Accountability } from '@directus/types';
import { Router } from 'express';
import Joi from 'joi';
import {
	Client,
	EqualityFilter,
	InappropriateAuthError,
	InsufficientAccessError,
	InvalidCredentialsError as LDAPInvalidCredentialsError,
} from 'ldapts';
import type { ClientOptions, Entry } from 'ldapts';
import getDatabase from '../../database/index.js';
import emitter from '../../emitter.js';
import env from '../../env.js';
import {
	ErrorCode,
	InvalidCredentialsError,
	InvalidPayloadError,
	InvalidProviderError,
	InvalidProviderConfigError,
	ServiceUnavailableError,
	UnexpectedResponseError,
} from '@directus/errors';
import logger from '../../logger.js';
import { respond } from '../../middleware/respond.js';
import { AuthenticationService } from '../../services/authentication.js';
import { UsersService } from '../../services/users.js';
import type { AuthDriverOptions, User } from '../../types/index.js';
import asyncHandler from '../../utils/async-handler.js';
import { getIPFromReq } from '../../utils/get-ip-from-req.js';
import { getMilliseconds } from '../../utils/get-milliseconds.js';
import { AuthDriver } from '../auth.js';

interface UserInfo {
	dn: string;
	uid?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	userAccountControl: number;
}

type SearchScope = 'base' | 'one' | 'sub';

// 0x2: ACCOUNTDISABLE
// 0x10: LOCKOUT
// 0x800000: PASSWORD_EXPIRED
const INVALID_ACCOUNT_FLAGS = 0x800012;

export class LDAPAuthDriver extends AuthDriver {
	bindClient: Client;
	usersService: UsersService;
	config: Record<string, any>;

	constructor(options: AuthDriverOptions, config: Record<string, any>) {
		super(options, config);

		const { bindDn, bindPassword, userDn, provider, clientUrl } = config;

		if (bindDn === undefined || bindPassword === undefined || !userDn || !provider || !clientUrl) {
			// CaseFusion: ldapts has no Unix socket support, so AUTH_<PROVIDER>_CLIENT_SOCKET_PATH alone is not enough
			if (!clientUrl && config['client']?.socketPath) logger.error('[LDAP] client.socketPath is not supported');
			logger.error('Invalid provider config');
			throw new InvalidProviderConfigError({ provider });
		}

		this.config = config;
		this.bindClient = new Client(this.getClientOptions());

		this.usersService = new UsersService({ knex: this.knex, schema: this.schema });
	}

	private getClientOptions(): ClientOptions {
		const clientConfig = typeof this.config['client'] === 'object' ? this.config['client'] : {};
		const { tlsOptions, timeout, connectTimeout, strictDN } = clientConfig;

		return { url: this.config['clientUrl'], tlsOptions, timeout, connectTimeout, strictDN };
	}

	private async validateBindClient(): Promise<void> {
		const { bindDn, bindPassword, provider } = this.config;

		// ldapts connects per operation, so bind before every lookup made as the bind user
		try {
			await this.bindClient.bind(bindDn, bindPassword);
		} catch (err) {
			const error = handleError(err);

			if (isDirectusError(error, ErrorCode.InvalidCredentials)) {
				logger.warn('Invalid bind user');
				throw new InvalidProviderConfigError({ provider });
			}

			throw error;
		}

		// Healthcheck bind user: it must be able to read its own record
		let entries: Entry[];

		try {
			({ searchEntries: entries } = await this.bindClient.search(bindDn, { scope: 'base' }));
		} catch (err) {
			throw handleError(err);
		}

		if (entries.length === 0) {
			logger.warn('[LDAP] Failed to find bind user record');
			throw new UnexpectedResponseError();
		}
	}

	private async fetchUserInfo(
		baseDn: string,
		filter?: EqualityFilter,
		scope?: SearchScope
	): Promise<UserInfo | undefined> {
		let { firstNameAttribute, lastNameAttribute, mailAttribute } = this.config;

		firstNameAttribute ??= 'givenName';
		lastNameAttribute ??= 'sn';
		mailAttribute ??= 'mail';

		let entries: Entry[];

		try {
			// Search for the user in LDAP by filter (ldapjs defaulted to a base-scope search, ldapts to sub)
			({ searchEntries: entries } = await this.bindClient.search(baseDn, {
				...(filter ? { filter } : {}),
				scope: scope ?? 'base',
				attributes: ['uid', firstNameAttribute, lastNameAttribute, mailAttribute, 'userAccountControl'],
			}));
		} catch (err) {
			throw handleError(err);
		}

		const entry = entries[0];

		if (!entry) return undefined;

		const user: UserInfo = {
			dn: entry.dn,
			userAccountControl: Number(getEntryValue(entry['userAccountControl']) ?? 0),
		};

		const firstName = getEntryValue(entry[firstNameAttribute]);
		if (firstName) user.firstName = firstName;

		const lastName = getEntryValue(entry[lastNameAttribute]);
		if (lastName) user.lastName = lastName;

		const email = getEntryValue(entry[mailAttribute]);
		if (email) user.email = email;

		const uid = getEntryValue(entry['uid']);
		if (uid) user.uid = uid;

		return user;
	}

	private async fetchUserGroups(baseDn: string, filter?: EqualityFilter, scope?: SearchScope): Promise<string[]> {
		let entries: Entry[];

		try {
			// Search for the user info in LDAP by group attribute
			({ searchEntries: entries } = await this.bindClient.search(baseDn, {
				...(filter ? { filter } : {}),
				scope: scope ?? 'base',
				attributes: ['cn'],
			}));
		} catch (err) {
			throw handleError(err);
		}

		return entries.flatMap((entry) => toStrings(entry['cn']));
	}

	private async fetchUserId(userDn: string): Promise<string | undefined> {
		const user = await this.knex
			.select('id')
			.from('directus_users')
			.orWhereRaw('LOWER(??) = ?', ['external_identifier', userDn.toLowerCase()])
			.first();

		return user?.id;
	}

	async getUserID(payload: Record<string, any>): Promise<string> {
		if (!payload['identifier']) {
			throw new InvalidCredentialsError();
		}

		await this.validateBindClient();

		const { userDn, userScope, userAttribute, groupDn, groupScope, groupAttribute, defaultRoleId } = this.config;

		const userInfo = await this.fetchUserInfo(
			userDn,
			new EqualityFilter({
				attribute: userAttribute ?? 'cn',
				value: payload['identifier'],
			}),
			userScope ?? 'one'
		);

		if (!userInfo?.dn) {
			throw new InvalidCredentialsError();
		}

		let userRole;

		if (groupDn) {
			const userGroups = await this.fetchUserGroups(
				groupDn,
				new EqualityFilter({
					attribute: groupAttribute ?? 'member',
					value: groupAttribute?.toLowerCase() === 'memberuid' && userInfo.uid ? userInfo.uid : userInfo.dn,
				}),
				groupScope ?? 'one'
			);

			if (userGroups.length) {
				userRole = await this.knex
					.select('id')
					.from('directus_roles')
					.whereRaw(`LOWER(??) IN (${userGroups.map(() => '?')})`, [
						'name',
						...userGroups.map((group) => group.toLowerCase()),
					])
					.first();
			}
		}

		const userId = await this.fetchUserId(userInfo.dn);

		if (userId) {
			// Run hook so the end user has the chance to augment the
			// user that is about to be updated
			let updatedUserPayload = await emitter.emitFilter(
				`auth.update`,
				{},
				{ identifier: userInfo.dn, provider: this.config['provider'], providerPayload: { userInfo, userRole } },
				{ database: getDatabase(), schema: this.schema, accountability: null }
			);

			// Only sync roles if the AD groups are configured
			if (groupDn) {
				updatedUserPayload = { role: userRole?.id ?? defaultRoleId ?? null, ...updatedUserPayload };
			}

			// Update user to update properties that might have changed
			await this.usersService.updateOne(userId, updatedUserPayload);

			return userId;
		}

		if (!userInfo) {
			throw new InvalidCredentialsError();
		}

		const userPayload = {
			provider: this.config['provider'],
			first_name: userInfo.firstName,
			last_name: userInfo.lastName,
			email: userInfo.email,
			external_identifier: userInfo.dn,
			role: userRole?.id ?? defaultRoleId,
		};

		// Run hook so the end user has the chance to augment the
		// user that is about to be created
		const updatedUserPayload = await emitter.emitFilter(
			`auth.create`,
			userPayload,
			{ identifier: userInfo.dn, provider: this.config['provider'], providerPayload: { userInfo, userRole } },
			{ database: getDatabase(), schema: this.schema, accountability: null }
		);

		try {
			await this.usersService.createOne(updatedUserPayload);
		} catch (e) {
			if (isDirectusError(e, ErrorCode.RecordNotUnique)) {
				logger.warn(e, '[LDAP] Failed to register user. User not unique');
				throw new InvalidProviderError();
			}

			throw e;
		}

		return (await this.fetchUserId(userInfo.dn)) as string;
	}

	async verify(user: User, password?: string): Promise<void> {
		if (!user.external_identifier || !password) {
			throw new InvalidCredentialsError();
		}

		const client = new Client(this.getClientOptions());

		try {
			await client.bind(user.external_identifier, password);
		} catch (err) {
			throw handleError(err);
		} finally {
			await client.unbind().catch(() => undefined);
		}
	}

	override async login(user: User, payload: Record<string, any>): Promise<void> {
		await this.verify(user, payload['password']);
	}

	override async refresh(user: User): Promise<void> {
		await this.validateBindClient();

		const userInfo = await this.fetchUserInfo(user.external_identifier!);

		if (userInfo?.userAccountControl && userInfo.userAccountControl & INVALID_ACCOUNT_FLAGS) {
			throw new InvalidCredentialsError();
		}
	}
}

const handleError = (e: unknown) => {
	if (
		e instanceof InappropriateAuthError ||
		e instanceof LDAPInvalidCredentialsError ||
		e instanceof InsufficientAccessError
	) {
		return new InvalidCredentialsError();
	}

	return new ServiceUnavailableError({
		service: 'ldap',
		reason: `Service returned unexpected error: ${e instanceof Error ? e.message : String(e)}`,
	});
};

const toStrings = (value: Entry[string] | undefined): string[] => {
	if (value === undefined) return [];
	return (Array.isArray(value) ? value : [value]).map((v) => (Buffer.isBuffer(v) ? v.toString() : v));
};

const getEntryValue = (value: Entry[string] | undefined): string | undefined => {
	return toStrings(value)[0];
};

export function createLDAPAuthRouter(provider: string): Router {
	const router = Router();

	const loginSchema = Joi.object({
		identifier: Joi.string().required(),
		password: Joi.string().required(),
		mode: Joi.string().valid('cookie', 'json'),
		otp: Joi.string(),
	}).unknown();

	router.post(
		'/',
		asyncHandler(async (req, res, next) => {
			const accountability: Accountability = {
				ip: getIPFromReq(req),
				role: null,
			};

			const userAgent = req.get('user-agent');
			if (userAgent) accountability.userAgent = userAgent;

			const origin = req.get('origin');
			if (origin) accountability.origin = origin;

			const authenticationService = new AuthenticationService({
				accountability: accountability,
				schema: req.schema,
			});

			const { error } = loginSchema.validate(req.body);

			if (error) {
				throw new InvalidPayloadError({ reason: error.message });
			}

			const mode = req.body.mode || 'json';

			const { accessToken, refreshToken, expires } = await authenticationService.login(
				provider,
				req.body,
				req.body?.otp
			);

			const payload = {
				data: { access_token: accessToken, expires },
			} as Record<string, Record<string, any>>;

			if (mode === 'json') {
				payload['data']!['refresh_token'] = refreshToken;
			}

			if (mode === 'cookie') {
				res.cookie(env['REFRESH_TOKEN_COOKIE_NAME'], refreshToken, {
					httpOnly: true,
					domain: env['REFRESH_TOKEN_COOKIE_DOMAIN'],
					maxAge: getMilliseconds(env['REFRESH_TOKEN_TTL']),
					secure: env['REFRESH_TOKEN_COOKIE_SECURE'] ?? false,
					sameSite: (env['REFRESH_TOKEN_COOKIE_SAME_SITE'] as 'lax' | 'strict' | 'none') || 'strict',
				});
			}

			res.locals['payload'] = payload;

			return next();
		}),
		respond
	);

	return router;
}
