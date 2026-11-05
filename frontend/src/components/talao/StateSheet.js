import styled from 'styled-components';
import { paperSurface } from './TalaoPage';

/* Folha de estado de página inteira: o que aparece no lugar da página quando ela
   não existe, não carregou ou quebrou. Uma folha solta sobre a via amarela,
   o fato no título, a saída logo abaixo. */

export const StateSection = styled.section`
  ${paperSurface('amarela')}
  padding: clamp(1.25rem, 4vw, 2.5rem) 0 clamp(2.5rem, 6vw, 4rem);
  min-height: 60vh;
`;

export const StateSheet = styled.div`
  max-width: 40rem;
  padding: 1.5rem clamp(1.25rem, 3vw, 1.75rem);
  background: var(--papel);
  border-bottom: 5px solid var(--grafica);
  box-shadow: 0 16px 28px -18px rgba(91, 74, 18, 0.55), 0 1px 3px rgba(91, 74, 18, 0.18);

  h1 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(1.9rem, 4vw, 2.4rem);
    line-height: 1.05;
    text-wrap: balance;
  }

  p {
    margin-top: 0.6rem;
    line-height: 1.55;
    color: var(--texto-2-papel);
  }
`;

export const StateActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;
