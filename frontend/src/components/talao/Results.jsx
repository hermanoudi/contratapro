import styled from 'styled-components';

// Barra acima dos cartões: contagem à esquerda, filtros à direita, fechada por uma linha de gráfica
export const ResultsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem 1.5rem;
  padding-bottom: 0.75rem;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  border-bottom: 2px solid var(--grafica);
`;

export const ResultsCount = styled.p`
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.02em;
  color: var(--nanquim);

  strong {
    font-variant-numeric: tabular-nums;
  }
`;

const Note = styled.p`
  margin-top: 1.75rem;
  color: var(--texto-2);
  max-width: 62ch;
  line-height: 1.55;
`;

// Dito com todas as letras embaixo dos cartões: o ContrataPro não checa ninguém
export function TrustNote() {
  return (
    <Note>
      O ContrataPro não verifica os profissionais. Antes de marcar, leia as avaliações, confira os serviços e
      preços do perfil e converse com a pessoa.
    </Note>
  );
}
