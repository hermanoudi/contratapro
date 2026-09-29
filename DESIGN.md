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
  carbono-claro: "#5c64a8"
  nanquim: "#17171b"
  texto-2: "#4a4550"
  texto-2-amarela: "#5b4a12"
  texto-2-rosa: "#6b2638"
  texto-2-azul: "#22385e"
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
    padding: "0.9rem 0 0.2rem"
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

Density is that of a paper form: generous section padding, ruled lines instead of boxes, and tables and lists that read as printed rows. Sheets meet at a perforated seam (a scalloped tear edge) rather than a straight divider. State is carried by the stroke, not by fills: a solid rule is printed, a dashed rule is the tear line, a hand-drawn X marks a choice, and focus thickens the rule to carbon blue.

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
- **Vermelho de Gráfica** (grafica): the single printing ink. Primary buttons, stamp buttons, every structural rule (2px solid under headers, 6px top rule on a via, 5px foot on a card), form labels, item numerals, prices, the Nº numbering, links, the star rating fill. Its hover/pressed ink is **Gráfica Escura** (grafica-escura).
- **Pauta** (pauta): the same red at 55% alpha, used only for decorative ruled lines: table row rules, list rules, FAQ dividers, card-foot rules. Never text, and never the only boundary of a control (it measures 2.7:1 on white); a field's resting underline uses full gráfica.

### Secondary
- **Azul-Carbono** (carbono): the handwriting ink. Input values and caret, the resolved city, the drawn X in a checkbox, marginal notes (ViaNote, PrecosNote), "included" check marks, and the focus ring. **Carbono Claro** (carbono-claro) is for placeholders only.

### Tertiary (the paper stock)
- **Via Amarela** (amarela): the hero sheet and text selection highlight; also the monogram fill on a card without a photo.
- **Via Rosa** (rosa): the client via and the professionals section (Mesa).
- **Via Azul** (azul): the professional via and the pricing section.

### Neutral
- **Papel** (papel): the white sheet; page background, the talão, cards, price sheets, topbar.
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
- **Title** (700–800, 1.45–2.2rem, ~1.05): via titles (800, clamp(1.7rem, 3vw, 2.2rem)), list titles and FAQ heading (700, 1.5rem), card names (700, 1.45rem), plan names (800, 1.9rem).
- **Lead** (400, clamp(1.05rem, 1.4vw, 1.2rem), 1.55, max 60ch): the one supporting paragraph under a heading, in texto-2.
- **Body** (400, 1rem, 1.5–1.6, 62–68ch): running text, table cells, FAQ answers.
- **Label** (Barlow Condensed 600, 0.8–0.95rem, 0.08–0.16em, uppercase, gráfica): printed form labels on the talão and vias only: field labels ("SERVIÇO:"), fieldset legend, table column heads, the canhoto, the tear line, via stamps.
- **Action** (Barlow Condensed 700, 1.1rem, 0.05em, uppercase): button text; nav links use 600, 1.1rem, 0.03em, sentence case.
- **Hand** (Caveat 700, 1.45–1.75rem, 1.2): input values (1.75rem), resolved city (1.5rem), marginal notes (1.45rem).

### Named Rules
**The Printed vs. Written Rule.** If the gráfica would have printed it, it is Barlow Condensed; if a person would have written it, it is Caveat in carbon blue. Caveat never sets headings, buttons, or labels.

**The Numbers Are Printed Rule.** Numbering, prices, and item numerals are Barlow Condensed with `tabular-nums`.

## Layout

Content sits in a 1200px max-width column with a fluid side gutter (clamp(1rem, 4vw, 2.5rem)); section color runs full-bleed behind it. Sections breathe at clamp(3.5rem, 8vw, 6.5rem) vertical padding, with clamp(2rem, 4vw, 3rem) between a section head and its content. A section head is a Headline plus one Lead, nothing above the headline.

Breakpoints are content-driven, not a fixed scale: topbar nav switches at 860px; the hero goes two-column (text left, talão right in a 32rem column) at 960px; the canhoto stub appears at 560px; the two vias sit side by side at 880px; professional cards go 2-up at 640px and 3-up at 1040px; the pricing table replaces stacked price sheets at 760px. Mobile order in the hero is title, talão, then the professional call.

The 56px topbar is the only sticky element. Touch targets are at least 44px (menu toggle, checklist items, footer links); primary buttons are 48px, the talão submit 54px.

### Named Rules
**The Perforated Seam Rule.** Two different paper sheets meet at the perforated seam (12px tall, 18px scallop tile, radius 5.5px) drawn in the upper sheet's color over the lower sheet's color. Never a straight line or a gradient fade between vias.

## Elevation & Depth

Paper lies flat. Depth is reserved for the two objects that are physically separate sheets resting on the page, and it is soft and cast downward like paper on a table, never a hard offset block. Everything else separates by paper color and printed rules.

### Shadow Vocabulary
- **Talão on the table** (`box-shadow: 0 22px 36px -18px rgba(23, 23, 27, 0.45), 0 2px 4px rgba(23, 23, 27, 0.12)`): the order pad in the hero.
- **Card on pink paper** (`box-shadow: 0 16px 28px -18px rgba(107, 38, 56, 0.55), 0 1px 3px rgba(107, 38, 56, 0.18)`): professional cards; the shadow is tinted with the paper's own ink (texto-2-rosa), not grey.

