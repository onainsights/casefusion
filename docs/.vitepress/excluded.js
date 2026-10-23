// CaseFusion: pages left out of the published site (VitePress srcExclude) and out of the guides index. Upstream merges
// keep adding these files; the list keeps them out without deleting them (UPSTREAM.md).
export const excludedPages = [
	// Upstream's blog, generated package reference, contribution process and Directus Cloud
	'blog/**',
	'packages/**',
	'contributing/**',
	'user-guide/cloud/**',
	'README.md',
	// Guides about external web frameworks and hosting platforms (Next.js, Nuxt, React, Vue, Netlify, Vercel)
	'guides/headless-cms/build-static-website/**',
	'guides/headless-cms/live-preview/**',
	'guides/headless-cms/trigger-static-builds/**',
	'guides/headless-cms/schedule-content/static-sites.md',
	'guides/real-time/chat/react.md',
	'guides/real-time/chat/vue.md',
	'guides/template_shell.md',
];

// True when a site path (e.g. /guides/real-time/chat/react) belongs to an excluded page
export function isExcludedPath(path) {
	const page = path.replace(/^\//, '').replace(/\.html$/, '');

	return excludedPages.some((pattern) => {
		const glob = pattern.replace(/\.md$/, '');
		if (glob.endsWith('/**')) return page === glob.slice(0, -3) || page.startsWith(glob.slice(0, -2));
		return page === glob;
	});
}
