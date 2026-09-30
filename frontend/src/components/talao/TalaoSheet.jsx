import styled, { keyframes } from 'styled-components';

/* O talão: folha branca com canhoto perfurado, cabeçalho da gráfica e linha de destaque.
   Uso: <TalaoSheet as="form" $tilt><Canhoto aria-hidden="true" /><TalaoBody>…</TalaoBody></TalaoSheet>
   $tilt inclina a folha no desktop (só na Home: formulário com calendário não se inclina). */

export const TalaoSheet = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  background: var(--papel);
  border: 2px solid var(--grafica);
  box-shadow: 0 22px 36px -18px rgba(23, 23, 27, 0.45), 0 2px 4px rgba(23, 23, 27, 0.12);

  @media (min-width: 560px) {
    grid-template-columns: 2.75rem 1fr;
  }

  @media (min-width: 960px) {
    transform: ${({ $tilt }) => ($tilt ? 'rotate(-1.2deg)' : 'none')};
  }
`;

// Canhoto em branco, marcado só pela borda picotada: palavra impressa nele vira coisa para preencher
export const Canhoto = styled.div`
  display: none;
  border-right: 2px dashed var(--grafica);

  @media (min-width: 560px) {
    display: block;
  }
`;

export const TalaoBody = styled.div`
  padding: 1.25rem clamp(1rem, 3vw, 1.75rem) 0;
  min-width: 0;

  @media (max-width: 559px) {
    padding-top: 0.9rem;
  }
`;

export const TalaoHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.35rem 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--grafica);
  color: var(--grafica);
`;

export const TalaoBrand = styled.div`
  font-family: var(--f-impresso);
  line-height: 1;

  strong {
    display: block;
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: 0.02em;
  }

  span {
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

export const SubmitRow = styled.div`
  margin: 0.5rem 0 0;

  button {
    width: 100%;
    min-height: 54px;
    font-size: 1.2rem;
  }
`;

// Linha picotada no pé do talão: o que tranquiliza na hora de enviar
export const Perforation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.25rem calc(-1 * clamp(1rem, 3vw, 1.75rem)) 0;
  padding: 0.55rem clamp(1rem, 3vw, 1.75rem) 0.7rem;
  border-top: 2px dashed var(--grafica);
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.03em;
  line-height: 1.3;
  color: var(--grafica-escura);
`;

/* ------------------------------ Escolha impressa ------------------------------ */

const drawStroke = keyframes`
  to { stroke-dashoffset: 0; }
`;

// Bolinha impressa: escolha única, como o "( )" de um formulário de papel
export const PrintedCircle = styled.span`
  flex: none;
  position: relative;
  width: 1.3rem;
  height: 1.3rem;
  border: 2px solid var(--grafica);
  border-radius: 50%;

  svg {
    position: absolute;
    inset: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    overflow: visible;
  }

  path {
    stroke: var(--carbono);
    stroke-width: 3.2;
    stroke-linecap: round;
    fill: none;
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    animation: ${drawStroke} 220ms var(--ease-out) forwards;
  }

  path + path {
    animation-delay: 160ms;
  }

  @media (prefers-reduced-motion: reduce) {
    path {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

// O X à mão, em dois traços, que marca a escolha
export function HandCross() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3 L21 21" />
      <path d="M21 3 L3 21" />
    </svg>
  );
}
