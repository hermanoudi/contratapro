# ADR-001: React 19 + Vite 7 as Frontend SPA Framework

**Status:** Accepted
**Date:** 2026-01-14
**Related to:**
- [ADR-001: JWT Storage in Browser localStorage](../../AUTH/needs-input/ADR-001-jwt-storage-in-browser-localstorage.md)
- [ADR-001: FastAPI as Primary Backend Framework](../../CORE/ADR-001-fastapi-as-primary-backend-framework.md)

---

## Context and Problem Statement

ContrataPro required a frontend framework to deliver a Brazilian professional services marketplace
to end users. The chosen framework would define the component model, client-side routing strategy,
build pipeline, development server behavior, and the rendering approach for all user-facing pages
across the client and professional workflows.

The team selected React 19 with Vite 7 as a Single-Page Application at project inception. This
decision established client-side rendering as the rendering model for all 20 routes — including
publicly accessible marketplace pages where SEO discoverability directly affects organic user
acquisition. React Router DOM 7 was adopted as the standard routing companion, styled-components
for component-scoped styling, and framer-motion for animated transitions, all as React-ecosystem
dependencies that operate within this foundation.

[NEEDS INPUT: Was a product or SEO strategy assessment performed before committing to client-side
rendering? Marketplaces typically depend on organic search traffic, and the SPA choice defers
indexability to client-side solutions (react-helmet-async) rather than server-generated HTML.]

## Decision Drivers

- The Vercel deployment target provides native SPA hosting with zero-configuration SPA rewrite
  rules, minimizing deployment complexity for a client-side routing model
- Vite 7 offers significantly faster hot module replacement and build times compared to
  webpack-based toolchains, reducing development cycle friction for a growing page count
- React's ecosystem maturity ensures availability of all required companion libraries
  (routing, animation, form handling, SEO metadata) without custom implementations
- The explicit architectural constraint prohibiting a `src/services/` directory mandates
  inline data fetching per page, which is most naturally expressed within React's component
  and hook model
- React 19's concurrent mode APIs align with progressive rendering patterns if the architecture
  evolves toward Suspense-based data loading

## Considered Options

1. **React 19 + Vite 7 SPA** — client-side rendered SPA with React Router DOM for routing,
   deployed as static assets on Vercel with an API proxy rewrite rule
2. **Next.js (App Router)** — React-based SSR/SSG hybrid framework with built-in file-system
   routing, server components, and automatic SEO-friendly HTML generation per route
3. **React 18 + Vite (stable baseline)** — same SPA architecture using the prior stable React
   major to reduce exposure to React 19 breaking changes and ecosystem incompatibilities

## Decision Outcome

Chosen option: React 19 + Vite 7 SPA, because it provides a fast development experience via
Vite's HMR pipeline, native compatibility with the Vercel static deployment model, and full
alignment with the React ecosystem libraries already committed to (React Router DOM, framer-motion,
styled-components, react-helmet-async). The client-side rendering trade-off is partially addressed
by react-helmet-async for metadata injection.

[NEEDS INPUT: Was Next.js formally evaluated and rejected, or was it not considered? Documenting
the explicit rationale for choosing SPA over SSR is especially important given that marketplace
SEO is a growth-critical factor for ContrataPro.]

## Pros and Cons of the Options

### React 19 + Vite 7 SPA

- Good: Vite's Rollup-based build pipeline and native ESM dev server produce fast HMR cycles
  regardless of page count growth
- Good: Vercel's SPA rewrite (`/* → /index.html`) requires no server configuration, making
  deployment and CDN caching trivially simple
- Good: `@vitejs/plugin-react` with Babel transforms provides broad ecosystem compatibility
  at the cost of slower individual transforms compared to SWC
- Bad: All 20 routes are rendered client-side; initial HTML is a blank shell, requiring JavaScript
  execution before any content or metadata is visible to crawlers that do not execute JavaScript

### Next.js (App Router)

- Good: Server-rendered HTML per route provides crawler-ready content and eliminates the indexability
  gap that react-helmet-async only partially fills
- Good: Built-in image optimization, font loading, and route-level code splitting reduce
  manual optimization work
- Bad: App Router introduces a server/client component boundary that would require restructuring
  all existing components, auth flows, and data-fetching patterns
- Bad: Next.js's opinionated routing and build model is incompatible with the current Vite
  configuration and the Vercel SPA deployment setup without a full migration

### React 18 + Vite (stable baseline)

- Good: React 18 has broader third-party library compatibility and a more stable ecosystem
  than React 19 at the time of selection
- Bad: React 19 was deliberately chosen; staying at React 18 would require a future upgrade
  anyway, deferring rather than eliminating migration cost
- Bad: Concurrent features available in React 19 (improved Suspense, Actions) would not be
  available for progressive adoption

## Consequences

The SPA architecture imposes a permanent constraint on SEO discoverability for publicly accessible
marketplace pages. react-helmet-async injects metadata tags client-side, but crawlers that do not
fully execute JavaScript — including some social media link previewers — will receive a blank HTML
shell. This gap is tolerable if ContrataPro's primary acquisition channel is paid or direct, but
becomes load-bearing if organic search is a significant growth driver. Any future requirement for
server-rendered marketplace listings or professional profile pages would require migrating the
public routes to Next.js or Remix without disrupting the authenticated SPA flows.

The no-service-layer constraint (`CLAUDE.md`) combined with React's component model results in
inline `fetch()` calls distributed across all pages. This pattern is structurally coupled to the
React component lifecycle and is incompatible with non-React rendering contexts. Any framework
migration would require auditing and extracting data-fetching logic from all 20 pages. The
Vite proxy (development) and Vercel rewrite (production) topology for API routing is also
tightly coupled to this framework choice and would need to be re-evaluated if the deployment
target changes.

Choosing React 19 at project inception — the newest major at the time — creates an obligation
to track React's stability advisories and potential breaking changes in companion libraries.
The `@vitejs/plugin-react` Babel-based transform path was selected over the SWC-based alternative
(`@vitejs/plugin-react-swc`), accepting slower per-file transform times in exchange for broader
Babel plugin ecosystem compatibility.

## References

- `frontend/src/main.jsx:1`
- `frontend/src/App.jsx:1`
- `frontend/vite.config.js:1`
- `frontend/package.json:1`
- `frontend/vercel.json:1`
