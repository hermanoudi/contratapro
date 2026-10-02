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
  controle: "#8b8590"
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
  page-title:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.05
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
  panel: "clamp(1rem, 2.5vw, 1.5rem)"
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
  field-box:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.nanquim}"
    typography: "{typography.body}"
    rounded: "{rounded.btn}"
    padding: "0 1rem"
    height: "52px"
  field-box-readonly:
    backgroundColor: "{colors.papel-2}"
    textColor: "{colors.texto-2}"
  topbar:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.nanquim}"
    height: "56px"
  sidebar:
    backgroundColor: "{colors.papel-2}"
    textColor: "{colors.nanquim}"
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
  panel:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.none}"
    padding: "{spacing.panel}"
  notice:
    backgroundColor: "{colors.papel-2}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.none}"
    padding: "0.9rem 1rem"
---

# Design System: ContrataPro

> **Scope.** Every surface of ContrataPro now runs in this world, in one of two registers.
>
> - **Full talão** for the public flow, where the client decides whether to trust a stranger: Home, Search, Category, the professional's profile and booking (`/p/:slug`), and the review page.
> - **Contained register** for everything a person operates: entry pages (login, signups, new password), the logged-in areas of client and professional, subscription, and admin. It keeps the talão's ink and type and drops the vias, seams, tilt and handwriting.
>
> All tokens are written to `:root` once, by `TalaoTokens` in `frontend/src/components/talao/tokens.js`, the single source. `index.css` keeps the old variable names (`--primary`, `--border`…) only as a bridge to these tokens, so older styles render in the world. The legacy blue/indigo palette and Inter are gone: never bring them back.

## Overview

**Creative North Star: "Talão de Orçamento"**

The product is dressed as the carbon-copy order pad (talão de pedido/orçamento) that every Brazilian autônomo keeps in the van or the toolbox. Whole sections are flat sheets of colored paper, the "vias": yellow, white, pink, blue. Everything printed by the gráfica is in a single red ink: rules, labels, numbering, stamps, primary buttons. Everything filled in by a person is carbon blue in a handwriting face. Near-black nanquim carries headings and running text. The effect is warm and local, a thing from the neighbourhood rather than a SaaS product, which is the tone PRODUCT.md commits to.

Density is that of a paper form: generous section padding, ruled lines instead of boxes, and tables and lists that read as printed rows. Sheets meet at a perforated seam (a scalloped tear edge) rather than a straight divider. State is carried by the stroke, not by fills: a solid rule is printed, a dashed rule is the tear line, a hand-drawn X marks a choice, and focus re-inks the rule in carbon blue over a faint blue wash on the line being written.

The contained register is the same pad seen at the counter, once the order is in the drawer. The ink, type, square corners, ruled rows and printed labels are the same. The paper is white and off-white (papel, papel-2), rules are neutral régua, nothing is tilted, and nothing is handwritten. A professional checking the week's agenda, or an admin reading a table, sees the gráfica's print, not its sales sheet.

Motion is small and physical: the city from the CEP writes itself in by a left-to-right clip reveal (700ms), a checkbox's X draws in two strokes (220ms, second delayed 160ms), a professional card lifts and tilts slightly on hover, and buttons press 1px down. All of it is disabled under `prefers-reduced-motion`.

**Key Characteristics:**
- Flat paper vias as full-bleed section colors, joined by a perforated seam (full talão).
- One printing ink (gráfica red) for all print: rules, labels, numbers, stamps, primary actions, in both registers.
- Handwriting (Caveat, carbon blue) only for what a person writes: input values, the resolved city, marginal notes. Not used in the contained register.
- Condensed, heavy printed display type (Barlow Condensed 800) over a plain humanist text face (Barlow).
- Square paper geometry; the only rounding is a 2px press on buttons and fields.
- Slight hand-placed rotation on physical objects (the talão, stamps, notes); status stamps keep it in the contained register.

## Colors

A four-paper stock (yellow, white, pink, blue) printed in one red and written in one blue, with near-black ink for reading, plus a neutral counter-paper and three status inks for operating.

