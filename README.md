<!--
title: Adding Profitwell to your app using open source analytics
description: Connect Profitwell to the analytics library
pageTitle: Profitwell
-->

# Profitwell

This library exports the `profitwell` plugin for the [`analytics`](https://www.npmjs.com/package/analytics) package & standalone methods for any project to use to make it easier to interact with [Profitwell](https://www.profitwell.com/).

This analytics plugin will load Profitwell into your application.

## Installation

```bash
npm install analytics
npm install analytics-plugin-profitwell
```

## How to use

```typescript
import Analytics from 'analytics'
import profitwell from 'analytics-plugin-profitwell'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    profitwell({
      publicToken: '1234' // required
      identifyMode: 'user_id' // optional (valid values: user_id, email, custom)
      getCustomId(traits) {
        return traits.stripeId;
      }, // required if `identifyMode` is "custom"
    })
  ]
})
```
