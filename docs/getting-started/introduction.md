---
description: An introduction to what CaseFusion is, how it works, who it is for, and when to use it.
readTime: 6 min read
---

# Introduction

> These Docs will help you get CaseFusion up-and-running quickly, guide you through advanced features, and explain the
> core concepts that make CaseFusion so unique.

## What is CaseFusion?

**CaseFusion is a platform for building highly configured case management applications.**\
It comes from [Ona Insights](https://onainsights.io/)' experience building and configuring case management applications for
humanitarian organizations such as UNICEF, UN Women and Jacaranda Health. CaseFusion is a GPLv3 fork of [Directus 10.6.4](https://github.com/directus/directus/tree/v10.6.4),
maintained by Ona Insights.

Its primary uses are case management applications and master data management. Custom workflows, strong security, tight
access controls, easy integration and a web-based interface make it possible to build very custom apps that support
operations needing a high degree of confidentiality, such as child protection, customer feedback management, and the
prevention of sexual exploitation and abuse.

**CaseFusion is an Open Data Platform built to democratize the database.**\
This platform provides everyone on your team, _regardless of technical skill_, equal access to data and digital file asset
management, for any data model or project. First, link CaseFusion to your desired SQL database and file storage adapter.
After that, CaseFusion enables you to perform CRUD operations, create users, assign roles with fully configurable permissions,
build complex and granular queries, configure event-driven webhooks and task automation... _the list goes on!_

**Database Introspection & Abstraction**\
SQL flavors all come with slightly different data types and idiosyncrasies. CaseFusion uses [Database Introspection](#how-it-works)
to read your database structure and create an abstraction layer to handle all the nitty-gritty details behind the scenes.
This technique works seamlessly with any major SQL database. It also lets you link CaseFusion to your new or pre-existing
database or remove it anytime, with no impact on your existing data model. That means you'll never encounter vendor lock-in.

**The App and APIs**\
Once your database is introspected and abstracted, CaseFusion dynamically generates REST and GraphQL API endpoints to manage
your data with granular control. You also get CLI tools for file management and a complete JavaScript SDK.

The API and CLI power the no-code App. In other words, the App is just a GUI that provides no-code access to the API.
This architecture is how CaseFusion democratizes the database and provides control to [the whole team](#who-s-it-for).

**Open-Source, Modular, Extensible, Scalable**\
At the highest level, CaseFusion organizes its features and functionality into Modules. Each Module allows you to interact
with data in some specific way, such as data and content management, digital file asset management, drag and drop analytics
dashboard creation, or whatever. If you find CaseFusion is missing something that your project needs, no problem!

Built entirely in Typescript, primarily on [Node.js](https://nodejs.dev) and [Vue.js](https://vuejs.org), CaseFusion is
100% open-source, modular and extensible, ensuring your project never hits a hard feature ceiling.

You can use it with any _(or many)_ stacks or frontend frameworks.

**Custom Configuration Options**\
Extensive configuration options are also available as global variables in the codebase. Developers can custom configure SSO
authentication method, caching details, default file storage location (local, S3, google, etc.) for digital assets, emails,
_and much more._

### What Do Teams Use CaseFusion For?

- [Case Management](#case-management)
- [Master Data Management](#master-data-management)
- [Product Inventory Management](#product-inventory-management)

::: tip Ready to dive in?

Get a project running in minutes. Learn CaseFusion hands-on in the [Quickstart Guide](/getting-started/quickstart).

:::

## How It Works

**CaseFusion is installed as a _layer_ on top of your new or existing SQL database.**

The App and API dynamically _"mirror"_ your actual schema and content in real-time. This is similar to how technical
database clients (like _phpMyAdmin_) work. However, Database Introspection has many unique advantages:

- Absolute control over your pure SQL database schema.
- Complete transparency, portability, and security for your data.
- Allows importing existing databases, unaltered and without migrations.
- Direct database access and the full power of raw, complex SQL queries.
- Significant performance improvements through optimizations and indexing.

In contrast, other platforms typically use a predefined or proprietary _one-size-fits-all_ data model to store content .
That is not the case with CaseFusion. CaseFusion gives you direct access to your pure and unaltered data. That means you
have the option to bypass the CaseFusion middleware (API, SDK, App) and connect to your data with proper SQL queries.
This effectively removes all bottlenecks, latency overhead, and proprietary access limitations.

<!--
::: tip Ready to try the API?

Get a Project running in minutes. Test the API hands-on in the [Quickstart Guide](/getting-started/quickstart).

:::
-->

## Who's It For?

**CaseFusion lets the whole team work together and access data in one place.**

**Developers**\
Developers get a complete data connection toolkit with REST and GraphQL APIs, a JavaScript SDK, access to global variables
to customize configuration options, and direct command-line access to digital assets.

**Power Users**\
Data analysts and data scientists have in-app tools to query data, build out in-app analytics dashboards, and extract or
upload data in file format. Additionally, these users are still free to link other services and run raw SQL queries directly
on the database.

**Business Users**\
The no-code app is safe and intuitive enough to make data accessible to everyone, even the most non-technical users. Administrators
can create fully granular permissions for roles as well as individual users.

::: tip CaseFusion Vocabulary

To keep things simpler, _especially for the no-code users_, CaseFusion uses friendlier names for many database terms and
technical concepts, including [Project](/user-guide/overview/glossary#projects) (database),
[Collection](/user-guide/overview/glossary#collections) (table), [Field](/user-guide/overview/glossary#fields) (column),
[Item](/user-guide/overview/glossary#items) (record), and [Type](/user-guide/overview/glossary#types) (datatype).

<!--
@TODO getting-started > learn-directus
For more information on CaseFusion-specific terms, see the guide on [how to learn CaseFusion](/getting-started/learn-directus).
-->

:::

<!--
::: tip Ready to see what CaseFusion can do?

Checkout the core features and learn CaseFusion hands-on in the [Quickstart Guide](/getting-started/quickstart).

@TODO getting-started > crashcourse
Change this CTA to the 20-30 min crashcourse

:::
-->

## When to Use It

**CaseFusion is built for operational data that has to be configured closely and kept confidential.**

### Case Management

Track people, cases and the services delivered to them through their whole lifecycle. Model each programme's case types
and forms, route work with custom workflows, and use role- and field-level permissions so that each caseworker,
supervisor or partner sees only what they should. This suits sensitive work such as child protection, customer feedback
management, and the prevention of sexual exploitation and abuse.

### Master Data Management

Keep _a single source of truth_ for shared reference data: beneficiaries, locations, facilities, organizations or
service catalogues. Other systems read and update it through the REST and GraphQL APIs, and changes can trigger flows
that keep them in sync.

### Product Inventory Management

Manage stock, supplies and assets with their locations, movements and history, with dashboards to monitor levels and
flows to automate reorders or alerts.

<!--
::: tip Ready to dive-in?

Get a Project running in minutes. Learn CaseFusion hands-on in the [Quickstart Guide](/getting-started/quickstart).

:::
-->

## Why Use It?

**CaseFusion is a simple, data-first solution to complex problems with no downsides.**

CaseFusion is plug-and-play, so you're free to link or remove it anytime, with zero impact on your data. You have no
vendor lock-in whatsoever, _your data is yours_. There are no artificial data limits _(e.g. limits on users or roles)_.

You can test it immediately on an existing database or build a new data model from scratch, _with no impact on your data
and no long-term commitments._

The following core principles guide this platform:

- **Pure** — No predefined or proprietary schema. All system metadata is stored separately.
- **Open** — CaseFusion Core is open source, with no obfuscated or cloud-only code.
- **Portable** — No vendor lock-in. Your database can be exported or migrated anytime.
- **Limitless** — No arbitrary limits or paywalls on users, roles, translations, and data.
- **Extensible** — Every aspect of this platform is modular to avoid any hard feature ceiling.
- **Unopinionated** — Choose the stack, database, and architecture as you wish.

## Ona Insights Managed Cloud

[Ona Insights](https://onainsights.io/) offers managed cloud hosting for CaseFusion.
[Get in touch with Ona Insights](https://onainsights.io/) for more information.
