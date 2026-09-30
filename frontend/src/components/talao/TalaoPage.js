import styled, { css } from 'styled-components';

/* Superfície do talão: fonte, tinta, seleção e foco. Envolve a página inteira. */
export const TalaoPage = styled.div`
  font-family: var(--f-texto);
  font-size: 1rem;
  color: var(--nanquim);
  background: var(--papel);
  min-height: 100vh;

  ::selection {
    background: var(--amarela);
    color: var(--nanquim);
  }

  a, button, input, select, textarea, summary {
    &:focus-visible {
      outline: 2px solid var(--carbono);
      outline-offset: 3px;
    }
  }
`;

export const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
`;

// Via de papel: fundo chapado e texto secundário tingido da mesma cor
export const paperSurface = (paper) => css`
  background: var(--${paper});
  --texto-2: var(--texto-2-${paper});
`;
