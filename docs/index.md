---
layout: home
---

<script setup lang="ts">
import Pattern from './.vitepress/components/home/Pattern.vue';
import Footer from './.vitepress/components/home/Footer.vue';
import Github from './.vitepress/components/home/icons/Github.vue';
import Badge from './.vitepress/components/Badge.vue'
</script>

<section :class="[$style.hero, $style.paddingBox]">
	<div :class="$style.heroPattern">
		 <Pattern />
	</div>
	<div :class="[$style.sectionContainer, $style.sectionContainerHero, $style.flex]">
		<div :class="[$style.heroContent, $style.sectionPaddingHero]">
			<Badge>GPLv3 · version 10.6.4</Badge>
			<h1>CaseFusion Documentation</h1>
			<p>The GPLv3 data platform maintained by Ona Insights: REST and GraphQL APIs, the admin app, flows and extensions.</p>
			<div :class="[$style.heroButtons, $style.buttonGroup]">
				<Button href="/getting-started/quickstart">Get Started</Button>
				<Button secondary :icon="Github" href="https://github.com/onainsights/casefusion" external>GitHub</Button>
			</div>
		</div>
		<div :class="$style.heroToggler">

<SnippetToggler :choices="['REST', 'GraphQL', 'SDK']" group="api" alwaysDark maintainHeight>
<template #rest>

```js
GET /items/products/4
	?fields[]=id
	&fields[]=status
	&fields[]=title
	&fields[]=category
	&fields[]=image.id
	&fields[]=image.name
```

</template>
<template #graphql>

```graphql
query {
	articles_by_id(id: 4) {
		id
		status
		title
		category
		image {
			id
			name
		}
	}
}
```

</template>
<template #sdk>

```js
await directus.request(
  readItem('articles', 4, {
    fields: [
      'id',
      'status',
      'title',
      'category,',
      { image: ['id', 'name'] }
    ]
  })
);
```

</template>
</SnippetToggler>
		</div>
	</div>

</section>

<section :class="[$style.sectionPaddingLg, $style.paddingBox]">
	<Tabs :class="[$style.sectionContainer, $style.whiteBg]" :tabs="['Developer Reference', 'User Guide']">
		<template #developer-reference>
			<Card
				title="Database APIs"
				text="Use our dynamic REST and GraphQL APIs to access and efficiently manage your data."
				url="/reference/introduction"
				icon="api"
			/>
			<Card
				title="Data Model"
				text="Structure and organize items in your collection, while also establishing relationships between them."
				url="/app/data-model"
				icon="database"
			/>
			<Card
				title="Authentication"
				text="Use our powerful and simple authentication features in your own applications."
				url="/reference/authentication"
				icon="lock"
			/>
			<Card
				title="Extensions"
				text="Build, modify or expand any feature needed for your project with our flexible extensions."
				url="/extensions/introduction"
				icon="extension"
			/>
			<Card
				title="Realtime"
				text="Access real-time data in your project with WebSockets, backed by your database."
				url="/guides/real-time/getting-started/"
				icon="bolt"
			/>
			<Card
				title="Flows"
				text="Create custom, event-driven data processing and task automation workflows."
				url="/app/flows"
				icon="flowsheet"
			/>
		</template>
		<template #user-guide>
			<Card
				title="Content Module"
				text="Empower your entire team to interact with and manage items in your collection."
				url="/user-guide/content-module/content"
				icon="deployed_code"
			/>
			<Card
				title="User Management"
				text="Learn about adding users, granular roles, and access permissions to your projects."
				url="/user-guide/user-management/users-roles-permissions"
				icon="group"
			/>
			<Card
				title="File Storage"
				text="Store and retrieve files, use storage adapters, and learn about media transformations."
				url="/user-guide/file-library/files"
				icon="folder_copy"
			/>
			<Card
				title="Insights Dashboard"
				text="Build custom analytics dashboards directly from your data to gain meaningful business insights. "
				url="/user-guide/insights/dashboards"
				icon="insights"
			/>
			<Card
				title="Translation"
				text="Easily manage multilingual content, making your projects accessible and user-friendly for a global audience."
				url="/user-guide/content-module/translation-strings"
				icon="g_translate"
			/>
		</template>
	</Tabs>
</section>

<div :class="$style.paddingBox">
	<div :class="$style.sectionContainer">
		<Divider />
	</div>
</div>

<section :class="[$style.grayBg, $style.paddingBox]">
	<div :class="[$style.sectionContainer, $style.sectionPaddingMd]">
		<div :class="$style.header">
			<h2>Guides</h2>
			<p>
				Step-by-step guides to flows, content workflows, real-time data and the SDK.
			</p>
		</div>
		<div :class="[$style.grid3, $style.m60]">
			<Card
				h="3"
				title="Build Content Approval Workflows"
				text="Use roles, permissions and flows to route content through review before it is published."
				url="/guides/headless-cms/approval-workflows"
				icon="approval"
			/>
			<Card
				h="3"
				title="Slugify Text With Run Script"
				text="Transform data in a flow with a sandboxed Run Script operation."
				url="/guides/flows/slugify-text-with-run-script"
				icon="bolt"
			/>
			<Card
				h="3"
				title="Build a Multi-User Chat"
				text="Use WebSockets to build an interactive chat application in plain JavaScript."
				url="/guides/real-time/chat/javascript"
				icon="forum"
			/>
		</div>
		<div :class="$style.header">
			<Button href="/guides/">View All Guides</Button>
		</div>
	</div>
</section>

<section :class="[$style.sectionPaddingMd, $style.paddingBox]">
	<div :class="[$style.sectionContainer, $style.sectionContainerSelfHosted]">
		<div :class="[$style.header, $style.headerSelfHosted]">
			<h2 :class="$style.headingSelfHosted">
				Self Hosted
				<span style="white-space: nowrap">CaseFusion</span>
			</h2>
			<p>
				Learn how to run CaseFusion on your own machine, customize settings, and deploy with confidence.
			</p>
		</div>
		<div :class="[$style.grid2, $style.m60]">
			<Article
				title="Get Started with Docker"
				desc="Get up and running with our Docker Guide."
				img="/assets/docker.png"
				url="/self-hosted/quickstart"
			/>
			<Article
    			title="Config Options"
    			desc="A reference of all possible settings in your project."
    			img="/assets/config-options.png"
    			url="/self-hosted/config-options"
    		/>
    	</div>
    </div>
</section>

<div :class="$style.paddingBox">
	<div :class="$style.sectionContainer">
		<Divider />
	</div>
</div>

<section :class="[$style.sectionContainer, $style.sectionPaddingMd, $style.paddingBox]">
	<div :class="$style.header">
		<h2>Contributing to CaseFusion</h2>
		<p>
			Bug reports and pull requests are welcome. Read the contributing guide and the security policy on GitHub.
		</p>
		<div :class="$style.buttonGroup">
			<Button href="https://github.com/onainsights/casefusion/blob/main/contributing.md" external>Contributing Guide</Button>
			<Button secondary :icon="Github" href="https://github.com/onainsights/casefusion" external>GitHub</Button>
		</div>
	</div>
</section>

<Footer />

<style module>
@import './home.css';
</style>
