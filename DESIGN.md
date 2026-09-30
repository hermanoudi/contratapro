---
name: ContrataPro
description: Talão de Orçamento — the order pad every Brazilian autônomo carries, printed in one red ink and filled in by hand in carbon blue.
colors:
  papel: "#ffffff"
  amarela: "#fce58a"
  rosa: "#f9cfda"
  azul: "#cfe0f5"
  grafica: "#c4201a"
  grafica-escura: "#9e1712"
  pauta: "rgba(196, 32, 26, 0.55)"
  carbono: "#2e3a9e"
  nanquim: "#17171b"
  texto-2: "#4a4550"
  texto-2-amarela: "#5b4a12"
  texto-2-rosa: "#6b2638"
  texto-2-azul: "#22385e"
  papel-2: "#f6f4ef"
  regua: "rgba(23, 23, 27, 0.14)"
  sucesso: "#1d6b3a"
  alerta: "#8a5300"
  erro: "#9e1712"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.05
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    letterSpacing: "0.08em"
  action:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  hand:
    fontFamily: "Caveat, 'Segoe Print', cursive"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  none: "0px"
  btn: "2px"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  section: "clamp(3.5rem, 8vw, 6.5rem)"
  section-head: "clamp(2rem, 4vw, 3rem)"
  card: "1.25rem"
  via: "clamp(1.25rem, 3vw, 2rem)"
components:
  button-primary:
    backgroundColor: "{colors.grafica}"
    textColor: "{colors.papel}"
    typography: "{typography.action}"
    rounded: "{rounded.btn}"
    padding: "0 1.4rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.grafica-escura}"
    textColor: "{colors.papel}"
  button-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.grafica}"
    typography: "{typography.action}"
    rounded: "{rounded.btn}"
    padding: "0 1.4rem"
    height: "48px"
  button-stamp-hover:
    backgroundColor: "{colors.grafica}"
    textColor: "{colors.papel}"
  field-ruled:
    backgroundColor: "transparent"
    textColor: "{colors.carbono}"
    typography: "{typography.hand}"
    rounded: "{rounded.none}"
    padding: "0.9rem 0.5rem 0.2rem"
  topbar:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.nanquim}"
    height: "56px"
  cartao:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.none}"
    padding: "{spacing.card}"
  via:
    backgroundColor: "{colors.rosa}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.none}"
    padding: "{spacing.via}"
---

# Design System: ContrataPro

> **Scope.** This system is derived from the shipped Home (`/`, `frontend/src/pages/Home.jsx`), the first surface built in this world. It is the target system for ContrataPro. Every other surface (dashboards, booking, profile, auth, admin) has **not migrated yet** and still runs on the legacy blue/indigo + Inter tokens in `frontend/src/index.css` (`:root --primary #2563eb` etc.). Those legacy tokens are incumbent code, not the design system; do not extend them on new work and do not copy them into this world. The Talão tokens currently live as CSS custom properties on the Home's `Page` styled component, not on `:root`; migrating a surface means lifting them to a shared scope first.

## Overview

**Creative North Star: "Talão de Orçamento"**

The product is dressed as the carbon-copy order pad (talão de pedido/orçamento) that every Brazilian autônomo keeps in the van or the toolbox. Whole sections are flat sheets of colored paper, the "vias": yellow, white, pink, blue. Everything printed by the gráfica is in a single red ink: rules, labels, numbering, stamps, primary buttons. Everything filled in by a person is carbon blue in a handwriting face. Near-black nanquim carries headings and running text. The effect is warm and local, a thing from the neighbourhood rather than a SaaS product, which is the tone PRODUCT.md commits to.

Density is that of a paper form: generous section padding, ruled lines instead of boxes, and tables and lists that read as printed rows. Sheets meet at a perforated seam (a scalloped tear edge) rather than a straight divider. State is carried by the stroke, not by fills: a solid rule is printed, a dashed rule is the tear line, a hand-drawn X marks a choice, and focus re-inks the rule in carbon blue over a faint blue wash on the line being written.

