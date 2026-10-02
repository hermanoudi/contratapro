import { useState, useEffect, useRef, useId } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Check, RotateCw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton, StampButton, FieldNote } from '../components/talao';
import { StepHead, FormError, FooterNote } from '../components/SignupParts';
import { PlanList, PlanSheet, PlanHead, PlanItems, PlanTag, planItems, planPrice, sortPlans, rememberPlanIntent } from '../components/planParts';
import { translateError } from '../components/apiErrors';

/* Escolha do plano para quem ainda não tem um em vigor (cadastro com plano
   pago, assinatura cancelada ou vencida) e para quem está no Free.
   ?plano=<slug> chega do cadastro com o plano já escolhido. */

const isDev = import.meta.env.DEV;

const Summary = styled.div`
  margin-top: 1.25rem;
  padding: 1rem;
  background: var(--papel-2);
  border-top: 2px solid var(--grafica);

  ul {
    padding-left: 1.15rem;
    display: grid;
    gap: 0.35rem;
    line-height: 1.5;
  }
`;

const Actions = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-top: 1.5rem;

  @media (min-width: 521px) {
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-items: center;
  }
`;

const Later = styled(Link)`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--texto-2-papel);
  text-underline-offset: 3px;

  &:hover {
    color: var(--grafica);
  }
