# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server (uses Turbopack)
npm run build        # Production build
npm run lint         # ESLint

# Database scripts (run with bun)
npm run migrate                  # Run DB migrations
npm run import-books             # Import from Goodreads CSV
npm run update-covers            # Fetch book covers
npm run pregenerate-synopses     # Pre-generate Gemini synopses
```

Environment: requires `.env.local` with `DATABASE_URL=postgresql://...`

## Architecture

**Next.js App Router** personal portfolio site with 5 pages:

| Route | Content |
|---|---|
| `/me` | Home — hero, about blurbs, projects grid |
| `/experience` | Work/club history |
| `/drawer-of-thoughts` | Journal entries organized by grade |
| `/bookshelf` | Goodreads books fetched from PostgreSQL via `/api/books` |
| `/art-gallery` | Draggable photo collage ("my room" tab) + videos ("my mind" tab) |

Root `/` redirects to `/me`.

## Key Patterns

**Component structure:** Every component is a `.tsx` + `.module.css` pair (e.g. `Header.tsx` / `Header.module.css`). All in `/components/`.

**Theme system:** Three themes (`light` / `dark` / `orange`) stored in `localStorage` and applied via `data-theme` attribute on `<html>`. CSS variables defined in `globals.css` per theme. `ThemeProvider` wraps the whole app. Shift+O toggles orange mode. Import `useTheme()` from `@/components/ThemeProvider` to read the current theme.

**Sound effects:** A pooled `SoundManager` singleton (in `hooks/useSoundEffects.ts`) pre-loads 4 WAV effects from `/public/assets/sfx/`. Components call `useSoundEffects()` and invoke `playClick()`, `playSelect()`, `playDeselect()`, `playMenu()` on interactions. The `soundManager` singleton is also exported for direct use (e.g. in ThemeProvider).

**Animations:** Framer Motion throughout. Shared `fadeInUp` / `staggerContainer` variants appear in each page file. `whileInView` + `viewport={{ once: true }}` is the standard pattern for scroll-triggered animations.

**Static content:** The projects list, thoughts/journal entries, and collage items are all hardcoded in TypeScript — `app/me/page.tsx` (projects), `app/drawer-of-thoughts/page.tsx` (thoughts), `lib/collageItems.ts` (collage items with default positions).

**Collage / art gallery positions:** `lib/collageItems.ts` defines each draggable item's config (src, dimensions, default x/y %). `lib/artGalleryItems.ts` defines art-gallery-specific default positions. User-adjusted positions are persisted to `localStorage` with versioned keys (`STORAGE_KEY`, `ART_GALLERY_STORAGE_KEY`).

**Database:** PostgreSQL via `pg` pool in `lib/db.ts`. The pool reads `DATABASE_URL` or `STORAGE_DATABASE_URL`. Only the bookshelf feature uses the DB. API routes in `app/api/books/`, `app/api/book-synopsis/`, `app/api/book-cover-search/`.

**Image sources allowed** (configured in `next.config.ts`): `api.microlink.io`, `covers.openlibrary.org`, `images-na.ssl-images-amazon.com`, `books.google.com`, `books.googleusercontent.com`, `image.pollinations.ai`.

**Path alias:** `@/` maps to the project root (configured in `tsconfig.json`).