Motion is small and physical: the city from the CEP writes itself in by a left-to-right clip reveal (700ms), a checkbox's X draws in two strokes (220ms, second delayed 160ms), a professional card lifts and tilts slightly on hover, and buttons press 1px down. All of it is disabled under `prefers-reduced-motion`.

**Key Characteristics:**
- Flat paper vias as full-bleed section colors, joined by a perforated seam.
- One printing ink (gráfica red) for all print: rules, labels, numbers, stamps, primary actions.
- Handwriting (Caveat, carbon blue) only for what a person writes: input values, the resolved city, marginal notes.
- Condensed, heavy printed display type (Barlow Condensed 800) over a plain humanist text face (Barlow).
- Square paper geometry; the only rounding is a 2px press on buttons.
- Slight hand-placed rotation on physical objects (the talão, stamps, notes).

## Colors

A four-paper stock (yellow, white, pink, blue) printed in one red and written in one blue, with near-black ink for reading.

### Primary
- **Vermelho de Gráfica** (grafica): the single printing ink. Primary buttons, stamp buttons, every structural rule (2px solid under headers, 6px top rule on a via, 5px foot on a card), form labels, item numerals, prices, the appointment count on the talão, links, the star rating fill, and the logo (the Home uses a one-ink gráfica version, `contratapro-logo-grafica.png`; other surfaces still use the legacy blue file). Its hover/pressed ink is **Gráfica Escura** (grafica-escura).
- **Pauta** (pauta): the same red at 55% alpha, used only for decorative ruled lines: table row rules, list rules, FAQ dividers, card-foot rules. Never text, and never the only boundary of a control (it measures 2.7:1 on white); a field's resting underline uses full gráfica.

### Secondary
- **Azul-Carbono** (carbono): the handwriting ink. Input values and caret, the resolved city, the drawn X in a checkbox, marginal notes (ViaNote), check marks in the "O combinado" list, the focus ring, and the focused field's underline. Placeholders are not handwriting: they are printed in texto-2 (see Inputs).

### Tertiary (the paper stock)
- **Via Amarela** (amarela): the hero sheet and text selection highlight; also the monogram fill on a card without a photo.
- **Via Rosa** (rosa): the client via and the professionals section (Mesa).
- **Via Azul** (azul): the professional via; at 55% alpha, the wash behind a focused field on the talão.

### Neutral
- **Papel** (papel): the white sheet; page background, the talão, cards, the blank notice sheet, topbar, footer.
- **Nanquim** (nanquim): headings, body text, icons in the topbar, photo frame.
- **Texto Secundário** (texto-2 and its per-paper variants): secondary text is re-inked per sheet so it stays in family and legible: default on white, **texto-2-amarela** on the hero, **texto-2-rosa** on pink, **texto-2-azul** on blue. Set it by overriding `--texto-2` on the section or via, never by hardcoding.

### Named Rules
**The One Ink Rule.** Everything printed is gráfica red; everything written is carbon blue. No third accent. Status red (errors) is the same gráfica ink.

**The Paper Is the Color Rule.** Color arrives as whole flat sheets of paper, edge to edge. No tinted cards floating on a neutral page, no color washes, no gradient fills.

**The Small Print Rule.** Red text smaller than about 18px regular / 14px bold sits on papel or amarela only (5.88:1 and 4.68:1). On rosa and azul, gráfica at small sizes falls below 4.5:1 (4.19:1 and 4.38:1), so small red text there is set in **gráfica-escura** instead: via table heads and item numerals, via stamps, and links in the rosa professionals section.

**The Seam Sync Rule.** The perforated seam draws its scallops in an SVG data URI that cannot read CSS variables, so the paper hexes are repeated in a `PAPER` map beside it. That map is a mirror of the paper tokens, not a second palette; change both together.

## Typography

