import { useState, useEffect, useRef, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import { Menu, X, LogOut, Scissors, Star, MapPin, ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { API_URL } from '../config';
import StructuredData from '../components/SEO/StructuredData';
import SEOHead, { SEO_CONFIGS } from '../components/SEO/SEOHead';
import logoImage from '../assets/contratapro-logo.png';

/* ------------------------------------------------------------------
   Mundo visual "Talão de Orçamento": vias de papel chapadas, impressão
   em uma cor (vermelho de gráfica) e preenchimento à mão em azul-carbono.
   ------------------------------------------------------------------ */

const PLANS = [
  { id: 'free', name: 'Free', price: 'Grátis', period: 'para sempre', cta: 'Começar grátis', primary: true },
  { id: 'pro', name: 'Pro', price: 'R$ 19,90', period: 'por mês', cta: 'Assinar o Pro' },
  { id: 'premium', name: 'Premium', price: 'R$ 39,90', period: 'por mês', cta: 'Assinar o Premium' },
];

// Linhas da tabela de preços: um valor por plano (true = incluso, false = não incluso)
const PLAN_ROWS = [
  { label: 'Serviços cadastrados', values: ['1', 'Ilimitados', 'Ilimitados'] },
  { label: 'Agendamentos por mês', values: ['Até 3', 'Ilimitados', 'Ilimitados'] },
  { label: 'Perfil público e agenda online', values: [true, true, true] },
  { label: 'Selo no perfil', values: [false, 'Profissional Ativo', 'Destaque'] },
  { label: 'Posição na busca', values: ['Normal', 'Destaque intermediário', 'Topo da busca'] },
  { label: 'Relatório de desempenho', values: [false, false, true] },
  { label: 'Suporte prioritário', values: [false, false, true] },
];

const formatCep = (digits) => (digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits);

/* ------------------------------ Tokens ------------------------------ */

const Page = styled.div`
  --papel: #ffffff;
  --amarela: #fce58a;
  --rosa: #f9cfda;
  --azul: #cfe0f5;
  --grafica: #c4201a;
  --grafica-escura: #9e1712;
  --pauta: rgba(196, 32, 26, 0.55);
  --carbono: #2e3a9e;
  --carbono-claro: #5c64a8;
  --nanquim: #17171b;
  --texto-2: #4a4550;

  --f-impresso: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  --f-texto: 'Barlow', system-ui, sans-serif;
  --f-mao: 'Caveat', 'Segoe Print', cursive;

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

  font-family: var(--f-texto);
  font-size: 1rem;
  color: var(--nanquim);
  background: var(--papel);
  min-height: 100vh;

  ::selection {
    background: var(--amarela);
    color: var(--nanquim);
  }

  a, button, input, summary {
    &:focus-visible {
      outline: 2px solid var(--carbono);
      outline-offset: 3px;
    }
  }
`;

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
`;

const Display = styled.h2`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2rem, 4.2vw, 3.25rem);
  line-height: 1;
  letter-spacing: -0.01em;
  text-wrap: balance;
  margin-bottom: 1rem;
`;

const Lead = styled.p`
  font-size: clamp(1.05rem, 1.4vw, 1.2rem);
  line-height: 1.55;
  color: var(--texto-2);
  max-width: 60ch;
`;

const Hand = styled.span`
  font-family: var(--f-mao);
  font-weight: 700;
  color: var(--carbono);
`;

/* ------------------------------ Botões ------------------------------ */

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0 1.4rem;
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms var(--ease-out), color 160ms var(--ease-out), transform 120ms var(--ease-out);

  &:active {
    transform: translateY(1px);
  }
`;

const PrimaryButton = styled.button`
  ${buttonBase}
  background: var(--grafica);
  color: var(--papel);
  border: 2px solid var(--grafica);

  &:hover {
    background: var(--grafica-escura);
    border-color: var(--grafica-escura);
  }
`;

const PrimaryLink = styled(Link)`
  ${buttonBase}
  background: var(--grafica);
  color: var(--papel);
  border: 2px solid var(--grafica);

  &:hover {
    background: var(--grafica-escura);
    border-color: var(--grafica-escura);
  }
`;

const StampLink = styled(Link)`
  ${buttonBase}
  background: transparent;
  color: var(--grafica);
  border: 2px solid var(--grafica);

  &:hover {
    background: var(--grafica);
    color: var(--papel);
  }
`;

/* ------------------------------ Topo ------------------------------ */

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--papel);
  border-bottom: 2px solid var(--grafica);
`;

const TopbarInner = styled(Wrap)`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;

  img {
    height: 34px;
    width: auto;
    display: block;
  }
`;

const TopNav = styled.nav`
  display: none;
  align-items: center;
  gap: 1.5rem;

  @media (min-width: 860px) {
    display: flex;
  }
`;

const TopLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.03em;
  color: var(--nanquim);
  text-decoration: none;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;

  &:hover {
    color: var(--grafica);
    text-decoration-line: underline;
  }
`;

const TopButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.03em;
  color: var(--nanquim);

  &:hover {
    color: var(--grafica);
  }
`;

const TopStamp = styled(StampLink)`
  min-height: 38px;
  font-size: 1rem;
  padding: 0 0.9rem;
  white-space: nowrap;

  @media (max-width: 380px) {
    font-size: 0.9rem;
    padding: 0 0.6rem;
  }
