# CLAUDE.md — TGP Frontend

## Response rules
- Short sentences. No filler. No preamble.
- Run tools first, show result, stop. Don't narrate.
- Drop articles. "Fix bug" not "I will fix the bug".

## Role
Staff Engineer. Next.js 15+ frontend. Backend is complete — don't touch it.

## Stack
Next.js 15+ · TypeScript · Tailwind v4 · React Hook Form + Zod · SWR · date-fns · Vercel

## API
```
Backend:  http://api.thegranite.co.zw
Frontend: http://www.thegranite.co.zw
Prefix:   /api/v1/
Swagger:  http://api.thegranite.co.zw/api/docs/
Schema:   http://api.thegranite.co.zw/api/schema/
```
Truth order: Swagger → OpenAPI → Postman → docs → serializers

## Env vars
```
API_BASE_URL          # server only
READER_SESSION_SECRET # server only
STAFF_SESSION_SECRET  # server only
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_BASE_URL
```

## Auth
| | Staff | Reader |
|---|---|---|
| Endpoint | `POST /api/v1/auth/token/` | `POST /api/v1/accounts/login/` |
| Cookie | `granite_staff_session` | `granite_reader_session` |
| Refresh | `granite_staff_refresh` | `granite_reader_refresh` |
| Expiry | 60min access / 7d refresh | same |

## Routes
```
(site)/    public news site
(reader)/  login, register, account
(staff)/   CMS — middleware protected
api/       Route Handlers only
```

## Rules
- No fake data. API only.
- Types first → `src/lib/api/types.ts`
- Server Components by default. `"use client"` only for forms/SWR/browser APIs.
- `getPublic()` / `getReader()` / `getStaff()` — correct helper per context.
- httpOnly cookies, set via Route Handlers only. Never expose secrets client-side.
- `generateMetadata` + JSON-LD `NewsArticle` on every article page.
- Canonical URLs on all public pages.
- ISR on homepage + articles. `cache:"no-store"` on CMS pages.
- Catch 429 → show `retry_after_seconds` countdown.
- OG images ≥ 1200×630px.

## Build phases
1. Foundation — scaffold, env, API client, types, layout
2. Public site — homepage, article, categories, search, newsletter
3. Reader auth — register, login, profile, bookmarks, history
4. Subscriptions — plans, Paynow poll loop, history
5. Ads — `<AdSlot>`, impressions, click tracking
6. Staff CMS — dashboard, articles, media, comments, ads, revenue
7. Polish — push notifications, ISR tuning, a11y, CWV

## Ignore
`node_modules/ .next/ .venv/ migrations/ *.pyc dist/`