**Display Font:** Barlow Condensed (with 'Arial Narrow', sans-serif), weights 500–800 loaded
**Body Font:** Barlow (with system-ui, sans-serif), weights 400/500/600/700 loaded
**Handwriting Font:** Caveat (with 'Segoe Print', cursive), weights 500/700 loaded

**Character:** Barlow Condensed is the gráfica's type: heavy, narrow, printed. Barlow is its plain reading partner. Caveat is the customer's pen and never sets anything the gráfica would have printed.

### Hierarchy
- **Display** (800, clamp(2.6rem, 6.4vw, 5.25rem), 0.95, -0.015em, balanced): the single page title (hero h1).
- **Headline** (800, clamp(2rem, 4.2vw, 3.25rem), 1, -0.01em, balanced): section titles.
- **Title** (700–800, 1.2–2.2rem, ~1.05): via titles (800, clamp(1.7rem, 3vw, 2.2rem)), list titles, FAQ heading and notice-sheet headings (700, 1.5rem), card names (700, 1.45rem), plan names in the via's plan table (700, 1.2rem).
- **Lead** (400, clamp(1.05rem, 1.4vw, 1.2rem), 1.55, max 60ch): the one supporting paragraph under a heading, in texto-2.
- **Body** (400, 1rem, 1.5–1.6, 62–68ch): running text, table cells, FAQ answers.
- **Label** (Barlow Condensed 600, 0.95rem, 0.08em, uppercase, gráfica): printed form labels on the talão and vias only: field labels ("SERVIÇO:"), fieldset legend ("MAIS PEDIDOS (ESCOLHA UM):"), table column heads ("PASSO / COMO FUNCIONA"), via stamps.
- **Fine print** (Barlow Condensed 500–600, 0.95–1rem, 0.02–0.03em, sentence case): printed lines that must be read, not scanned: the appointment-count caption and the reassurance line on the talão's tear line (gráfica-escura). Kept at 0.95rem or larger; nothing on the page is set below that.
- **Action** (Barlow Condensed 700, 1.1rem, 0.05em, uppercase): button text; nav links use 600, 1.1rem, 0.03em, sentence case.
- **Hand** (Caveat 700, 1.45–1.75rem, 1.2): input values (1.75rem), resolved city (1.5rem), marginal notes (1.45rem). Never placeholders.

### Named Rules
**The Printed vs. Written Rule.** If the gráfica would have printed it, it is Barlow Condensed; if a person would have written it, it is Caveat in carbon blue. Caveat never sets headings, buttons, or labels.

**The Numbers Are Printed Rule.** Numbering, prices, and item numerals are Barlow Condensed with `tabular-nums`.

## Layout

Content sits in a 1200px max-width column with a fluid side gutter (clamp(1rem, 4vw, 2.5rem)); section color runs full-bleed behind it. Sections breathe at clamp(3.5rem, 8vw, 6.5rem) vertical padding, with clamp(2rem, 4vw, 3rem) between a section head and its content. A section head is a Headline plus one Lead, nothing above the headline.

Breakpoints are content-driven, not a fixed scale: topbar nav switches at 860px; the hero goes two-column (text left, talão right in a 32rem column) at 960px; the canhoto stub appears at 560px; professional cards go 2-up at 640px and 3-up at 1040px; the talão's checklist shows 4 shortcuts at every width so the submit stays in the first viewport. Below 560px the hero drops its Lead paragraph and tightens its top padding and gaps: the talão explains the task itself, and the submit must end inside a 360×640 screen (it measures 634px with count and checklist showing). Mobile order in the hero, in the DOM and in tab order alike, is title, talão, then the professional call.

The Home's page order puts proof before explanation: hero with talão, the professionals (Mesa), "O combinado", the professional via ("Você oferece serviços?"), a short FAQ, footer. There is no client via: the hero and "O combinado" already cover the client. The FAQ keeps only questions "O combinado" does not answer. Two consecutive sections on the same paper do not add their padding; the second starts at 0 top padding. The Mesa section always renders: cards when there are professionals, blank ruled cards while loading, a notice sheet on error or when there is nobody yet. Plan prices are not on the Home: the professional via stops at "grátis, sem cartão", and the signup flow presents the plans. The section's Lead (how profiles and reviews work) always shows, since it is true with or without data.

