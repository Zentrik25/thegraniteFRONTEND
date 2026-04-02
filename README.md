# The Granite Frontend

Next.js frontend scaffold for The Granite Post.

## Requirements

- Node.js 20.9 or newer
- npm, pnpm, yarn, or bun

## Quick start

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Backend target

The app is pre-wired to talk to the Django API at:

```text
http://127.0.0.1:8000
```

## Main route groups

- `(site)` public site
- `(reader)` reader auth, account, and subscription area
- `(staff)` newsroom and CMS area

## Important notes

- Staff auth and reader auth must stay separate.
- Premium article detail pages should handle `402` paywall responses.
- The current subscription flow returns `redirect_url` and `poll_url`, but not `payment_id`, so the frontend should fetch the latest pending payment before calling the poll endpoint.
