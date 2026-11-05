---
target: Home
total_score: 27
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
target_identity: "file:/home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx"
target_fingerprint: "sha256:ed63b0ffdd31ab4b22de4e6db2f1065ab0351e6747ffb2dc75d67c835d6a0442"
target_path: /home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx
timestamp: 2026-09-29T13-08-16Z
slug: frontend-src-pages-home-jsx
---
# Critique: Home (/) — rodada 3

Method: dual-agent (A: design review · B: detector + browser). Avaliada com API fora do ar e com dados simulados (contagem, 6 categorias, 3 profissionais).

## Design Health Score — 27/36 (75%, Good). n/a: 7

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Status do sistema | 3 | Status do CEP ao vivo; envio sem feedback |
| 2 | Mundo real | 3 | Checklist parece múltipla escolha e é escolha única |
| 3 | Controle | 3 | Desmarcar restaura texto; CEP salvo preenchido sem "não é você?" |
| 4 | Consistência | 3 | Logo azul legado; dois "Preencher o pedido" iguais |
| 5 | Prevenção de erro | 3 | Teclado numérico, maxlength, busca só por serviço |
| 6 | Reconhecimento | 3 | Checklist + datalist; só 4 atalhos <480px |
| 7 | Flexibilidade | n/a | Página de persuasão de visita única |
| 8 | Estético/minimalista | 3 | Seção das vias repete o hero; via do profissional densa |
| 9 | Recuperação de erro | 3 | "CEP não encontrado" não ajuda quem não sabe o CEP |
| 10 | Ajuda | 3 | FAQ responde o que importa |

## Design specificity
Autoral. O talão agora trabalha: campos pautados são o formulário, checklist dá atalhos, picote carrega a garantia. Fantasia residual: carimbos "1ª/2ª via" e tabelas Item/Descrição nas vias. Detector: CLI 0 achados (Home, SEOHead, StructuredData). Overlay 6 desktop / 5 mobile, idênticos com dados simulados: side-tab ×2 (falso positivo, régua de 6px do DESIGN.md), tight-leading ×2 (falso positivo, nota Caveat 1.2 especificada), layout-transition (falso positivo, vem do CSS injetado pelo sonner), oversized-h1 (intencional; 35vh a 1440, leading 0.95 apertado para 56 caracteres).

## Priority issues
1. [P1] Prova humana longe demais — profissionais (Home.jsx:1687) ficam depois das vias, ~2000px no mobile. Fix: subir a seção para logo após o hero; reduzir a via do cliente, que repete o hero. → layout
2. [P1] Texto de SEO contradiz PRODUCT.md — "profissionais verificados" (SEOHead.jsx:42), "qualificados" (:8, :44, :113), "mais de 50 categorias" (:113) sem dado; acentos faltando. É o que aparece no Google. Fix: reescrever na voz da página, sem verificação. → clarify
3. [P2] Checklist parece multi-seleção mas é única (1381–1388, 1558). Fix: semântica radiogroup + legenda "Escolha um", mantendo o X desenhado. → clarify
4. [P2] "Nº 001235" é inventado (contagem+1, 1518) e sugere número de pedido. Fix: imprimir só a contagem real. → clarify
5. [P3] Logo azul legado no talão (1460); cabeçalho de tabela 12.8px (751) e legal 0.9rem (1185) abaixo do piso 0.95rem; ordem de tab no mobile: "Cadastre-se" antes do talão (1500–1507). → colorize, typeset, audit

## Persona red flags
- Jordan: "1ª/2ª via", "Item/Descrição" leem como papelada; dúvida se pode marcar dois serviços.
- Riley: título "Quem atende em Belo Horizonte" com cards de Contagem/Ribeirão das Neves; `pro.name.charAt(0)` e `average_rating.toFixed` quebram com nome nulo ou nota string (1209, 1226).
- Casey: botão ao alcance; só "Sou profissional" no topo para profissionais.
- Dona Cida: cidade em Caveat fina; o medo principal só é respondido na 4ª seção; cards sem foto/preço/"desde quando"; "Perfis de verdade" pode soar como verificação.

## Minor
- Via rosa com vazio grande acima do botão no desktop (estica para igualar a azul). "Sobre a plataforma" h3 aninhado sob o FAQ. "Preencher o pedido" da via só rola para cima.

## Questions
1. O cartão do profissional deveria ser um mini-talão com preço, serviço e horário livre?
2. Sem verificação, o que mostrar honestamente: "agendou X vezes pelo ContrataPro", "no ContrataPro desde"?
3. As vias precisam estar na Home?