The 56px topbar is the only sticky element. Touch targets are at least 44px (menu toggle, checklist items, footer links); primary buttons are 48px, the talão submit 54px.

### Named Rules
**The Perforated Seam Rule.** Two different paper sheets meet at the perforated seam (12px tall, 18px scallop tile, radius 5.5px) drawn in the upper sheet's color over the lower sheet's color. Never a straight line or a gradient fade between vias.

## Elevation & Depth

Paper lies flat. Depth is reserved for the two objects that are physically separate sheets resting on the page, and it is soft and cast downward like paper on a table, never a hard offset block. Everything else separates by paper color and printed rules.

### Shadow Vocabulary
- **Talão on the table** (`box-shadow: 0 22px 36px -18px rgba(23, 23, 27, 0.45), 0 2px 4px rgba(23, 23, 27, 0.12)`): the order pad in the hero.
- **Card on pink paper** (`box-shadow: 0 16px 28px -18px rgba(107, 38, 56, 0.55), 0 1px 3px rgba(107, 38, 56, 0.18)`): professional cards and the notice sheet that replaces them; the shadow is tinted with the paper's own ink (texto-2-rosa), not grey.

### Named Rules
**The Loose Sheet Rule.** Only a loose sheet on top of another sheet casts a shadow, and its shadow is tinted by the paper under it. Vias, tables, and printed boxes stay flat.

## Shapes

Geometry is square paper. Every container, sheet, card, via, table, and photo frame has square corners (0px). The only rounding is 2px on buttons, the slight softness of a pressed rubber stamp, and the full circle of a single-choice mark, the printed "( )" of a paper form.

