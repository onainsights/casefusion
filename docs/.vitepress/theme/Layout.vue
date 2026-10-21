<script setup lang="ts">
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { computed } from 'vue';

const { Layout } = DefaultTheme;
const { page } = useData();
const contributors = computed(() => page.value.frontmatter['contributors']);
</script>

<template>
	<Layout>
		<template #doc-before>
			<div class="info custom-block casefusion-notice">
				<p>
					CaseFusion is a GPLv3 fork of Directus 10.6.4, maintained by
					<a href="https://onainsights.io/">Ona Insights</a>
					. This documentation is adapted from the Directus 10.6.4 documentation. Mentions of Directus Cloud, licensing
					or the marketplace do not apply to CaseFusion. CaseFusion is not affiliated with Monospace, Inc.; "Directus"
					is a trademark of Monospace, Inc.
				</p>
			</div>
		</template>
		<template #doc-footer-before>
			<Meta v-if="contributors" id="contributors" title-left="Contributors">
				<template #left>
					<div class="contributors">{{ contributors }}</div>
				</template>
			</Meta>
		</template>
	</Layout>
</template>

<style scoped>
#contributors {
	margin-bottom: 2em;
}

.contributors {
	font-weight: 700;
}

.casefusion-notice {
	margin-bottom: 24px;
	font-size: 14px;
}
</style>