`;

const MobileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (min-width: 860px) {
    display: none;
  }
`;

const MenuToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: var(--nanquim);
  cursor: pointer;
`;

const MobilePanel = styled.nav`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--papel);
  border-bottom: 2px solid var(--grafica);
  padding: 0.5rem clamp(1rem, 4vw, 2.5rem) 1.25rem;
  display: flex;
  flex-direction: column;

  a, button {
    min-height: 48px;
    border-bottom: 1px solid var(--pauta);
    width: 100%;
    justify-content: flex-start;
  }

  a:last-child {
    border-bottom: 2px solid var(--grafica);
    justify-content: center;
    margin-top: 1rem;
  }

  @media (min-width: 860px) {
    display: none;
  }
`;

/* ------------------------------ Hero: via amarela ------------------------------ */

const Hero = styled.section`
  background: var(--amarela);
  --texto-2: #5b4a12;
  padding: clamp(2rem, 6vw, 5rem) 0 clamp(3rem, 7vw, 6rem);
`;

// Mobile: título, talão e só depois a chamada para profissionais
const HeroGrid = styled(Wrap)`
  display: grid;
  grid-template-areas: 'text' 'talao' 'foot';
  gap: 1.75rem;

  > div:first-child {
    grid-area: text;
  }

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 32rem);
    grid-template-areas: 'text talao' 'foot talao';
    column-gap: clamp(2rem, 4vw, 4rem);
    row-gap: 0;

    > div:first-child {
      align-self: end;
    }
  }
`;

const HeroTitle = styled.h1`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2.6rem, 6.4vw, 5.25rem);
  line-height: 0.95;
  letter-spacing: -0.015em;
  text-wrap: balance;
  margin-bottom: 1.25rem;
`;

const HeroFoot = styled.p`
  grid-area: foot;
  align-self: start;
  display: flex;

  @media (min-width: 960px) {
    margin-top: 1.75rem;
  }
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.75rem;
  font-size: 1.05rem;
  color: var(--texto-2);

  a {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 0.02em;
    color: var(--grafica);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    &:hover {
      color: var(--grafica-escura);
    }
  }
`;

/* O talão: folha branca com canhoto perfurado */
const Talao = styled.form`
  grid-area: talao;
  align-self: center;
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  background: var(--papel);
  border: 2px solid var(--grafica);
  box-shadow: 0 22px 36px -18px rgba(23, 23, 27, 0.45), 0 2px 4px rgba(23, 23, 27, 0.12);

  @media (min-width: 560px) {
    grid-template-columns: 2.75rem 1fr;
  }

  @media (min-width: 960px) {
    transform: rotate(-1.2deg);
  }
`;

const Canhoto = styled.div`
  display: none;
  border-right: 2px dashed var(--grafica);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--grafica);
  align-items: center;
  justify-content: center;

  @media (min-width: 560px) {
    display: flex;
  }
`;

const TalaoBody = styled.div`
  padding: 1.25rem clamp(1rem, 3vw, 1.75rem) 0;
  min-width: 0;
`;

const TalaoHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--grafica);
  color: var(--grafica);
`;

const TalaoBrand = styled.div`
  font-family: var(--f-impresso);
  line-height: 1;

  strong {
    display: block;
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: 0.02em;
  }

  span {
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const Numeradora = styled.div`
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-align: right;

  @media (max-width: 480px) {
    font-size: 1.15rem;
  }

  small {
    display: block;
    max-width: 10rem;
    margin-left: auto;
    white-space: normal;
    line-height: 1.2;
    margin-top: 0.2rem;
    font-weight: 500;
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: none;
    color: #8e1611;
  }
`;

const Field = styled.label`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.9rem 0 0.2rem;
  /* Única borda do campo em repouso: tinta cheia para passar 3:1 */
  border-bottom: 1.5px solid var(--grafica);
  cursor: text;

  > span {
    flex: none;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-family: var(--f-mao);
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 1.2;
    color: var(--carbono);
    caret-color: var(--carbono);
    padding: 0;

    &::placeholder {
      color: var(--carbono-claro);
      font-weight: 500;
    }

    &:focus {
      outline: none;
    }
  }

  &:focus-within {
    border-bottom-color: var(--carbono);
    border-bottom-width: 2px;
  }
`;

const writeIn = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
`;

const CepStatus = styled.p`
  min-height: 1.9rem;
  padding-top: 0.35rem;
  font-size: 0.95rem;
  color: ${({ $tone }) => ($tone === 'erro' ? 'var(--grafica)' : 'var(--texto-2)')};
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const CityWrite = styled(Hand)`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1.5rem;
  line-height: 1;
  animation: ${writeIn} 700ms var(--ease-out) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Checklist = styled.fieldset`
  border: none;
  margin-top: 1.25rem;

  legend {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
    margin-bottom: 0.4rem;
  }
`;

const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
`;

const drawStroke = keyframes`
  to { stroke-dashoffset: 0; }
`;

const CheckItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  padding: 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: var(--f-texto);
  font-weight: 500;
  font-size: 1rem;
  color: var(--nanquim);
  min-width: 0;

  > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover > span:last-child {
    color: var(--grafica);
  }
`;