Borders are printing: 2px solid gráfica for frames and header rules (including the rule that opens the footer, which holds only the brand line, links and legal line; it does not repeat "O combinado"), 1.5px pauta for ruled rows, 2px dashed gráfica for tear lines (the canhoto edge, the talão's tear line, the divider inside the footer). Weight carries meaning: a 6px top rule opens a via, a 5px bottom rule closes a card or notice sheet.

Physical objects are placed by hand at a slight angle: the talão at -1.2deg (desktop only), via stamps at -4deg, marginal notes at -1deg, a card tilts -0.4deg as it lifts on hover.

## Components

### Where the code lives
Shared pieces live in `frontend/src/components/talao/`. Pages import them from the barrel (`import { TalaoPage, Display, PrimaryButton } from '../components/talao'`).
- **Tokens:** `tokens.js` is the single source. `TalaoTokens`, mounted once in `App.jsx`, writes every token to `:root` as a CSS variable (`--grafica`, `--carbono`, `--f-impresso`, `--texto-2-rosa`…). The `PAPER` hex map from the same file feeds SVGs, such as the seam, that can't read variables. Declaring the tokens changes nothing visually; a page joins the world only by wrapping itself in `TalaoPage`.
- **Legacy bridge (contained register):** pages not yet migrated still read the old names (`--primary`, `--text-secondary`, `--bg-secondary`, `--border`, `--font-sans`…). `index.css` now points them at talão tokens:
  - `--primary` and `--accent` → gráfica. Keeping them equal flattens the old gradients.
  - `--bg-secondary` → papel-2, `--border` → régua, `--success`/`--error` → sucesso/erro.
  - Body text is Barlow; h1–h4 are Barlow Condensed.
  - `.btn-primary` is the flat printed button.

  New colours go in `tokens.js`, never in `index.css`. The contained register uses papel and papel-2 surfaces with neutral régua rules. It keeps gráfica for action and carbono for focus, and uses no vias, seams, tilt or handwriting.
- **Logged-in shell (contained register):** `components/AppShell.jsx`, used by `ProfessionalLayout` and `ClientLayout`. `SharedLayout` picks one of the two.
  - **Sidebar:** papel-2, closed on the right by a 2px gráfica rule, like the red margin of an order pad. It carries the one-ink logo.
  - **Menu items:** Barlow Condensed 600 at 1.15rem, 48px rows, groups separated by pauta. The active item is gráfica, 700 and underlined 2px at 5px offset, the same underline as the Home's topbar links. No pills and no coloured side bars.
  - **Top bar:** sticky, 64px (56 on mobile), papel, closed by a 2px gráfica rule. On mobile it holds the menu toggle and the logo. The user shows as a 2px nanquim frame on amarela with the initial, the same frame as the ProCard photo.
  - **State colours:** "Suspender atendimentos" is in alerta and "Retomar" in sucesso, never in the action red. While a professional is suspended, the top bar shows "Atendimentos suspensos" ("Suspenso" on phones) in alerta on every page.
- **Entry pages (contained register):** `components/AuthLayout.jsx` frames login, and later the signups and the new-password page.
  - **Desktop aside:** papel-2 with the gráfica margin rule, the one-ink logo, a Barlow Condensed headline and a ruled list of true facts drawn from PRODUCT.md (carbono checks, pauta rules). Never feature claims like "verificados" or "tempo real".
  - **Mobile:** the aside collapses to a logo over a gráfica rule.
- **Contained fields:** `components/talao/TextInput.js` holds `FieldLabel` (printed gráfica-escura caps), `InputBox` (optional leading icon), `TextInput` and `FieldNote`.
  - `TextInput` is a square box: 1.5px `--controle` border (3:1), 52px tall. Focus is the talão focus: an azul wash with a carbono inset rule.
  - Errors are written under the form in gráfica with `role="alert"`, not only in a toast.
- **Dialogs:** use native `<dialog>` with `showModal()`, so Esc and focus trapping come for free. The sheet is papel with a 4px gráfica top rule and square corners. Content renders only while open (see `ForgotPasswordModal`).
- **Signups (contained register):** `components/SignupParts.jsx` and `components/signupUtils.js`.
  - **Step header:** printed "Passo N de M" in gráfica-escura caps over the h1. Focus moves to the h1 on every step change.
  - **Fields:** `TextField` is label, input and its own error in one piece.
  - **Address:** `AddressFields` looks the CEP up at `${API_URL}/cep/`. Its status line reads "Consultando…", "Endereço em…", or not found/offline. When the lookup fails, Cidade and UF become editable, so a CEP outage never blocks a signup.
  - **Actions:** "Voltar" as a stamp beside the primary. Under 480px they stack with the primary on top.
  - **Validation:** errors are written under each field and the first invalid field takes focus. Toasts are only for what happens after navigation.
  - **Backend messages:** `translateError` maps the ones that arrive in English or without accents.
- **Password field:** `components/PasswordInput.jsx`, used by the signups, the new-password page and admin.
  - **Rules:** they sit in an inline list under the field and tick in sucesso as they are met. The field is never red while the person is typing; it turns sucesso only when every rule passes.
  - **Eye toggle:** reachable by Tab.
  - **Generated password:** shown in a papel-2 box with a sucesso rule and a copy button, in monospace so l, I and 1 don't get confused.
- **Plan choice:** each plan is a papel sheet holding a real radio. The chosen one gets a 2px gráfica frame; the others a 1.5px controle frame. Plan items come from the plan record (services, bookings/month, search priority, badge label), never hardcoded marketing ("mais popular", emoji).
- **Surface:** `TalaoPage` sets the font, ink, paper, `::selection` and focus ring, and holds `font-size: 1rem` against the mobile body shrink in `index.css`. `Wrap` is the 1200px column. `paperSurface('rosa')` paints a via and tints `--texto-2` for it. Every sheet of papel resting on a coloured via resets `--texto-2` via `cardSheet`.
- **Components:**
  - Type: `Display` (always carries `data-display`, so the mobile `!important` heading rule never shrinks it), `Lead`, `Hand`.
  - Buttons: `PrimaryButton`/`PrimaryLink` and `StampButton`/`StampLink`, with a disabled state.
  - Fields: `Field` + `FormError`.
  - Seam: `Seam`.
  - Cards: `ProCard` + `CardsGrid` + `BlankCard`, with the price rules in `pricing.js`. `ProCard` is an `article` whose name link stretches over the whole card (`::after`); keyboard focus outlines the card via `:has()`. Two opt-in props:
    - `badge`: the plan's `badge_label`, stamped on the top edge like a via stamp. Only Search passes it.
    - `contactHref`: an outlined WhatsApp action that sits above the stretched link.
  - CEP: `useCep` (the lookup and its states, remembered in localStorage), with `CepField` for the field, its status line and the city written in by hand.
  - `NoticeSheet` + `NoticeActions`: the sheet that takes the cards' place on error or empty, used by Home, Search and ServiceCategory.
  - `ResultsBar` + `ResultsCount`: the count row above a results grid, closed by a gráfica rule.
  - `TrustNote`: the "O ContrataPro não verifica os profissionais…" line under any list of cards.
  - `whatsappLink`: the prefilled WhatsApp message for a card's contact action.
  - Page frame: `SiteHeader` (owns the `/auth/me` session and the mobile menu) and `SiteFooter`.
- **Still local to the Home:** the talão form shell (canhoto, head, tear line), the printed checklist, the steps table, the combinado panel and the FAQ. Promote one to `components/talao/` the first time a second page needs it; don't copy it.
- **Search (`/search`):**
  - The request sits on the amarela via as an untilted sheet: Serviço, CEP and Buscar in one row from 900px.
  - The h1 restates the request ("Diarista em Uberlândia").
  - Results sit on rosa, below a toolbar with the count ("X de Y" while filters are on) and multi-select filters.
  - Multi-select filters are printed squares (`aria-pressed`), because the circle means single choice.
  - The URL (`service`, `city`, `cep`) is the request.
- **Category (`/servicos/:categoria`):** the SEO entry page.
  - Amarela intro: a printed breadcrumb, the h1 "{Categoria} em {cidade}", an honest lead and the region line. The region line offers "Ver todas as cidades" when a city is saved, and "Buscar perto de você" (to Search) when none is.
  - Rosa cards, same states as Search.
  - Papel "Outras categorias" as a ruled printed list: 2 columns, 3 from 760px.
  - No stats row and no invented ratings: every number on the page comes from the API.

### Buttons
Printed and decisive, like the gráfica's red block.
- **Shape:** near-square (2px), 2px border in the same ink as the fill.
- **Primary:** gráfica fill, papel text, uppercase Barlow Condensed 700, 48px min height, 0 1.4rem padding, optional trailing arrow icon. Use it for the one main action in a sheet.
- **Stamp (secondary):** transparent with gráfica text and 2px gráfica border; inverts to a gráfica fill on hover. Used for "Sou profissional" in the topbar (compact padding, still 44px tall) and for the secondary action on a notice sheet ("Preencher o pedido", "Sou profissional, quero me cadastrar"). Rendered as a link or, when it triggers an in-page action, as a button with the same look.
- **Hover / Focus / Active:** hover darkens to gráfica-escura (160ms, ease-out `cubic-bezier(0.22, 1, 0.36, 1)`); focus is a 2px carbono outline at 3px offset; active presses 1px down.

### Chips: Printed Checklist
The "mais pedidos" choices are a printed checklist, not pills: a 1.3rem printed circle with a 2px gráfica border beside a Barlow 500 label, 44px row height, two columns. It sits directly under the Serviço field it fills (before CEP and the submit), with at most 4 items, and only when real categories came back from the API. It is a single choice and says so in its legend ("escolha um"): semantically a `radiogroup` of `role="radio"` buttons with roving tabindex, one tab stop, arrow keys moving focus only among the visible items (Space/Enter chooses), so arrowing never overwrites what was typed. Selecting writes that service into the field and draws a carbon-blue X in two strokes inside the circle; selecting it again gives back whatever the person had typed. Hover turns the label red.

### Cards / Containers
- **Cartão (professional card):** papel, square, 1.25rem padding, 5px gráfica bottom rule, tinted paper shadow; 64px square photo with a 2px nanquim frame (amarela monogram when no photo); a "No ContrataPro desde {mês de ano}" line from the professional's real `created_at` (omitted when missing or invalid; no other trust signal is invented), then one talão line under a 1.5px pauta rule with the service the professional registered and its price (the professional's first service defines the unit (hora or dia) and the line shows the lowest price among services in that same unit, "a partir de" when there are several, R$ in Barlow Condensed 700 tabular gráfica-escura, "/hora" or "/dia" in texto-2; title only when there is no price; no line when there are no services); foot row under another pauta rule with the rating and an uppercase "Ver perfil e avaliações" link (the next step is checking the person out, not booking). Missing name falls back to "Profissional"; a rating that is not a positive number shows "Ainda sem avaliações". Hover lifts 3px and tilts -0.4deg (200ms). Loading state is a blank ruled card, never a grey shimmer.
- **Notice sheet (MesaAviso):** what the professionals section shows instead of cards when the API fails or there is nobody yet, so the section never disappears. It sits inside the cards grid, spanning the full row (two columns at 1040px+, with one blank ruled card beside it so the row reads as empty slots, not a void). A papel sheet card shadow and 5px gráfica foot, a Title-sized heading that states the fact plainly ("Os perfis não carregaram agora."), one short paragraph in texto-2 that names the recovery, and actions: primary for the fix ("Tentar de novo" with a rotate icon), stamp for the alternative. Only the heading and paragraph sit inside `role="status"`; the actions stay outside it. The heading says "Quem atende em {cidade}" only for professionals whose city matches the visitor's exactly.
- **Via:** a whole paper sheet (rosa or azul) with a 6px gráfica top rule, a title over a 2px red rule, and a rotated stamp in the corner that states a fact, never paperwork jargon ("Grátis", "Sem cartão"; not "1ª via"). The Home now uses only the professional via, full width, with its title as the section's h2. It carries a ruled steps table (Passo | Como funciona, numbered rows), a handwritten note and one action ("Quero oferecer serviços"). It stops at free: no plan table on the Home.
- **Printed box:** 2px gráfica frame on the current paper, no fill, no shadow (the "O combinado" panel).

