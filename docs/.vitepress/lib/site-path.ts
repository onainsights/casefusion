import { withBase } from 'vitepress';

// CaseFusion: the site is served under a base path (/casefusion/), so root-relative links and images passed to
// components as props need the base added. Absolute URLs are returned unchanged.
export function sitePath(path: string): string;
export function sitePath(path: string | undefined): string | undefined;
export function sitePath(path: string | undefined) {
	return path?.startsWith('/') ? withBase(path) : path;
}