const Box = styled.span`
  flex: none;
  position: relative;
  width: 1.3rem;
  height: 1.3rem;
  border: 2px solid var(--grafica);

  svg {
    position: absolute;
    inset: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    overflow: visible;
  }

  path {
    stroke: var(--carbono);
    stroke-width: 3.2;
    stroke-linecap: round;
    fill: none;
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    animation: ${drawStroke} 220ms var(--ease-out) forwards;
  }

  path + path {
    animation-delay: 160ms;
  }

  @media (prefers-reduced-motion: reduce) {
    path {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

const FormError = styled.p`
  margin-top: 0.75rem;
  font-weight: 600;
  color: var(--grafica);
`;

const SubmitRow = styled.div`
  margin: 0.5rem 0 0;

  button {
    width: 100%;
    min-height: 54px;
    font-size: 1.2rem;
  }
`;

const Perforation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.25rem calc(-1 * clamp(1rem, 3vw, 1.75rem)) 0;
  padding: 0.55rem clamp(1rem, 3vw, 1.75rem) 0.7rem;
  border-top: 2px dashed var(--grafica);
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--grafica);
`;

/* ------------------------------ Picote entre as vias ------------------------------ */

// Hex das vias: o SVG do picote não enxerga variáveis CSS
const PAPER = { amarela: '#fce58a', papel: '#ffffff', rosa: '#f9cfda', azul: '#cfe0f5' };

const perforationTile = (color) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='18' height='12'><circle cx='9' cy='0' r='5.5' fill='${color}'/></svg>`
  )}")`;

// A borda de baixo da folha de cima fica picotada, como um talão destacado
const Seam = styled.div`
  height: 12px;
  background-color: ${({ $to }) => PAPER[$to]};
  background-image: ${({ $from }) => perforationTile(PAPER[$from])};
  background-repeat: repeat-x;
  background-position: top center;
`;

/* ------------------------------ Duas vias ------------------------------ */

const Section = styled.section`
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;
`;

const SectionHead = styled.div`
  margin-bottom: clamp(2rem, 4vw, 3rem);
`;

const ViasGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 880px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
`;

const Via = styled.article`
  background: ${({ $paper }) => `var(--${$paper})`};
  --texto-2: ${({ $paper }) => ($paper === 'rosa' ? '#6b2638' : '#22385e')};
  border-top: 6px solid var(--grafica);
  padding: clamp(1.25rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
`;

const ViaHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--grafica);
`;

const ViaTitle = styled.h3`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  line-height: 1.05;
`;

// Carimbo da via, como o da gráfica no canto do talão
const ViaStamp = styled.span`
  flex: none;
  padding: 0.2rem 0.55rem;
  border: 2px solid var(--grafica-escura);
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--grafica-escura);
  transform: rotate(-4deg);
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25rem;

  th {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--grafica);
    text-align: left;
    padding: 0 0 0.35rem;
    border-bottom: 1.5px solid var(--grafica);
  }

  td {
    padding: 0.8rem 0;
    border-bottom: 1.5px solid var(--pauta);
    vertical-align: top;
    line-height: 1.5;
    color: var(--nanquim);
  }

  td:first-child,
  th:first-child {
    width: 3rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  /* Texto vermelho pequeno sobre rosa/azul precisa da tinta escura para passar 4.5:1 */
  th,
  td:first-child {
    color: var(--grafica-escura);
  }
`;

const ViaNote = styled.p`
  font-family: var(--f-mao);
  font-weight: 700;
  font-size: 1.45rem;
  line-height: 1.2;
  color: var(--carbono);
  transform: rotate(-1deg);
  margin-bottom: 1.5rem;
`;

const ViaAction = styled.div`
  margin-top: auto;

  > * {
    width: 100%;
  }

  @media (min-width: 560px) {
    > * {
      width: auto;
    }
  }
`;

/* ------------------------------ Profissionais: via rosa ------------------------------ */

const Mesa = styled.section`
  background: var(--rosa);
  --texto-2: #6b2638;
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1040px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Cartao = styled(Link)`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
  gap: 0.9rem 1rem;
  min-height: 11rem;
  padding: 1.25rem;
  background: var(--papel);
  color: var(--nanquim);
  text-decoration: none;
  border-bottom: 5px solid var(--grafica);
  box-shadow: 0 16px 28px -18px rgba(107, 38, 56, 0.55), 0 1px 3px rgba(107, 38, 56, 0.18);
  transition: transform 200ms var(--ease-out);

  &:hover {
    transform: translateY(-3px) rotate(-0.4deg);
  }

  &:hover [data-ver] {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const Foto = styled.div`
  width: 64px;
  height: 64px;
  border: 2px solid var(--nanquim);
  background: var(--amarela);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: 1.9rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CartaoInfo = styled.div`
  min-width: 0;

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.45rem;
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  p {
    margin-top: 0.25rem;
    font-size: 0.95rem;
    color: #4a4550;
  }

  [data-cat] {
    color: var(--grafica);
    font-weight: 600;
  }
`;

const CartaoFoot = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1.5px solid var(--pauta);
  font-size: 0.95rem;

  [data-nota] {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: #4a4550;
  }

  [data-ver] {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--grafica);
    white-space: nowrap;
  }
`;

const BlankCard = styled.div`
  min-height: 11rem;
  /* Cartão em branco com pautas enquanto a API responde */
  background: repeating-linear-gradient(
    to bottom,
    #fbe3e9 0,
    #fbe3e9 2.2rem,
    #efb3c3 2.2rem,
    #efb3c3 calc(2.2rem + 1.5px)
  );
  border-bottom: 5px solid #efb3c3;
`;

const MesaNote = styled.p`
  margin-top: 1.75rem;
  color: var(--texto-2);
  max-width: 62ch;
  line-height: 1.55;

  a {
    color: var(--grafica-escura);
    font-weight: 600;
    text-underline-offset: 4px;
  }
`;

/* ------------------------------ O combinado ------------------------------ */

const CombinadoGrid = styled.div`
  display: grid;
  gap: 2rem;
  border: 2px solid var(--grafica);
  padding: clamp(1.25rem, 3vw, 2.25rem);

  @media (min-width: 880px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3rem;
  }
`;

const ListTitle = styled.h3`
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--grafica);
`;

const RuledList = styled.ul`
  list-style: none;

  li {
    display: flex;
    gap: 0.75rem;
    padding: 0.85rem 0;
    border-bottom: 1.5px solid var(--pauta);
    line-height: 1.5;
  }

  svg {
    flex: none;
    margin-top: 0.15rem;
    color: ${({ $mark }) => ($mark === 'carbono' ? 'var(--carbono)' : 'var(--grafica)')};
  }
`;

const Perguntas = styled.div`
  margin-top: clamp(2.5rem, 5vw, 3.5rem);
  max-width: 52rem;

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  details {
    border-bottom: 1.5px solid var(--pauta);
  }

  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    min-height: 56px;
    font-weight: 600;
    font-size: 1.08rem;

    &::-webkit-details-marker {
      display: none;
    }

    svg {
      flex: none;
      color: var(--grafica);
      transition: transform 200ms var(--ease-out);
    }

    &:hover {
      color: var(--grafica);
    }
  }

  details[open] summary svg {
    transform: rotate(45deg);
  }

  @media (prefers-reduced-motion: reduce) {
    summary svg {
      transition: none;
    }
  }

  details p {
    padding: 0 0 1.1rem;
    line-height: 1.6;
    color: var(--texto-2);
    max-width: 65ch;
  }
`;

/* ------------------------------ Tabela de preços: via azul ------------------------------ */

const Precos = styled.section`
  background: var(--azul);
  --texto-2: #22385e;
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;
`;

const PriceTable = styled.table`
  display: none;
  width: 100%;
  border-collapse: collapse;
  background: var(--papel);
  border: 2px solid var(--grafica);

  @media (min-width: 760px) {
    display: table;
  }

  th, td {
    padding: 0.9rem 1.1rem;
    border-bottom: 1.5px solid var(--pauta);
    text-align: left;
    vertical-align: middle;
  }

  thead th {
    border-bottom: 2px solid var(--grafica);
    vertical-align: bottom;
  }

  tbody th {
    font-weight: 500;
    color: var(--texto-2);
    width: 30%;
  }

  td + td, th + th, th + td {
    border-left: 1.5px solid var(--pauta);
  }

  tfoot td {
    border-bottom: none;
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }
`;

const PlanHead = styled.div`
  font-family: var(--f-impresso);
  line-height: 1;

  /* Nome do plano é o título da coluna; preço vem logo abaixo */
  span {
    display: block;
    font-weight: 800;
    font-size: 1.9rem;
    color: var(--nanquim);
    margin-bottom: 0.35rem;
  }

  strong {
    font-weight: 700;
    font-size: 1.45rem;
    color: var(--grafica);
    font-variant-numeric: tabular-nums;
  }

  small {
    display: block;
    margin-top: 0.3rem;
    font-family: var(--f-texto);
    font-size: 0.9rem;
    color: var(--texto-2);
  }
`;

const PlanStack = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: 760px) {
    display: none;
  }
`;

const PlanSheet = styled.div`
  background: var(--papel);
  border: 2px solid var(--grafica);
  padding: 1.25rem;

  dl {
    margin: 1rem 0 1.25rem;
  }

  dl > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 0;
    border-bottom: 1.5px solid var(--pauta);
  }

  dt {
    color: var(--texto-2);
  }

  dd {
    text-align: right;
    font-weight: 600;
  }

  a {
    width: 100%;
  }
`;

const PrecosNote = styled.p`
  margin-top: 1.5rem;
  font-family: var(--f-mao);
  font-weight: 700;
  font-size: 1.45rem;
  color: var(--carbono);
`;

/* ------------------------------ Rodapé ------------------------------ */

const Footer = styled.footer`
  background: var(--papel);
  color: var(--nanquim);
  padding: clamp(3rem, 6vw, 4.5rem) 0 2rem;

  p {
    color: var(--texto-2);
    line-height: 1.6;
    max-width: 68ch;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px dashed var(--grafica);

  @media (min-width: 860px) {
    grid-template-columns: 1.4fr 1fr;
  }

  strong {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--grafica);
    margin-bottom: 0.4rem;
  }
`;

const FooterLinks = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  margin-top: 1.5rem;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--nanquim);
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 0.03em;
    text-underline-offset: 5px;

    &:hover {
      color: var(--grafica);
    }
  }
`;

const Legal = styled.p`
  margin-top: 1.5rem;
  font-size: 0.9rem;
`;

/* ------------------------------ Componentes ------------------------------ */

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3 L21 21" />
      <path d="M21 3 L3 21" />
    </svg>
  );
}

