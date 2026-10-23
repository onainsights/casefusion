#!/usr/bin/env node
// Replaces the product name "Directus" with "CaseFusion" in the prose of docs/**/*.md.
//
// Run after every upstream merge (UPSTREAM.md): `node scripts/rebrand-docs.mjs && pnpm exec prettier --write docs`
// (or `--check` to only report files that would change; it exits 1 if any would). It is idempotent.
//
// Left unchanged, because they are identifiers or refer to Directus the company and its services:
// - fenced code blocks, inline code, HTML tags and attributes, Vue interpolations, URLs and link targets;
// - the text of links that point to Directus' own sites;
// - Directus Cloud, the Directus team or community, Directus Marketplace, Monospace's trademark notices;
// - lower-case "directus" (package names, CLI commands, table prefixes);
// - anything between `<!-- rebrand-docs: off -->` and `<!-- rebrand-docs: on -->` (our own text about upstream).
// Heading anchors change with the heading text, so "directus" in the #fragment of internal links is updated too.
//
// It also points references to upstream's distribution at ours (`references` below), in code blocks too: the Docker
// image, Docker Hub, the npm package and links into upstream's GitHub repository.
//
// Media hosted by Directus (`hotlinked` below) is replaced or removed (`stripMedia`): images listed in
// docs/.vitepress/screenshots.json point at our own screenshot in docs/public/img/; other images, videos and YouTube
// embeds are removed, with a "Video coming soon" note where the text nearby refers to the video.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isExcludedPath } from '../docs/.vitepress/excluded.js';

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
// Not prose, or not published (pages in docs/.vitepress/excluded.js are skipped too)
const skipDirs = ['node_modules', '.vitepress', 'public'];
const screenshots = JSON.parse(await readFile(join(docsDir, '.vitepress', 'screenshots.json'), 'utf8'));
const check = process.argv.includes('--check');

// "Directus" followed by these words is a Monospace product, team or trademark, not the software.
const keepAfter =
	/^(?:,? Inc\b|,? Inc\.|\s+(?:Cloud|Marketplace|[Tt]eam|[Cc]ommunity|Discord|TV|Plus|Enterprise|Labs|Purple|Inc)\b|'s? (?:[Tt]eam|[Cc]ommunity|Cloud)\b)/;

const directusSite =
	/directus\.(?:io|cloud|chat|app)|github\.com\/directus|discord\.(?:gg|com)|monospace\.io|youtube\.com/i;

const repo = 'https://github.com/onainsights/casefusion';

// [pattern, replacement], applied in order to every line, code included
const references = [
	[
		/\[Docker Hub\]\(https:\/\/hub\.docker\.com\/r\/directus\/directus\/?\)/g,
		`[GitHub Container Registry](${repo}/pkgs/container/casefusion)`,
	],
	[/https:\/\/hub\.docker\.com\/r\/directus\/directus\/?/g, `${repo}/pkgs/container/casefusion`],
	[/(?<![\w./-])directus\/directus(?=:|`|$)/g, 'ghcr.io/onainsights/casefusion'],
	[/https:\/\/www\.npmjs\.com\/package\/directus(?![\w/-])/g, `${repo}#running-it`],
	[/https:\/\/github\.com\/directus\/directus\/blob\/main\//g, `${repo}/blob/main/`],
	[
		/https:\/\/github\.com\/directus\/directus\/(?:discussions(?:\/new)?|issues(?:\?[^)\s]*)?)(?![\w/])/g,
		`${repo}/issues`,
	],
	[/https:\/\/github\.com\/directus\/directus\/pulls/g, `${repo}/pulls`],
	[/https:\/\/github\.com\/directus\/directus\/releases(?:\/latest)?/g, `${repo}/releases`],
	[/https:\/\/github\.com\/directus\/directus\/?(?=[)\s]|$)/g, repo],
	// Links into upstream's docs: to the same page of this site (upstream's contributing pages are not published)
	[/\]\(https:\/\/docs\.directus\.io\/contributing\/[^)]*\)/g, `](${repo}/blob/main/contributing.md)`],
	[/\]\(\/contributing\/[^)]*\)/g, `](${repo}/blob/main/contributing.md)`],
	[/\]\(https:\/\/docs\.directus\.io\//g, '](/'],
	[/https:\/\/docs\.directus\.io\//g, 'https://onainsights.github.io/casefusion/'],
	// Placeholder hosts and addresses in examples: example.com is reserved for this
	[/https:\/\/example\.directus\.app/g, 'https://casefusion.example.com'],
	[/\b(your-[a-z-]+|example|ldap)\.directus\.(?:app|io)\b/g, '$1.example.com'],
	[/\b([a-z]+)@directus\.io\b/g, '$1@example.com'],
	// Directus' hosting, community and services: Ona Insights or this repository instead
	[
		/\[managed Directus Cloud service\]\(https:\/\/directus\.cloud\/?\)/g,
		'[managed cloud hosting](https://onainsights.io/)',
	],
	[/Contact \[our team\]\(https:\/\/directus\.io\/contact\)/g, 'Contact [Ona Insights](https://onainsights.io/)'],
	[
		/^Looking for technical support for your non-enterprise project\? Chat with thousands of engineers within our growing$/,
		'Looking for help? Search or open an issue on',
	],
	[/^\[Community on Discord\]\(https:\/\/discord\.com\/invite\/directus\)$/, `[CaseFusion's GitHub](${repo}/issues).`],
	[
		/\[Vue Component Library and Storybook\]\(https:\/\/components\.directus\.io\)/g,
		`[Vue Component Library](${repo}/tree/main/app/src/components)`,
	],
	[
		/\[available via NPM\]\(https:\/\/www\.npmjs\.com\/package\/@directus\/sdk\)/g,
		`[in this repository](${repo}/tree/main/sdk)`,
	],
	[
		/\[our Crowdin page\]\(https:\/\/locales\.directus\.io\)/g,
		`[the translation files](${repo}/tree/main/app/src/lang/translations)`,
	],
	[/ through the integration with$/, ' by opening'],
	[
		/^\[Crowdin\]\(https:\/\/locales\.directus\.io\)\.$/,
		`[a pull request to the translation files](${repo}/tree/main/app/src/lang/translations).`,
	],
	[
		/^We have \[integration guides\]\(https:\/\/directus\.io\/guides\/?\) for many popular front-end frameworks\. But there are far too$/,
		'There are far too many front-end frameworks',
	],
	[/^many to cover in this recipe\.$/, 'to cover in this recipe.'],
	[
		/^Here's a \[list of various extensions\]\(https:\/\/github\.com\/directus-community\/awesome-directus#extensions\) created by the$/,
		'Extensions from the Directus community often work with CaseFusion. Test each one before you',
	],
	[/^Directus Community\.$/, 'rely on it.'],
];

function replaceReferences(line) {
	return references.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), line);
}

