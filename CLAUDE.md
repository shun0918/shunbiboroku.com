# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal Next.js 16 blog deployed at `shunbiboroku.com`. App Router only. Posts and works are authored as Markdown in the repo (no CMS).

## Commands

| Task                                             | Command                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Dev server (http://localhost:3000)               | `npm run dev` (Turbopack)                                                           |
| Production build                                 | `npm run build` (uses `--webpack` because `@serwist/next` injects a webpack plugin) |
| Serve production build                           | `npm run start`                                                                     |
| oxlint (src only)                                | `npm run lint` / autofix `npm run lint:fix`                                         |
| oxfmt check (src + scss + root JSON + CLAUDE.md) | `npm run format` / write `npm run format:write`                                     |
| TypeScript check (tsgo, primary)                 | `npm run type-check`                                                                |
| TypeScript check (tsc fallback)                  | `npm run type-check:tsc` or `npx tsc --noEmit`                                      |

There is **no test framework** configured — no `npm test`, no Jest/Vitest/Playwright. Verify changes manually via the dev server.

`predev` and `prebuild` hooks run `scripts/copy-content-images.js`; `postbuild` runs `next-sitemap`.

## Routing (App Router)

Routes live under `src/app/`:

- `src/app/layout.tsx` — RootLayout. Owns `<html>` / `<body>`, the site-wide `Metadata` (title, OGP, PWA manifest link, favicons, theme-color), Google Fonts `<link>`, AdSense `<script>`, GA `<Script>` (next/script, `afterInteractive`), and `<Footer>`. Wraps `<PageViewTracker>` in `<Suspense>`.
- `src/app/page.tsx` — home.
- `src/app/works/page.tsx` — works list.
- `src/app/post/[slug]/page.tsx` — post detail. Uses `generateStaticParams` for all slugs, `generateMetadata` for per-post OGP, and `dynamicParams: false` so unknown slugs 404 at build time.
- `src/app/_components/PageViewTracker.tsx` — `'use client'` component that pushes GA pageview events on navigation using `usePathname` + `useSearchParams`.

All page/layout components are server components (default) except `PageViewTracker`. Data loaders (`src/lib/content/*.ts`) are called directly in async server components — no `getStaticProps`.

## Content pipeline

Source of truth lives in `content/`:

```
content/{post,works}/<slug>/
  ├── index.md      # frontmatter + body
  └── images/       # thumbnail + embedded images
```

`scripts/copy-content-images.js` copies `content/**/images/` → `public/content/` before dev/build. **Never edit images under `public/content/` directly** — they are regenerated and your changes will be lost. Edit the originals in `content/<type>/<slug>/images/`.

In markdown, image refs use `./images/<file>`; the post page rewrites them to `/content/<type>/<slug>/images/<file>` at render time.

Loader code lives in `src/lib/content/`:

- `posts.ts`, `works.ts` — gray-matter parses frontmatter and validates required fields
- `paths.ts` — resolves slug → file paths
- `description.ts` — auto-generates OGP description from the first 100 chars of the post body (don't add `description` to frontmatter)

Post bodies render via `react-markdown` with `remark-gfm` (GFM tables/checkboxes), `rehype-raw` (inline HTML), and `rehype-prism-plus` (syntax highlighting via PrismJS). These run on the server.

## Metadata / SEO

OGP and Twitter Card meta are produced entirely through Next.js's Metadata API in each page:

- `export const metadata` for static pages (home, works)
- `export async function generateMetadata({ params })` for dynamic post pages

The site-level defaults (including `metadataBase`, PWA icon set, `msapplication-*` tiles, `apple-mobile-web-app-*`, `theme-color`) are set in `src/app/layout.tsx`. Page-level exports only override what's post-specific.

## PWA (Serwist)

Service worker generation uses `@serwist/next`, configured in `next.config.js` as `withSerwist` around the config. `src/sw.ts` is the Serwist runtime entry (precache + default runtime caching). Output lives at `public/sw.js` (generated, gitignored). `public/manifest.json` is hand-written.

Serwist injects a webpack plugin, so production builds must use `next build --webpack`. Dev disables Serwist (`disable: process.env.NODE_ENV === 'development'`) and uses Turbopack. `next.config.js` also sets an empty `turbopack: {}` to silence the mixed-bundler warning during dev.

## Styling system

SCSS Modules per component (`src/styles/components/*.module.scss`) and per page (`src/styles/pages/`). The base layer:

- **Theme tokens** are CSS custom properties on `:root` in `src/styles/_app/globals.scss`: `--c-primary`, `--c-primary-darker`, `--c-primary-lighter`, `--c-text-*`, `--c-bg-*`, `--font-*`. **Always reference tokens; never hardcode colors** — the palette is actively tuned (see git log for recent neumorphic refinements).
- **Neumorphic mixins** in `src/styles/base/variables.scss`:
  - `@include shadow-bumps($distance)` — raised/embossed surface
  - `@include shadow-dent($distance)` — inset/depressed surface
  - `@include shadow-transition()` — standard 0.2s ease-in-out for box-shadow
  - Use these instead of writing box-shadow by hand.
- **Responsive**: `@include mq('sm'|'md'|'lg'|'xl')` for max-width media queries (mobile-first); `@include container()` for the standard responsive max-width wrapper.
- **Imports**: `next.config.js` sets `sassOptions.loadPaths` to `src/styles`, so `@use 'base/variables' as *;` (or the older `@import 'base/variables';`) works from any `.scss` file without relative paths. The codebase still uses legacy `@import`; Sass deprecation warnings for it and for global built-ins are currently silenced via `sassOptions.silenceDeprecations` — migrating to `@use` is a future tidy-up.
- **Post body styles** are in `src/styles/base/post-body.scss` — keyed off `h3` as the top heading level.

## Tooling

- **TypeScript**: 6.0, `strict: true`, `moduleResolution: "bundler"`, `types: ["node"]` (so `src/global.d.ts` augments `Window` for gtag). Primary type-checker is **tsgo** (`@typescript/native-preview`, nightly-pinned) via `npm run type-check`; **tsc** stays as a fallback via `npm run type-check:tsc` while tsgo is in preview.
- **oxlint**: 1.60 with config in `.oxlintrc.json`. Enables the `typescript`, `unicorn`, `oxc`, `react`, and `nextjs` plugins. All 21 rules from the old `next/core-web-vitals` preset are enumerated explicitly, including the two deliberate `off` overrides (`nextjs/no-img-element`, `nextjs/no-page-custom-font`) — native `<img>` is a project choice. React Hooks rules live under the `react/*` prefix in oxlint. `scripts/`, `next-sitemap.config.js`, `next.config.js`, and `src/sw.ts` are ignored.
- **oxfmt**: 0.45 with config in `.oxfmtrc.json` (migrated from the old `.prettierrc` via `oxfmt --migrate=prettier`). Scope is `src/**/*.{js,jsx,ts,tsx,scss}` + root JSON + `CLAUDE.md`. `README.md` stays hand-controlled (oxfmt rewrites frontmatter examples incompatibly with authored posts). `content/**/*.md` is excluded — post bodies are authorial prose rendered through react-markdown regardless of source whitespace.
- **Pre-commit**: husky + lint-staged auto-run `oxlint --fix` and `oxfmt` on staged files before each commit (see `.husky/pre-commit` and the `lint-staged` block in `package.json`). Type-check is not in the hook — run `npm run type-check` manually before pushing.

## Conventions

- **Path alias**: `~/*` → `src/*` (in `tsconfig.json`). Use `~/lib/...`, `~/components/...`, etc.
- **`params` is a Promise** in App Router pages under Next.js 16. Destructure with `const { slug } = await params;`.

## Content authoring rules

Frontmatter schemas for posts/works, image conventions, and the **headings rule (start at `###`; never use `#` or `##` in post bodies)** are documented in `README.md`. Refer to it before adding or editing content under `content/`.
