import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AlertCircle, RotateCw, Filter, X, Search, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';
import { PrimaryButton, StampButton, FieldLabel, InputBox, TextInput, FieldNote } from '../components/talao';
import { PageHead, Notice } from '../components/dashboard/parts';
import { parseLocalDate } from '../components/dashboard/utils';
import { FilterPanel, FilterGrid, FilterActions, ResultCount, EmptyList, Loading } from '../components/dashboard/listParts';
import Pager from '../components/dashboard/Pager';

/* Avisos que o ContrataPro mandou para você (hoje, por e-mail), no registro contido.
   Mesmo padrão do Histórico: rascunho no formulário, filtros aplicados na busca. */

const PAGE_SIZE = 10;
const EMPTY = { search: '', type: '', start: '', end: '' };

const TYPES = {
  new_appointment: 'Novo agendamento',
  appointment_updated: 'Agendamento alterado',
  appointment_cancelled: 'Agendamento cancelado',
};

// Situação do envio, não do agendamento
const DELIVERY = {
  sent: { label: 'Enviado', color: 'var(--sucesso)' },
  pending: { label: 'Na fila', color: 'var(--alerta)' },
  error: { label: 'Não foi enviado', color: 'var(--erro)' },
};

const CHANNELS = { email: 'e-mail', sms: 'SMS', whatsapp: 'WhatsApp', push: 'notificação no celular' };

const Row = styled.li`
  border-bottom: 1.5px solid var(--pauta);
`;

const rowInner = `
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.25rem 1rem;
  align-items: center;
  padding: 0.85rem 0.25rem;
  color: var(--nanquim);
  text-decoration: none;
`;

const RowLink = styled(Link)`
  ${rowInner}

  &:hover strong {
    color: var(--grafica);
  }

  > svg {
    color: var(--texto-2-papel);
  }
`;

const RowStatic = styled.div`
  ${rowInner}
`;

const Body = styled.span`
  min-width: 0;

  small {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica-escura);
  }

  strong {
    display: block;
    margin-top: 0.1rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  > span {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.95rem;
    line-height: 1.45;
    color: var(--texto-2-papel);
  }
`;