### Inputs / Fields
- **Style:** a ruled line, not a box. A Barlow Condensed uppercase red label ("SERVIÇO:") sits on the same baseline as a borderless transparent input; the value is Caveat 700 1.75rem in carbono. The placeholder is printed, not written: Barlow 400 1.05rem in texto-2, phrased as an example ("ex.: eletricista, diarista"), so an empty field never looks filled in. The field's only boundary is a 1.5px full-gráfica underline (pauta would fail 3:1 for a control boundary). The field row bleeds 0.5rem past the text on each side so the focus wash has room.
- **Focus:** the row takes an azul wash at 55% alpha and the underline turns carbono with an inset 2.5px shadow (`box-shadow: inset 0 -2.5px 0 carbono`), so focus is unmistakable without shifting layout; 160ms ease-out, off under reduced motion. The input itself has no outline.
- **Status / Error:** helper and status text below in Barlow 0.95rem texto-2; errors in gráfica ink; a confirmed city writes itself in by hand with a check.

### Navigation
Papel topbar, 56px, sticky, closed by a 2px gráfica bottom rule. Links are Barlow Condensed 600 1.1rem nanquim; hover turns them red and draws a 2px underline at 5px offset. The stamp button sits at the end. Below 860px the links collapse into a full-width panel of 48px rows separated by pauta rules, closed by Esc; the stamp stays visible beside the menu toggle.

