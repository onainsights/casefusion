// GHSA-gwvv-rr68-cmv6: a `deep` key naming an inherited member must not pollute Object.prototype. Before the fix one
// anonymous request broke every later request on the instance.
import { getUrl } from '@common/config';
import vendors from '@common/get-dbs-to-test';
import { USER } from '@common/variables';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('deep with inherited member names', () => {
	it.each(vendors)('%s', async (vendor) => {
		const deep = JSON.stringify({
			toString: { call: { _limit: 1 } },
			valueOf: { call: { _limit: 1 } },
			x: { 0: { _limit: 1 }, slice: { call: { _limit: 1 } } },
		});

		const polluting = await request(getUrl(vendor)).get('/server/ping').query({ deep });
		expect(polluting.statusCode).toBe(200);

		const viaBody = await request(getUrl(vendor))
			.search('/users')
			.send({ query: { deep: { toString: { call: { _limit: 1 } } } } });

		expect(viaBody.statusCode).toBeLessThan(500);

		const after = await request(getUrl(vendor)).get('/users/me').set('Authorization', `Bearer ${USER.ADMIN.TOKEN}`);
		expect(after.statusCode).toBe(200);
		expect(after.body.data.email).toBe(USER.ADMIN.EMAIL);
	});
});
