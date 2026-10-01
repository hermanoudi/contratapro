import styled from 'styled-components';

/* Peças do painel do profissional no registro contido: tinta e letra do talão,
   sem vias coloridas nem letra à mão (exceto o que o cliente "preencheu"). */

export const PageHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1.5rem;

  h1 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(1.9rem, 3.5vw, 2.5rem);
    line-height: 1.05;
    letter-spacing: -0.01em;
  }

  p {
    margin-top: 0.35rem;
    color: var(--texto-2-papel);
    line-height: 1.5;
  }
`;

// Folha do painel: papel com a régua de gráfica no alto
export const Panel = styled.section`
  background: var(--papel);
  border: 1.5px solid var(--regua);
  border-top: 2px solid var(--grafica);
  padding: clamp(1rem, 2.5vw, 1.5rem);

  & + & {
    margin-top: 1.5rem;
  }

  > h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
`;

// Aviso de estado (assinatura, agenda vazia, erro) dentro do conteúdo, nunca por cima da barra
export const Notice = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1.5rem;
  background: var(--papel-2);
  border: 1.5px solid ${({ $tone }) => ($tone === 'alerta' ? 'var(--alerta)' : $tone === 'erro' ? 'var(--grafica)' : 'var(--regua)')};

  > p {
    flex: 1 1 18rem;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    line-height: 1.5;
    color: var(--nanquim);
  }

  > p svg {
    flex: none;
    margin-top: 0.15rem;
    color: ${({ $tone }) => ($tone === 'alerta' ? 'var(--alerta)' : 'var(--grafica)')};
  }

  a {
    color: var(--grafica);
    font-weight: 600;
    text-underline-offset: 3px;
  }
`;

// Botão de ícone com área de toque de 44px; o rótulo vai no aria-label
export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 44px;
  height: 44px;
  background: var(--papel);
  border: 1.5px solid var(--controle);
  border-radius: 2px;
  color: ${({ $tone }) => ($tone === 'erro' ? 'var(--erro)' : 'var(--nanquim)')};
  cursor: pointer;
  transition: border-color 160ms var(--ease-out), color 160ms var(--ease-out);

  &:hover:not(:disabled) {
    border-color: var(--grafica);
    color: var(--grafica);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Rótulo impresso de grupo (formulários do painel)
export const Fieldset = styled.fieldset`
  border: none;

  legend {
    margin-bottom: 0.4rem;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica-escura);
  }
`;

export const Choices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;

  label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    cursor: pointer;
    font-size: 1.02rem;
  }

  input {
    width: 1.15rem;
    height: 1.15rem;
    accent-color: var(--grafica);
  }
`;
