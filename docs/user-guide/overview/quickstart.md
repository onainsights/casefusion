---
description:
  Get up and running with CaseFusion in minutes. Learn the basics of building your data model and managing permissions.
readTime: 7 min read
---

# Quickstart Guide

> This quickstart guide is designed to get you up and running with a CaseFusion Project in a snap. Along the way, you
> will better understand what CaseFusion is and get a _hands-on introduction_ to the App.

## 1. Get a Project

You need a running CaseFusion Project. Either [self-host CaseFusion](/self-hosted/quickstart), or
[get in touch with Ona Insights](https://onainsights.io/) about managed cloud hosting.

## 2. Log In

Open your Project's URL in your browser and log in with your email and password. On a new self-hosted Project, the first
admin user is the one set by `ADMIN_EMAIL` and `ADMIN_PASSWORD` when it first started.

## 3. Create a Collection

Once logged in, you're greeted with the option to create your first
[Collection](/user-guide/overview/glossary#collections).

1. Navigate into the Content Module.
2. Click **"Create Collection"** and a side menu will appear.
3. Fill in a **Name**.\
   For the sake of this demo, we'll call ours `articles`, but feel free to make it your own!
4. Leave the other options at default. Click <span mi btn>arrow_forward</span> and the **"Optional System Fields"** menu
   will open.\
   Keep the values in this menu at the default, toggled off, for now. You can adjust them later.
5. Click <span mi btn>check</span> in the menu header.

::: tip Learn More About Collections

- [The Content Module](/user-guide/content-module/content)
- [Create and Manage a Collection](/app/data-model/collections)
- [Build Relationships Between Collections](/app/data-model/relationships)

:::

## 4. Create a Field

With your first Collection created, it's time to start adding some [Fields](/user-guide/overview/glossary#fields).

1. Navigate to **Settings Module > Data Model > `Collection-Name`**.
2. Click the **"Create Field"** button and select the **"Input"** Field type.
3. Fill in a Field name under **Key**. We'll be calling our Field `title`.\
   CaseFusion offers powerful Field customization options, but let's stick to the defaults for now.
4. Select **"Save"**.

::: tip Learn More About Fields

- [Create and Manage Fields in the App](/app/data-model)

:::

## 5. Create an Item

Now that we have a Collection with a Field configured, it's time to add an [Item](/user-guide/overview/glossary#).

1. Navigate to the Content Module.
2. Click <span mi btn>add</span> in the page header to open the Item Page.
3. Fill in the Field Value(s) as desired.
4. Click <span mi btn>check</span> in the top-right to save your Item.

::: tip Learn More About Items

- [The Content Module](/user-guide/content-module/content)
- [The Item Page](/user-guide/content-module/content/items)

:::
