import { useState, useEffect, useId } from 'react';
import { AlertCircle, RotateCw, Filter, X } from 'lucide-react';
import { API_URL } from '../config';
import { PrimaryButton, StampButton, FieldLabel, TextInput, FieldNote } from '../components/talao';
import { PageHead, Notice } from '../components/dashboard/parts';
import { FilterPanel, FilterGrid, Shortcuts, Chip, FilterActions, ResultCount, EmptyList, Loading } from '../components/dashboard/listParts';
import { localISO, APPOINTMENT_STATUS } from '../components/dashboard/utils';
import AppointmentRow from '../components/dashboard/AppointmentRow';
import Pager from '../components/dashboard/Pager';

/* Histórico de serviços (SharedLayout), para profissional e cliente.
   O formulário edita um rascunho; "Filtrar" aplica e "Limpar" zera os dois,
   e a busca depende só dos filtros aplicados e da página. */

const PAGE_SIZE = 10;
const EMPTY = { status: '', person: '', start: '', end: '' };

const PERIODS = [
  { key: 'week', label: '7 dias', days: 7 },
  { key: 'month', label: '30 dias', days: 30 },
  { key: 'quarter', label: '90 dias', days: 90 },
  { key: 'year', label: '12 meses', days: 365 },
];

const readIsProfessional = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? !!JSON.parse(atob(token.split('.')[1])).is_professional : false;
  } catch {
    return false;
  }
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localISO(d);
};

