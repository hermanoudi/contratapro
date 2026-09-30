// Sistema visual "Talão de Orçamento" (ver DESIGN.md). Páginas importam daqui.
export { TalaoTokens, PAPER, PAPER_TEXT_2, INK, FONTS } from './tokens';
export { TalaoPage, Wrap, paperSurface } from './TalaoPage';
export { Display, Lead, Hand } from './type';
export { PrimaryButton, PrimaryLink, StampButton, StampLink } from './buttons';
export { Field, FormError } from './Field';
export { Seam } from './Seam';
export { default as ProCard, CardsGrid, BlankCard, cardSheet } from './ProCard';
export { formatPrice, pickHighlight } from './pricing';
export { default as SiteHeader } from './SiteHeader';
export { default as SiteFooter } from './SiteFooter';
export { NoticeSheet, NoticeActions } from './NoticeSheet';
export { default as useCep, formatCep, readSavedLocation } from './useCep';
export { default as CepField, FieldStatus } from './CepField';
export { whatsappLink } from './contact';
export { ResultsBar, ResultsCount, TrustNote } from './Results';