### Primary
- **Vermelho de Gráfica** (grafica): the single printing ink. Primary buttons, stamp buttons, every structural rule (2px solid under headers, 6px top rule on a via, 5px foot on a card, 2px top rule on a panel), form labels, item numerals, prices, the appointment count on the talão, links, the star rating fill, and the one-ink logo (`contratapro-logo-grafica.png`) on every surface and e-mail. Its hover/pressed ink is **Gráfica Escura** (grafica-escura), which also prints small labels (`FieldLabel`, Passo N de M).
- **Pauta** (pauta): the same red at 55% alpha, used only for decorative ruled lines: table row rules, list rules, FAQ dividers, card-foot rules. Never text, and never the only boundary of a control (it measures 2.7:1 on white); a field's resting underline uses full gráfica.

### Secondary
- **Azul-Carbono** (carbono): the handwriting ink. Input values and caret on the talão, the resolved city, the drawn X in a checkbox, marginal notes (ViaNote), check marks in factual lists, the focus ring and the focused field's inset rule in both registers. In the contained register it also marks the "Agendado" state, the ink of what a person booked.

### Tertiary (the paper stock)
- **Via Amarela** (amarela): the hero sheet and text selection highlight; also the monogram and avatar fill (the photo frame) in both registers, and today's underline in the weekly agenda.
- **Via Rosa** (rosa): the client via and the professionals section (Mesa).
- **Via Azul** (azul): the professional via; at 55% alpha, the wash behind a focused field; in the agenda, the wash of a booked slot.

### Neutral
- **Papel** (papel): the white sheet; page background, the talão, cards, panels, dialogs, topbar, footer.
- **Papel do Balcão** (papel-2): the contained register's off-white. Sidebar, notices, read-only fields, auth asides, unavailable plan sheets, the hatch of a blocked slot, the inline reason and pending boxes.
- **Régua** (regua): nanquim at 14%, the neutral rule of the contained register: panel borders, card frames, the line under tabs. Decorative only.
- **Controle** (controle): the boundary of a boxed field or an unselected plan sheet, at 3:1 so a control is visible without ink.
- **Nanquim** (nanquim): headings, body text, icons in the topbar, photo frame.
- **Texto Secundário** (texto-2 and its per-paper variants): secondary text is re-inked per sheet so it stays in family and legible: default on white and papel-2, **texto-2-amarela** on the hero, **texto-2-rosa** on pink, **texto-2-azul** on blue. Set it by overriding `--texto-2` on the section or via, never by hardcoding.

### Status
- **Sucesso** (sucesso): done and good: Concluído, Ativa, Pago, a passed password rule, "Retomar atendimentos".
- **Alerta** (alerta): waiting or reversible: Pendente, Suspenso, Em análise, scheduled cancellation or plan change, "Suspender atendimentos".
- **Erro** (erro): ended or refused: Cancelado, Recusado, Vencido, a destructive dialog's top rule. The same value as gráfica-escura, so an error never looks like a button.

### Named Rules
**The One Ink Rule.** Everything printed is gráfica red; everything written is carbon blue. No third accent. Status inks are for state words only, never for decoration or actions.

**The Paper Is the Color Rule.** Color arrives as whole flat sheets of paper, edge to edge. No tinted cards floating on a neutral page, no color washes, no gradient fills. The contained register has no colored paper at all.

**The Word Carries the State Rule.** A status is always a word in its ink (Agendado, Pendente, Cancelado), sometimes framed as a stamp; never a colored dot, pill or icon alone.

**The Small Print Rule.** Red text smaller than about 18px regular / 14px bold sits on papel, papel-2 or amarela only (5.88:1 and 4.68:1). On rosa and azul, gráfica at small sizes falls below 4.5:1 (4.19:1 and 4.38:1), so small red text there is set in **gráfica-escura** instead: via table heads and item numerals, via stamps, and links in the rosa professionals section.

**The Seam Sync Rule.** The perforated seam draws its scallops in an SVG data URI that cannot read CSS variables, so the paper hexes are repeated in the `PAPER` map beside it. That map is a mirror of the paper tokens, not a second palette; change both together.

## Typography

**Display Font:** Barlow Condensed (with 'Arial Narrow', sans-serif), weights 500–800 loaded
**Body Font:** Barlow (with system-ui, sans-serif), weights 400/500/600/700 loaded
**Handwriting Font:** Caveat (with 'Segoe Print', cursive), weights 500/700 loaded

