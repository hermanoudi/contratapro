---
target: Home
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx"
target_fingerprint: "sha256:004a64009f04b5f1c4d4f4c5a940136c2b544b8527735db017c443d915cc4398"
target_path: /home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx
timestamp: 2026-09-29T18-14-48Z
slug: frontend-src-pages-home-jsx
---
# Critique: Home (/) — rodada 4

Method: dual-agent (A: design review · B: detector + browser). API fora do ar, dados simulados e caminho de erro; 1440, 390 e 360×640.

## Design Health Score — 26/32 (81%, Good). n/a: 7, 10

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Status do sistema | 4 | Status do CEP ao vivo; cartões em branco no carregamento |
| 2 | Mundo real | 4 | Talão, CEP, Pix/dinheiro, "O combinado" |
| 3 | Controle | 3 | Setas no checklist sobrescrevem o campo Serviço em silêncio |
| 4 | Consistência | 3 | Caixas quadradas agem como rádio; "1.234" vermelho no lugar do Nº parece número de pedido |
| 5 | Prevenção de erro | 3 | Aceita só serviço ou só CEP; CEP com máscara |
| 6 | Reconhecimento | 4 | Atalhos, datalist, placeholder de exemplo, CEP salvo |
| 7 | Flexibilidade | n/a | Página de persuasão |
| 8 | Estético/minimalista | 2 | Via do cliente redundante; FAQ repete "O combinado"; ~5.400px a 390 |
| 9 | Recuperação de erro | 3 | Erro de envio vazio abaixo do CEP, sem vínculo ao campo (1684) |
| 10 | Ajuda | n/a | FAQ cobre |

## Design specificity
Autoral: o talão é o formulário. Fantasia residual: seção "Uma via para cada lado" (1821–1885) explica a metáfora, não o produto; via do cliente repete o hero. Detector: CLI 0 achados (Home, SEOHead, StructuredData, index.html). Overlay 5 desktop / 4 mobile, todos falsos positivos ou intencionais (side-tab ×2 régua de 6px; tight-leading Caveat 1.2; layout-transition do sonner; oversized-h1 intencional).

## Priority issues
1. [P1] Pré-visualização de compartilhamento quebrada — og:image, twitter:image e logo do schema apontam para arquivos inexistentes em public/ (index.html:23,32; StructuredData.jsx:36). WhatsApp é o canal principal. Fix: criar og-image 1200×630 no mundo talão e logo.png; alinhar twitter:description. → harden
2. [P1] Tarefa abaixo da dobra em Android pequeno — botão em 781px num 360×640. Fix: lead de 1 linha ou oculto no mobile, hero mais justo. → adapt
3. [P2] "a partir de" mistura hora e dia (pickHighlight 1252–1257): diarista de R$180/dia vira "Passar roupa a partir de R$ 45/hora". Fix: comparar só dentro da mesma unidade do serviço principal. → clarify
4. [P2] Pitch do profissional enterrado (~4.000px) e página repetitiva. Fix: fundir via do cliente em "O combinado", subir via do profissional acima do FAQ, cortar FAQs repetidas. → distill, layout
5. [P3] Caixas quadradas com comportamento de rádio. Fix: marca redonda desenhada à tinta. → polish

## Persona red flags
- Jordan: "1.234" vermelho parece nº de pedido; não sabe se precisa dos dois campos.
- Riley: setas sobrescrevem texto; erro de envio vazio aparece abaixo do CEP; contagem pequena real seria antiprova.
- Casey: botão na borda da dobra ou abaixo.
- Dona Cida: não vê "Buscar" sem rolar; caixas convidam a marcar dois; "não checa antecedentes" alarma sem dizer o que ela pode fazer.

## Minor
- Inter ainda carregada (index.html:41). favicon.png 954KB. Keywords com categorias inexistentes. Sem CEP, cartões de qualquer cidade sem rótulo.

## Questions
1. Contagem pequena em produção: mostrar ajuda ou atrapalha? Limite mínimo?
2. O cliente precisa da explicação das vias?
3. Uma avaliação real exibida como prova convenceria mais que a lista inteira do "O combinado"?