### Named Rules
**The Loose Sheet Rule.** Only a loose sheet on top of another sheet casts a shadow, and its shadow is tinted by the paper under it. Vias, tables, and printed boxes stay flat.

## Shapes

Geometry is square paper. Every container, sheet, card, via, table, checkbox, and photo frame has square corners (0px). The only rounding is 2px on buttons, the slight softness of a pressed rubber stamp.

Borders are printing: 2px solid gráfica for frames and header rules, 1.5px pauta for ruled rows, 2px dashed gráfica for tear lines (the canhoto edge, the "destaque aqui" line, the footer). Weight carries meaning: a 6px top rule opens a via, a 5px bottom rule closes a card.

Physical objects are placed by hand at a slight angle: the talão at -1.2deg (desktop only), via stamps at -4deg, marginal notes at -1deg, a card tilts -0.4deg as it lifts on hover.

## Components

### Buttons
Printed and decisive, like the gráfica's red block.
- **Shape:** near-square (2px), 2px border in the same ink as the fill.
- **Primary:** gráfica fill, papel text, uppercase Barlow Condensed 700, 48px min height, 0 1.4rem padding, optional trailing arrow icon. Use it for the one main action in a sheet.
- **Stamp (secondary):** transparent with gráfica text and 2px gráfica border; inverts to a gráfica fill on hover. Used for "Sou profissional" in the topbar (38px compact) and for paid-plan CTAs.
- **Hover / Focus / Active:** hover darkens to gráfica-escura (160ms, ease-out `cubic-bezier(0.22, 1, 0.36, 1)`); focus is a 2px carbono outline at 3px offset; active presses 1px down.

### Chips: Printed Checklist
The "mais pedidos" choices are a printed checklist, not pills: a 1.3rem square box with a 2px gráfica border beside a Barlow 500 label, 44px row height, two columns. Selecting draws a carbon-blue X in two strokes (`aria-pressed`); hover turns the label red.

### Cards / Containers
- **Cartão (professional card):** papel, square, 1.25rem padding, 5px gráfica bottom rule, tinted paper shadow; 64px square photo with a 2px nanquim frame (amarela monogram when no photo); foot row under a 1.5px pauta rule with the rating and an uppercase "Ver agenda" link. Hover lifts 3px and tilts -0.4deg (200ms). Loading state is a blank ruled card, never a grey shimmer.
- **Via:** a whole paper sheet (rosa or azul) with a 6px gráfica top rule, a title over a 2px red rule, a rotated stamp ("1ª via") in the corner, a ruled item table with numbered rows, a handwritten note, and one action at the foot.
- **Printed box:** 2px gráfica frame on the current paper, no fill, no shadow (the "O combinado" panel, price sheets, the pricing table).

### Inputs / Fields
- **Style:** a ruled line, not a box. A Barlow Condensed uppercase red label ("SERVIÇO:") sits on the same baseline as a borderless transparent input; the value is Caveat 700 1.75rem in carbono; placeholder in carbono-claro. The field's only boundary is a 1.5px full-gráfica underline (pauta would fail 3:1 for a control boundary).
- **Focus:** the underline turns carbono and thickens to 2px.
- **Status / Error:** helper and status text below in Barlow 0.95rem texto-2; errors in gráfica ink; a confirmed city writes itself in by hand with a check.

### Navigation
Papel topbar, 56px, sticky, closed by a 2px gráfica bottom rule. Links are Barlow Condensed 600 1.1rem nanquim; hover turns them red and draws a 2px underline at 5px offset. The stamp button sits at the end. Below 860px the links collapse into a full-width panel of 48px rows separated by pauta rules, closed by Esc; the stamp stays visible beside the menu toggle.

### Talão (signature component)
The primary search form is the order pad itself: a papel sheet with a 2px gráfica frame, rotated -1.2deg on desktop, carrying the table shadow. A dashed-edge canhoto stub runs down the left (vertical uppercase label, from 560px). The head prints the brand and "Pedido de serviço" left and a Nº numbering right, in tabular Barlow Condensed 700, fed only by the real appointment count (a blank "Nº ______" until the API answers). Ruled fields, the red submit, the printed checklist, and a dashed "destaque aqui" tear line with scissors close the sheet.

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
- **Do** keep numbering and counts tied to real API data, and leave a printed blank when the data is missing.

### Don't:
- **Don't** use a gradient as a color fill or a fade between sections; the only gradient in the world is the repeating ruled-line pattern of a blank card.
- **Don't** introduce a second accent color or reuse the legacy blue/indigo (`#2563eb` family) or Inter on Talão surfaces.
- **Don't** set small red text on rosa or azul.
- **Don't** put the uppercase tracked label style above section headings as a kicker or eyebrow; it belongs to printed form labels on the talão and vias only.
- **Don't** use Caveat for headings, buttons, or labels.
- **Don't** give flat vias, tables, or printed boxes a shadow, and never use a hard offset shadow; only loose sheets cast a soft, paper-tinted one.
- **Don't** round cards or containers.
