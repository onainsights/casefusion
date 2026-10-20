import mid from 'node-machine-id';
import env from '../env.js';
import logger from '../logger.js';
import { version } from './package.js';

export async function collectTelemetry(): Promise<void> {
	const axios = (await import('axios')).default;

	// CaseFusion: off by default and no built-in endpoint, so nothing is reported to Monospace
	if (env['TELEMETRY'] === true && env['TELEMETRY_URL']) {
		try {
			await axios.post(env['TELEMETRY_URL'], {
				version: version,
				public_url: env['PUBLIC_URL'],
				project_id: env['KEY'],
				machine_id: await mid.machineId(),
				db_client: env['DB_CLIENT'],
			});
		} catch (err: any) {
			if (env['NODE_ENV'] === 'development') {
				logger.error(err);
			}
		}
	}
}