// Spans on a line that are not prose: inline code, links and images (their text is rewritten, their target is not),
// HTML tags, Vue interpolations, bare URLs.
const protectedPattern = new RegExp(
	[
		'(`+)[\\s\\S]*?\\1', // inline code
		'!?\\[[^\\]]*\\]\\((?:[^()]|\\([^()]*\\))*\\)', // markdown link or image (handled below)
		'<\\/?[A-Za-z][^>]*>', // HTML / Vue tag
		'\\{\\{[\\s\\S]*?\\}\\}', // Vue interpolation
		'https?:\\/\\/[^\\s)>\\]]+', // bare URL
	].join('|'),
	'g'
);

// `next` is the start of the following line: Prettier can wrap "Directus Cloud" across two lines.
function replaceName(text, next = '') {
	return text.replace(/\bDirectus\b/g, (match, offset, whole) => {
		const rest = whole.slice(offset + match.length);
		const after = rest.trim() === '' && next ? ` ${next}` : rest;
		if (keepAfter.test(after)) return match;
		if (/Monospace|trademark/i.test(whole)) return match;
		return 'CaseFusion';
	});
}

function rewriteFragment(url) {
	if (/^[a-z]+:/i.test(url)) return url;
	const hash = url.indexOf('#');
	if (hash === -1) return url;
	const fragment = url.slice(hash + 1).replace(/(^|-)directus(?=-|$)/g, '$1casefusion');
	return url.slice(0, hash + 1) + fragment;
}

function rewriteLink(link, next) {
	const image = link.startsWith('!');
	const close = link.lastIndexOf('](');
	const text = link.slice(image ? 2 : 1, close);
	const url = link.slice(close + 2, -1);
	// Image alt text describes a screenshot of the software, wherever the image is hosted
	if (directusSite.test(url) && !image) return link;
	const bang = image ? '!' : '';
	if (directusSite.test(url)) return `${bang}[${rewriteLine(text, next)}](${url})`;
	return `${bang}[${rewriteLine(text, next)}](${rewriteFragment(url)})`;
}

