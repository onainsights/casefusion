#!/usr/bin/env node
// CaseFusion: no update check. Upstream's checks npm for newer Directus releases, which are not GPL yet.

// isolated-vm (the Run Script operation) requires --no-node-snapshot on Node 20 and later.
// Re-launch with the flag when it was not given on the command line or in NODE_OPTIONS.
const SNAPSHOT_FLAG = '--no-node-snapshot';

if (!process.execArgv.includes(SNAPSHOT_FLAG) && !(process.env.NODE_OPTIONS ?? '').includes(SNAPSHOT_FLAG)) {
	const { spawn } = await import('node:child_process');

	const child = spawn(process.execPath, [SNAPSHOT_FLAG, ...process.execArgv, ...process.argv.slice(1)], {
		stdio: 'inherit',
	});

	for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
	child.on('exit', (code, signal) => (signal ? process.kill(process.pid, signal) : process.exit(code ?? 1)));
} else {
	import('@directus/api/cli/run.js');
}
