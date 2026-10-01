import { useState, useEffect, useId } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, MessageCircle, Check, X, PauseCircle, AlertCircle, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import { PrimaryButton, StampButton, FieldLabel, TextInput, FieldNote } from '../components/talao';
import { PageHead, Panel, Notice } from '../components/dashboard/parts';
import { formatPhone } from '../components/dashboard/utils';
import { translateError } from '../components/apiErrors';

/* Detalhe de um agendamento, para o profissional e para o cliente (SharedLayout).
   Cada um vê primeiro a outra pessoa e o que precisa para o dia do serviço. */

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  margin-bottom: 0.5rem;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--grafica-escura);
  text-underline-offset: 4px;

  &:hover {
    color: var(--nanquim);
  }
`;

const Sheet = styled(Panel)`
  max-width: 46rem;
`;

const SheetHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem 1rem;
  padding-bottom: 0.6rem;
  margin-bottom: 0.25rem;
  border-bottom: 2px solid var(--grafica);

  span {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica-escura);
  }
`;

// Situação do agendamento como carimbo: a cor acompanha o texto, nunca está sozinha
const StatusStamp = styled.strong`
  padding: 0.15rem 0.55rem;
  border: 2px solid ${({ $color }) => $color};
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  transform: rotate(-3deg);
`;

const Lines = styled.dl`
  > div {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: 0.25rem 1rem;
    padding: 0.75rem 0;
    border-bottom: 1.5px solid var(--pauta);

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  dt {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
    padding-top: 0.15rem;
  }

  dd {
    line-height: 1.5;
    overflow-wrap: anywhere;

    strong {
      font-weight: 600;
    }

    span {
      display: block;
      color: var(--texto-2-papel);
    }
  }
`;

const Reason = styled.div`
  margin: 1rem 0 0;
  padding: 0.85rem 1rem;
  background: var(--papel-2);
  border: 1.5px solid var(--regua);

  b {
    display: block;
    margin-bottom: 0.25rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.05rem;
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

const WhatsApp = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0 1.2rem;
  border: 2px solid var(--grafica);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--grafica);

  &:hover {
    background: var(--grafica);
    color: var(--papel);
  }
`;

const ReasonForm = styled.form`
  margin-top: 1.25rem;
  padding: 1rem;
  background: var(--papel-2);
  border: 1.5px solid ${({ $tone }) => ($tone === 'cancelled' ? 'var(--erro)' : 'var(--alerta)')};

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
  }

  > p:first-of-type {
    margin-bottom: 0.75rem;
    color: var(--texto-2-papel);
    line-height: 1.5;
  }
`;

const Note = styled.p`
  margin-top: 1.25rem;
  color: var(--texto-2-papel);
  line-height: 1.55;
`;

const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;

const STATUS = {
  scheduled: { label: 'Agendado', color: 'var(--carbono)' },
  completed: { label: 'Concluído', color: 'var(--sucesso)' },
  cancelled: { label: 'Cancelado', color: 'var(--erro)' },
  suspended: { label: 'Suspenso', color: 'var(--alerta)' },
};

const STATUS_DONE = { completed: 'concluído', cancelled: 'cancelado', suspended: 'suspenso' };

// Papel de quem está vendo, lido do token (o mesmo critério de antes)
const readIsProfessional = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? !!JSON.parse(atob(token.split('.')[1])).is_professional : false;
  } catch {
    return false;
  }
};

const waPhone = (raw) => {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('55') ? digits : `55${digits}`;
};

const address = (p) => {
  const street = [p.street, p.number].filter(Boolean).join(', ');
  const line1 = [street, p.complement].filter(Boolean).join(' – ');
  const line2 = [p.neighborhood, [p.city, p.state].filter(Boolean).join('/')].filter(Boolean).join(' – ');
  return { line1, line2, cep: p.cep };
};

