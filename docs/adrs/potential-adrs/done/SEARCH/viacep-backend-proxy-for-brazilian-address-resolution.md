# Potential ADR: ViaCEP Backend Proxy for Brazilian Address Resolution

**Module**: SEARCH
**Category**: Architecture / Integration
**Priority**: Must Document (Score: 115)
**Date Identified**: 2026-02-17

---

## What Was Identified

The system integrates with ViaCEP — a free, public Brazilian API that resolves 8-digit CEP (postal code) numbers into structured address data (city, state, neighborhood, street). Rather than having the frontend call ViaCEP directly from the browser, all CEP lookups are routed through a backend proxy endpoint (`GET /cep/{cep}`).

The backend exposes this through a dedicated FastAPI router (`backend/app/routers/cep.py`) backed by a singleton service class (`backend/app/services/viacep.py`). The service uses `httpx` with a 10-second timeout, sanitizes the input (strips non-digits, validates 8-digit length), handles the ViaCEP-specific `{"erro": true}` response format, and translates Portuguese field names (`localidade`, `uf`, `bairro`) into English-keyed response fields (`city`, `state`, `neighborhood`).

The frontend (`frontend/src/pages/Search.jsx`) calls this proxy exclusively via `${API_URL}/cep/${value}`, and both the URL parameters and `localStorage` are used to persist city context between page navigations. This proxy pattern is the sole mechanism through which geographic context enters the search flow — CEP is resolved to a city name, which becomes the city-level geographic filter for professional search.

## Why This Might Deserve an ADR

- **Impact**: CEP resolution is the entry point to the entire geographic discovery feature. All professional search queries are scoped by city, and the city comes exclusively from CEP lookup via this proxy. Without it, location-based search does not function.
- **Trade-offs**: The proxy adds a network hop through the backend (client → backend → ViaCEP → backend → client) but eliminates browser CORS restrictions that would prevent direct calls to `viacep.com.br`. It also collapses sequential latency that existed when the frontend made the CEP call first and then the search call second, because the backend now controls the flow.
- **Complexity**: The proxy abstracts ViaCEP's Portuguese-language API surface, shields the frontend from the external API's error format (`{"erro": true}`), and centralizes timeout/retry policy in one place.
- **Team Knowledge**: Frontend developers must know that CEP resolution goes through the backend proxy, not directly to `viacep.com.br`. Any new page or component that needs address resolution must follow this pattern. New engineers who are unaware of this may attempt to call ViaCEP directly, reintroducing CORS problems and breaking the city-resolution pipeline.
- **Future Implications**: If ViaCEP ever becomes unavailable or paid, the backend service is the single change point. If address resolution accuracy needs improvement (alternative providers: Postmon, OpenCEP, IBGE), the frontend is completely decoupled from that decision. If a caching layer is added for CEP lookups (e.g., Redis), it slots into the backend service without frontend changes.

## Evidence Found in Codebase

### Key Files
- [`backend/app/services/viacep.py`](../../../../../backend/app/services/viacep.py) — Lines 1-96
  - Singleton `ViaCEPService` with `buscar_cep()` static method, 10s timeout, input sanitization, Portuguese-to-English field translation, error handling
- [`backend/app/routers/cep.py`](../../../../../backend/app/routers/cep.py) — Lines 1-45
  - FastAPI router at `/cep/{cep}` that delegates to `viacep_service.buscar_cep()` and returns `CEPResponse`
- [`frontend/src/pages/Search.jsx`](../../../../../frontend/src/pages/Search.jsx) — Lines 643-658
  - `handleCepChange` calls `${API_URL}/cep/${value}` on 8-digit CEP input, sets city state from response

### Code Evidence

```python
# backend/app/services/viacep.py:44-64
async with httpx.AsyncClient(timeout=ViaCEPService.TIMEOUT) as client:
    response = await client.get(url)

    if response.status_code != 200:
        return None

    data = response.json()

    # ViaCEP retorna {"erro": true} quando CEP não existe
    if data.get("erro"):
        return None

    return {
        "cep": data.get("cep", ""),
        "street": data.get("logradouro", ""),
        "complement": data.get("complemento", ""),
        "neighborhood": data.get("bairro", ""),
        "city": data.get("localidade", ""),
        "state": data.get("uf", ""),
    }
```

```javascript
// frontend/src/pages/Search.jsx:643-658
const handleCepChange = async (e) => {
  const value = e.target.value.replace(/\D/g, '');
  setCep(value);
  if (value.length === 8) {
    try {
      const res = await fetch(`${API_URL}/cep/${value}`);
      if (res.ok) {
        const data = await res.json();
        setCity(data.city);
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    setCity('');
  }
};
```

```python
# backend/app/main.py:137
app.include_router(cep.router)
```

### Impact Analysis
- Introduced: 2026-02-10 (search optimization sprint, referenced in MEMORY.md as "Fix 1")
- Context: Fix documented as "Frontend now uses `/api/cep/{cep}` instead of calling ViaCEP directly → eliminates sequential network latency"
- Affects: SEARCH module (backend), FE-PUB (Search.jsx), and implicitly all future external public API integrations
- Pattern: Only one external address provider in the codebase; no direct ViaCEP calls from the frontend exist

### Alternatives (if observable)
- Direct browser-to-ViaCEP calls were explicitly replaced by this proxy (per MEMORY.md "Fix 1")
- Other Brazilian CEP APIs (Postmon, OpenCEP, IBGE APIs) were not considered in the current implementation — ViaCEP was chosen as the de-facto public standard

## Questions to Address in ADR (if created)

- Why was ViaCEP chosen as the CEP provider over alternatives (Postmon, OpenCEP, Google Places Brazil)?
- Was CORS the primary driver, or was sequential latency reduction equally important?
- Should the `/cep/` endpoint cache responses in Redis to reduce external API dependency?
- What is the fallback plan if ViaCEP has downtime (the current implementation returns `null`, which shows no city)?
- Should the proxy become the canonical pattern for all future external API integrations in this codebase?

## Related Potential ADRs
- [PostgreSQL GIN Trigram Indexes for City-Level Professional Search](./postgresql-gin-trigram-indexes-for-city-level-professional-search.md) — The city string resolved via this proxy is the input to the GIN-indexed search query

## Additional Notes
The `viacep_service` is a singleton class instance but `buscar_cep` is implemented as a `@staticmethod`, meaning instantiation provides no behavioral benefit and could be simplified to module-level functions. This design inconsistency may indicate the service was scaffolded for future stateful features (e.g., in-memory CEP cache).

The proxy does not return HTTP caching headers, so each identical CEP lookup triggers a new upstream call. For a marketplace where many users search from the same cities, this is a missed optimization opportunity.
