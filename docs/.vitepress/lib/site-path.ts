import { withBase } from 'vitepress';

// CaseFusion: root-relative links and images passed to components as props need VitePress' base added. It's '/' on
// casefusion.onainsights.io; this keeps them working if the site moves under a sub-path again. Absolute URLs are
// returned unchanged.
export function sitePath(path: string): string;
export function sitePath(path: string | undefined): string | undefined;
export function sitePath(path: string | undefined) {
	return path?.startsWith('/') ? withBase(path) : path;
}
