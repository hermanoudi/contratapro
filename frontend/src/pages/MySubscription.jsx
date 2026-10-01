import { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AlertCircle, RotateCw, Check, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import { PrimaryButton, PrimaryLink, StampButton, StampLink, FieldNote } from '../components/talao';
import { PageHead, Panel, Notice } from '../components/dashboard/parts';
import { parseLocalDate } from '../components/dashboard/utils';
import { planItems, planPrice, PlanItems } from '../components/planParts';
import { translateError } from '../components/apiErrors';
import CancelSubscriptionDialog from '../components/dashboard/CancelSubscriptionDialog';

/* Minha assinatura (ProfessionalLayout) no registro contido.
   A página só oferece o que o backend aceita no estado atual:
   com cancelamento ou troca agendados, o botão é desfazer, não repetir. */

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
  border-bottom: 2px solid var(--grafica);

  h2 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.85rem;
    line-height: 1.05;
  }

  p {
    margin-top: 0.2rem;
    font-size: 0.98rem;
    color: var(--texto-2-papel);
  }
`;

// Situação da assinatura como carimbo: cor e palavra juntas
const Stamp = styled.strong`
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
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: 0.25rem 1rem;
    padding: 0.75rem 0;
    border-bottom: 1.5px solid var(--pauta);

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  dt {
    padding-top: 0.15rem;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
  }

  dd {
    line-height: 1.5;
    font-variant-numeric: tabular-nums;

    strong {
      font-weight: 600;
    }

    span {
      display: block;
      color: var(--texto-2-papel);
    }
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;

  > * {
    flex: 0 1 auto;
  }

  @media (max-width: 480px) {
    > * {
      flex: 1 1 100%;
    }
  }
`;

const Scheduled = styled.div`
  margin-top: 1.25rem;
  padding: 1rem;
  background: var(--papel-2);
  border: 1.5px solid var(--alerta);

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.25rem;
  }

  p {
    margin-top: 0.25rem;
    line-height: 1.5;
  }

  button {
    margin-top: 0.85rem;
  }
`;

const Support = styled(Panel)`
  max-width: 46rem;
  margin-top: 1.5rem;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
  }

  > p {
    margin-top: 0.3rem;
    line-height: 1.5;
    color: var(--texto-2-papel);
  }
`;

const OutlineLink = styled.a`
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

const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;

const STATUS = {
  active: { label: 'Ativa', color: 'var(--sucesso)' },
  pending: { label: 'Pendente', color: 'var(--alerta)' },
  cancelled: { label: 'Cancelada', color: 'var(--erro)' },
  suspended: { label: 'Suspensa', color: 'var(--alerta)' },
  paused: { label: 'Pausada', color: 'var(--alerta)' },
  expired: { label: 'Vencida', color: 'var(--erro)' },
};

