import styled from 'styled-components';
import { Panel } from './parts';

/* Peças das listas filtradas do registro contido (Histórico, Notificações):
   painel de filtros, atalhos, contagem e estado vazio. */

export const FilterPanel = styled(Panel).attrs({ as: 'form' })`
  margin-bottom: 1.75rem;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* Data nativa: menos recuo para caber dd/mm/aaaa na coluna estreita */
  input[type='date'] {
    padding: 0 0.6rem;
  }

  @media (max-width: 480px) {
    > :nth-child(-n + 2) {
      grid-column: 1 / -1;
    }
  }
`;

export const Shortcuts = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;

  > span {
    margin-right: 0.25rem;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica-escura);
  }
`;

export const Chip = styled.button`
  min-height: 40px;
  padding: 0 0.85rem;
  background: ${({ 'aria-pressed': on }) => (on ? 'var(--grafica)' : 'var(--papel)')};
  border: 1.5px solid ${({ 'aria-pressed': on }) => (on ? 'var(--grafica)' : 'var(--regua)')};
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.02rem;
  color: ${({ 'aria-pressed': on }) => (on ? 'var(--papel)' : 'var(--nanquim)')};
  cursor: pointer;

  &:hover {
    border-color: var(--grafica);
  }
`;

export const FilterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;

  @media (max-width: 480px) {
    > * {
      flex: 1 1 8rem;
    }
  }
`;

export const ResultCount = styled.p`
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--grafica);
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.35rem;

  span {
    font-family: var(--f-texto);
    font-weight: 400;
    font-size: 0.98rem;
    color: var(--texto-2-papel);
  }
`;

export const EmptyList = styled.div`
  padding: 1.5rem 0;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.4rem;
  }

  p {
    margin-top: 0.4rem;
    color: var(--texto-2-papel);
    line-height: 1.55;
  }
`;

export const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;
