import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* Paginação contida: Anterior / "Página X de Y" / Próxima.
   Cabe em 360px qualquer que seja o número de páginas. */

const Bar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.5rem;

  p {
    font-size: 0.98rem;
    color: var(--texto-2-papel);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }
`;

const Step = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 44px;
  padding: 0 0.9rem;
  background: var(--papel);
  border: 1.5px solid var(--regua);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--nanquim);
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--grafica);
    color: var(--grafica);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default function Pager({ page, pages, onChange, label = 'Páginas' }) {
  if (!pages || pages <= 1) return null;
  return (
    <Bar aria-label={label}>
      <Step type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft size={18} aria-hidden="true" /> Anterior
      </Step>
      <p aria-live="polite">Página {page} de {pages}</p>
      <Step type="button" onClick={() => onChange(page + 1)} disabled={page >= pages}>
        Próxima <ChevronRight size={18} aria-hidden="true" />
      </Step>
    </Bar>
  );
}