function Address({ addr }) {
  return (
    <>
      {addr.line1 && <strong>{addr.line1}</strong>}
      {addr.line2 && <span>{addr.line2}</span>}
      {addr.cep && <span>CEP {addr.cep}</span>}
      {!addr.line1 && !addr.line2 && <span>Endereço não informado.</span>}
    </>
  );
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const uid = useId();
  const [isProfessional] = useState(readIsProfessional);
  const backTo = isProfessional ? '/dashboard' : '/my-appointments';

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: 'loading', appt: null }); // loading | ok | notfound | error
  const appt = state.appt;
  const [updating, setUpdating] = useState(false);
  const [asking, setAsking] = useState(null); // 'cancelled' | 'suspended'
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    let cancelled = false;
    fetch(`${API_URL}/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404 || res.status === 403) {
          setState({ status: 'notfound', appt: null });
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setState({ status: 'ok', appt: data });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setState({ status: 'error', appt: null });
      });
    return () => { cancelled = true; };
  }, [id, attempt]);

  const handleStatusUpdate = async (status) => {
    setActionError('');
    // Cancelar e suspender pedem motivo (mínimo de 5 letras)
    if ((status === 'cancelled' || status === 'suspended') && reason.trim().length < 5) {
      setActionError('Escreva o motivo com pelo menos 5 letras.');
      document.getElementById(`${uid}-motivo`)?.focus();
      return;
    }
    setUpdating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reason: reason.trim() || null })
      });
      if (res.ok) {
        const updated = await res.json();
        setState({ status: 'ok', appt: updated });
        setAsking(null);
        setReason('');
        toast.success(`Agendamento ${STATUS_DONE[status]}. Cliente e profissional recebem um aviso por e-mail.`);
      } else {
        const data = await res.json().catch(() => ({}));
        setActionError(translateError(data.detail, 'Não deu para mudar o agendamento. Tente de novo.'));
      }
    } catch {
      setActionError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setUpdating(false);
    }
  };

  if (state.status === 'loading') return <Loading role="status">Carregando o agendamento…</Loading>;

  if (state.status !== 'ok') {
    return (
      <>
        <Back to={backTo}><ArrowLeft size={18} aria-hidden="true" /> {isProfessional ? 'Voltar para a agenda' : 'Voltar para meus agendamentos'}</Back>
        <Notice $tone="erro" role="alert">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>
              {state.status === 'notfound'
                ? 'Não encontramos este agendamento na sua conta.'
                : 'Não deu para carregar o agendamento agora. Pode ser a conexão ou uma instabilidade do nosso lado.'}
            </span>
          </p>
          {state.status === 'error' && (
            <PrimaryButton type="button" onClick={() => { setState({ status: 'loading', appt: null }); setAttempt((n) => n + 1); }}>
              <RotateCw size={18} aria-hidden="true" /> Tentar de novo
            </PrimaryButton>
          )}
        </Notice>
      </>
    );
  }

  const [y, m, d] = appt.date.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dateLong = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateShort = dateObj.toLocaleDateString('pt-BR');
  const time = `${appt.start_time.slice(0, 5)} às ${appt.end_time.slice(0, 5)}`;
  const status = STATUS[appt.status] || { label: appt.status, color: 'var(--texto-2-papel)' };
  const clientAddr = address({
    street: appt.client_street, number: appt.client_number, complement: appt.client_complement,
    neighborhood: appt.client_neighborhood, city: appt.client_city, state: appt.client_state, cep: appt.client_cep,
  });
  const proAddr = address({
    street: appt.professional_street, number: appt.professional_number, complement: appt.professional_complement,
    neighborhood: appt.professional_neighborhood, city: appt.professional_city, state: appt.professional_state, cep: appt.professional_cep,
  });

  // WhatsApp para a outra pessoa, com a mensagem já escrita
  const other = isProfessional
    ? { phone: waPhone(appt.client_whatsapp), message: `Olá, tudo bem? Meu nome é ${appt.professional_name}. Você agendou ${appt.service_title} comigo no dia ${dateShort}, às ${appt.start_time.slice(0, 5)}. Você confirma esse agendamento?` }
    : { phone: waPhone(appt.professional_whatsapp), message: `Olá, ${appt.professional_name}! Agendei ${appt.service_title} pelo ContrataPro para o dia ${dateShort}, às ${appt.start_time.slice(0, 5)}.` };
  const whatsappHref = other.phone ? `https://wa.me/${other.phone}?text=${encodeURIComponent(other.message)}` : null;

  return (
    <>
      <Back to={backTo}><ArrowLeft size={18} aria-hidden="true" /> {isProfessional ? 'Voltar para a agenda' : 'Voltar para meus agendamentos'}</Back>
      <PageHead>
        <div>
          <h1 data-display>{appt.service_title}</h1>
          <p style={{ textTransform: 'none' }}>{dateLong}, das {time}</p>
        </div>
      </PageHead>

      <Sheet aria-labelledby={`${uid}-ficha`}>
        <SheetHead>
          <span id={`${uid}-ficha`}>Agendamento nº {appt.id}</span>
          <StatusStamp $color={status.color}>{status.label}</StatusStamp>
        </SheetHead>

        <Lines>
          {isProfessional ? (
            <div>
              <dt>Cliente</dt>
              <dd>
                <strong>{appt.client_name}</strong>
                {appt.client_whatsapp && <span>{formatPhone(appt.client_whatsapp)}</span>}
                {appt.client_email && <span>{appt.client_email}</span>}
              </dd>
            </div>
          ) : (
            <div>
              <dt>Profissional</dt>
              <dd>
                <strong>{appt.professional_name}</strong>
                {appt.professional_category && <span>{appt.professional_category}</span>}
                {appt.professional_whatsapp && <span>{formatPhone(appt.professional_whatsapp)}</span>}
              </dd>
            </div>
          )}
          <div>
            <dt>Serviço</dt>
            <dd><strong>{appt.service_title}</strong></dd>
          </div>
          <div>
            <dt>Dia e horário</dt>
            <dd><strong>{dateLong}</strong><span>{time}</span></dd>
          </div>
          <div>
            <dt>{isProfessional ? 'Endereço do cliente' : 'Seu endereço'}</dt>
            <dd><Address addr={clientAddr} /></dd>
          </div>
          {!isProfessional && (
            <div>
              <dt>Endereço do profissional</dt>
              <dd><Address addr={proAddr} /></dd>
            </div>
          )}
        </Lines>

        {appt.reason && (
          <Reason>
            <b>Motivo da alteração</b>
            {appt.reason}
          </Reason>
        )}

        {appt.status === 'completed' && !isProfessional && (
          <Note>O link para avaliar o serviço chega no seu e-mail. Sua nota aparece no perfil de {appt.professional_name}.</Note>
        )}

        {appt.status === 'scheduled' && (
          <>
            <Actions>
              {whatsappHref && (
                <WhatsApp href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={20} aria-hidden="true" /> {isProfessional ? 'Falar com o cliente' : 'Falar com o profissional'}
                </WhatsApp>
              )}
              {isProfessional && (
                <PrimaryButton type="button" onClick={() => handleStatusUpdate('completed')} disabled={updating}>
                  <Check size={18} aria-hidden="true" /> Marcar como concluído
                </PrimaryButton>
              )}
            </Actions>
            {!asking && (
              <Actions>
                <StampButton type="button" onClick={() => { setAsking('cancelled'); setActionError(''); }} disabled={updating}>
                  <X size={18} aria-hidden="true" /> Cancelar
                </StampButton>
                <StampButton type="button" onClick={() => { setAsking('suspended'); setActionError(''); }} disabled={updating}>
                  <PauseCircle size={18} aria-hidden="true" /> Suspender
                </StampButton>
              </Actions>
            )}

            {asking && (
              <ReasonForm $tone={asking} onSubmit={(e) => { e.preventDefault(); handleStatusUpdate(asking); }} noValidate>
                <h2>{asking === 'cancelled' ? 'Cancelar este agendamento' : 'Suspender este agendamento'}</h2>
                <p>{isProfessional ? 'O cliente' : 'O profissional'} recebe o motivo por e-mail.</p>
                <FieldLabel htmlFor={`${uid}-motivo`}>Motivo</FieldLabel>
                <TextInput
                  as="textarea"
                  id={`${uid}-motivo`}
                  rows={3}
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setActionError(''); }}
                  placeholder="ex.: surgiu um imprevisto e não vou conseguir no horário"
                  style={{ padding: '0.75rem 1rem', minHeight: '6rem', resize: 'vertical' }}
                  autoFocus
                />
                {actionError && <FieldNote role="alert" $tone="erro">{actionError}</FieldNote>}
                <Actions>
                  <StampButton type="button" onClick={() => { setAsking(null); setReason(''); setActionError(''); }}>Voltar</StampButton>
                  <PrimaryButton type="submit" disabled={updating}>
                    {updating ? 'Salvando…' : asking === 'cancelled' ? 'Confirmar cancelamento' : 'Confirmar suspensão'}
                  </PrimaryButton>
                </Actions>
              </ReasonForm>
            )}
          </>
        )}

        {actionError && !asking && <FieldNote role="alert" $tone="erro">{actionError}</FieldNote>}
      </Sheet>
    </>
  );
}
