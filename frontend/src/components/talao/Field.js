import styled from 'styled-components';

/* Campo de talão: rótulo impresso em vermelho, valor escrito à mão em azul-carbono.
   Uso: <Field><span>CEP:</span><input … /></Field> */
export const Field = styled.label`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.9rem 0.5rem 0.2rem;
  margin: 0 -0.5rem;
  /* Única borda do campo em repouso: tinta cheia para passar 3:1 */
  border-bottom: 1.5px solid var(--grafica);
  /* Sombra interna no lugar de engrossar a borda: o foco não desloca o layout */
  transition: background-color 160ms var(--ease-out), box-shadow 160ms var(--ease-out);
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

    /* Exemplo impresso, não escrito à mão: campo vazio não pode parecer preenchido */
    &::placeholder {
      font-family: var(--f-texto);
      font-weight: 400;
      font-size: 1.05rem;
      color: var(--texto-2);
      opacity: 1;
    }

    &:focus {
      outline: none;
    }

    &::-webkit-calendar-picker-indicator {
      display: none !important;
    }
  }

  &:focus-within {
    border-bottom-color: var(--carbono);
    background: rgba(207, 224, 245, 0.55);
    box-shadow: inset 0 -2.5px 0 var(--carbono);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const FormError = styled.p`
  margin-top: 0.75rem;
  font-weight: 600;
  color: var(--grafica);
`;
