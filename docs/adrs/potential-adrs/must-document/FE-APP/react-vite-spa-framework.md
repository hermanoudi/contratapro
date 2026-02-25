# Potential ADR: React 19 + Vite 7 as Frontend SPA Framework

**Module**: FE-APP
**Category**: Technology / Architecture
**Priority**: Must Document (Score: 145)
**Date Identified**: 2026-02-17

---

## What Was Identified

ContrataPro's frontend is built as a Single-Page Application (SPA) using React 19 and Vite 7 as the foundational framework and build toolchain. This is the primary framework structuring the entire frontend application, determining how the UI is composed, how routing works, how the development experience is configured, and how the production bundle is generated and served.

React 19 is used with functional components and hooks throughout. There are no class components. The application is bootstrapped with `createRoot` (React 18+ concurrent mode API) via `frontend/src/main.jsx`, wrapped in `StrictMode`. Vite 7 provides the dev server (with hot module replacement), the build pipeline (Rollup-based), and the proxy configuration for local API forwarding.

The framework choice also implicitly selected React Router DOM 7 as the routing solution (the standard companion), styled-components for CSS-in-JS, and framer-motion for animations — all of which are React-ecosystem libraries that operate within this foundation.

## Why This Might Deserve an ADR

- **Impact**: Every frontend file in the codebase — all 20 pages, 9 components, 2 contexts — is a React component. Vite is the sole build tool controlling bundling, dev server, and proxy behavior. This decision defines the entire frontend development stack.
- **Trade-offs**: React SPA means all routing is client-side. This has SEO implications (addressed partially by react-helmet-async but not server-side rendering). An alternative like Next.js would have provided SSR out of the box. Vite was chosen over Create React App (now deprecated) or webpack-based setups, providing significantly faster HMR and build times.
- **Complexity**: React 19 introduces concurrent features; React Router 7 introduces a new data router model. The version choices lock the team to specific migration paths.
- **Team Knowledge**: Every frontend contribution requires React and Vite knowledge. Understanding the Vite proxy (dev) vs. Vercel rewrite (prod) behavior is essential and is part of this framework configuration.
- **Future Implications**: The SPA architecture choice means SEO relies on client-side rendering — future requirements for SSR or SSG would require migrating to Next.js or Remix. The Vite build pipeline choice affects CI/CD build times, bundle optimization strategies, and plugin ecosystem.

## Evidence Found in Codebase

### Key Files
- [`frontend/src/main.jsx`](../../../../../frontend/src/main.jsx) - Lines 1-33
  - React 19 SPA entry point using `createRoot`, `StrictMode`, `HelmetProvider` wrapper
- [`frontend/src/App.jsx`](../../../../../frontend/src/App.jsx) - Lines 1-101
  - Top-level React component: 20 routes defined with React Router DOM, `TourProvider` global context, `Toaster` UI provider
- [`frontend/vite.config.js`](../../../../../frontend/vite.config.js) - Lines 1-22
  - Vite 7 configuration: `@vitejs/plugin-react`, dev server proxy rules for `/api` and `/uploads`
- [`frontend/package.json`](../../../../../frontend/package.json) - Lines 1-44
  - Dependency declarations: `react@^19.2.0`, `react-dom@^19.2.0`, `vite@^7.2.4`, `react-router-dom@^7.11.0`

### Code Evidence

```jsx
// frontend/src/main.jsx:27-33
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
```

```js
// frontend/vite.config.js:5-22
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['vaguely-semifinished-mathilda.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

```jsx
// frontend/src/App.jsx:30-98 (excerpt)
function App() {
  return (
    <TourProvider>
    <Router>
      <Toaster position="top-right" ... />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProfessionalLayout><Dashboard /></ProfessionalLayout>} />
          {/* 20 routes total */}
        </Routes>
      </div>
    </Router>
    </TourProvider>
  );
}
```

### Impact Analysis
- Introduced: Project inception (core framework, present from initial commit)
- Affects: All 20 pages, 9 components, 2 contexts, 4 config files
- Modules touched: FE-APP, FE-PUB, FE-PRO, FE-CLI (entire frontend)
- Recent themes: Vite ngrok host allowlist added (development convenience)
- Git history: Not available for enrichment

### Alternatives (if observable)
- The `vercel.json` configuration with `"framework": "vite"` indicates Vite was an explicit selection recognized by Vercel's deployment platform (vs. framework auto-detection)
- `@vitejs/plugin-react` is used (standard Babel-based transforms), not `@vitejs/plugin-react-swc` (faster SWC-based alternative) — a deliberate speed vs. compatibility tradeoff
- React 19 (latest major) was chosen over React 18 (more stable/widespread at time of project start), indicating preference for latest features over conservative versioning

## Questions to Address in ADR (if created)

- Why React SPA over SSR frameworks (Next.js, Remix) given SEO is important for a marketplace?
- What drove the choice of Vite 7 over other build tools (webpack, Parcel, Turbopack)?
- Was Create React App considered and dismissed?
- Why React 19 (bleeding edge) over React 18 (stable)?
- How are SEO limitations of client-side rendering mitigated (react-helmet-async, structured data)?
- What is the migration path if SSR becomes a requirement?

## Related Potential ADRs
- None identified yet in FE-APP module. Related to `vercel.json` SPA rewrite configuration (see Additional Notes).

## Additional Notes

**Deliberate no-service-layer constraint**: CLAUDE.md explicitly states "No `src/services/` dir — use inline `fetch()` with `API_URL` from `config.js`". This is an architectural decision closely tied to the framework choice — it was deliberately decided that React pages would own their own data fetching logic rather than delegating to a service abstraction layer. This pattern affects all 20 pages and every future page that will be created. While it scored below the 75-point threshold for a standalone ADR (score: 55), it is highly relevant context for any team member working in this codebase. Consider whether this constraint warrants its own ADR or can be captured as a section of the formal framework ADR.

**API URL abstraction**: `frontend/src/config.js` provides a single `API_URL` constant (`/api` in production, `http://localhost:8000` in dev) consumed by every page via inline fetch. The Vite proxy (`/api` → `localhost:8000`) and Vercel rewrite (`/api/*` → `https://api.contratapro.com.br/$1`) implement this abstraction at the infrastructure layer. This is structurally important but is implementation detail of the deployment topology rather than a primary architectural decision.

**JWT in localStorage**: All authenticated pages read `localStorage.getItem('token')` and pass it as `Authorization: Bearer` header. This is a security-relevant pattern (XSS exposure risk vs. HttpOnly cookie alternative) that touches FE-APP at the layout component level. It likely belongs in the AUTH module's ADR rather than here.
