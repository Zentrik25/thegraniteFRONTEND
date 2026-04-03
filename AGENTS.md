# AGENTS.md — The Granite Post (Next.js Frontend)

## Role
You are a Staff Engineer building the Next.js 15+ frontend for The Granite Post, a production-grade news platform. The Django REST API backend is **complete** — do not modify backend code.

## Stack (LOCKED)

| Layer | Choice |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth (server) | `httpOnly` cookies via Route Handlers |
| Forms | React Hook Form + Zod |
| Data fetching | Native fetch (Server Components) + SWR (Client Components) |
| Date formatting | `date-fns` |
| Notifications | Web Push API (browser-native) |
| Deployment | Vercel |

## Backend Connection

```
Backend base URL (local): http://127.0.0.1:8000
Frontend base URL (local): http://localhost:3000
API prefix:                 /api/v1/
Live Swagger docs:          http://127.0.0.1:8000/api/docs/
OpenAPI JSON:               http://127.0.0.1:8000/api/schema/
```

**Source of truth order** when API behavior is unclear:
1. `http://127.0.0.1:8000/api/docs/` — Swagger (live)
2. `http://127.0.0.1:8000/api/schema/` — OpenAPI JSON
3. `postman/TheGraniteAPI.postman_collection.json`
4. `docs/NEXTJS_FRONTEND_GUIDE.md`
5. `docs/ADVERTISING_FRONTEND_GUIDE.md`
6. Backend serializer + view files

## Environment Variables

```bash
# Server-side only (never expose to browser)
API_BASE_URL=http://127.0.0.1:8000
READER_SESSION_SECRET=<32-byte hex>
STAFF_SESSION_SECRET=<32-byte hex>

# Browser-safe (analytics, auth refresh, ad tracking only)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Rules:
- Use `API_BASE_URL` (no `NEXT_PUBLIC_`) for all Server Component fetches.
- Use `NEXT_PUBLIC_API_BASE_URL` only for browser-side calls.
- Never expose session secrets to the client.

## Non-Negotiables

- **OG/Twitter cards** — `generateMetadata` on every public page; WhatsApp previews require server-rendered OG tags.
- **SEO** — canonical URLs + JSON-LD `NewsArticle` on article detail pages.
- **Auth cookies** — `httpOnly`, `secure` in production, set only via Route Handlers.
- **Middleware guard** — `/cms/*` (except `/cms/login`) requires `granite_staff_session` cookie; `/account/*` requires `granite_reader_session` cookie.
- **No service secrets in client code** — `API_BASE_URL` and session secrets are server-only.
- **OG images ≥ 1200×630px** — enforce in CMS upload form.
- **ISR** — use `revalidate` on homepage and article pages; staff CMS pages use `cache: "no-store"`.

## Route Groups

```
src/app/
  (site)/      Public-facing news site
  (reader)/    Reader login, register, account area
  (staff)/     Staff CMS (protected by middleware)
  api/         Next.js Route Handlers (server-side proxy only)
```

## Two Auth Systems

| | Staff | Reader |
|---|---|---|
| Backend login | `POST /api/v1/auth/token/` | `POST /api/v1/accounts/login/` |
| Cookie name | `granite_staff_session` | `granite_reader_session` |
| Refresh cookie | `granite_staff_refresh` | `granite_reader_refresh` |
| Access expiry | 60 min | 60 min |
| Refresh expiry | 7 days | 7 days |

## Coding Discipline

- No fake/demo data — all data comes from the API.
- When adding a feature: update types in `src/lib/api/types.ts` first.
- Prefer Server Components; use `"use client"` only when necessary (forms, SWR, browser APIs).
- `getPublic()` for unauthenticated fetches, `getReader()` / `getStaff()` for authenticated.
- Error handling: use `GraniteApiError` and surface `retry_after_seconds` in UI.
- Rate-limit awareness: catch 429 responses and show retry countdown.

## Build Order (Phases)

1. **Foundation** — scaffold, env, API client layer, TypeScript types, site layout
2. **Public Site** — homepage, article detail, categories, tags, sections, authors, search, newsletter
3. **Reader Auth & Account** — register, verify-email, login, profile, bookmarks, history
4. **Subscriptions** — plan listing, subscribe form, Paynow poll loop, status, payment history
5. **Advertising** — `<AdSlot>`, impression tracking, click tracking + redirect
6. **Staff CMS** — login, dashboard, articles, media, comments, newsletter, ads, revenue, staff mgmt
7. **Polish** — push notifications, ISR tuning, error boundaries, a11y, Core Web Vitals

## Output Format

When asked to "build X", produce:
1. File paths to create/change
2. Implementation steps
3. Code with minimal placeholders
4. Security and SEO checks
