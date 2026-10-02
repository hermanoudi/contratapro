import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:active {
      transform: none;
    }
  }
`;

// Tinta cheia de gráfica: a ação principal da tela
const primary = css`
  ${buttonBase}
  background: var(--grafica);
  color: var(--papel);
  border: 2px solid var(--grafica);

  &:hover:not(:disabled) {
    background: var(--grafica-escura);
    border-color: var(--grafica-escura);
  }
`;

// Carimbo vazado: ação secundária
const stamp = css`
  ${buttonBase}
  background: transparent;
  color: var(--grafica);
  border: 2px solid var(--grafica);

  &:hover:not(:disabled) {
    background: var(--grafica);
    color: var(--papel);
  }
`;

export const PrimaryButton = styled.button`${primary}`;
export const PrimaryLink = styled(Link)`${primary}`;
export const StampButton = styled.button`${stamp}`;
export const StampLink = styled(Link)`${stamp}`;
