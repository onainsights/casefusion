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

	await request(getUrl(vendor))
		.delete('/permissions')
		.set('Authorization', `Bearer ${USER.TESTS_FLOW.TOKEN}`)
		.send({ query: { filter: { role: { _eq: role.id } } } });

	if (options.permissions.length > 0) {
		await request(getUrl(vendor))
			.post('/permissions')
			.set('Authorization', `Bearer ${USER.TESTS_FLOW.TOKEN}`)
			.send(
				options.permissions.map((permission) => ({
					role: role.id,
					fields: ['*'],
					permissions: {},
					...permission,
				}))
			);
	}

	await CreateUser(vendor, { token: options.token, email: options.email, role: role.id });

	return role.id;
}
