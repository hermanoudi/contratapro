import styled from 'styled-components';

// data-display livra o título do encolhimento forçado do index.css no mobile
export const Display = styled.h2.attrs({ 'data-display': '' })`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2rem, 4.2vw, 3.25rem);
  line-height: 1;
  letter-spacing: -0.01em;
  text-wrap: balance;
  margin-bottom: 1rem;
`;

export const Lead = styled.p`
  font-size: clamp(1.05rem, 1.4vw, 1.2rem);
  line-height: 1.55;
  color: var(--texto-2);
  max-width: 60ch;
`;

// Letra à mão em azul-carbono: só para o que foi "preenchido", nunca para o impresso
export const Hand = styled.span`
  font-family: var(--f-mao);
  font-weight: 700;
  color: var(--carbono);
`;
