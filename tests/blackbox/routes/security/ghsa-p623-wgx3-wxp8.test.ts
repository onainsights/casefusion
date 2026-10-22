// GHSA-p623-wgx3-wxp8: deleting flows and users must check permissions before the clean-up that runs ahead of the
// delete, so a refused delete changes nothing.
import { getUrl } from '@common/config';
import { CreateUser } from '@common/functions';
import vendors from '@common/get-dbs-to-test';
import { USER } from '@common/variables';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

const state: Record<string, { flow: string; first: string; second: string; user: string; notification: number }> = {};

function asAdmin(test: request.Test) {
	return test.set('Authorization', `Bearer ${USER.ADMIN.TOKEN}`);
}

beforeAll(async () => {
	for (const vendor of vendors) {
		const url = getUrl(vendor);

		const flow = await asAdmin(request(url).post('/flows')).send({
			name: 'Security p623 flow',
			status: 'inactive',
			trigger: 'manual',
			options: { collections: [] },
		});

		const second = await asAdmin(request(url).post('/operations')).send({
			flow: flow.body.data.id,
			name: 'Second',
			key: 'second',
			type: 'log',
			position_x: 20,
			position_y: 1,
			options: { message: 'second' },
		});

		const first = await asAdmin(request(url).post('/operations')).send({
			flow: flow.body.data.id,
			name: 'First',
			key: 'first',
			type: 'log',
			position_x: 1,
			position_y: 1,
			options: { message: 'first' },
			resolve: second.body.data.id,
		});

		const user = await CreateUser(vendor, {
			token: 'SecurityP623Token',
			email: 'security-p623@tests.com',
		});

		const notification = await asAdmin(request(url).post('/notifications')).send({
			recipient: user.id,
			sender: user.id,
			subject: 'Security p623',
		});

		state[vendor] = {
			flow: flow.body.data.id,
			first: first.body.data.id,
			second: second.body.data.id,
			user: user.id,
			notification: notification.body.data.id,
		};
	}
}, 300_000);

const callers = [
	{ label: 'public', token: null },
	{ label: 'non-admin', token: USER.APP_ACCESS.TOKEN },
];

describe.each(callers)('$label', ({ token }) => {
	describe('DELETE /flows/:id is refused and keeps the operation links', () => {
		it.each(vendors)('%s', async (vendor) => {
			const test = request(getUrl(vendor)).delete(`/flows/${state[vendor]!.flow}`);
			if (token) test.set('Authorization', `Bearer ${token}`);

			expect((await test).statusCode).toBe(403);

			const operation = await asAdmin(request(getUrl(vendor)).get(`/operations/${state[vendor]!.first}`));
			expect(operation.body.data.resolve).toBe(state[vendor]!.second);
		});
	});

	describe('DELETE /users/:id is refused and keeps the notification sender', () => {
		it.each(vendors)('%s', async (vendor) => {
			const test = request(getUrl(vendor)).delete(`/users/${state[vendor]!.user}`);
			if (token) test.set('Authorization', `Bearer ${token}`);

			expect((await test).statusCode).toBe(403);

			const notification = await asAdmin(request(getUrl(vendor)).get(`/notifications/${state[vendor]!.notification}`));

			expect(notification.body.data.sender).toBe(state[vendor]!.user);
		});
	});
});

describe('admin can still delete', () => {
	it.each(vendors)('%s', async (vendor) => {
		const flow = await asAdmin(request(getUrl(vendor)).delete(`/flows/${state[vendor]!.flow}`));
		const user = await asAdmin(request(getUrl(vendor)).delete(`/users/${state[vendor]!.user}`));

		expect(flow.statusCode).toBe(204);
		expect(user.statusCode).toBe(204);
	});
});
