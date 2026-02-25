# ADR-001: ViaCEP Backend Proxy for Address Resolution

**Status:** Accepted
**Date:** 2026-02-10
**Related to:** [ADR-001: PostgreSQL GIN Trigram Indexes for Professional Search](./ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md)

---

## 1. Context and Problem Statement

The ContrataPro marketplace uses Brazilian postal codes (CEP) as the entry point for geographic search. When a user types a CEP, the system must resolve it to a city name, which becomes the geographic filter applied to all professional search queries. Without accurate and reliable CEP resolution, location-based discovery does not function.

The resolution requires calling an external Brazilian address API. The question was whether that call should originate from the browser or from the backend. The browser-direct approach had been the initial implementation but introduced CORS restrictions when calling `viacep.com.br` cross-origin and created sequential latency — the frontend would resolve the CEP first, then issue the search query with the resulting city, making both network round-trips visible to the user.

The decision was made during the search optimization sprint of February 2026 to route all CEP lookups through a backend proxy endpoint, making the backend the single integration point with the external address provider.

## 2. Decision Drivers

- CEP resolution is the sole entry point for geographic context in the professional search flow — reliability directly affects feature availability.
- Direct browser calls to `viacep.com.br` are blocked by CORS policy, requiring either a proxy or a JSONP/CORS workaround.
- Sequential frontend latency (CEP call then search call) degraded perceived performance on search interactions.
- The external API uses Portuguese-language response fields that do not match the frontend's expected data model.
- A single backend integration point allows timeout policy, input sanitization, and future provider changes to be made without frontend releases.

## 3. Considered Options

- **Option A — Backend proxy via dedicated FastAPI endpoint**: All CEP lookups routed through `GET /cep/{cep}`, which calls ViaCEP server-side and returns normalized English-keyed fields.
- **Option B — Direct browser-to-ViaCEP calls**: Frontend fetches `viacep.com.br` directly from the browser, then passes the resolved city to the search query.

## 4. Decision Outcome

Chosen option: **Option A — Backend proxy via dedicated FastAPI endpoint**, because it eliminates CORS restrictions, consolidates input sanitization and error normalization in one place, and decouples the frontend from the external provider's API surface and error format.

[NEEDS INPUT: Was the proxy pattern chosen primarily for CORS elimination, or was the sequential latency reduction (collapsing two frontend network calls into one) considered equally important? The Impact Analysis notes both but does not rank them.]

## 5. Pros and Cons of the Options

### Option A — Backend proxy via dedicated FastAPI endpoint

- Good: Resolves CORS restrictions without client-side workarounds.
- Good: Centralizes timeout policy (10 seconds), input sanitization (8-digit validation, non-digit stripping), and error handling for the ViaCEP-specific `{"erro": true}` response format.
- Good: Frontend is fully decoupled from the external provider — changing providers requires no frontend changes.
- Bad: Adds a network hop through the backend on every CEP lookup, increasing backend load for what is otherwise a stateless external call.

### Option B — Direct browser-to-ViaCEP calls

- Good: No backend infrastructure required for address resolution; zero backend load.
- Good: Simpler architecture — one fewer service boundary.
- Bad: Blocked by CORS policy when called cross-origin from browser JavaScript without additional workarounds.
- Bad: Sequential latency: the frontend must complete the CEP call before issuing the search query, adding a full network round-trip to the user-perceived search time.

## 6. Consequences

The backend is now the sole integration point for Brazilian address resolution. Any availability issues with ViaCEP will surface as CEP resolution failures in the search flow. The current implementation returns no result when ViaCEP is unreachable, which means the city filter is silently cleared and the user cannot proceed with location-based search.

[NEEDS INPUT: What is the approved fallback strategy when ViaCEP is unavailable — should the system return an error to prompt manual city entry, fall back to an alternative provider (Postmon, OpenCEP), or allow search without geographic filtering?]

Frontend developers and new engineers must route all CEP lookups through `${API_URL}/cep/{cep}` rather than calling `viacep.com.br` directly. Direct browser calls will fail due to CORS and would bypass the input validation layer. This pattern should be treated as the canonical approach for any future external address or geographic API integration.

The proxy currently makes one upstream request per CEP lookup with no response caching. For a marketplace where many users search from the same metropolitan areas, repeated resolution of identical CEPs generates unnecessary upstream traffic.

## 7. References

- `backend/app/services/viacep.py:1-96` — ViaCEP service: input sanitization, timeout policy, Portuguese-to-English field normalization
- `backend/app/routers/cep.py:1-45` — FastAPI proxy endpoint registration and response schema
- `frontend/src/pages/Search.jsx:643-658` — CEP input handler calling the backend proxy
- `backend/app/main.py:137` — Router registration in application entry point
