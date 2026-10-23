import { getUrl } from '@common/config';
import { CreateRole, CreateUser } from '@common/functions';
import { USER } from '@common/variables';
import type { Vendor } from '@common/get-dbs-to-test';
import request from 'supertest';

export type PermissionSeed = {
	collection: string;
	action: 'create' | 'read' | 'update' | 'delete' | 'share';
	fields?: string[];
	permissions?: Record<string, any>;
};

function asTestsFlow(test: request.Test) {
	return test.set('Authorization', `Bearer ${USER.TESTS_FLOW.TOKEN}`);
}

function expectOk(response: request.Response, what: string) {
	if (response.statusCode >= 300) {
		throw new Error(`${what} failed (${response.statusCode}): ${JSON.stringify(response.body)}`);
	}

	return response.body.data;
}

/**
 * Create `collection` afresh (dropping a copy left by an earlier run) with an integer primary key and the given fields,
 * in one request. Throws when the API refuses, so a broken setup fails loudly instead of leaving the tests to run
 * against an empty collection.
 */
export async function SeedCollection(vendor: Vendor, collection: string, fields: Record<string, any>[]) {
	await asTestsFlow(request(getUrl(vendor)).delete(`/collections/${collection}`));

	const response = await asTestsFlow(request(getUrl(vendor)).post('/collections')).send({
		collection,
		meta: {},
		schema: {},
		fields: [
			{
				field: 'id',
				type: 'integer',
				meta: { hidden: true, interface: 'input', readonly: true },
				schema: { is_primary_key: true, has_auto_increment: true },
			},
			...fields.map((field) => ({ meta: {}, schema: {}, ...field })),
		],
	});

	expectOk(response, `Creating collection ${collection}`);
}

/**
 * Create an item as the tests flow user and return it. Throws when the API refuses.
 */
export async function SeedItem(vendor: Vendor, collection: string, item: Record<string, any>) {
	const response = await asTestsFlow(request(getUrl(vendor)).post(`/items/${collection}`)).send(item);

	return expectOk(response, `Creating an item in ${collection}`);
}

/**
 * Create a role with exactly the given permissions, and a user in it that authenticates with `token`. Returns the
 * role id. Safe to call again for the same role name: existing permissions of the role are replaced.
 */
export async function SeedRoleWithPermissions(
	vendor: Vendor,
	options: { roleName: string; token: string; email: string; appAccess?: boolean; permissions: PermissionSeed[] }
): Promise<string> {
	const role = await CreateRole(vendor, {
		name: options.roleName,
		appAccessEnabled: options.appAccess ?? false,
		adminAccessEnabled: false,
	});

	await asTestsFlow(request(getUrl(vendor)).delete('/permissions')).send({
		query: { filter: { role: { _eq: role.id } } },
	});

	if (options.permissions.length > 0) {
		const response = await asTestsFlow(request(getUrl(vendor)).post('/permissions')).send(
			options.permissions.map((permission) => ({
				role: role.id,
				fields: ['*'],
				permissions: {},
				...permission,
			}))
		);

		expectOk(response, `Creating permissions for ${options.roleName}`);
	}

	await CreateUser(vendor, { token: options.token, email: options.email, role: role.id });

	return role.id;
}