`;

const DevBox = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1.5px dashed var(--alerta);

  p {
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

async function loadSetup() {
  const headers = authHeaders();
  const [plansRes, meRes, subRes] = await Promise.all([
    fetch(`${API_URL}/plans/`),
    fetch(`${API_URL}/plans/me/features`, { headers }),
    fetch(`${API_URL}/subscriptions/my-subscription`, { headers }),
  ]);
  if (!plansRes.ok || !meRes.ok) throw new Error('falha ao carregar os planos');
  const sub = subRes.ok ? (await subRes.json()).subscription : null;
  return { plans: sortPlans(await plansRes.json()), me: await meRes.json(), subscription: sub || null };
}

export default function SubscriptionSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = useId();
  const headingRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: 'loading' });
  const [selected, setSelected] = useState(searchParams.get('plano'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // { text, cpf }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return undefined;
    }
    let cancelled = false;
    loadSetup()
      .then((data) => {
        if (cancelled) return;
        const sub = data.subscription;
        // Quem já paga ou já tem um pagamento em andamento resolve em Minha assinatura
        if (sub && (sub.pending_plan || (sub.status === 'active' && sub.plan_amount > 0) || sub.status === 'pending')) {
          navigate('/minha-assinatura', { replace: true });
          return;
        }
        setState({ status: 'ok', ...data });
      })
      .catch((e) => {
        console.error('Falha ao carregar os planos', e);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => { cancelled = true; };
  }, [attempt, navigate]);

  if (state.status === 'loading') {
    return <AuthLayout asideTitle="Seu plano no ContrataPro" wide><Loading role="status">Carregando os planos…</Loading></AuthLayout>;
  }

  if (state.status === 'error') {
    return (
      <AuthLayout asideTitle="Seu plano no ContrataPro" wide>
        <StepHead eyebrow="Assinatura" title="Escolha o seu plano" />
        <FormError>Não deu para carregar os planos agora. Pode ser a conexão ou uma instabilidade do nosso lado.</FormError>
        <Actions>
          <PrimaryButton type="button" onClick={() => { setState({ status: 'loading' }); setAttempt((n) => n + 1); }}>
            <RotateCw size={18} aria-hidden="true" /> Tentar de novo
          </PrimaryButton>
        </Actions>
      </AuthLayout>
    );
  }

  const { plans, me } = state;
  // No Free em vigor: o Free continua valendo até o pagamento confirmar (change-plan)
  const onActiveFree = me.plan_slug === 'free';
  const chosen = plans.find((p) => p.slug === selected && !(onActiveFree && p.slug === 'free')) || null;
  const isPaid = !!chosen && chosen.price > 0;

  const confirm = async (e) => {
    e.preventDefault();
    if (!chosen) {
      setError({ text: 'Escolha um plano.' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const path = onActiveFree && isPaid
        ? `/subscriptions/change-plan/${chosen.slug}`
        : `/subscriptions/subscribe/${chosen.slug}`;
      const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = translateError(data.detail, 'Não deu para continuar agora. Tente de novo.');
        setError({ text, cpf: /CPF/.test(text) });
        return;
      }
      if (data.init_point) {
        rememberPlanIntent(chosen.slug);
        window.location.href = data.init_point;
        return;
      }
      toast.success(isPaid ? 'Plano escolhido.' : 'Plano Free ativo. Você já aparece na busca.');
      navigate('/dashboard');
    } catch {
      setError({ text: 'Não deu para falar com o servidor. Confira sua conexão e tente de novo.' });
    } finally {
      setSaving(false);
    }
  };

  const activateDev = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/subscriptions/activate-manual`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || 'Assinatura ativada (desenvolvimento).');
        navigate('/dashboard');
      } else {
        setError({ text: translateError(data.detail, 'Não deu para ativar.') });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      asideTitle="Seu plano no ContrataPro"
      asideLead="Sem comissão sobre os serviços: você paga só o plano, se escolher um pago."
      facts={[
        { strong: 'Free para sempre:', text: 'o plano grátis não vence e não pede cartão.' },
        { strong: 'Pagamento no Mercado Pago:', text: 'os dados do cartão ficam com o Mercado Pago, não com o ContrataPro.' },
        { strong: 'Cancele quando quiser:', text: 'em Minha assinatura, e você usa até o fim do período pago.' },
      ]}
      wide
    >
      <form onSubmit={confirm} noValidate>
        <StepHead
          ref={headingRef}
          eyebrow="Assinatura"
          title="Escolha o seu plano"
          lead={onActiveFree
            ? 'Você está no Free. Os planos pagos dão mais serviços, agendamentos e destaque na busca.'
            : 'Escolha o plano para o seu perfil aparecer na busca dos clientes.'}
        />

        <PlanList>
          <legend>Planos</legend>
          {plans.map((plan) => {
            const isCurrent = onActiveFree && plan.slug === 'free';
            const on = chosen?.slug === plan.slug;
            return (
              <PlanSheet key={plan.id} $on={on} $off={isCurrent}>
                <input
                  type="radio"
                  name={`${uid}-plano`}
                  value={plan.slug}
                  checked={on || (isCurrent && !chosen)}
                  disabled={isCurrent}
                  onChange={() => { setSelected(plan.slug); setError(null); }}
                />
                <PlanHead>
                  <strong>{plan.name}</strong>
                  <span>
                    {plan.price === 0 ? 'Grátis' : planPrice(plan.price)}
                    <small>{plan.price === 0 ? ' sem prazo' : ' por mês'}</small>
                  </span>
                </PlanHead>
                {isCurrent && <PlanTag $tone="atual">Seu plano atual</PlanTag>}
                <PlanItems>
                  {planItems(plan).map((item) => <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>)}
                </PlanItems>
              </PlanSheet>
            );
          })}
        </PlanList>

        {chosen && (
          <Summary aria-live="polite">
            <ul>
              {isPaid ? (
                <>
                  <li>Você vai para o Mercado Pago autorizar a assinatura de {planPrice(chosen.price)} por mês.</li>
                  {onActiveFree
                    ? <li>Você continua no Free, e na busca, até o Mercado Pago confirmar o pagamento.</li>
                    : <li>Seu perfil passa a aparecer na busca quando o Mercado Pago confirmar o pagamento.</li>}
                </>
              ) : (
                <li>O Free começa agora, sem cartão e sem prazo para acabar.</li>
              )}
            </ul>
          </Summary>
        )}

        {error && (
          <FormError>
            {error.text}
            {error.cpf && <> <Link to="/profile" style={{ color: 'inherit' }}>Atualizar o perfil</Link></>}
          </FormError>
        )}

        <Actions>
          <Later to="/dashboard">Decidir depois</Later>
          <PrimaryButton type="submit" disabled={saving || !chosen}>
            {saving
              ? 'Enviando…'
              : !chosen
                ? 'Escolha um plano'
                : isPaid
                  ? <>Ir para o pagamento <ArrowRight size={20} aria-hidden="true" /></>
                  : 'Ficar no Free'}
          </PrimaryButton>
        </Actions>
      </form>

      {/* Só em desenvolvimento: o sandbox do Mercado Pago não confirma pagamentos */}
      {isDev && (
        <DevBox>
          <p><strong>Desenvolvimento:</strong> ativa a assinatura pendente sem passar pelo Mercado Pago. O backend só aceita com DEBUG=True.</p>
          <StampButton type="button" onClick={activateDev} disabled={saving}>Ativar assinatura (dev)</StampButton>
        </DevBox>
      )}

      <FooterNote>
        <FieldNote as="span">Dúvidas sobre cobrança? <a href="mailto:contato@contratapro.com.br">contato@contratapro.com.br</a></FieldNote>
      </FooterNote>
    </AuthLayout>
  );
}