export default function History() {
  const uid = useId();
  const [isProfessional] = useState(readIsProfessional);
  const [people, setPeople] = useState([]);

  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [period, setPeriod] = useState('');
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [dateError, setDateError] = useState('');

  // Resposta guardada com a chave da busca; carregando = chave diferente
  const key = JSON.stringify({ applied, page, attempt });
  const [response, setResponse] = useState({ key: null, status: 'ok', data: null });
  const ready = response.key === key;

  useEffect(() => {
    const token = localStorage.getItem('token');
    let cancelled = false;
    fetch(`${API_URL}/appointments/history/filters/people`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => { if (!cancelled) setPeople(Array.isArray(list) ? list : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (applied.status) params.append('status_filter', applied.status);
    if (applied.start) params.append('start_date', applied.start);
    if (applied.end) params.append('end_date', applied.end);
    if (applied.person) params.append(isProfessional ? 'client_id' : 'professional_id', applied.person);
    let cancelled = false;
    fetch(`${API_URL}/appointments/history?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setResponse({ key, status: 'ok', data });
      })
      .catch((e) => {
        console.error('Falha ao carregar o histórico', e);
        if (!cancelled) setResponse({ key, status: 'error', data: null });
      });
    return () => { cancelled = true; };
  }, [key, applied, page, isProfessional]);

  const set = (field) => (e) => {
    setDraft((d) => ({ ...d, [field]: e.target.value }));
    if (field === 'start' || field === 'end') {
      setPeriod('');
      setDateError('');
    }
  };

  const choosePeriod = (p) => {
    setPeriod(p.key);
    setDateError('');
    setDraft((d) => ({ ...d, start: daysAgo(p.days), end: localISO(new Date()) }));
  };

  const apply = (e) => {
    e.preventDefault();
    if (draft.start && draft.end && draft.start > draft.end) {
      setDateError('A data inicial precisa ser antes da final.');
      document.getElementById(`${uid}-de`)?.focus();
      return;
    }
    setApplied(draft);
    setPage(1);
  };

  const clear = () => {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPeriod('');
    setDateError('');
    setPage(1);
  };

  const filtered = JSON.stringify(applied) !== JSON.stringify(EMPTY);
  const data = ready && response.status === 'ok' ? response.data : null;
  const personLabel = isProfessional ? 'Cliente' : 'Profissional';

  return (
    <>
      <PageHead>
        <div>
          <h1 data-display>Histórico</h1>
          <p>
            {isProfessional
              ? 'Todos os serviços da sua agenda, do mais recente para o mais antigo.'
              : 'Todos os serviços que você agendou, do mais recente para o mais antigo.'}
          </p>
        </div>
      </PageHead>

      <FilterPanel onSubmit={apply} noValidate aria-label="Filtrar o histórico">
        <FilterGrid>
          <div>
            <FieldLabel htmlFor={`${uid}-situacao`}>Situação</FieldLabel>
            <TextInput as="select" id={`${uid}-situacao`} value={draft.status} onChange={set('status')}>
              <option value="">Todas</option>
              {Object.entries(APPOINTMENT_STATUS).map(([value, s]) => (
                <option key={value} value={value}>{s.label}</option>
              ))}
            </TextInput>
          </div>
          <div>
            <FieldLabel htmlFor={`${uid}-pessoa`}>{personLabel}</FieldLabel>
            <TextInput as="select" id={`${uid}-pessoa`} value={draft.person} onChange={set('person')}>
              <option value="">Todos</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </TextInput>
          </div>
          <div>
            <FieldLabel htmlFor={`${uid}-de`}>De</FieldLabel>
            <TextInput
              type="date"
              id={`${uid}-de`}
              value={draft.start}
              onChange={set('start')}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? `${uid}-erro-data` : undefined}
            />
          </div>
          <div>
            <FieldLabel htmlFor={`${uid}-ate`}>Até</FieldLabel>
            <TextInput type="date" id={`${uid}-ate`} value={draft.end} onChange={set('end')} />
          </div>
        </FilterGrid>
        {dateError && <FieldNote id={`${uid}-erro-data`} role="alert" $tone="erro">{dateError}</FieldNote>}

        <Shortcuts role="group" aria-label="Atalhos de período">
          <span aria-hidden="true">Últimos</span>
          {PERIODS.map((p) => (
            <Chip key={p.key} type="button" aria-pressed={period === p.key} onClick={() => choosePeriod(p)}>
              {p.label}
            </Chip>
          ))}
        </Shortcuts>

        <FilterActions>
          <StampButton type="button" onClick={clear}>
            <X size={18} aria-hidden="true" /> Limpar
          </StampButton>
          <PrimaryButton type="submit">
            <Filter size={18} aria-hidden="true" /> Filtrar
          </PrimaryButton>
        </FilterActions>
      </FilterPanel>

      {!ready && <Loading role="status">Carregando o histórico…</Loading>}

      {ready && response.status === 'error' && (
        <Notice $tone="erro" role="alert">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>Não deu para carregar o histórico agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
          </p>
          <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}>
            <RotateCw size={18} aria-hidden="true" /> Tentar de novo
          </PrimaryButton>
        </Notice>
      )}

      {data && data.items.length === 0 && (
        <EmptyList>
          <h2>{filtered ? 'Nada com esses filtros' : 'Nenhum serviço ainda'}</h2>
          <p>
            {filtered
              ? 'Tente outro período ou outra situação, ou limpe os filtros para ver tudo.'
              : isProfessional
                ? 'Os serviços agendados com você aparecem aqui, inclusive os concluídos e cancelados.'
                : 'Os serviços que você agendar aparecem aqui, inclusive os concluídos e cancelados.'}
          </p>
        </EmptyList>
      )}

      {data && data.items.length > 0 && (
        <section aria-labelledby={`${uid}-total`}>
          <ResultCount id={`${uid}-total`} aria-live="polite">
            {data.total} {data.total === 1 ? 'serviço' : 'serviços'}
            {filtered && <span> com os filtros</span>}
          </ResultCount>
          {data.items.map((appt) => (
            <AppointmentRow
              key={appt.id}
              appt={appt}
              person={isProfessional ? appt.client_name : appt.professional_name && `com ${appt.professional_name}`}
            />
          ))}
          <Pager page={data.page} pages={data.pages} onChange={setPage} label="Páginas do histórico" />
        </section>
      )}
    </>
  );
}
