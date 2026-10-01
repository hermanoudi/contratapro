import { useState, useEffect, useRef, useId } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { API_URL } from '../../config';
import { translateError } from '../apiErrors';
import { PrimaryButton, StampButton, FieldLabel, TextInput, FieldNote } from '../talao';

/* Cancelar a assinatura num <dialog> nativo (Esc fecha, foco preso).
   O motivo é obrigatório e vai com o código para a análise de cancelamentos. */

const REASONS = [
  { id: 'not_using', label: 'Não estou usando a plataforma', description: 'Poucos clientes ou sem tempo para atender' },
  { id: 'too_expensive', label: 'Valor muito alto', description: 'O custo não compensa o retorno' },
  { id: 'found_alternative', label: 'Encontrei outra plataforma', description: 'Estou usando outro serviço parecido' },
  { id: 'technical_issues', label: 'Problemas técnicos', description: 'Dificuldades com o sistema ou com o pagamento' },
  { id: 'temporary_pause', label: 'Pausa temporária', description: 'Pretendo voltar no futuro' },
  { id: 'closing_business', label: 'Encerrando as atividades', description: 'Não vou mais prestar serviços' },
  { id: 'payment_issue', label: 'Problema no pagamento', description: 'O pagamento não foi processado direito' },
  { id: 'other', label: 'Outro motivo', description: 'Prefiro escrever' },
];

const Dialog = styled.dialog`
  width: min(34rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  margin: auto;
  padding: 1.5rem clamp(1.25rem, 4vw, 1.75rem) 1.75rem;
  border: none;
  border-top: 4px solid var(--grafica);
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

  h2 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.75rem;
    line-height: 1.05;
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

const Lead = styled.p`
  margin: 0.4rem 0 1.25rem;
  line-height: 1.5;
  color: var(--texto-2-papel);
`;

const Reasons = styled.fieldset`
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

  label {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.6rem 0.25rem;
    border-bottom: 1.5px solid var(--pauta);
    cursor: pointer;
  }

  input {
    flex: none;
    width: 1.15rem;
    height: 1.15rem;
    margin-top: 0.2rem;
    accent-color: var(--grafica);
  }

  b {
    display: block;
    font-weight: 600;
  }

  small {
    display: block;
    font-size: 0.93rem;
    color: var(--texto-2-papel);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;

  > * {
    flex: 1 1 11rem;
  }
`;

export default function CancelSubscriptionDialog({ open, endDate, onClose, onCancelled }) {
  const ref = useRef(null);
  const id = useId();
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Formulário zera a cada abertura (ajuste durante a renderização)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason('');
      setOther('');
      setError('');
    }
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Escolha o motivo do cancelamento.');
      return;
    }
    if (reason === 'other' && other.trim().length < 5) {
      setError('Conte o motivo com pelo menos 5 letras.');
      document.getElementById(`${id}-outro`)?.focus();
      return;
    }
    const chosen = REASONS.find((r) => r.id === reason);
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason === 'other' ? `Outro: ${other.trim()}` : `${chosen.label}: ${chosen.description}`,
          reason_code: reason,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(translateError(data.detail, 'Não deu para cancelar agora. Tente de novo.'));
        return;
      }
      onCancelled(data.message);
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      ref={ref}
      aria-labelledby={`${id}-titulo`}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current && !saving) onClose(); }}
    >
      {open && (
        <form onSubmit={submit} noValidate>
          <Head>
            <h2 id={`${id}-titulo`}>Cancelar a assinatura</h2>
            <button type="button" aria-label="Fechar" onClick={onClose} disabled={saving}>
              <X size={24} aria-hidden="true" />
            </button>
          </Head>
          <Lead>
            {endDate
              ? `A cobrança para no Mercado Pago e você continua usando tudo até ${endDate}. Depois disso, seu perfil sai da busca.`
              : 'A cobrança para no Mercado Pago e seu perfil sai da busca quando o período pago acabar.'}
          </Lead>

          <Reasons>
            <legend>Por que você está cancelando?</legend>
            {REASONS.map((r) => (
              <label key={r.id}>
                <input
                  type="radio"
                  name={`${id}-motivo`}
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => { setReason(r.id); setError(''); }}
                />
                <span>
                  <b>{r.label}</b>
                  <small>{r.description}</small>
                </span>
              </label>
            ))}
          </Reasons>

          {reason === 'other' && (
            <div style={{ marginTop: '1rem' }}>
              <FieldLabel htmlFor={`${id}-outro`}>Conte o motivo</FieldLabel>
              <TextInput
                as="textarea"
                id={`${id}-outro`}
                rows={3}
                value={other}
                onChange={(e) => { setOther(e.target.value); setError(''); }}
                style={{ padding: '0.75rem 1rem', minHeight: '5.5rem', resize: 'vertical' }}
              />
            </div>
          )}

          {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}

          <Actions>
            <StampButton type="button" onClick={onClose} disabled={saving}>Manter a assinatura</StampButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Cancelando…' : 'Confirmar o cancelamento'}
            </PrimaryButton>
          </Actions>
        </form>
      )}
    </Dialog>
  );
}
