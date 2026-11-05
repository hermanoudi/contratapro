---
target: Home
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx"
target_fingerprint: "sha256:86a5848f13b9ddb893ea1726409e6573089808648b3b2cb4b472b5c4b94f0e6a"
target_path: /home/hermano/projetos/faz_de_tudo/frontend/src/pages/Home.jsx
timestamp: 2026-09-30T00-04-50Z
slug: frontend-src-pages-home-jsx
---
# Critique: Home (/) — rodada 5

Method: dual-agent (A: design review · B: detector + browser). 1440×900, 390×844, 360×640; API fora do ar e com dados simulados.

## Design Health Score — 24/32 (75%, Good). n/a: 7, 10

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Status do sistema | 3 | Ao resolver o CEP, título e cartões da seção de profissionais trocam em silêncio |
| 2 | Mundo real | 3 | "Pedido de serviço" sugere enviar um pedido, mas o botão só busca |
| 3 | Controle | 3 | Não há como limpar o CEP salvo além de editar |
| 4 | Consistência | 3 | Seta nativa do datalist quebra a linha pautada; "Sou profissional" em 4 lugares |
| 5 | Prevenção de erro | 3 | CEP parcial gera erro genérico (1493) |
| 6 | Reconhecimento | 3 | Checklist + datalist; 4 atalhos no celular |
| 7 | Flexibilidade | n/a | Página de persuasão |
| 8 | Estético/minimalista | 3 | Via do profissional densa (duas tabelas); rodapé repete o "combinado" |
| 9 | Recuperação de erro | 3 | Mensagens claras, tentar de novo, alternativa |
| 10 | Ajuda | n/a | FAQ cobre |

## Design specificity
Autoral. Fantasia residual: tabelas da via do profissional, carimbo, canhoto vazio; "Pedido de serviço" desalinhado com a ação de busca. Detector: CLI 0 achados (Home, SEOHead, StructuredData, index.html). Overlay 4 desktop / 3 mobile, todos falsos positivos (side-tab régua de 6px; tight-leading Caveat 1.2; layout-transition do sonner; oversized-h1 intencional). Assets: og-image.jpg 1200×630 e logo.png existem e não são ignorados pelo git, mas ainda não foram commitados.

## Priority issues
1. [P1] Seção de prova murcha quando falta dado — aviso pequeno à esquerda num campo rosa vazio no desktop (1732); Lead escondido. Fix: centralizar/compor com cartões em branco pautados, manter o Lead de como perfis e avaliações funcionam, reduzir respiro. → harden, layout
2. [P1] Cartões não dão motivo para confiar — monograma, nome, categoria, "Ainda sem avaliações". Fix: sinais reais se a API tiver (desde quando, agendamentos concluídos); senão "Ver perfil e avaliações" no lugar de "Ver agenda". → clarify
3. [P2] Talão parece enviar um pedido. Fix: linha impressa "Buscar não compromete nada: você só vê quem atende" ou subtítulo de busca. → clarify
4. [P2] Checklist duplica o campo e empurra a garantia do picote para baixo da dobra em 360×640 com dados; seta nativa do datalist. → distill
5. [P3] "agendamentos já feitos pelo ContrataPro" sugere que a plataforma executa (use "no"); og-image escreve "seu bairro" no campo CEP numérico; erro de CEP parcial genérico. → polish

## Persona red flags
- Jordan: "Pedido" + "escolha um" parece encomenda; três formas de preencher Serviço.
- Riley: profissional sem serviços ainda oferece "Ver agenda"; CEP parcial com erro genérico; título e cartões mudam sob o visitante.
- Casey: "Sou profissional" no topo com 38px (<44px).
- Dona Cida: orientação de segurança enterrada no 3º item da 2ª coluna; sem fotos; não sabe o que acontece depois de agendar.

## Minor
- FAQ com 2 itens parece vestigial. Rodapé repete o "combinado". Canhoto vazio. role=status envolvendo os botões do aviso.

## Questions
1. Se a única ação é buscar, por que a folha se chama pedido?
2. O que a página oferece à Dona Cida que a indicação de um vizinho no WhatsApp não oferece? "O combinado" viraria um checklist "como se proteger"?
3. Os preços dos planos deveriam parar em "Grátis, sem cartão" e deixar o cadastro vender os planos?
