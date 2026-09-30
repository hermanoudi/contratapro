import { createGlobalStyle } from 'styled-components';

/* ------------------------------------------------------------------
   Mundo visual "Talão de Orçamento": vias de papel chapadas, impressão
   em uma cor (vermelho de gráfica) e preenchimento à mão em azul-carbono.
   Fonte única dos tokens (espelhada em DESIGN.md): o CSS em :root e os
   SVGs gerados em JS leem deste mesmo objeto.
   ------------------------------------------------------------------ */

// Hex das vias: o SVG do picote não enxerga variáveis CSS
export const PAPER = {
  papel: '#ffffff',
  amarela: '#fce58a',
  rosa: '#f9cfda',
  azul: '#cfe0f5',
};

// Texto secundário tingido de cada via: cinza sobre papel colorido não passa 4.5:1
export const PAPER_TEXT_2 = {
  papel: '#4a4550',
  amarela: '#5b4a12',
  rosa: '#6b2638',
  azul: '#22385e',
};

export const INK = {
  grafica: '#c4201a',
  'grafica-escura': '#9e1712',
  pauta: 'rgba(196, 32, 26, 0.55)',
  carbono: '#2e3a9e',
  nanquim: '#17171b',
};

// Registro contido (páginas de uso): superfície neutra e régua neutra, sem vias coloridas
export const SURFACE = {
  'papel-2': '#f6f4ef',
  regua: 'rgba(23, 23, 27, 0.14)',
};

// Status em tinta escura o bastante para texto (4.5:1 no papel); erro separado da ação pelo tom
export const STATUS = {
  sucesso: '#1d6b3a',
  alerta: '#8a5300',
  erro: '#9e1712',
};

export const FONTS = {
  'f-impresso': "'Barlow Condensed', 'Arial Narrow', sans-serif",
  'f-texto': "'Barlow', system-ui, sans-serif",
  'f-mao': "'Caveat', 'Segoe Print', cursive",
};

const vars = (map, suffix = '') =>
  Object.entries(map)
    .map(([name, value]) => `--${name}${suffix}: ${value};`)
    .join('\n');

// Só declara variáveis: nenhuma página muda de cara até usar TalaoPage
export const TalaoTokens = createGlobalStyle`
  :root {
    ${vars(PAPER)}
    ${Object.entries(PAPER_TEXT_2).map(([paper, value]) => `--texto-2-${paper}: ${value};`).join('\n')}
    --texto-2: var(--texto-2-papel);
    ${vars(INK)}
    ${vars(SURFACE)}
    ${vars(STATUS)}
    ${vars(FONTS)}
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  }
`;