function ProCard({ pro, cep }) {
  const hasReviews = pro.total_reviews > 0 && pro.average_rating;
  const target = pro.slug ? `/p/${pro.slug}` : `/book/${pro.id}`;

  return (
    <Cartao to={target} state={{ pro, clientCep: cep }}>
      <Foto aria-hidden="true">
        {pro.profile_picture ? (
          <img src={pro.profile_picture} alt="" loading="lazy" width="64" height="64" />
        ) : (
          pro.name.charAt(0).toUpperCase()
        )}
      </Foto>
      <CartaoInfo>
        <h3>{pro.name}</h3>
        {pro.category && <p data-cat>{pro.category}</p>}
        {pro.city && (
          <p>
            <MapPin size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
            {pro.city}{pro.state ? `, ${pro.state}` : ''}
          </p>
        )}
      </CartaoInfo>
      <CartaoFoot>
        {hasReviews ? (
          <span data-nota>
            <Star size={16} fill="var(--grafica)" color="var(--grafica)" aria-hidden="true" />
            <strong>{pro.average_rating.toFixed(1).replace('.', ',')}</strong>
            · {pro.total_reviews} {pro.total_reviews === 1 ? 'avaliação' : 'avaliações'}
          </span>
        ) : (
          <span data-nota>Ainda sem avaliações</span>
        )}
        <span data-ver>
          Ver agenda <ArrowRight size={16} aria-hidden="true" />
        </span>
      </CartaoFoot>
    </Cartao>
  );
}

function PlanValue({ value }) {
  if (value === true) return <><Check size={18} color="var(--carbono)" aria-hidden="true" /><SrOnly>Incluso</SrOnly></>;
  if (value === false) return <><Minus size={18} color="var(--texto-2)" aria-hidden="true" /><SrOnly>Não incluso</SrOnly></>;
  return value;
}

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

/* ------------------------------ Página ------------------------------ */

