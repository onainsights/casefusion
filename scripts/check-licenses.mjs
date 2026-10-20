#!/usr/bin/env node
// Fails when a production dependency is under a licence that cannot ship in a GPLv3 project
// (source-available licences such as BUSL, SSPL or Commons Clause) or under no identifiable licence.
import { execFileSync } from 'node:child_process';

const DENIED = /BUSL|Business Source|SSPL|Server Side Public|Commons Clause|Elastic License|PolyForm|SEE LICENSE IN/i;

// Packages whose package.json has no licence field; the licence was checked by hand in their repository.
const REVIEWED = {
	precond: 'MIT (LICENSE file in the repository)',
	'thirty-two': 'MIT (LICENSE.txt in the repository)',
};

const output = execFileSync('pnpm', ['licenses', 'list', '--prod', '--json', '--recursive'], {
	encoding: 'utf8',
	maxBuffer: 64 * 1024 * 1024,
});

const problems = [];
let count = 0;

for (const [license, packages] of Object.entries(JSON.parse(output))) {
	for (const pkg of packages) {
		count++;
		const id = `${pkg.name}@${pkg.version ?? pkg.versions?.join(',')}`;

		if (DENIED.test(license)) problems.push(`${id}: ${license}`);
		else if (license === 'Unknown' && !REVIEWED[pkg.name]) problems.push(`${id}: no licence declared, review it`);
	}
}

if (problems.length > 0) {
	process.stderr.write(`Licence check failed for ${problems.length} of ${count} production dependencies:\n`);
	for (const problem of problems) process.stderr.write(`  ${problem}\n`);
	process.exit(1);
}

process.stdout.write(`Licence check passed: ${count} production dependencies.\n`);
