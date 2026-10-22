// GHSA-7cvf-pxgp-42fc: a manual flow may only be triggered by a user who can read the flow and the items it runs on.
import { getUrl } from '@common/config';
import vendors from '@common/get-dbs-to-test';
import { USER } from '@common/variables';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { SeedCollection, SeedItem, SeedRoleWithPermissions } from './security.seed';

const collection = 'security_7cvf';

const NO_FLOW_READ = { token: 'Security7cvfNoFlowToken', email: 'security-7cvf-no-flow@tests.com' };
const NO_ITEM_READ = { token: 'Security7cvfNoItemToken', email: 'security-7cvf-no-item@tests.com' };
const ALLOWED = { token: 'Security7cvfAllowedToken', email: 'security-7cvf-allowed@tests.com' };

const flowIds: Record<string, string> = {};
const itemIds: Record<string, any> = {};

beforeAll(async () => {
	for (const vendor of vendors) {
		await SeedCollection(vendor, collection, [{ field: 'name', type: 'string' }]);
		const item = await SeedItem(vendor, collection, { name: 'target' });
		itemIds[vendor] = item.id;

		const flow = await request(getUrl(vendor))
			.post('/flows')
			.set('Authorization', `Bearer ${USER.ADMIN.TOKEN}`)
			.send({
				name: 'Security 7cvf manual flow',
				status: 'active',
				trigger: 'manual',
				accountability: 'all',
				options: { collections: [collection] },
			});

		flowIds[vendor] = flow.body.data.id;

		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security 7cvf no flow read',
			...NO_FLOW_READ,
			permissions: [{ collection, action: 'read' }],
		});

		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security 7cvf no item read',
			...NO_ITEM_READ,
			permissions: [
				{ collection: 'directus_flows', action: 'read' },
				{ collection, action: 'read', permissions: { name: { _eq: 'something else' } } },
			],
		});

		await SeedRoleWithPermissions(vendor, {
			roleName: 'Security 7cvf allowed',
			...ALLOWED,
			permissions: [
				{ collection: 'directus_flows', action: 'read' },
				{ collection, action: 'read' },
			],
		});
	}
}, 300_000);

function trigger(vendor: (typeof vendors)[number], token: string | null) {
	const test = request(getUrl(vendor)).post(`/flows/trigger/${flowIds[vendor]}`);
	if (token) test.set('Authorization', `Bearer ${token}`);
	return test.send({ collection, keys: [itemIds[vendor]] });
}

describe('POST /flows/trigger/:id for a manual flow', () => {
	describe('refuses anonymous callers', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect((await trigger(vendor, null)).statusCode).toBe(403);
		});
	});

	describe('refuses users who cannot read the flow', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect((await trigger(vendor, NO_FLOW_READ.token)).statusCode).toBe(403);
		});
	});

	describe('refuses users who cannot read the items', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect((await trigger(vendor, NO_ITEM_READ.token)).statusCode).toBe(403);
		});
	});

	describe('runs for users who can read both', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect([200, 204]).toContain((await trigger(vendor, ALLOWED.token)).statusCode);
		});
	});

	describe('runs for admins', () => {
		it.each(vendors)('%s', async (vendor) => {
			expect([200, 204]).toContain((await trigger(vendor, USER.ADMIN.TOKEN)).statusCode);
		});
	});
});