const Delivery = styled.b`
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const readIsProfessional = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? !!JSON.parse(atob(token.split('.')[1])).is_professional : false;
  } catch {
    return false;
  }
};

const received = (iso) => new Date(iso).toLocaleString('pt-BR', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}).replace('.', '');

function NotificationRow({ notif, isProfessional }) {
  const delivery = DELIVERY[notif.status] || { label: notif.status, color: 'var(--texto-2-papel)' };
  const channel = CHANNELS[notif.channel] || notif.channel;
  const person = isProfessional ? notif.client_name : notif.professional_name;
  const details = [
    notif.service_title,
    notif.appointment_date && `${parseLocalDate(notif.appointment_date).toLocaleDateString('pt-BR')}${notif.appointment_start_time ? `, às ${notif.appointment_start_time.slice(0, 5)}` : ''}`,
    person && (isProfessional ? `cliente ${person}` : `com ${person}`),
  ].filter(Boolean).join(' · ');

  const inner = (
    <Body>
      <small>{TYPES[notif.type] || 'Aviso'}</small>
      <strong>{notif.title}</strong>
      {details && <span>{details}</span>}
      <span>
        <Delivery $color={delivery.color}>{delivery.label}</Delivery>
        {notif.status === 'sent' ? ` por ${channel}` : ''} · {received(notif.created_at)}
      </span>
    </Body>
  );

  return (
    <Row>
      {notif.appointment_id ? (
        <RowLink to={`/appointment/${notif.appointment_id}`}>
          {inner}
          <ChevronRight size={20} aria-hidden="true" />
        </RowLink>
      ) : (
        <RowStatic>{inner}</RowStatic>
      )}
    </Row>
  );
}

export default function MyNotifications() {
  const uid = useId();
  const [isProfessional] = useState(readIsProfessional);

  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [dateError, setDateError] = useState('');

  const key = JSON.stringify({ applied, page, attempt });
  const [response, setResponse] = useState({ key: null, status: 'ok', data: null });
  const ready = response.key === key;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (applied.search.trim()) params.append('search', applied.search.trim());
    if (applied.type) params.append('type_filter', applied.type);
    if (applied.start) params.append('start_date', applied.start);
    if (applied.end) params.append('end_date', applied.end);
    let cancelled = false;
    fetch(`${API_URL}/notifications/me?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setResponse({ key, status: 'ok', data });
      })
      .catch((e) => {
        console.error('Falha ao carregar as notificações', e);
        if (!cancelled) setResponse({ key, status: 'error', data: null });
      });
    return () => { cancelled = true; };
  }, [key, applied, page]);

  const set = (field) => (e) => {
    setDraft((d) => ({ ...d, [field]: e.target.value }));
    if (field === 'start' || field === 'end') setDateError('');
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
    setDateError('');
    setPage(1);
  };

  const filtered = JSON.stringify(applied) !== JSON.stringify(EMPTY);
  const data = ready && response.status === 'ok' ? response.data : null;

  return (
    <>
      <PageHead>
        <div>
          <h1 data-display>Notificações</h1>
          <p>Os avisos que mandamos para você sobre seus agendamentos, e se cada um chegou a ser enviado.</p>
        </div>
      </PageHead>

      <FilterPanel onSubmit={apply} noValidate aria-label="Filtrar as notificações">
        <FilterGrid>
          <div>
            <FieldLabel htmlFor={`${uid}-busca`}>Buscar</FieldLabel>
            <InputBox>
              <Search size={20} aria-hidden="true" />
              <TextInput
                $icon
                type="search"
                id={`${uid}-busca`}
                value={draft.search}
                onChange={set('search')}
                placeholder={isProfessional ? 'serviço ou cliente' : 'serviço ou profissional'}
              />
            </InputBox>
          </div>
          <div>
            <FieldLabel htmlFor={`${uid}-tipo`}>Tipo</FieldLabel>
            <TextInput as="select" id={`${uid}-tipo`} value={draft.type} onChange={set('type')}>
              <option value="">Todos</option>
              {Object.entries(TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </TextInput>
          </div>
          <div>
            <FieldLabel htmlFor={`${uid}-de`}>Recebidas de</FieldLabel>
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

        <FilterActions>
          <StampButton type="button" onClick={clear}>
            <X size={18} aria-hidden="true" /> Limpar
          </StampButton>
          <PrimaryButton type="submit">
            <Filter size={18} aria-hidden="true" /> Filtrar
          </PrimaryButton>
        </FilterActions>
      </FilterPanel>

      {!ready && <Loading role="status">Carregando as notificações…</Loading>}

      {ready && response.status === 'error' && (
        <Notice $tone="erro" role="alert">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>Não deu para carregar as notificações agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
          </p>
          <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}>
            <RotateCw size={18} aria-hidden="true" /> Tentar de novo
          </PrimaryButton>
        </Notice>
      )}

      {data && data.items.length === 0 && (
        <EmptyList>
          <h2>{filtered ? 'Nada com esses filtros' : 'Nenhuma notificação ainda'}</h2>
          <p>
            {filtered
              ? 'Tente outra busca ou outro período, ou limpe os filtros para ver tudo.'
              : 'Quando um agendamento for feito, alterado ou cancelado, o aviso que mandamos aparece aqui.'}
          </p>
        </EmptyList>
      )}

      {data && data.items.length > 0 && (
        <section aria-labelledby={`${uid}-total`}>
          <ResultCount id={`${uid}-total`} aria-live="polite">
            {data.total} {data.total === 1 ? 'aviso' : 'avisos'}
            {filtered && <span> com os filtros</span>}
          </ResultCount>
          <ul style={{ listStyle: 'none' }}>
            {data.items.map((notif) => <NotificationRow key={notif.id} notif={notif} isProfessional={isProfessional} />)}
          </ul>
          <Pager page={data.page} pages={data.pages} onChange={setPage} label="Páginas das notificações" />
        </section>
      )}
    </>
  );
}