function rewriteLine(line, next = '') {
	let out = '';
	let last = 0;

	for (const match of line.matchAll(protectedPattern)) {
		out += replaceName(line.slice(last, match.index), next);
		const token = match[0];
		out += /^!?\[/.test(token) ? rewriteLink(token, next) : token;
		last = match.index + token.length;
	}

	return out + replaceName(line.slice(last), next);
}

const hotlinked = /^https:\/\/(?:cdn\.directus\.io|marketing\.directus\.app)\//;
const videoNote = '::: info Video coming soon\n\n:::';
const removed = '\u0000';

export function stripMedia(source) {
	let out = source;

	// Videos: <video ...>...</video> with a hotlinked source
	out = out.replace(/^[ \t]*<video\b[\s\S]*?<\/video>[ \t]*$/gm, (block, offset, whole) => {
		const src = block.match(/src="([^"]*)"/)?.[1] ?? '';
		if (!hotlinked.test(src)) return block;
		const before = whole.slice(0, offset).split('\n').slice(-10).join('\n');
		const after = whole
			.slice(offset + block.length)
			.split('\n')
			.slice(0, 10)
			.join('\n');
		const nearby = (before + '\n' + after).replace(/<[^>]*>/g, '');
		return /\bvideo\b/i.test(nearby) ? videoNote : removed;
	});

	// YouTube embeds
	out = out.replace(/^[ \t]*<iframe\b[^>]*youtube[^>]*>\s*<\/iframe>[ \t]*$/gm, removed);

	// Markdown images, optionally with a title: ![alt](url "title")
	out = out.replace(/!\[([^\]]*)\]\((\S+?)(\s+"[^"]*")?\)/g, (image, alt, url, title = '') => {
		if (!hotlinked.test(url)) return image;
		return screenshots[url] ? `![${alt}](${screenshots[url]}${title})` : removed;
	});

	// HTML images
	out = out.replace(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g, (image, url) => {
		if (!hotlinked.test(url)) return image;
		return screenshots[url] ? image.replace(url, screenshots[url]) : removed;
	});

	// Drop lines that held only removed media, with one of the blank lines around them
	const lines = out.split('\n');
	const kept = [];

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].replaceAll(removed, '').trim() === '' && lines[i].includes(removed)) {
			if (kept.at(-1) === '' && lines[i + 1] === '') i++;
			continue;
		}

		kept.push(lines[i].replaceAll(removed, ''));
	}

	return kept.join('\n');
}

export function rebrand(source) {
	const lines = source.split('\n');
	let fence = null;
	let inFrontmatter = lines[0] === '---';
	let inProse = false;
	let off = false;

	return lines
		.map((source, index) => {
			if (/<!-- rebrand-docs: off -->/.test(source)) off = true;
			if (/<!-- rebrand-docs: on -->/.test(source)) off = false;
			if (off) return source;
			const line = replaceReferences(source);

			if (inFrontmatter) {
				if (index > 0 && line === '---') inFrontmatter = false;
				else if (/^(title|description):/.test(line)) inProse = true;
				else if (/^\S/.test(line)) inProse = false;
				return inProse ? replaceName(line, lines[index + 1]?.trim()) : line;
			}

			const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

			if (fence) {
				if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null;
				return line;
			}

			if (fenceMatch) {
				fence = fenceMatch[1];
				return line;
			}

			return rewriteLine(line, lines[index + 1]?.trim());
		})
		.join('\n');
}

async function* markdownFiles(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!skipDirs.includes(entry.name)) yield* markdownFiles(join(dir, entry.name));
		} else if (entry.name.endsWith('.md')) {
			const file = join(dir, entry.name);
			if (!isExcludedPath(relative(docsDir, file).replace(/\.md$/, ''))) yield file;
		}
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const changed = [];

	for await (const file of markdownFiles(docsDir)) {
		const source = await readFile(file, 'utf8');
		const output = rebrand(stripMedia(source));

		if (output !== source) {
			changed.push(relative(docsDir, file));
			if (!check) await writeFile(file, output);
		}
	}

	process.stdout.write(
		`${check ? 'Would change' : 'Changed'} ${changed.length} file(s)${changed.length ? ':' : '.'}\n`
	);

	for (const file of changed) process.stdout.write(`  ${file}\n`);
	if (check && changed.length) process.exit(1);
}
