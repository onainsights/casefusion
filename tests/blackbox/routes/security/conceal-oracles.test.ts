// Values a role may not see must not come back through search, aggregates or aliases.
// GHSA-7wq3-jr35-275c (search on non-permitted fields), GHSA-8jpw-gpr4-8cmh (search on concealed fields),
// GHSA-38hg-ww64-rrwc (aggregates on concealed fields), GHSA-p8v3-m643-4xqx (aliases of concealed fields), and
// sorting, which orders items by a value the role cannot see.
import { getUrl } from '@common/config';
import vendors from '@common/get-dbs-to-test';
import { USER } from '@common/variables';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { SeedCollection, SeedItem, SeedRoleWithPermissions } from './security.seed';

const collection = 'security_conceal';

const READER = { token: 'SecurityConcealReaderToken', email: 'security-conceal-reader@tests.com' };

const item = { name: 'visible', secret: 'swordfish', hidden_note: 'marmalade', code: 4242 };

beforeAll(async () => {
	for (const vendor of vendors) {
		await SeedCollection(vendor, collection, [
			{ field: 'name', type: 'string' },
			{ field: 'secret', type: 'string', meta: { special: ['conceal'] } },
			{ field: 'hidden_note', type: 'string' },
			{ field: 'code', type: 'integer' },
		]);

		await SeedItem(vendor, collection, item);

		// Reads `secret` (concealed) but not `hidden_note` or `code`
		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security conceal reader',
			...READER,
			permissions: [{ collection, action: 'read', fields: ['id', 'name', 'secret'] }],
		});
	}
}, 300_000);

function get(vendor: (typeof vendors)[number], query: Record<string, any>) {
	return request(getUrl(vendor))
		.get(`/items/${collection}`)
		.query(query)
		.set('Authorization', `Bearer ${READER.token}`);
}

describe('search', () => {
	describe('does not match a concealed field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await get(vendor, { search: 'swordf' });

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual([]);
		});
	});

	describe('does not match fields the role cannot read', () => {
		it.each(vendors)('%s', async (vendor) => {
			const text = await get(vendor, { search: 'marmal' });
			const number = await get(vendor, { search: '4242' });

			expect(text.statusCode).toBe(200);
			expect(text.body.data).toEqual([]);
			expect(number.statusCode).toBe(200);
			expect(number.body.data).toEqual([]);
		});
	});

	describe('filter_count does not match fields the role cannot read or concealed fields', () => {
		it.each(vendors)('%s', async (vendor) => {
			const hidden = await get(vendor, { search: 'marmal', meta: 'filter_count', limit: 0 });
			const concealed = await get(vendor, { search: 'swordf', meta: 'filter_count', limit: 0 });
			const readable = await get(vendor, { search: 'visib', meta: 'filter_count', limit: 0 });

			expect(hidden.body.meta.filter_count).toBe(0);
			expect(concealed.body.meta.filter_count).toBe(0);
			expect(readable.body.meta.filter_count).toBe(1);
		});
	});

	describe('still matches readable fields', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await get(vendor, { search: 'VISIB', fields: 'name' });

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual([{ name: 'visible' }]);
		});
	});

	describe('still matches every field for admins, except concealed ones', () => {
		it.each(vendors)('%s', async (vendor) => {
			const hidden = await request(getUrl(vendor))
				.get(`/items/${collection}`)
				.query({ search: 'marmal', fields: 'name' })
				.set('Authorization', `Bearer ${USER.ADMIN.TOKEN}`);

			const concealed = await request(getUrl(vendor))
				.get(`/items/${collection}`)
				.query({ search: 'swordf', fields: 'name' })
				.set('Authorization', `Bearer ${USER.ADMIN.TOKEN}`);

			expect(hidden.body.data).toEqual([{ name: 'visible' }]);
			expect(concealed.body.data).toEqual([]);
		});
	});
});

describe('aggregate', () => {
	describe('refuses min and max on a concealed field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const max = await get(vendor, { 'aggregate[max]': 'secret' });
			const min = await get(vendor, { 'aggregate[min]': 'secret', 'groupBy[]': 'id' });

			expect(max.statusCode).toBe(403);
			expect(min.statusCode).toBe(403);
			expect(JSON.stringify(max.body)).not.toContain('swordfish');
			expect(JSON.stringify(min.body)).not.toContain('swordfish');
		});
	});

	describe('still counts a concealed field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await get(vendor, { 'aggregate[count]': 'secret' });

			expect(response.statusCode).toBe(200);
			expect(Number(response.body.data[0].count.secret)).toBe(1);
		});
	});
});

describe('alias', () => {
	describe('refuses an alias of a concealed field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await get(vendor, { fields: 'x', alias: JSON.stringify({ x: 'secret' }) });

			expect(response.statusCode).toBe(403);
			expect(JSON.stringify(response.body)).not.toContain('swordfish');
		});
	});

	describe('refuses an alias of the password hash', () => {
		it.each(vendors)('%s', async (vendor) => {
			const list = await request(getUrl(vendor))
				.get('/users')
				.query({ fields: 'x', alias: JSON.stringify({ x: 'password' }) })
				.set('Authorization', `Bearer ${USER.APP_ACCESS.TOKEN}`);

			const me = await request(getUrl(vendor))
				.get('/users/me')
				.query({ fields: 'x', alias: JSON.stringify({ x: 'password' }) })
				.set('Authorization', `Bearer ${USER.APP_ACCESS.TOKEN}`);

			expect(list.statusCode).toBe(403);
			expect(JSON.stringify(list.body)).not.toContain('$argon2');
			expect(JSON.stringify(me.body)).not.toContain('$argon2');
		});
	});

	describe('still allows an alias of a readable field', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await get(vendor, { fields: 'x', alias: JSON.stringify({ x: 'name' }) });

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual([{ x: 'visible' }]);
		});
	});
});

describe('sort', () => {
	describe('refuses fields the role cannot read', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect((await get(vendor, { sort: 'hidden_note' })).statusCode).toBe(403);
			expect((await get(vendor, { sort: '-code' })).statusCode).toBe(403);
		});
	});

	describe('refuses concealed fields', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect((await get(vendor, { sort: 'secret' })).statusCode).toBe(403);

			const users = await request(getUrl(vendor))
				.get('/users')
				.query({ sort: 'password' })
				.set('Authorization', `Bearer ${USER.APP_ACCESS.TOKEN}`);

			expect(users.statusCode).toBe(403);
		});
	});

	describe('still sorts by readable fields', () => {
		it.each(vendors)('%s', async (vendor) => {
			const response = await get(vendor, { sort: '-name', fields: 'name' });

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual([{ name: 'visible' }]);
		});
	});
});