### Talão (signature component)
The primary search form is the order pad itself: a papel sheet with a 2px gráfica frame, rotated -1.2deg on desktop, carrying the table shadow. A blank canhoto stub, marked only by its dashed edge, runs down the left from 560px; it carries no text, because printed words on it read as something to act on. The head prints the brand and "Pedido de serviço" left and, only when the API returns a real appointment count above zero, one line of fine print under "Pedido de serviço", full width, in gráfica-escura, with only the number in bold tabular figures ("**1.234** agendamentos já feitos no ContrataPro"). It is never dressed as an order number: no big red figure in the corner, no "Nº", no zero padding, no count-plus-one. With no real count, the head carries no number at all. Order down the sheet: Serviço field, printed checklist, CEP field with its status line, the red submit, then a dashed tear line that prints the reassurance that matters at the moment of submitting: that it is only a search, it is free, and payment is direct ("Buscar não compromete nada: você só vê quem atende. Grátis para quem contrata, e o pagamento você combina direto com o profissional."). The sheet keeps its "Pedido de serviço" name; the tear line removes the fear of committing. An incomplete CEP on submit does not search without the region: the CEP status line turns into an error ("Faltam N números do CEP. Complete ou apague para buscar só pelo serviço.") and focus moves to the CEP.

### Share Image
`frontend/public/og-image.jpg` (1200×630) is the talão world as a social preview: amarela paper, the one-ink logo, the hero title in Barlow Condensed 800, a tilted talão filled in by hand ("eletricista", "seu bairro") with the red submit and the "Grátis para quem contrata." tear line, and a perforated seam at the foot. `og:image` and `twitter:image` both point to it. `public/logo.png` is the official logo file for Schema.org. Its source is `frontend/design/og-image.html` (the talão drawn in HTML with the real fonts; the CEP field shows a numeric example); regenerate the JPEG from it when the hero copy changes.

