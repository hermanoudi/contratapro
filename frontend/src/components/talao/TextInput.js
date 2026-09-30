import styled from 'styled-components';

/* Campo do registro contido (páginas de uso): caixa reta, rótulo impresso em tinta
   de gráfica, sem letra à mão. O foco repete o do talão: lavado de azul e régua carbono.
   Uso: <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <InputBox><Mail /><TextInput id="email" $icon /></InputBox> */

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--grafica-escura);
`;

export const InputBox = styled.div`
  position: relative;

  > svg {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--texto-2-papel);
    pointer-events: none;
    transition: color 160ms var(--ease-out);
  }

  &:focus-within > svg {
    color: var(--carbono);
  }
`;

export const TextInput = styled.input`
  width: 100%;
  min-height: 52px;
  padding: 0 1rem 0 ${({ $icon }) => ($icon ? '2.9rem' : '1rem')};
  background: var(--papel);
  border: 1.5px solid var(--controle);
  border-radius: 2px;
  font-family: var(--f-texto);
  font-size: 1.05rem;
  color: var(--nanquim);
  transition: border-color 160ms var(--ease-out), box-shadow 160ms var(--ease-out), background-color 160ms var(--ease-out);

  &::placeholder {
    color: var(--texto-2-papel);
    opacity: 1;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: var(--carbono);
    background: rgba(207, 224, 245, 0.35);
    box-shadow: inset 0 -2.5px 0 var(--carbono);
  }

  &[aria-invalid='true'] {
    border-color: var(--grafica);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Linha abaixo do campo ou do formulário: ajuda em texto-2, erro em tinta de gráfica
export const FieldNote = styled.p`
  margin-top: 0.4rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: ${({ $tone }) => ($tone === 'erro' ? 'var(--grafica)' : 'var(--texto-2-papel)')};
  font-weight: ${({ $tone }) => ($tone === 'erro' ? 600 : 400)};
`;