**Character:** Barlow Condensed is the gráfica's type: heavy, narrow, printed. Barlow is its plain reading partner. Caveat is the customer's pen and never sets anything the gráfica would have printed.

### Hierarchy
- **Display** (800, clamp(2.6rem, 6.4vw, 5.25rem), 0.95, -0.015em, balanced): the single page title on full-talão pages (hero h1).
- **Headline** (800, clamp(2rem, 4.2vw, 3.25rem), 1, -0.01em, balanced): section titles on full-talão pages.
- **Page title** (800, clamp(1.9rem, 3.5vw, 2.5rem), 1.05): the one h1 of a contained page (`PageHead`, `StepHead`), with one supporting line under it in texto-2.
- **Title** (700–800, 1.2–2.2rem, ~1.05): via titles (800, clamp(1.7rem, 3vw, 2.2rem)), panel and section headings (700, 1.35rem), dialog titles (800, 1.65–1.85rem), card names (700, 1.45rem), plan names (800, 1.5rem), appointment titles in rows (700, 1.2–1.25rem).
- **Lead** (400, clamp(1.05rem, 1.4vw, 1.2rem), 1.55, max 60ch): the one supporting paragraph under a heading, in texto-2.
- **Body** (400, 1rem, 1.5–1.6, 62–68ch): running text, table cells, FAQ answers. On phones the body never shrinks below 15px.
- **Label** (Barlow Condensed 600, 0.95rem, 0.08em, uppercase, gráfica or gráfica-escura): printed form labels: field labels ("SERVIÇO:", `FieldLabel`), fieldset legends, table column heads, ruled-list terms (`dt`), via stamps, "Passo N de M".
- **Fine print** (Barlow Condensed 500–600, 0.95–1rem, 0.02–0.03em, sentence case): printed lines that must be read, not scanned, such as the talão's tear line. Kept at 0.95rem or larger; nothing on any page is set below that, except the 0.9rem slug and sub-notes of the admin.
- **Action** (Barlow Condensed 700, 1.1rem, 0.05em, uppercase): button text; nav and menu items use 600, 1.1–1.15rem, 0.03em, sentence case.
- **Hand** (Caveat 700, 1.45–1.75rem, 1.2): input values on the talão (1.75rem), resolved city (1.5rem), marginal notes (1.45rem). Never placeholders, never in the contained register.

### Named Rules
**The Printed vs. Written Rule.** If the gráfica would have printed it, it is Barlow Condensed; if a person would have written it, it is Caveat in carbon blue. Caveat never sets headings, buttons, or labels.

**The Numbers Are Printed Rule.** Numbering, prices, dates, counts and admin figures are Barlow Condensed (or Barlow in tables) with `tabular-nums`.

**The Display Guard Rule.** `index.css` shrinks h1–h3 with `!important` on phones for legacy markup. Every world heading carries `data-display`, which exempts it; without it, a Display or Page title collapses on mobile.

## Layout

Full-talão pages sit in a 1200px max-width column with a fluid side gutter (clamp(1rem, 4vw, 2.5rem)); section color runs full-bleed behind it. Sections breathe at clamp(3.5rem, 8vw, 6.5rem) vertical padding, with clamp(2rem, 4vw, 3rem) between a section head and its content. A section head is a Headline plus one Lead, nothing above the headline. Two consecutive sections on the same paper do not add their padding; the second starts at 0 top padding.

Contained pages sit inside one of two frames:
- **AppShell** (logged-in areas and admin): a papel-2 sidebar closed by a 2px gráfica rule on the right, with a sticky 64px topbar (56px on phones). Up to 768px the sidebar becomes an off-canvas drawer over a scrim. Content is a single column: `PageHead`, then panels at `spacing.panel` padding. Reading panels (detail, subscription, profile, forms) cap at 44–46rem; tables and agendas take the full width.
- **AuthLayout** (entry pages and the subscription flow): two halves from 969px, a papel-2 aside of true facts on the left and the form on the right; on phones only the form, under a logo and a gráfica rule.

