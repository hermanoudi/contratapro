import { useEffect, useRef, useId } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

/* <dialog> nativo do admin (Esc fecha, foco preso). O conteúdo só existe
   enquanto aberto, para não duplicar rótulos e ids na página. */

const Box = styled.dialog`
  width: min(32rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  margin: auto;
  padding: 1.5rem clamp(1.25rem, 4vw, 1.75rem) 1.75rem;
  border: none;
  border-top: 4px solid ${({ $danger }) => ($danger ? 'var(--erro)' : 'var(--grafica)')};
  border-radius: 0;
  background: var(--papel);
  color: var(--nanquim);
  box-shadow: 0 24px 48px -20px rgba(23, 23, 27, 0.55), 0 2px 6px rgba(23, 23, 27, 0.15);

  &::backdrop {
    background: rgba(23, 23, 27, 0.45);
  }
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.65rem;
    line-height: 1.1;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 44px;
    height: 44px;
    margin: -0.5rem -0.5rem 0 0;
    background: none;
    border: none;
    color: var(--nanquim);
    cursor: pointer;

    &:hover {
      color: var(--grafica);
    }
  }
`;

export const DialogText = styled.p`
  margin-bottom: 1rem;
  line-height: 1.55;
  color: var(--texto-2-papel);
`;

export const DialogActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;

  > * {
    flex: 1 1 10rem;
  }
`;

export default function AdminDialog({ open, title, onClose, busy = false, danger = false, children }) {
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <Box
      ref={ref}
      $danger={danger}
      aria-labelledby={`${id}-titulo`}
      onClose={onClose}
      onCancel={(e) => { if (busy) e.preventDefault(); }}
      onClick={(e) => { if (e.target === ref.current && !busy) onClose(); }}
    >
      {open && (
        <>
          <Head>
            <h2 id={`${id}-titulo`}>{title}</h2>
            <button type="button" aria-label="Fechar" onClick={onClose} disabled={busy}>
              <X size={24} aria-hidden="true" />
            </button>
          </Head>
          {children}
        </>
      )}
    </Box>
  );
}
