# Application Boundaries

This project is organized as a small multi-application Astro workspace.

- `apps/price`: owns the price comparison application, including its domain types, data collection plugins, catalog helpers, and UI components.
- `apps/worldcup`: owns the World Cup analysis application, including its curated data, analysis helpers, metrics, and UI components.
- `shared`: owns framework-level utilities that may be used by multiple apps, such as the base layout, global styles, URL helpers, and data freshness copy.
- `pages`: remains the Astro routing layer. Route files should be thin wrappers only: they decide the URL, import one app page implementation, optionally re-export `getStaticPaths`, and render that app page.

App folders should not import from each other. Shared code should not import from any app.

## How To Add A New App

1. Create `src/apps/<app-name>/`.
2. Put page implementations in `src/apps/<app-name>/pages/`.
3. Put app-only components, data, plugins, and helpers under that same app folder.
4. Add tiny route wrappers under `src/pages/` for the public URLs.
5. Add a TypeScript alias in `tsconfig.json`, for example `@newapp/*`.
6. Only use `@shared/*` for cross-app UI and utilities.

Cross-app imports should be rare and limited to integration routes such as `sitemap.xml.ts`.
