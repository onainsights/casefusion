import { cssVar } from '@directus/utils/browser';

// TODO(logo): placeholder CaseFusion wordmark until the real logo is supplied
const svg = (color: string, hide: boolean) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
	<style>
		circle {
			fill: ${color};
		}
	</style>

	<circle cx="100" cy="100" r="100"/>

	${
		hide
			? ''
			: '<text x="100" y="128" font-size="96" letter-spacing="-4" fill="#FFF" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-weight="800" text-anchor="middle">CF</text>'
	}
</svg>`;

export function setFavicon(color: string | null | undefined, hide = false): void {
	color = color || cssVar('--primary');

	const icon = svg(color, hide);
	const wrapper = document.createElement('div');
	wrapper.innerHTML = icon.trim();

	if (wrapper.firstChild) {
		const iconSerialized = new XMLSerializer().serializeToString(wrapper.firstChild);

		const string = 'data:image/svg+xml;base64,' + window.btoa(iconSerialized);

		const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'icon';
		link.href = string;
		document.getElementsByTagName('head')[0].appendChild(link);
	}
}
