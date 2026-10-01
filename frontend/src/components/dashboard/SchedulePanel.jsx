import { useState, useId } from 'react';
import styled from 'styled-components';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { translateError } from '../apiErrors';
import { PrimaryButton, FieldLabel, TextInput, FieldNote } from '../talao';
import { Panel, IconButton } from './parts';

/* Horários de atendimento: formulário e a lista em linhas pautadas, de segunda a domingo. */

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const Form = styled.form`
  display: grid;
  gap: 1rem 1.25rem;
  grid-template-columns: 1fr 1fr;

  > div:first-child {
    grid-column: 1 / -1;
  }

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    align-items: end;

    > div:first-child {
      grid-column: auto;
    }
  }
`;

const Submit = styled.div`
  grid-column: 1 / -1;

  button {
    width: 100%;
    min-height: 52px;
  }

  @media (min-width: 900px) {
    grid-column: auto;
  }
`;

const Hours = styled.ul`
  list-style: none;
  margin-top: 1.5rem;
  border-top: 2px solid var(--grafica);
  max-width: 44rem;
`;

const Hour = styled.li`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 56px;
  padding: 0.35rem 0;
  border-bottom: 1.5px solid var(--pauta);

  strong {
    flex: 0 0 7rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
  }

  span {
    flex: 1;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1.2rem;
    font-variant-numeric: tabular-nums;
    color: var(--grafica-escura);
  }
`;

const Empty = styled.p`
  margin-top: 1.5rem;
  color: var(--texto-2-papel);
  line-height: 1.55;
`;

const isValidTime = (t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

export default function SchedulePanel({ workingHours, setWorkingHours }) {
  const id = useId();
  const [newWH, setNewWH] = useState({ day_of_week: 0, start_time: '08:00', end_time: '18:00' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Máscara HH:mm
  const handleTimeChange = (field, value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    const formatted = cleaned.length >= 3 ? `${cleaned.slice(0, 2)}:${cleaned.slice(2)}` : cleaned;
    setNewWH({ ...newWH, [field]: formatted });
    setError('');
  };

  const handleAddWH = async (e) => {
    e.preventDefault();
    if (!isValidTime(newWH.start_time) || !isValidTime(newWH.end_time)) {
      setError('Use horários de 24h, como 08:00 ou 18:30.');
      return;
    }
    if (newWH.start_time >= newWH.end_time) {
      setError('O término precisa ser depois do início.');
      return;
    }
    const token = localStorage.getItem('token');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/schedule/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newWH, start_time: `${newWH.start_time}:00`, end_time: `${newWH.end_time}:00` })
      });
      if (res.ok) {
        const saved = await res.json();
        setWorkingHours((prev) => [...prev, saved]);
        setError('');
        toast.success(`${DAYS[newWH.day_of_week]} adicionada à sua agenda.`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(translateError(data.detail, 'Não deu para salvar o horário. Tente de novo.'));
      }
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWH = async (whId) => {
    if (!confirm('Remover este horário de atendimento?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/schedule/${whId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setWorkingHours((prev) => prev.filter((wh) => wh.id !== whId));
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(translateError(data.detail, 'Não deu para remover o horário.'));
      }
    } catch {
      toast.error('Não deu para remover o horário. Confira sua conexão.');
    }
  };

  // Ordena por dia e depois por início
  const sorted = [...workingHours].sort((a, b) =>
    a.day_of_week !== b.day_of_week ? a.day_of_week - b.day_of_week : a.start_time.localeCompare(b.start_time)
  );

  return (
    <>
      <Panel data-tour="schedule-form" aria-labelledby={`${id}-novo`}>
        <h2 id={`${id}-novo`}>Novo horário</h2>
        <Form onSubmit={handleAddWH} noValidate>
          <div data-tour="schedule-day">
            <FieldLabel htmlFor={`${id}-dia`}>Dia da semana</FieldLabel>
            <TextInput
              as="select"
              id={`${id}-dia`}
              value={newWH.day_of_week}
              onChange={(e) => setNewWH({ ...newWH, day_of_week: parseInt(e.target.value) })}
            >
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </TextInput>
          </div>
          <div data-tour="schedule-start">
            <FieldLabel htmlFor={`${id}-inicio`}>Início</FieldLabel>
            <TextInput
              id={`${id}-inicio`}
              inputMode="numeric"
              placeholder="08:00"
              maxLength={5}
              value={newWH.start_time}
              onChange={(e) => handleTimeChange('start_time', e.target.value)}
            />
          </div>
          <div data-tour="schedule-end">
            <FieldLabel htmlFor={`${id}-fim`}>Término</FieldLabel>
            <TextInput
              id={`${id}-fim`}
              inputMode="numeric"
              placeholder="18:00"
              maxLength={5}
              value={newWH.end_time}
              onChange={(e) => handleTimeChange('end_time', e.target.value)}
            />
          </div>
          <Submit>
            <PrimaryButton type="submit" disabled={saving}>
              <Plus size={18} aria-hidden="true" /> {saving ? 'Salvando…' : 'Adicionar'}
            </PrimaryButton>
          </Submit>
          {error && <FieldNote role="alert" $tone="erro" style={{ gridColumn: '1 / -1' }}>{error}</FieldNote>}
        </Form>
      </Panel>

      <div data-tour="schedule-list">
        {sorted.length === 0 ? (
          <Empty>Nenhum horário ainda. Adicione os dias e horários em que você atende: é por eles que os clientes agendam.</Empty>
        ) : (
          <Hours>
            {sorted.map((wh) => (
              <Hour key={wh.id}>
                <strong>{DAYS[wh.day_of_week]}</strong>
                <span>{wh.start_time.slice(0, 5)} às {wh.end_time.slice(0, 5)}</span>
                <IconButton
                  type="button"
                  $tone="erro"
                  onClick={() => handleDeleteWH(wh.id)}
                  aria-label={`Remover ${DAYS[wh.day_of_week]}, ${wh.start_time.slice(0, 5)} às ${wh.end_time.slice(0, 5)}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </IconButton>
              </Hour>
            ))}
          </Hours>
        )}
      </div>
    </>
  );
}
