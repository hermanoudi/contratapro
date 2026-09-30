import styled from 'styled-components';
import { cardSheet } from './ProCard';

/* Folha de aviso no lugar dos cartões (erro, ninguém encontrado): a seção nunca some.
   Fica dentro de CardsGrid, ocupando a linha inteira. Só o título e o parágrafo
   vão dentro de role="status"; as ações ficam em NoticeActions, fora dele. */
export const NoticeSheet = styled.div`
  grid-column: 1 / -1;
  padding: 1.5rem clamp(1.25rem, 3vw, 1.75rem) 1.5rem;
  ${cardSheet}

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1.05;
    color: var(--nanquim);
  }

  p {
    margin-top: 0.6rem;
    max-width: 60ch;
    line-height: 1.55;
    color: var(--texto-2);
  }

  @media (min-width: 1040px) {
    grid-column: span 2;
  }
`;

export const NoticeActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;