// Colunas Date chegam como 'AAAA-MM-DD'; cancelled_at é data e hora
const day = (value) => {
  if (!value) return null;
  const d = value.length === 10 ? parseLocalDate(value) : new Date(value);
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

async function loadSubscription() {
  const headers = authHeaders();
  const [subRes, planRes] = await Promise.all([
    fetch(`${API_URL}/subscriptions/my-subscription`, { headers }),
    fetch(`${API_URL}/plans/me/features`, { headers }),
  ]);
  if (!subRes.ok && subRes.status !== 404) throw new Error(String(subRes.status));
  if (!planRes.ok) throw new Error(String(planRes.status));
  const sub = subRes.ok ? await subRes.json() : {};
  return { subscription: sub.subscription || null, plan: await planRes.json() };
}

export default function MySubscription() {
  const navigate = useNavigate();
  const uid = useId();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: 'loading', subscription: null, plan: null });
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSubscription()
      .then((data) => { if (!cancelled) setState({ status: 'ok', ...data }); })
      .catch((e) => {
        console.error('Falha ao carregar a assinatura', e);
        if (!cancelled) setState({ status: 'error', subscription: null, plan: null });
      });
    return () => { cancelled = true; };
  }, [attempt]);

  // Depois de uma ação, recarrega sem voltar para o "Carregando"
  const refresh = async () => {
    try {
      setState({ status: 'ok', ...(await loadSubscription()) });
    } catch {
      setAttempt((n) => n + 1);
    }
  };

  const post = async (key, path, fallback) => {
    setBusy(key);
    setActionError('');
    try {
      const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(translateError(data.detail, fallback));
        return null;
      }
      return data;
    } catch {
      setActionError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
      return null;
    } finally {
      setBusy('');
    }
  };

  const undoScheduled = async () => {
    const data = await post('undo', '/subscriptions/cancel-scheduled-change', 'Não deu para desfazer a mudança. Tente de novo.');
    if (data) {
      toast.success('Mudança desfeita. Sua assinatura continua como está.');
      refresh();
    }
  };

  const restart = async () => {
    const data = await post('reset', '/subscriptions/reset-pending', 'Não deu para recomeçar a assinatura. Tente de novo.');
    if (data) navigate('/subscription/setup');
  };

  if (state.status === 'loading') return <Loading role="status">Carregando a sua assinatura…</Loading>;

  if (state.status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p>
          <AlertCircle size={18} aria-hidden="true" />
          <span>Não deu para carregar a sua assinatura agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
        </p>
        <PrimaryButton type="button" onClick={() => { setState({ status: 'loading', subscription: null, plan: null }); setAttempt((n) => n + 1); }}>
          <RotateCw size={18} aria-hidden="true" /> Tentar de novo
        </PrimaryButton>
      </Notice>
    );
  }

  const { subscription: sub, plan } = state;
  const isFree = plan?.plan_slug === 'free';
  const features = plan?.features || {};
  const isPremium = (features.priority_in_search ?? 0) >= 2;

  const head = (
    <PageHead>
      <div>
        <h1 data-display>Minha assinatura</h1>
        <p>O seu plano, o que ele inclui e as cobranças no Mercado Pago.</p>
      </div>
    </PageHead>
  );

  // Sem plano e sem assinatura: só dá para assinar
  if (!sub && !isFree) {
    return (
      <>
        {head}
        <Sheet>
          <SheetHead>
            <div>
              <h2>Nenhum plano ativo</h2>
              <p>Sem um plano, seu perfil não aparece na busca dos clientes.</p>
            </div>
          </SheetHead>
          <Actions>
            <PrimaryLink to="/subscription/setup">Escolher um plano</PrimaryLink>
          </Actions>
        </Sheet>
      </>
    );
  }

  const status = isFree ? { label: 'Grátis', color: 'var(--sucesso)' } : (STATUS[sub.status] || { label: sub.status, color: 'var(--texto-2-papel)' });
  const scheduledCancel = !isFree && sub?.scheduled_cancellation_date;
  const scheduledPlan = !isFree && sub?.scheduled_plan;
  const isActive = !isFree && sub?.status === 'active';
  const isPending = !isFree && sub?.status === 'pending';
  const isEnded = !isFree && ['cancelled', 'expired', 'suspended', 'paused'].includes(sub?.status);

  return (
    <>
      {head}

      <Sheet aria-labelledby={`${uid}-plano`}>
        <SheetHead>
          <div>
            <h2 id={`${uid}-plano`}>Plano {plan?.plan_name || sub?.plan?.name}</h2>
            {features.badge_label && <p>Selo no perfil: “{features.badge_label}”</p>}
          </div>
          <Stamp $color={status.color}>{status.label}</Stamp>
        </SheetHead>

        <Lines>
          <div>
            <dt>Valor</dt>
            <dd>
              {isFree
                ? <><strong>Grátis</strong><span>Sem prazo para acabar</span></>
                : <strong>{planPrice(sub.plan_amount)} por mês</strong>}
            </dd>
          </div>
          {isActive && (
            <div>
              <dt>{scheduledCancel ? 'Termina em' : 'Próxima cobrança'}</dt>
              <dd><strong>{day(scheduledCancel || sub.next_billing_date) || 'Ainda sem data'}</strong></dd>
            </div>
          )}
          {!isFree && sub?.last_payment_date && (
            <div>
              <dt>Último pagamento</dt>
              <dd>{day(sub.last_payment_date)}</dd>
            </div>
          )}
          {isEnded && sub.cancelled_at && (
            <div>
              <dt>Cancelada em</dt>
              <dd>
                {day(sub.cancelled_at)}
                {sub.cancellation_reason && <span>{sub.cancellation_reason}</span>}
              </dd>
            </div>
          )}
          <div>
            <dt>Inclui</dt>
            <dd>
              <PlanItems style={{ marginTop: 0 }}>
                {planItems(features).map((item) => <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>)}
                <li><Check size={16} aria-hidden="true" /> Sem comissão sobre os serviços</li>
              </PlanItems>
            </dd>
          </div>
        </Lines>

        {/* Pagamento pendente: concluir no Mercado Pago ou recomeçar */}
        {isPending && (
          <Scheduled role="status">
            <h3>Pagamento pendente</h3>
            <p>Enquanto o pagamento não for concluído no Mercado Pago, seu perfil não aparece na busca. Se o link não funcionar, recomece a assinatura.</p>
            <Actions style={{ marginTop: '0.85rem' }}>
              {sub.init_point && (
                <OutlineLink href={sub.init_point} target="_blank" rel="noopener noreferrer">
                  Concluir o pagamento <ExternalLink size={18} aria-hidden="true" />
                </OutlineLink>
              )}
              <StampButton type="button" onClick={restart} disabled={busy === 'reset'}>
                {busy === 'reset' ? 'Recomeçando…' : 'Recomeçar a assinatura'}
              </StampButton>
            </Actions>
          </Scheduled>
        )}

        {scheduledCancel && (
          <Scheduled role="status">
            <h3>Cancelamento agendado</h3>
            <p>A cobrança já parou. Você continua usando tudo até {day(scheduledCancel)}; depois disso, seu perfil sai da busca.</p>
            <StampButton type="button" onClick={undoScheduled} disabled={busy === 'undo'}>
              {busy === 'undo' ? 'Desfazendo…' : 'Manter a assinatura'}
            </StampButton>
          </Scheduled>
        )}

        {scheduledPlan && (
          <Scheduled role="status">
            <h3>Troca de plano agendada</h3>
            <p>
              Você continua no plano atual até {day(sub.scheduled_plan_change_date)} e depois passa para o {scheduledPlan.name}
              {scheduledPlan.price ? ` (${planPrice(scheduledPlan.price)} por mês)` : ''}.
            </p>
            <StampButton type="button" onClick={undoScheduled} disabled={busy === 'undo'}>
              {busy === 'undo' ? 'Desfazendo…' : 'Desfazer a troca'}
            </StampButton>
          </Scheduled>
        )}

        {actionError && <FieldNote role="alert" $tone="erro">{actionError}</FieldNote>}

        <Actions>
          {isFree && <PrimaryLink to="/alterar-plano">Ver os planos Pro e Premium</PrimaryLink>}
          {isActive && !scheduledPlan && !scheduledCancel && <StampLink to="/alterar-plano">Alterar o plano</StampLink>}
          {isActive && !scheduledCancel && (
            <StampButton type="button" onClick={() => { setActionError(''); setCancelOpen(true); }}>Cancelar a assinatura</StampButton>
          )}
          {isEnded && <PrimaryLink to="/subscription/setup">Assinar de novo</PrimaryLink>}
        </Actions>
      </Sheet>

      {/* Canal de suporte do Premium */}
      {isPremium && !isEnded && (
        <Support aria-labelledby={`${uid}-suporte`}>
          <h2 id={`${uid}-suporte`}>Suporte prioritário</h2>
          <p>Como assinante Premium, você tem um canal exclusivo de suporte. Nossa equipe responde em até 24 horas úteis.</p>
          <Actions>
            <OutlineLink
              href="https://wa.me/5534999715592?text=Olá, sou assinante Premium do ContrataPro e preciso de suporte."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={20} aria-hidden="true" /> WhatsApp
            </OutlineLink>
            <OutlineLink href="mailto:contato@contratapro.com.br?subject=Suporte Premium">
              <Mail size={20} aria-hidden="true" /> E-mail
            </OutlineLink>
          </Actions>
        </Support>
      )}

      <CancelSubscriptionDialog
        open={cancelOpen}
        endDate={isActive ? day(sub.next_billing_date) : null}
        onClose={() => setCancelOpen(false)}
        onCancelled={(message) => {
          setCancelOpen(false);
          toast.success(message || 'Cancelamento registrado.');
          refresh();
        }}
      />
    </>
  );
}