### Perforated Seam (signature component)
See the Perforated Seam Rule. It is the only divider between sections of different paper.

## Do's and Don'ts

### Do:
- **Do** give each section a whole flat paper color (amarela, papel, rosa, azul) and join different papers with the perforated seam.
- **Do** print every rule, label, number, and primary action in gráfica red, and write every user value and marginal note in Caveat carbon blue.
- **Do** re-ink secondary text per paper by overriding `--texto-2` (texto-2-amarela / -rosa / -azul) on the section.
- **Do** use ruled lines (1.5px pauta) for rows and fields, and let stroke carry state: solid printed, dashed tear, drawn X for chosen, carbono underline for focus.
- **Do** keep corners square; buttons alone take 2px.
- **Do** place physical objects (the talão, stamps, notes) at a slight hand angle, and keep all motion off under `prefers-reduced-motion`.
- **Do** keep numbering and counts tied to real API data, and omit them entirely when the data is missing.
- **Do** keep a section in place when its data fails or is empty: show a notice sheet that says what happened and offers the next action.
- **Do** print placeholders (Barlow, texto-2, "ex.: …"); handwriting is reserved for what the person actually wrote.

### Don't:
- **Don't** use a gradient as a color fill or a fade between sections; the only gradient in the world is the repeating ruled-line pattern of a blank card.
- **Don't** introduce a second accent color or reuse the legacy blue/indigo (`#2563eb` family) or Inter on Talão surfaces.
- **Don't** set small red text on rosa or azul.
- **Don't** put the uppercase tracked label style above section headings as a kicker or eyebrow; it belongs to printed form labels on the talão and vias only.
- **Don't** use Caveat for headings, buttons, or labels.
- **Don't** give flat vias, tables, or printed boxes a shadow, and never use a hard offset shadow; only loose sheets cast a soft, paper-tinted one.
- **Don't** round cards or containers.
- **Don't** print decorative words that look like instructions or controls (a labelled canhoto, "destaque aqui", a blank "Nº ______", an invented order number, "1ª via"); every printed word on the talão either labels a field or tells the person something true.
