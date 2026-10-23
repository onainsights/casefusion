<script setup lang="ts">
import { useData, useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { computed } from 'vue';

const { Layout } = DefaultTheme;
const { page } = useData();
const contributors = computed(() => page.value.frontmatter['contributors']);
const route = useRoute();
const extensionsPage = computed(() => /\/(guides\/)?extensions\//.test(route.path));
</script>

<template>
	<Layout>
		<template #doc-before>
			<div v-if="extensionsPage" class="warning custom-block casefusion-notice">
				<p>
					The CaseFusion extensions SDK will be made available soon. Until then,
					<code>create-directus-extension</code>
					and
					<code>@directus/extensions-sdk</code>
					from npm install upstream's tooling, which targets newer Directus releases than CaseFusion.
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