Breakpoints are content-driven, not a fixed scale: topbar nav switches at 860px; the hero goes two-column at 960px; the canhoto stub appears at 560px; professional cards go 2-up at 640px and 3-up at 1040px; ruled `dl` detail lines collapse to one column under 480px, where action rows also stack with the primary on top. Below 560px the hero drops its Lead so the talão's submit ends inside a 360×640 screen.

The 360px rule: no page scrolls sideways at 360px wide. Wide content scrolls inside its own frame (`TableScroll`), never the page. Touch targets are at least 44px; primary buttons are 48px, the talão submit 54px. Only the topbar is sticky.

### Named Rules
**The Perforated Seam Rule.** Two different paper sheets meet at the perforated seam (12px tall, 18px scallop tile, radius 5.5px) drawn in the upper sheet's color over the lower sheet's color. Never a straight line or a gradient fade between vias.

**The State Stays in Place Rule.** A section never disappears when its data fails, is loading or is empty. It shows a loading line, a notice that says what happened with "Tentar de novo", or an empty state that names the next step, in the same place the content would be.

## Elevation & Depth

Paper lies flat. Depth is reserved for objects that are physically separate sheets resting on the page, and it is soft and cast downward like paper on a table, never a hard offset block. Everything else separates by paper color and printed rules.

### Shadow Vocabulary
- **Talão on the table** (`box-shadow: 0 22px 36px -18px rgba(23, 23, 27, 0.45), 0 2px 4px rgba(23, 23, 27, 0.12)`): the order pad in the hero.
- **Card on pink paper** (`box-shadow: 0 16px 28px -18px rgba(107, 38, 56, 0.55), 0 1px 3px rgba(107, 38, 56, 0.18)`): professional cards and the notice sheet that replaces them; the shadow is tinted with the paper's own ink (texto-2-rosa), not grey.
- **Sheet over the desk** (`box-shadow: 0 24px 48px -20px rgba(23, 23, 27, 0.55), 0 2px 6px rgba(23, 23, 27, 0.15)`): every native `<dialog>`, over a nanquim scrim at 45%.
- **Drawer** (`box-shadow: 16px 0 40px -20px rgba(23, 23, 27, 0.5)`): the AppShell sidebar only while it is open on phones.

### Named Rules
**The Loose Sheet Rule.** Only a loose sheet on top of another sheet casts a shadow, and its shadow is tinted by the paper under it. Vias, panels, tables and printed boxes stay flat.

## Shapes

Geometry is square paper. Every container, sheet, card, via, panel, table, dialog and photo frame has square corners (0px). The only rounding is 2px on buttons and boxed fields, the slight softness of a pressed rubber stamp, and the full circle of a single-choice mark, the printed "( )" of a paper form.

