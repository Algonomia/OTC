# @algonomia/angular-sdk

Angular UI component library by Algonomia — design elements, charts, smart forms, export services and utilities for Angular standalone applications.

## Installation

```bash
npm install @algonomia/angular-sdk
```

## Configuration

Provide the `ALGONOMIA_SDK_CONFIG` token in your `app.config.ts`:

```typescript
import { ALGONOMIA_SDK_CONFIG } from '@algonomia/angular-sdk';

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: ALGONOMIA_SDK_CONFIG, useValue: yourEnvironment }
    ]
};
```

The token expects an object implementing `AlgonomiaSdkConfig`:

| Property | Type | Description |
|---|---|---|
| `apiUrl` | `string` | Backend API base URL |
| `siteUrl` | `string` | Public site URL |
| `linkedinClientId` | `string` | LinkedIn OAuth client ID |
| `linkedinRedirectUri` | `string` | LinkedIn OAuth redirect URI |
| `production` | `boolean` | Production mode flag |

## AppInjector — required setup

Some SDK utilities (pipes, static notification broadcaster) operate outside Angular's injection context. They rely on `AppInjector`, a global injector reference that must be initialized once in the root component constructor.

Call `setAppInjector` in your `AppComponent`:

```typescript
import { Component, Injector } from '@angular/core';
import { setAppInjector } from '@algonomia/angular-sdk';

@Component({ ... })
export class AppComponent {
    constructor(private injector: Injector) {
        setAppInjector(injector);
    }
}
```

> **Note:** If `setAppInjector` is not called, any pipe or utility that relies on `AppInjector` will throw at runtime.

## Style include paths

The SDK uses SCSS imports that resolve from its own `src` directory. In the caller project's `angular.json`, add the following under `architect > build > options > stylePreprocessorOptions`:

```json
"stylePreprocessorOptions": {
    "includePaths": ["src", "node_modules/@algonomia/angular-sdk/src"]
}
```

## What's included

| Category | Description |
|---|---|
| **Design elements** | Buttons, labels, icons, menus, flags, form controls, file display, completion bars... |
| **Charts** | Configurable data table, world map (amCharts 5) |
| **Smart forms** | Meta-form system, custom fields (date, file, number, select, complex value...) |
| **Global services** | Modal, export (PDF / Excel), translate wrapper, SEO, cookies, HTTP utils... |
| **Global components** | Lang selector, logo, notifications, clipboard field, toggle... |
| **Handlers** | Search filter, tree factory, select handler, list incrementer... |
| **Plugs** | Virtual scroll, slider, screen size handler, panel sync, edge popover... |
| **Pipes** | 12+ utility pipes |

## i18n generator

The SDK ships with an i18n generator script that scans your project and `node_modules` for `_i18n` folders and merges all translation files into `src/assets/i18n`.

### Configuring the node_modules whitelist

By default, the generator only scans `@algonomia/angular-sdk` in `node_modules`. If your project depends on other packages that contain `_i18n` folders, create an `i18n.config.js` file at the root of your project:

```javascript
// i18n.config.js
module.exports = {
    nodeModulesWhitelist: ['@your-package']
};
```

The final whitelist is the merge of:
- `@algonomia/angular-sdk` (always included)
- The entries from your `i18n.config.js` `nodeModulesWhitelist` array

If no `i18n.config.js` is found, only `@algonomia/angular-sdk` is scanned.

## Build

```bash
# From the monorepo root
npm run build --workspace=angular-sdk
```

## Tests

```bash
# From the monorepo root
npm test --workspace=angular-sdk
```
