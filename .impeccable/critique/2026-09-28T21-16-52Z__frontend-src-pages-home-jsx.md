---
target: Home (landing)
total_score: 16
max_score: 36
na_heuristics: 7
p0_count: 1
p1_count: 2
target_identity: "file:/home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx"
target_fingerprint: "sha256:1e121761de8bc622470f4f90aa1428e084be64e16fe36246d62d6af06a4eacbb"
target_path: /home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx
timestamp: 2026-09-28T21-16-52Z
slug: frontend-src-pages-home-jsx
---
# Critique: Home (frontend/src/pages/Home.jsx) — Persuade
Method: dual-agent. Backend offline durante a inspeção.

## Heuristics (16/36, Poor 44%, n/a: 7)
1 Status 2 — dropdown categorias vazio em falha de API (CategoryMenu.jsx:207); CEP falha silenciosa (Home.jsx:1059)
2 Real world 2 — pricing sem acentos (Home.jsx:1497-1610), "Free"/"Badge"
3 Control 2 — modal CEP sem Esc/focus trap/role=dialog (Home.jsx:1249)
4 Consistency 2 — 4 CTAs p/ /register-pro com rótulos diferentes; 3 cores de botão no pricing
5 Error prevention 2 — busca vazia silenciosa
6 Recognition 2 — categorias escondidas em "Todos Serviços"
7 n/a (landing)
8 Minimalist 2 — header pesado, públicos intercalados, 3-passos duplicado
9 Error recovery 1 — erros só em console.error
10 Help 1 — sem FAQ de pagamento/segurança/verificação

## Specificity
Template SaaS genérico (gradient text, gradiente azul-índigo, icon cards 2x, pricing 3 colunas). Sem pessoas reais, sem sinais locais.
Detector CLI: gradient-text x3 (HeroSection.jsx:87 real; Home.jsx:674 real; Home.jsx:443 dead code FP), side-tab x1 Home.jsx:850 (borderline).
Browser: icon-tile-stack x6, ai-color-palette x2, gradient-text x2, overused-font (Inter) x1, layout-transition x1.

## Priority Issues
- [P0] Prova social falsa: HeroSection.jsx:9 fallback 100/500; Home.jsx:1325 "4.9 (128)" hard-coded (seção morta). -> harden
- [P1] Header mobile 316/844px; hero padding 20rem (HeroSection.jsx:63); MobileMenu top:73px (Home.jsx:401). -> adapt
- [P1] Template genérico sem camada de confiança; disclaimer como última impressão (Home.jsx:1634). -> bolder, onboard
- [P2] Tipografia: Inter 400-700 carregado mas 800/900 usados (index.html:41); h1 !important em index.css:128; body 13px (index.css:155). -> typeset
- [P2] Estados/a11y: inputs sem label, CEP sem inputMode, dropdown sem erro/vazio, acentos. -> harden, clarify

## Personas
Jordan: 3 entradas similares, 9 decisões acima da dobra, sem categorias visíveis.
Riley: stats falsos + dropdown vazio com backend fora; cidade longa em CEPDisplay nowrap cobre H1.
Casey: 63% de tela útil; whileInView opacity 0 + framer-motion no 3G.

## Minor
Código morto Home.jsx 418-460 + handleSearch; focus ring rgba(99,102,241) != --primary; dropdown com gradiente e shift no hover; disclaimer opacity .7 no footer.

## Questions
Planos na home para clientes? Hero = busca (CEP+serviço)? Onde mora a confiança? Um rosto real > "100+"?
