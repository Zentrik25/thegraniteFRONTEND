# Agent Orchestration — The Granite Post Frontend

## Available Agents

| Agent | Purpose | When to Use |
|---|---|---|
| `planner` | Implementation planning | Before starting any new page or feature |
| `architect` | System design | API client structure, auth flow, route group decisions |
| `tdd-guide` | Test-driven development | New components, Route Handlers, hooks |
| `code-reviewer` | Code quality, patterns | After writing any component or utility |
| `security-reviewer` | Auth, cookies, CSRF, secrets | Before every commit touching auth or cookies |
| `build-error-resolver` | Fix TypeScript / Next.js build errors | When `next build` fails |
| `e2e-runner` | Playwright E2E tests | Login flows, paywall, comment posting |
| `refactor-cleaner` | Dead code, duplication | Post-phase cleanup |
| `frontend-engineer` | BBC-style UI, Server Components, Tailwind | Page layout and component implementation |
| `security-auditor` | RBAC, cookie security, CSP, abuse | Before each phase ships |

## Immediate Agent Usage (No User Prompt Needed)

| Trigger | Agent |
|---|---|
| Starting a new page or multi-file feature | **planner** |
| Just wrote or modified a component/hook | **code-reviewer** |
| Touching auth cookies or Route Handlers | **security-reviewer** |
| Build or type error | **build-error-resolver** |
| Architectural decision (route groups, ISR strategy) | **architect** |

## Parallel Task Execution

Always launch independent agents in parallel:

```
# GOOD
Launch 3 agents simultaneously:
1. security-reviewer → review auth Route Handlers
2. code-reviewer → review ArticleCard component
3. tdd-guide → write tests for useBookmark hook

# BAD
Run security-reviewer, wait, then code-reviewer, wait, then tdd-guide
```

## Phase-Specific Agent Workflows

### Phase 1 — Foundation
```
planner → architect → code-reviewer (after API client layer)
```

### Phase 2 — Public Site Pages
```
For each page:
  tdd-guide (write test) → implement → code-reviewer → security-reviewer (if auth-gated)
```

### Phase 3 — Reader Auth
```
security-reviewer FIRST (cookie design review)
→ tdd-guide → implement → code-reviewer → security-reviewer (final)
```

### Phase 4 — Subscriptions (Paynow)
```
planner (Paynow poll loop design)
→ tdd-guide → implement → security-reviewer (payment flow)
→ e2e-runner (end-to-end subscription test)
```

### Phase 5 — Advertising
```
tdd-guide (impression/click tracking)
→ implement AdSlot → code-reviewer
→ security-reviewer (tracking URL exposure check)
```

### Phase 6 — Staff CMS
```
security-reviewer (middleware + RBAC gates FIRST)
→ planner (CMS dashboard structure)
→ implement each section → code-reviewer
→ e2e-runner (login → create article → publish flow)
```

### Phase 7 — Polish
```
e2e-runner (full smoke suite)
→ security-auditor (CSP, headers, cookie flags)
→ refactor-cleaner
```

## Security Review Triggers

**STOP and invoke `security-reviewer` when:**
- Writing or modifying any Route Handler in `src/app/api/`
- Touching `src/middleware.ts`
- Handling JWT tokens or cookies
- Writing any form that POSTs to the backend
- Implementing file uploads (media library)
- Adding analytics or ad tracking calls

## Key Constraints for All Agents

- Backend is **read-only** — never suggest backend changes
- All types live in `src/lib/api/types.ts` — update there first
- Server Components are default; justify every `"use client"` directive
- `API_BASE_URL` must never appear in client bundles
- Cookie paths: access token at `/`, refresh token at `/api/auth` (staff) or `/api/reader` (reader)
- OG images must be server-rendered — no client-only meta tags