export default function Home() {
  const navigate = useNavigate();
  const serviceInputRef = useRef(null);
  const menuToggleRef = useRef(null);
  const formId = useId();

  const [userInfo, setUserInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // CEP salvo em visitas anteriores
  const [savedLocation] = useState(() => {
    const savedCep = localStorage.getItem('userCep');
    const savedCity = localStorage.getItem('userCity');
    return savedCep && savedCity ? { cep: savedCep, city: savedCity } : null;
  });

  const [service, setService] = useState('');
  const [cepDigits, setCepDigits] = useState(savedLocation?.cep ?? '');
  const [city, setCity] = useState(savedLocation?.city ?? '');
  const [cepState, setCepState] = useState(savedLocation ? 'ok' : 'idle'); // idle | loading | ok | notfound | offline
  const [formError, setFormError] = useState('');

  const [categories, setCategories] = useState([]);
  const [nextOrder, setNextOrder] = useState(null);

  const [pros, setPros] = useState({ status: 'loading', items: [], fromCity: null });

  // Usuário logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setUserInfo)
      .catch(() => {
        localStorage.removeItem('token');
        setUserInfo(null);
      });
  }, []);

  // Categorias para o checklist e autocomplete (sem categorias, o campo livre continua funcionando)
  useEffect(() => {
    fetch(`${API_URL}/categories/groups`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const names = Object.values(data).flat().map((c) => c.name);
        setCategories([...new Set(names)]);
      })
      .catch(() => {});
  }, []);

  // Numeração do talão: só aparece com o número real de agendamentos
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/users/stats/public`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Number.isFinite(data.appointments_count)) setNextOrder(data.appointments_count + 1);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Profissionais reais: primeiro da cidade do visitante, senão de qualquer lugar
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const fetchPros = async (cityName) => {
        const params = new URLSearchParams({ limit: '6' });
        if (cityName) params.append('city', cityName);
        const res = await fetch(`${API_URL}/users/search?${params}`);
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      };
      try {
        let items = city ? await fetchPros(city) : [];
        let fromCity = city || null;
        if (!items.length) {
          items = await fetchPros(null);
          fromCity = null;
        }
        if (!cancelled) setPros({ status: 'ok', items, fromCity });
      } catch {
        if (!cancelled) setPros({ status: 'error', items: [], fromCity: null });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [city]);

  // Esc fecha o menu mobile
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleCepChange = async (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    setCepDigits(digits);
    setFormError('');

    if (digits.length < 8) {
      setCity('');
      setCepState('idle');
      return;
    }

    setCepState('loading');
    try {
      const res = await fetch(`/api/cep/${digits}`);
      if (res.ok) {
        const data = await res.json();
        if (data.city) {
          setCity(data.city);
          setCepState('ok');
          localStorage.setItem('userCep', digits);
          localStorage.setItem('userCity', data.city);
          return;
        }
      }
      setCity('');
      setCepState(res.status >= 500 ? 'offline' : 'notfound');
    } catch {
      setCity('');
      setCepState('offline');
    }
  };

  const pickCategory = (name) => {
    setService((current) => (current === name ? '' : name));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!service.trim() && !city) {
      setFormError('Escreva o serviço ou um CEP válido para começar.');
      serviceInputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams();
    if (service.trim()) params.append('service', service.trim());
    if (city) params.append('city', city);
    if (cepState === 'ok' && cepDigits.length === 8) params.append('cep', cepDigits);
    navigate(`/search?${params}`);
  };

  const focusTalao = () => {
    document.getElementById(formId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    serviceInputRef.current?.focus({ preventScroll: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const closeMenu = () => setMenuOpen(false);

  const accountLinks = (onClick) =>
    userInfo ? (
      <>
        {!userInfo.is_professional && !userInfo.is_admin && (
          <TopLink to="/my-appointments" onClick={onClick}>Meus agendamentos</TopLink>
        )}
        {userInfo.is_professional && <TopLink to="/dashboard" onClick={onClick}>Meu painel</TopLink>}
        {userInfo.is_admin && <TopLink to="/admin" onClick={onClick}>Admin</TopLink>}
        <TopButton type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" /> Sair
        </TopButton>
      </>
    ) : (
      <>
        <TopLink to="/login" onClick={onClick}>Entrar</TopLink>
        <TopLink to="/register-client" onClick={onClick}>Criar conta</TopLink>
        <TopStamp to="/register-pro" onClick={onClick}>Sou profissional</TopStamp>
      </>
    );

  const cepStatus = {
    idle: cepDigits.length > 0 ? { text: `Faltam ${8 - cepDigits.length} números.` } : { text: 'Com o CEP, mostramos quem atende perto de você.' },
    loading: { text: 'Consultando o CEP…' },
    notfound: { text: 'CEP não encontrado. Confira os números.', tone: 'erro' },
    offline: { text: 'Não deu para consultar o CEP agora. Você pode buscar só pelo serviço.', tone: 'erro' },
  }[cepState];

  const checklist = categories.slice(0, 8);

  return (
    <Page>
      <SEOHead {...SEO_CONFIGS.home} url="https://contratapro.com.br" />
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="service" />

      <Topbar>
        <TopbarInner>
          <Logo to="/" aria-label="ContrataPro, página inicial">
            <img src={logoImage} alt="ContrataPro" width="120" height="34" />
          </Logo>

          <TopNav aria-label="Conta">{accountLinks()}</TopNav>

          <MobileActions>
            {!userInfo && <TopStamp to="/register-pro">Sou profissional</TopStamp>}
            <MenuToggle
              ref={menuToggleRef}
              type="button"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            </MenuToggle>
          </MobileActions>
        </TopbarInner>

        {menuOpen && (
          <MobilePanel id="menu-mobile" aria-label="Menu">
            {accountLinks(closeMenu)}
          </MobilePanel>
        )}
      </Topbar>

      <main>
        <Hero aria-labelledby="titulo-home">
          <HeroGrid>
            <div>
              <HeroTitle id="titulo-home" data-display>
                Profissionais da sua região, com agenda aberta pra você.
              </HeroTitle>
              <Lead>
                Escreva o serviço e o seu CEP. Você vê quem atende no seu bairro, confere o perfil e marca
                o horário direto na agenda da pessoa. Para quem contrata, é grátis.
              </Lead>
            </div>

            <HeroFoot>
              É profissional autônomo?
              <Link to="/register-pro">
                Cadastre-se grátis, sem cartão <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </HeroFoot>

            <Talao id={formId} onSubmit={handleSubmit} noValidate aria-label="Pedido de serviço">
              <Canhoto aria-hidden="true">Canhoto · ContrataPro</Canhoto>
              <TalaoBody>
                <TalaoHead>
                  <TalaoBrand>
                    <strong>CONTRATAPRO</strong>
                    <span>Pedido de serviço</span>
                  </TalaoBrand>
                  <Numeradora aria-hidden={nextOrder ? undefined : 'true'}>
                    {nextOrder ? (
                      <>
                        Nº {String(nextOrder).padStart(6, '0')}
                        <small>o próximo agendamento pode ser o seu</small>
                      </>
                    ) : (
                      'Nº ______'
                    )}
                  </Numeradora>
                </TalaoHead>

                <Field>
                  <span>Serviço:</span>
                  <input
                    ref={serviceInputRef}
                    type="text"
                    name="service"
                    list={categories.length ? `${formId}-servicos` : undefined}
                    placeholder="eletricista, diarista…"
                    autoComplete="off"
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      setFormError('');
                    }}
                  />
                </Field>
                {categories.length > 0 && (
                  <datalist id={`${formId}-servicos`}>
                    {categories.map((name) => <option key={name} value={name} />)}
                  </datalist>
                )}

                <Field>
                  <span>CEP:</span>
                  <input
                    type="text"
                    name="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    maxLength={9}
                    value={formatCep(cepDigits)}
                    onChange={(e) => handleCepChange(e.target.value)}
                    aria-describedby={`${formId}-cep`}
                    aria-invalid={cepState === 'notfound' || undefined}
                  />
                </Field>
                <CepStatus id={`${formId}-cep`} aria-live="polite" $tone={cepStatus?.tone}>
                  {cepState === 'ok' ? (
                    <CityWrite key={city}>
                      <Check size={20} aria-hidden="true" /> {city}
                    </CityWrite>
                  ) : (
                    cepStatus?.text
                  )}
                </CepStatus>

                {formError && <FormError role="alert">{formError}</FormError>}

                <SubmitRow>
                  <PrimaryButton type="submit">
                    Buscar profissionais <ArrowRight size={20} aria-hidden="true" />
                  </PrimaryButton>
                </SubmitRow>

                {checklist.length > 0 && (
                  <Checklist>
                    <legend>Ou marque um dos mais pedidos:</legend>
                    <ChecklistGrid>
                      {checklist.map((name) => {
                        const checked = service === name;
                        return (
                          <CheckItem key={name} type="button" aria-pressed={checked} onClick={() => pickCategory(name)}>
                            <Box>{checked && <CheckMark />}</Box>
                            <span>{name}</span>
                          </CheckItem>
                        );
                      })}
                    </ChecklistGrid>
                  </Checklist>
                )}

                <Perforation aria-hidden="true">
                  <Scissors size={14} /> Destaque aqui
                </Perforation>
              </TalaoBody>
            </Talao>
          </HeroGrid>
        </Hero>
        <Seam $from="amarela" $to="papel" aria-hidden="true" />

        <Section aria-labelledby="titulo-vias">
          <Wrap>
            <SectionHead>
              <Display id="titulo-vias" data-display>Uma via para cada lado do serviço</Display>
              <Lead>Quem precisa de um serviço e quem oferece usam o mesmo talão. Cada um fica com a sua via.</Lead>
            </SectionHead>

            <ViasGrid>
              <Via $paper="rosa" aria-labelledby="via-cliente">
                <ViaHead>
                  <ViaTitle id="via-cliente" data-display>Preciso de um serviço</ViaTitle>
                  <ViaStamp aria-hidden="true">1ª via</ViaStamp>
                </ViaHead>
                <ItemsTable>
                  <thead>
                    <tr><th scope="col">Item</th><th scope="col">Descrição</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>01</td><td>Escreva o serviço e o seu CEP.</td></tr>
                    <tr><td>02</td><td>Veja o perfil, os serviços, os preços e as avaliações de quem já agendou.</td></tr>
                    <tr><td>03</td><td>Escolha um horário livre na agenda do profissional. Pronto, está marcado.</td></tr>
                  </tbody>
                </ItemsTable>
                <ViaNote>Pagamento? Você combina direto com o profissional: Pix, dinheiro, como preferirem.</ViaNote>
                <ViaAction>
                  <PrimaryButton type="button" onClick={focusTalao}>
                    Preencher o pedido <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryButton>
                </ViaAction>
              </Via>

              <Via $paper="azul" aria-labelledby="via-profissional">
                <ViaHead>
                  <ViaTitle id="via-profissional" data-display>Ofereço serviços</ViaTitle>
                  <ViaStamp aria-hidden="true">2ª via</ViaStamp>
                </ViaHead>
                <ItemsTable>
                  <thead>
                    <tr><th scope="col">Item</th><th scope="col">Descrição</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>01</td><td>Crie seu perfil de graça, em minutos, sem cartão de crédito.</td></tr>
                    <tr><td>02</td><td>Cadastre seus serviços e preços e marque os horários em que você atende.</td></tr>
                    <tr><td>03</td><td>Clientes da sua região encontram você e agendam direto na sua agenda.</td></tr>
                  </tbody>
                </ItemsTable>
                <ViaNote>Sem intermediário: o cliente fala e paga direto com você.</ViaNote>
                <ViaAction>
                  <PrimaryLink to="/register-pro">
                    Quero oferecer serviços <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryLink>
                </ViaAction>
              </Via>
            </ViasGrid>
          </Wrap>
        </Section>

        {pros.status !== 'error' && (pros.status === 'loading' || pros.items.length > 0) && (
          <>
          <Seam $from="papel" $to="rosa" aria-hidden="true" />
          <Mesa aria-labelledby="titulo-pros" aria-busy={pros.status === 'loading'}>
            <Wrap>
              <SectionHead>
                <Display id="titulo-pros" data-display>
                  {pros.fromCity ? `Quem atende em ${pros.fromCity}` : 'Gente que já está no ContrataPro'}
                </Display>
                <Lead>
                  Perfis de verdade, com agenda online. As avaliações só vêm de clientes que agendaram pelo ContrataPro.
                </Lead>
              </SectionHead>

              <CardsGrid>
                {pros.status === 'loading'
                  ? [0, 1, 2].map((i) => <BlankCard key={i} aria-hidden="true" />)
                  : pros.items.map((pro) => <ProCard key={pro.id} pro={pro} cep={cepDigits} />)}
              </CardsGrid>

              {pros.status === 'ok' && city && !pros.fromCity && (
                <MesaNote>
                  Ainda não temos profissionais cadastrados em {city}; estes são de outras cidades. Conhece alguém bom
                  de serviço aí? <Link to="/register-pro">Mostre o ContrataPro para essa pessoa</Link>.
                </MesaNote>
              )}
            </Wrap>
          </Mesa>
          <Seam $from="rosa" $to="papel" aria-hidden="true" />
          </>
        )}

        <Section aria-labelledby="titulo-combinado">
          <Wrap>
            <SectionHead>
              <Display id="titulo-combinado" data-display>O combinado, preto no branco</Display>
              <Lead>Antes de chamar alguém na sua casa, é bom saber exatamente o que o ContrataPro faz e o que fica entre você e o profissional.</Lead>
            </SectionHead>

            <CombinadoGrid>
              <div>
                <ListTitle>O que o ContrataPro faz</ListTitle>
                <RuledList $mark="carbono">
                  <li><Check size={20} aria-hidden="true" />Mostra o perfil, os serviços e os preços que o profissional cadastrou.</li>
                  <li><Check size={20} aria-hidden="true" />Deixa você marcar horário direto na agenda dele.</li>
                  <li><Check size={20} aria-hidden="true" />Avisa por e-mail quando o agendamento é feito ou muda.</li>
                  <li><Check size={20} aria-hidden="true" />Só libera avaliação para quem agendou de verdade.</li>
                </RuledList>
              </div>
              <div>
                <ListTitle>O que fica entre você e o profissional</ListTitle>
                <RuledList $mark="grafica">
                  <li><ArrowRight size={20} aria-hidden="true" />O pagamento: Pix, dinheiro ou o que vocês combinarem. O ContrataPro não cobra nada de quem contrata.</li>
                  <li><ArrowRight size={20} aria-hidden="true" />O orçamento final e a execução do serviço.</li>
                  <li><ArrowRight size={20} aria-hidden="true" />A conversa antes: o ContrataPro não checa antecedentes, então confira o perfil e as avaliações e tire suas dúvidas com a pessoa.</li>
                </RuledList>
              </div>
            </CombinadoGrid>

            <Perguntas>
              <h3>Perguntas que todo mundo faz</h3>
              <details>
                <summary>Quanto custa para contratar? <Plus size={22} aria-hidden="true" /></summary>
                <p>Nada. Buscar, ver perfis e agendar é grátis para o cliente. O valor do serviço você combina com o profissional.</p>
              </details>
              <details>
                <summary>O ContrataPro verifica os profissionais? <Plus size={22} aria-hidden="true" /></summary>
                <p>Não. Mostramos o perfil que o profissional preencheu e as avaliações de clientes que agendaram pela plataforma. Leia as avaliações e converse com a pessoa antes de fechar.</p>
              </details>
              <details>
                <summary>Como eu pago o profissional? <Plus size={22} aria-hidden="true" /></summary>
                <p>Direto com ele, do jeito que vocês combinarem. O ContrataPro não intermedia pagamentos entre cliente e profissional.</p>
              </details>
              <details>
                <summary>Quem pode deixar avaliação? <Plus size={22} aria-hidden="true" /></summary>
                <p>Só quem agendou pelo ContrataPro. Depois que o serviço é concluído, o cliente recebe um link por e-mail para avaliar.</p>
              </details>
              <details>
                <summary>Por que a busca é por região? <Plus size={22} aria-hidden="true" /></summary>
                <p>Porque quem mora perto chega mais rápido, gasta menos com deslocamento e fica mais fácil de encontrar de novo.</p>
              </details>
            </Perguntas>
          </Wrap>
        </Section>

        <Seam $from="papel" $to="azul" aria-hidden="true" />
        <Precos aria-labelledby="titulo-precos">
          <Wrap>
            <SectionHead>
              <Display id="titulo-precos" data-display>Tabela de preços para profissionais</Display>
              <Lead>Todo profissional começa no Free, sem cartão. Os planos pagos são para quem quer aparecer mais na busca e atender sem limite.</Lead>
            </SectionHead>

            <PriceTable>
              <caption><SrOnly>Comparação dos planos Free, Pro e Premium</SrOnly></caption>
              <thead>
                <tr>
                  <td />
                  {PLANS.map((plan) => (
                    <th key={plan.id} scope="col">
                      <PlanHead>
                        <span>{plan.name}</span>
                        <strong>{plan.price}</strong>
                        <small>{plan.period}</small>
                      </PlanHead>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, i) => (
                      <td key={PLANS[i].id}><PlanValue value={value} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {PLANS.map((plan) => (
                    <td key={plan.id}>
                      {plan.primary ? (
                        <PrimaryLink to="/register-pro">{plan.cta}</PrimaryLink>
                      ) : (
                        <StampLink to="/register-pro">{plan.cta}</StampLink>
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </PriceTable>

            <PlanStack>
              {PLANS.map((plan, i) => (
                <PlanSheet key={plan.id}>
                  <PlanHead>
                    <span>{plan.name}</span>
                    <strong>{plan.price}</strong>
                    <small>{plan.period}</small>
                  </PlanHead>
                  <dl>
                    {PLAN_ROWS.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd><PlanValue value={row.values[i]} /></dd>
                      </div>
                    ))}
                  </dl>
                  {plan.primary ? (
                    <PrimaryLink to="/register-pro">{plan.cta}</PrimaryLink>
                  ) : (
                    <StampLink to="/register-pro">{plan.cta}</StampLink>
                  )}
                </PlanSheet>
              ))}
            </PlanStack>

            <PrecosNote>Planos pagos pelo Mercado Pago. Dá para cancelar pelo seu painel.</PrecosNote>
          </Wrap>
        </Precos>
        <Seam $from="azul" $to="papel" aria-hidden="true" />
      </main>

      <Footer>
        <Wrap>
          <FooterGrid>
            <div>
              <strong>ContrataPro</strong>
              <p>Encontre quem resolve, perto de casa, e marque o horário direto na agenda da pessoa.</p>
            </div>
            <div>
              <h3>Sobre a plataforma</h3>
              <p>
                O ContrataPro conecta clientes e profissionais autônomos. A contratação, o pagamento e a execução
                do serviço são combinados diretamente entre o cliente e o profissional.
              </p>
            </div>
          </FooterGrid>
          <FooterLinks aria-label="Rodapé">
            <Link to="/login">Entrar</Link>
            <Link to="/register-client">Criar conta</Link>
            <Link to="/register-pro">Sou profissional</Link>
          </FooterLinks>
          <Legal>© {new Date().getFullYear()} ContrataPro. Todos os direitos reservados.</Legal>
        </Wrap>
      </Footer>
    </Page>
  );
}
