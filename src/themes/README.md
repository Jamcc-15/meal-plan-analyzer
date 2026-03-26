# Theme System

This folder centralizes visual design tokens for the web app.

## Files

- `appTheme.ts`: global UI tokens (surfaces, buttons, text, badges).
- `tableTheme.ts`: table-specific color and section mapping.
- `systemTheme.ts`: app-level shell/layout theme (background and container).
- `index.ts`: theme barrel exports.

## Usage

Import `APP_THEME` for general UI styling:

```ts
import { APP_THEME } from '../themes/appTheme.ts'
```

Then compose class names from tokens, for example:

```tsx
<section className={`${APP_THEME.surface.card} p-6`}>
```

Import `SYSTEM_THEME` for top-level app shell/layout:

```ts
import { SYSTEM_THEME } from '../themes/systemTheme.ts'
```

```tsx
<div className={SYSTEM_THEME.layout.appShell}>
	<div className={SYSTEM_THEME.layout.appContent}>...</div>
</div>
```

## Guideline

When adding or changing shared visual styles, prefer updating tokens in this folder before editing individual components.
