// GHSA-2xcm-7h22-3m66: update and delete by query must not evaluate the filter beyond what the caller may read.
// Otherwise the difference between "nothing matched" and "matched but forbidden" leaks hidden field values.
import { getUrl } from '@common/config';
import { ReadItem } from '@common/functions';
import vendors from '@common/get-dbs-to-test';
import { USER } from '@common/variables';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { SeedCollection, SeedItem, SeedRoleWithPermissions } from './security.seed';

const collection = 'security_2xcm';

const UPDATE_ONLY = { token: 'Security2xcmUpdateOnlyToken', email: 'security-2xcm-update@tests.com' };
const READ_NAME = { token: 'Security2xcmReadNameToken', email: 'security-2xcm-read-name@tests.com' };
const USERS_NO_EMAIL = { token: 'Security2xcmUsersToken', email: 'security-2xcm-users@tests.com' };

beforeAll(async () => {
	for (const vendor of vendors) {
		await SeedCollection(vendor, collection, [
			{ field: 'name', type: 'string' },
			{ field: 'secret', type: 'string' },
		]);

		await SeedItem(vendor, collection, { name: 'first', secret: 'swordfish' });

		// May update and delete, but read nothing
		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security 2xcm update only',
			...UPDATE_ONLY,
			permissions: [
				{ collection, action: 'update', fields: ['name'] },
				{ collection, action: 'delete' },
			],
		});

		// May read `name` but not `secret`, and update/delete everything
		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security 2xcm read name',
			...READ_NAME,
			permissions: [
				{ collection, action: 'read', fields: ['id', 'name'] },
				{ collection, action: 'update', fields: ['name'] },
				{ collection, action: 'delete' },
			],
		});

		// Reads users without their email, and may only update its own row
		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security 2xcm users without email',
			...USERS_NO_EMAIL,
			permissions: [
				{ collection: 'directus_users', action: 'read', fields: ['id', 'first_name'] },
				{
					collection: 'directus_users',
					action: 'update',
					fields: ['first_name'],
					permissions: { id: { _eq: '$CURRENT_USER' } },
				},
			],
		});
	}
}, 300_000);

const callers = [
	{ label: 'public', token: null },
	{ label: 'update without read', token: UPDATE_ONLY.token },
	{ label: 'read without the filtered field', token: READ_NAME.token },
];

function send(test: request.Test, token: string | null) {
	return token ? test.set('Authorization', `Bearer ${token}`) : test;
}

describe.each(callers)('$label', ({ token }) => {
	describe('PATCH by query on a field the caller cannot read', () => {
		it.each(vendors)('%s', async (vendor) => {
			const matching = await send(request(getUrl(vendor)).patch(`/items/${collection}`), token).send({
				query: { filter: { secret: { _starts_with: 's' } } },
				data: { name: 'changed' },
			});

			const notMatching = await send(request(getUrl(vendor)).patch(`/items/${collection}`), token).send({
				query: { filter: { secret: { _starts_with: 'x' } } },
				data: { name: 'changed' },
			});

			expect(matching.statusCode).toBe(403);
			expect(notMatching.statusCode).toBe(403);

			const items = await ReadItem(vendor, { collection, fields: ['name'] });
			expect(items).toEqual([{ name: 'first' }]);
		});
	});

	describe('DELETE by query on a field the caller cannot read', () => {
		it.each(vendors)('%s', async (vendor) => {
			const matching = await send(request(getUrl(vendor)).delete(`/items/${collection}`), token).send({
				query: { filter: { secret: { _starts_with: 's' } } },
			});

			const notMatching = await send(request(getUrl(vendor)).delete(`/items/${collection}`), token).send({
				query: { filter: { secret: { _starts_with: 'x' } } },
			});

			expect(matching.statusCode).toBe(403);
			expect(notMatching.statusCode).toBe(403);

			const items = await ReadItem(vendor, { collection, fields: ['name'] });
			expect(items).toEqual([{ name: 'first' }]);
		});
	});
});

describe('PATCH by query with a search matching only a field the caller cannot read', () => {
	it.each(vendors)('%s', async (vendor) => {
		const response = await request(getUrl(vendor))
			.patch(`/items/${collection}`)
			.set('Authorization', `Bearer ${READ_NAME.token}`)
			.send({ query: { search: 'swordfish' }, data: { name: 'changed' } });

		expect(response.statusCode).toBe(200);
		expect(response.body.data).toEqual([]);

		const items = await ReadItem(vendor, { collection, fields: ['name'] });
		expect(items).toEqual([{ name: 'first' }]);
	});
});

describe('PATCH /users by query on another user\u2019s email', () => {
	it.each(vendors)('%s', async (vendor) => {
		const matching = await request(getUrl(vendor))
			.patch('/users')
			.set('Authorization', `Bearer ${USERS_NO_EMAIL.token}`)
			.send({ query: { filter: { email: { _starts_with: USER.ADMIN.EMAIL.slice(0, 5) } } }, data: {} });

		const notMatching = await request(getUrl(vendor))
			.patch('/users')
			.set('Authorization', `Bearer ${USERS_NO_EMAIL.token}`)
			.send({ query: { filter: { email: { _starts_with: 'zzz' } } }, data: {} });

		expect(matching.statusCode).toBe(403);
		expect(notMatching.statusCode).toBe(403);
	});
});

describe('still allowed', () => {
	describe('PATCH by query on a readable field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await request(getUrl(vendor))
				.patch(`/items/${collection}`)
				.set('Authorization', `Bearer ${READ_NAME.token}`)
				.send({ query: { filter: { name: { _eq: 'first' } } }, data: { name: 'renamed' } });

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual([expect.objectContaining({ name: 'renamed' })]);
		});
	});

	describe('admin PATCH by query on any field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await request(getUrl(vendor))
				.patch(`/items/${collection}`)
				.set('Authorization', `Bearer ${USER.ADMIN.TOKEN}`)
				.send({ query: { filter: { secret: { _eq: 'swordfish' } } }, data: { name: 'first' } });

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual([expect.objectContaining({ name: 'first' })]);
		});
	});
});
