import { useState, useEffect, useRef, useId } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { translateError } from '../apiErrors';
import { PrimaryButton, StampButton, FieldLabel, TextInput, FieldNote } from '../talao';
import { localISO } from './utils';

/* Bloquear horário num <dialog> nativo: Esc fecha e o foco fica preso dentro. */

const Dialog = styled.dialog`
  width: min(30rem, calc(100% - 2rem));
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
  margin-bottom: 0.5rem;

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
  margin-bottom: 1.25rem;
  line-height: 1.5;
  color: var(--texto-2-papel);
`;

const Fields = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;

  > :first-child,
  > :last-child {
    grid-column: 1 / -1;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const EMPTY = { date: '', start_time: '08:00', end_time: '09:00', reason: '' };

export default function BlockDialog({ open, onClose, onCreated }) {
  const ref = useRef(null);
  const dateRef = useRef(null);
  const id = useId();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Ao abrir, começa limpo
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(EMPTY);
      setError('');
    }
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dateRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) {
      setError('Escolha a data.');
      return;
    }
    // Sem datas passadas (comparação no fuso local)
    if (form.date < localISO(new Date())) {
      setError('Não dá para bloquear um dia que já passou.');
      return;
    }
    if (form.end_time <= form.start_time) {
      setError('O horário final precisa ser depois do inicial.');
      return;
    }

    const token = localStorage.getItem('token');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/appointments/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: form.date,
          start_time: `${form.start_time}:00`,
          end_time: `${form.end_time}:00`,
          reason: form.reason || 'Bloqueio manual'
        })
      });
      if (res.ok) {
        toast.success('Horário bloqueado.');
        onCreated(form.date);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(translateError(data.detail, 'Não deu para bloquear o horário. Tente de novo.'));
      }
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      ref={ref}
      aria-labelledby={`${id}-titulo`}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      {open && (
        <form onSubmit={handleSubmit} noValidate>
          <Head>
            <h2 id={`${id}-titulo`}>Bloquear horário</h2>
            <button type="button" aria-label="Fechar" onClick={onClose}>
              <X size={24} aria-hidden="true" />
            </button>
          </Head>
          <Lead>Os clientes não conseguem agendar no horário bloqueado.</Lead>

          <Fields>
            <div>
              <FieldLabel htmlFor={`${id}-data`}>Data</FieldLabel>
              <TextInput
                ref={dateRef}
                id={`${id}-data`}
                type="date"
                min={localISO(new Date())}
                value={form.date}
                onChange={set('date')}
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor={`${id}-inicio`}>Das</FieldLabel>
              <TextInput as="select" id={`${id}-inicio`} value={form.start_time} onChange={set('start_time')}>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </TextInput>
            </div>
            <div>
              <FieldLabel htmlFor={`${id}-fim`}>Até</FieldLabel>
              <TextInput as="select" id={`${id}-fim`} value={form.end_time} onChange={set('end_time')}>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </TextInput>
            </div>
            <div>
              <FieldLabel htmlFor={`${id}-motivo`}>Motivo (opcional)</FieldLabel>
              <TextInput
                as="textarea"
                id={`${id}-motivo`}
                rows={3}
                placeholder="ex.: o serviço anterior vai passar do horário"
                value={form.reason}
                onChange={set('reason')}
                style={{ padding: '0.75rem 1rem', minHeight: '5.5rem', resize: 'vertical' }}
              />
            </div>
          </Fields>

          {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}

          <Actions>
            <StampButton type="button" onClick={onClose}>Cancelar</StampButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Bloqueando…' : 'Bloquear'}</PrimaryButton>
          </Actions>
        </form>
      )}
    </Dialog>
  );
}