Borders are printing: 2px solid gráfica for frames and header rules, 1.5px pauta for ruled rows, 2px dashed gráfica for tear lines (the canhoto edge, the talão's tear line, the footer divider). Weight carries meaning: a 6px top rule opens a via, a 5px bottom rule closes a card or notice sheet, a 2px gráfica top rule opens a panel, a 4px top rule opens a dialog (erro instead of gráfica when the action is destructive). In the contained register the neutral frame is 1.5px régua; a selected sheet re-inks it to 2px gráfica.

Physical objects are placed by hand at a slight angle: the talão at -1.2deg (desktop only), via stamps at -4deg, marginal notes at -1deg, a card tilts -0.4deg as it lifts on hover, and a status stamp sits at -3deg.

## Components

### Where the code lives
- **`components/talao/`** — the world's shared kit, imported from the barrel. `tokens.js` (`TalaoTokens`, `PAPER`), `TalaoPage`/`Wrap`/`paperSurface`, type (`Display`, `Lead`, `Hand`), buttons, `Field`/`FormError`, `TextInput` (`FieldLabel`, `InputBox`, `TextInput`, `FieldNote`), `Seam`, `ProCard`/`CardsGrid`/`BlankCard`, `TalaoSheet` and its parts, `useCep`/`CepField`, `NoticeSheet`, `ResultsBar`, `TrustNote`, `SiteHeader`, `SiteFooter`, `whatsappLink`.
- **`components/AppShell.jsx`** (+ `ProfessionalLayout`, `ClientLayout`, `admin/AdminLayout`) and **`components/AuthLayout.jsx`** — the two contained frames.
- **`components/dashboard/`** — contained pieces: `parts.js` (`PageHead`, `Panel`, `Notice`, `IconButton`, `Fieldset`, `Choices`), `listParts.js` (filters, counts, empty lists), `AppointmentRow`, `Pager`, the agenda and its dialogs, `utils.js` (status map, local dates).
- **`components/admin/`** — `adminParts.js` (`Table`, `TableScroll`, `Figures`, `useAdminResource`), `AdminDialog`, one panel per tab.
- **Forms** — `SignupParts.jsx` (`StepHead`, `TextField`, `AddressFields`), `signupUtils.js`, `PasswordInput.jsx`, `PhotoPicker.jsx`, `planParts.js`, `apiErrors.js` (`translateError` for English or unaccented backend messages).
- **E-mails** — `backend/app/services/notifications/templates.py`: the one-ink logo over a 2px gráfica rule, a papel-2 page, an info box with a gráfica top rule, a square gráfica button, a dashed tear line before the footer, statuses in sucesso/alerta/erro.

Promote a local piece to a shared file the first time a second page needs it; never copy it.

### Buttons
Printed and decisive, like the gráfica's red block.
- **Shape:** near-square (2px), 2px border in the same ink as the fill.
- **Primary:** gráfica fill, papel text, uppercase Barlow Condensed 700, 48px min height, 0 1.4rem padding, optional icon. The one main action in a sheet, panel or dialog, labelled with what it does ("Ir para o pagamento", "Agendar a troca", "Salvar o perfil"), never "OK" or "Confirmar" alone.
- **Stamp (secondary):** transparent with gráfica text and 2px gráfica border; inverts to a gráfica fill on hover. Secondary and reversible actions: Voltar, Cancelar, Suspender, Limpar, Alterar o plano. Rendered as a link or a button with the same look.
- **Outline link:** the stamp's look on an external `<a>` (WhatsApp, Mercado Pago), with an icon that says where it goes.
- **Quiet link:** a plain underlined line in texto-2 for "do it later" exits ("Decidir depois", "Agora não"); never styled as a button.
- **Icon button:** 44px square, régua frame, icon only, always with an `aria-label` naming the object ("Excluir Diarista").
- **Hover / Focus / Active:** hover darkens to gráfica-escura (160ms, `var(--ease-out)` = cubic-bezier(0.22, 1, 0.36, 1)); focus is a 2px carbono outline at 3px offset; active presses 1px down; disabled is 0.4–0.5 opacity with a not-allowed cursor.

### Chips
- **Printed checklist (talão, single choice):** a 1.3rem printed circle with a 2px gráfica border beside a Barlow 500 label, 44px rows, two columns, at most 4 items, only when real categories came back. A `radiogroup` with roving tabindex; choosing draws a carbon-blue X in two strokes and writes the service into the field.
- **Printed squares (multi-select filters, Search):** square marks with `aria-pressed`, because the circle means single choice.
- **Period chips (contained):** square 40px chips with a régua frame that fill gráfica when pressed (`aria-pressed`), used for date shortcuts.

### Cards / Containers
- **Cartão (professional card):** papel, square, 1.25rem padding, 5px gráfica bottom rule, tinted paper shadow; 64px square photo with a 2px nanquim frame (amarela monogram when no photo); "No ContrataPro desde {mês de ano}" from the real `created_at`; one talão line with the first registered service and its lowest price in the same unit; a foot row with the real rating or "Ainda sem avaliações" and "Ver perfil e avaliações". Hover lifts 3px and tilts -0.4deg. Loading is a blank ruled card, never a grey shimmer.
- **Notice sheet (full talão):** what a cards section shows on error or empty, spanning the row: a heading that states the fact, one paragraph naming the recovery, a primary fix and a stamp alternative.
- **Via:** a whole paper sheet (rosa or azul) with a 6px gráfica top rule, a title over a 2px red rule, and a rotated stamp that states a fact ("Grátis", "Sem cartão").
- **Printed box:** 2px gráfica frame on the current paper, no fill, no shadow.
- **Panel (contained):** papel, 1.5px régua frame, 2px gráfica top rule, `spacing.panel` padding. Panels hold a form, a list or a receipt; one panel per topic, stacked with 1.5rem between.
- **Receipt panel (contained):** a panel whose head prints the record ("Agendamento nº 5", "Plano Pro") over a 2px gráfica rule, with a status stamp at the right, then a ruled `dl` of gráfica `dt` labels and values. Used for the appointment detail and the subscription.
- **Notice (contained):** papel-2 with a 1.5px border in the state's ink (alerta, erro, or régua), an icon and one sentence, and its action beside it. Inline in the content, never fixed over the shell. Pending, scheduled and reason boxes use the same papel-2 with an alerta or erro border.
- **Plan sheet:** a papel sheet holding a real radio, 1.5px controle frame; the chosen one gets a 2px gráfica frame, the unavailable one papel-2 with a printed tag ("Seu plano atual"). Items come from the plan record, never marketing ("mais popular", emoji).

### Inputs / Fields
- **Ruled field (full talão):** a ruled line, not a box. A Barlow Condensed uppercase red label on the same baseline as a borderless input; the value is Caveat 700 1.75rem in carbono. The placeholder is printed, not written: Barlow 400 1.05rem in texto-2, phrased as an example ("ex.: eletricista, diarista"). The only boundary is a 1.5px full-gráfica underline.
- **Boxed field (contained):** `TextInput`, a 52px box with a 1.5px controle border and 2px corners, a `FieldLabel` in gráfica-escura caps above it and an optional leading icon. Selects, dates and textareas reuse it (`as="select"`, `type="date"`, `as="textarea"`). Read-only fields switch to papel-2 with a régua border and texto-2 text, and carry a `FieldNote` saying why ("O e-mail é o seu login").
- **Focus (both):** an azul wash at 35–55% alpha and a carbono inset rule (`box-shadow: inset 0 -2.5px 0 carbono`), 160ms ease-out, off under reduced motion. No outline glow.
- **Status / Error:** helper and status text below in Barlow 0.95rem texto-2 (`FieldNote`); errors in gráfica ink with `role="alert"`, written under the field or the form, and the first invalid field takes focus. Toasts only confirm what already happened; they never carry an error the person must act on.

### Navigation
- **Topbar (full talão):** papel, 56px, sticky, closed by a 2px gráfica bottom rule. Links in Barlow Condensed 600 1.1rem nanquim; hover turns them red and draws a 2px underline at 5px offset. Below 860px they collapse into a full-width panel of 48px rows separated by pauta, closed by Esc; the "Sou profissional" stamp stays visible.
- **AppShell menu (contained):** Barlow Condensed 600 1.15rem in 48px rows, groups separated by pauta. The active item is gráfica, 700, underlined 2px at 5px offset, with `aria-current="page"`. No pills, no colored side bars. State items use status inks ("Suspender atendimentos" alerta, "Retomar" sucesso), never the action red.
- **Tabs (contained):** links in Barlow Condensed over a régua line; the current one is gráfica with a 3px gráfica underline.
- **Pager:** Anterior / "Página X de Y" / Próxima, which fits at 360px whatever the page count.

### Dialogs
Native `<dialog>` with `showModal()`, so Esc and focus trapping come for free. Papel, square, a 4px gráfica top rule (erro for destructive actions), the "Sheet over the desk" shadow. Content renders only while open, so labels and ids are never duplicated on the page. The title asks the real question ("Suspender Carla Mendes?"); one paragraph says what will happen; errors show inside the dialog; Voltar (stamp) beside the action (primary).

### Lists and Tables
- **Ruled rows:** lists are rows over 1.5px pauta rules under a 2px gráfica head rule. The appointment row prints the day as a block (number in Barlow Condensed 800 over the month), then the service, date, person and status word.
- **Ruled figures:** numbers in a `dl` grid, label left and a Barlow Condensed 800 number right, over pauta rules. Never icon stat cards.
- **Tables:** printed column heads in gráfica-escura caps over a 2px gráfica rule, pauta row rules, `th scope="col"`, row hover in papel-2. Wide tables sit in `TableScroll` (relative, scrolls inside the panel, keyboard-focusable).

### Status Stamp
The record's state as a rubber stamp: a 2px border and uppercase Barlow Condensed 800 in the status ink, rotated -3deg (Agendado, Concluído, Ativa, Pendente, Pago, Recusado). Used once per record head; inside lists the state is a plain colored word.

### Talão (signature component)
The primary search form is the order pad itself: a papel sheet with a 2px gráfica frame, rotated -1.2deg on desktop, carrying the table shadow. A blank canhoto stub, marked only by its dashed edge, runs down the left from 560px; it carries no text. The head prints the brand and "Pedido de serviço" and, only when the API returns a real appointment count above zero, one line of fine print with the number in bold tabular figures. It is never dressed as an order number. Order down the sheet: Serviço field, printed checklist, CEP field with its status line, the red submit, then a dashed tear line that prints the reassurance that matters at the moment of submitting: that it is only a search, it is free, and payment is direct. An incomplete CEP turns its status line into an error and takes focus. The booking talão on `/p/:slug` and the review talão reuse the shell (`TalaoSheet`) untilted, because they hold forms and a calendar.

### Share Image
`frontend/public/og-image.jpg` (1200×630) is the talão world as a social preview: amarela paper, the one-ink logo, the hero title in Barlow Condensed 800, a tilted talão filled in by hand, and a perforated seam at the foot. Its source is `frontend/design/og-image.html`; regenerate the JPEG from it when the hero copy changes.

### Perforated Seam (signature component)
See the Perforated Seam Rule. It is the only divider between sections of different paper.

### Known Gaps
- The guided tour (`contexts/TourContext.jsx`, react-joyride) still has the legacy styling: rounded 10–16px tooltip and buttons, grey Tailwind-style text. Its button is already gráfica. Bring it into the contained register (square, Barlow Condensed title, nanquim/texto-2 text) next time it is touched.

## Do's and Don'ts

### Do:
- **Do** pick the register by the person's job: full talão where a client decides whether to trust someone (Home, Search, Category, profile/booking, review); contained everywhere a person operates.
- **Do** give each full-talão section a whole flat paper color (amarela, papel, rosa, azul) and join different papers with the perforated seam.
- **Do** print every rule, label, number, and primary action in gráfica red, and write every user value and marginal note in Caveat carbon blue (full talão only).
- **Do** re-ink secondary text per paper by overriding `--texto-2` on the section.
- **Do** use ruled lines (1.5px pauta) for rows and fields, and let stroke carry state: solid printed, dashed tear, drawn X for chosen, carbono underline for focus.
- **Do** keep corners square; buttons and boxed fields alone take 2px.
- **Do** show every state as a word in its status ink, and every destructive or billing action behind a native `<dialog>` that says what will happen.
- **Do** keep a section in place when its data fails, loads or is empty, and say what happened with a way forward.
- **Do** keep numbering, counts, ratings and prices tied to real API data, and omit them entirely when the data is missing.
- **Do** keep all motion off under `prefers-reduced-motion`, and every page free of sideways scroll at 360px.

### Don't:
- **Don't** use a gradient as a color fill or a fade between sections; the only gradients are repeating line patterns (a blank card's ruling, a blocked slot's hatch, the review textarea's lines).
- **Don't** introduce a second accent color or reuse the legacy blue/indigo (`#2563eb` family), glass, pills or Inter anywhere.
- **Don't** bring vias, seams, tilt or handwriting into the contained register, except the status stamp's -3deg.
- **Don't** set small red text on rosa or azul.
- **Don't** put the uppercase tracked label style above section headings as a kicker; it belongs to printed form labels, table heads and the step/eyebrow line of `StepHead`.
- **Don't** use Caveat for headings, buttons, or labels.
- **Don't** give flat vias, panels, tables, or printed boxes a shadow, and never use a hard offset shadow; only loose sheets (talão, cards on rosa, dialogs, the open drawer) cast a soft one.
- **Don't** round cards, panels, dialogs or containers.
- **Don't** use icon stat cards, colored status dots or pills; numbers are ruled figures and states are words.
- **Don't** print claims the product can't back ("verificados", "mais popular", "suporte dedicado", invented ratings or counts), or decorative words that look like instructions (a labelled canhoto, "Nº ______", "1ª via").
