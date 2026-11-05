---
target: Home
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx"
target_fingerprint: "sha256:62276b96e0c66f34e12f07daa2b9b6e9955e3baf777a490edc9e1ef4f69fb63b"
target_path: /home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx
timestamp: 2026-09-29T12-36-41Z
slug: frontend-src-pages-home-jsx
---
# Critique: Home (/) — Talão de Orçamento

Method: dual-agent (A: design review · B: detector + browser). Backend offline durante a inspeção: seções da API avaliadas no estado vazio/erro e lidas no código para o estado populado.

## Design Health Score — 24/32 (75%, Good). n/a: 7, 10

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Status do sistema | 3 | CEP falha → busca descarta a região em silêncio (Home.jsx:1483) |
| 2 | Mundo real | 3 | "canhoto", "1ª via", "destaque aqui ✂" são jargão gráfico sem função |
| 3 | Controle | 3 | Escolher item do checklist sobrescreve o texto digitado (1469) |
| 4 | Consistência | 3 | Logo no azul legado; título "Regiao" sem acento (SEOHead.jsx:112) |
| 5 | Prevenção de erro | 3 | CEP só dígitos com contagem; guarda de form vazio ok |
| 6 | Reconhecimento | 3 | Checklist abaixo do botão (1660 após 1654) |
| 7 | Flexibilidade | n/a | Página de persuasão de propósito único |
| 8 | Estético/minimalista | 3 | Tabela de preços ~30% da rolagem mobile (1878) |
| 9 | Recuperação de erro | 3 | Mensagens claras em PT com próximo passo |
| 10 | Ajuda | n/a | FAQ cobre; landing page |

## Design specificity
Autoral, não template. O talão É o formulário de busca; vias rosa/azul mapeiam os dois públicos; tabela de preços como tabela de gráfica. Vira fantasia em dois pontos: "Nº ______" (1600) parece quebrado e não prova nada; placeholders em Caveat fazem campo vazio parecer preenchido. Detector: CLI 0 achados (Home.jsx, SEOHead.jsx, StructuredData.jsx). Overlay: 6 desktop / 5 mobile — side-tab ×2 (falso positivo: régua superior de 6px da via é do DESIGN.md), tight-leading ×2 (quase falso positivo: nota Caveat, limítrofe no mobile com 3 linhas), layout-transition no body (não vem do código), oversized-h1 (84px, 35vh — real, decisão de hero).

## Priority issues
1. [P1] Sem prova humana quando a API falha — seção de profissionais some (1743–1773); zero rostos na página. Fix: manter a seção com cartão impresso em branco + copy honesta + CTA de busca. → harden, onboard
2. [P1] Placeholders parecem valores preenchidos (509–512). Fix: placeholder em Barlow cor texto-2; Caveat só para entrada real. → clarify
3. [P2] Checklist depois do botão e sobrescreve texto (1654/1660, 1469). Fix: mover entre Serviço e CEP, limitar a 4–6, anexar em vez de substituir. → layout, distill
4. [P2] Foco dos inputs fraco — só sublinhado 1.5→2px, outline:none (514, 519). Fix: sublinhado grosso + fundo tintado na linha. → polish, audit
5. [P2] Conteúdo de cliente e profissional intercalado; preços dominam 6.161px de página mobile. Fix: comparação compacta no mobile ou mover para /register-pro. → distill, adapt

## Persona red flags
- Jordan: "Nº ______", "Canhoto", "Destaque aqui ✂" parecem acionáveis e não são; "1ª/2ª via" é jargão.
- Riley: CEP offline derruba a região em silêncio; checklist substitui texto; fetch de CEP fixo em `/api/cep/` em vez de API_URL (1449); `userCity` velho no localStorage pula revalidação (1342).
- Casey: "Sou profissional" colado no toggle do menu; rolagem longa de preços; "Preencher o pedido" sobe e abre teclado.
- Dona Cida (55, Android antigo, diarista): Caveat 1.45rem inclinado difícil de ler; sem rostos com API fora; letra miúda 0.8rem; sem contato nem link de privacidade; reasseguramento abaixo da dobra.

## Minor
- Hierarquia pula h2 → h3 no rodapé. Tab vai para "Cadastre-se" antes do formulário. Nome do logo duplicado (alt + aria-label). `<td />` vazio no canto da tabela. Rodapé sem privacidade/termos. Hero com 5 ações.

## Questions
1. Se o Nº nunca pode ser honesto sozinho, o talão precisa de número?
2. A tabela de preços do profissional deveria morar em /register-pro?
3. E se o talão carregasse uma linha de avaliação real em vez de decoração de gráfica?
