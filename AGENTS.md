# Agent Development Guide

This repository is a multi-application Astro workspace. Future agents should read this file before making changes.

## Core Architecture

- `src/apps/price` owns the Price Comparison app.
- `src/apps/worldcup` owns the World Cup Match Analysis app.
- `src/apps/chisha` owns the Chisha food discovery app.
- `src/shared` owns cross-app utilities only: base layout, global styles, URL helpers, and data freshness copy.
- `src/pages` is the Astro routing layer. Route files should stay thin: import one app page implementation, optionally re-export `getStaticPaths`, and render it.

App folders must not import from each other. Shared code must not import from any app. Cross-app integration should be limited to route-level files such as `src/pages/sitemap.xml.ts`.

## Commands

- `npm run dev`: start Astro locally.
- `npm run check`: run Astro sync and TypeScript check.
- `npm run build`: collect all app data and build the static site.
- `npm run build:static`: build without running collectors.
- `npm run collect:price`: refresh Price Comparison data.
- `npm run collect:worldcup`: generate World Cup freshness/report data.
- `npm run collect:chisha`: refresh Chisha Google Places data.
- `npm run collect:all`: run all collectors.

Run `npm run check` and either `npm run build` or `npm run build:static` after meaningful changes.

## Security Rules

- Never hardcode credentials, API keys, tokens, private keys, certificates, or connection strings.
- Google Maps/Places keys must be read from `GOOGLE_MAPS_API_KEY` locally or from GitHub Secrets.
- Do not commit generated live data under `data/chisha`, `data/worldcup`, `data/site.json`, or downloaded Chisha photos under `public/chisha/photos`.
- Treat all external data as untrusted. Validate shape before rendering and avoid injecting raw HTML.
- Keep user-facing claims honest. If a data source is not live, say so in the UI and freshness copy.

## App: Chisha

Chisha is the food discovery app at `/chisha/`. It focuses on `臺中市西屯區` for the current MVP.

### Ownership

- Page implementation: `src/apps/chisha/pages/HomePage.astro`
- Place card UI: `src/apps/chisha/components/PlaceCard.astro`
- Types: `src/apps/chisha/core/types.ts`
- Data loader: `src/apps/chisha/core/loadChishaData.ts`
- Search seeds and area config: `src/apps/chisha/data/xitunFeed.ts`
- Collector: `scripts/collect-chisha.ts`
- Public route wrapper: `src/pages/chisha/index.astro`
- Workflow: `.github/workflows/refresh-chisha.yml`

### Data Flow

`scripts/collect-chisha.ts` reads `GOOGLE_MAPS_API_KEY`, queries Google Places for Taichung Xitun food-related searches, normalizes Places details/reviews/photos, downloads allowed place photos to `public/chisha/photos`, and writes:

- `data/chisha/site.json`
- `data/chisha/crawl-report.json`

The page reads data through `getChishaData()`. If `data/chisha/site.json` is missing, the page must show a no-data state instead of mock stores or fake reviews.

### Refresh Strategy

Chisha refreshes daily in `.github/workflows/refresh-chisha.yml`.

Current intended settings:

- `CHISHA_TARGET_PLACES=24`
- `CHISHA_MAX_NEW_PLACES_PER_RUN=8`
- `CHISHA_MAX_PHOTOS_PER_PLACE=1`
- `CHISHA_SEARCH_RESULTS_PER_QUERY=20`

The collector should reuse existing `data/chisha/site.json` and `public/chisha/photos` when available. If the target place count is already met, it should skip unnecessary Google Places/Photos calls. This keeps the demo useful for partners while controlling cost.

The GitHub workflow restores a cache for:

- `data/chisha`
- `public/chisha/photos`

If changing this workflow, preserve the cache behavior unless there is a clear reason not to.

### UI Rules

- Do not use CSS-generated fake food images as a substitute for real store photos.
- If Google Places has no photo, show an explicit no-photo state.
- Place cards should open a detail card/modal with Google-style reviews, rating filters, address, metadata, and a Google Maps link.
- Top controls such as nearby/city/time filters should be real interactive controls or clearly marked as unavailable.
- Google Places reviews are limited by the API. Do not imply that the site has the full Google Maps review archive.

## App: Price Comparison

The Price Comparison app is the original product comparison site. Its public root is `/`.

### Ownership

- App folder: `src/apps/price`
- Data loader: `src/apps/price/core/loadSiteData.ts`
- Domain types: `src/apps/price/core/types.ts`
- Catalog helpers: `src/apps/price/core/catalog.ts`
- Main collector: `scripts/collect.ts`
- Workflow: `.github/workflows/refresh-price.yml`

### Data Flow

`scripts/collect.ts` builds `data/site.json` and `data/crawl-report.json` from:

- Google Trends Taiwan RSS
- Price channel adapters such as momo, PChome, BigGo, and Feebee
- Category/search seed configuration

The app should prefer verified product-page prices. Search/listing URLs may be used only when clearly labeled as market reference, not as exact product offers.

### Product and Pricing Rules

- Do not invent prices, offers, stock status, or product links.
- Avoid showing products with only one usable price source as meaningful comparison pages.
- Preserve distinction between exact product pages and search/listing references.
- Keep data freshness copy honest about which sources are live and which are curated seeds.
- If crawler output is insufficient, show insufficient coverage rather than filling with fake rows.

## App: World Cup Match Analysis

The World Cup app is at `/worldcup/`. It provides match analysis, team/player pages, matchup pages, and topic pages.

### Ownership

- App folder: `src/apps/worldcup`
- Curated data: `src/apps/worldcup/lib/data.ts`
- Topic data: `src/apps/worldcup/lib/topics.ts`
- Metrics/helpers: `src/apps/worldcup/lib/metrics.ts`, `src/apps/worldcup/lib/helpers.ts`
- Page implementations: `src/apps/worldcup/pages`
- Workflow: `.github/workflows/refresh-worldcup.yml`

### Data Posture

World Cup is currently a curated static MVP. `scripts/collect-worldcup.ts` generates an independent crawl/freshness report but does not yet fetch live FIFA, fixture, lineup, injury, weather, or odds data.

### Content Rules

- Keep the positioning as analysis and information, not betting advice.
- Avoid odds, wagering recommendations, or direct gambling calls to action unless a future compliance plan explicitly allows them.
- Cite or describe source posture honestly. If data is curated/static, say so.
- Prefer official/public sources when adding future data.
- Keep pages information-dense and professional, but do not overstate certainty.

## GitHub Actions

The repo uses separate scheduled refresh jobs:

- `.github/workflows/refresh-price.yml`: price/trends crawler.
- `.github/workflows/refresh-worldcup.yml`: World Cup static data report.
- `.github/workflows/refresh-chisha.yml`: Google Places/Photos crawler.
- `.github/workflows/deploy.yml`: build and deploy GitHub Pages.

Do not merge the three app refresh jobs into one scheduled crawler. They are intentionally independent so failures and costs can be understood per app.

## Adding A New App

1. Create `src/apps/<app-name>/`.
2. Put app page implementations in `src/apps/<app-name>/pages/`.
3. Put app-only components, data, collectors, and helpers inside that app folder.
4. Add a thin route wrapper under `src/pages/`.
5. Add a TypeScript alias in `tsconfig.json`.
6. Use `@shared/*` only for cross-app UI and utilities.
7. Add data freshness copy if the app has generated or external data.
8. Add an independent workflow if the app has scheduled data collection.
