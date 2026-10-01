import { useState, useEffect, useRef, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { AlertCircle, RotateCw, Check, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import { PrimaryButton, StampButton, FieldNote } from '../components/talao';
import { PageHead, Panel, Notice } from '../components/dashboard/parts';
import { parseLocalDate } from '../components/dashboard/utils';
import { PlanList, PlanSheet, PlanHead, PlanItems, PlanTag, planItems, planPrice, sortPlans } from '../components/planParts';
import { translateError } from '../components/apiErrors';

/* Alterar plano (ProfessionalLayout): escolher a folha do plano e confirmar.
   Nada vai para o Mercado Pago sem o botão de confirmação, e o resumo diz
   antes o que acontece de verdade (ver /subscriptions/change-plan). */

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

const Layout = styled.form`
  max-width: 46rem;
`;

const Summary = styled(Panel)`
  margin-top: 1.5rem;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
  }

  ul {
    margin-top: 0.5rem;
    padding-left: 1.15rem;
    display: grid;
    gap: 0.35rem;
    line-height: 1.5;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;

  @media (max-width: 480px) {
    > * {
      flex: 1 1 100%;
    }
  }
`;

const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;

/* Diálogo mínimo para quando o plano novo comporta menos serviços
   (resposta services_exceeded do backend). */
const Dialog = styled.dialog`
  width: min(30rem, calc(100% - 2rem));
  margin: auto;
  padding: 1.5rem clamp(1.25rem, 4vw, 1.75rem) 1.75rem;
  border: none;
  border-top: 4px solid var(--grafica);
  border-radius: 0;
  background: var(--papel);
  color: var(--nanquim);
  box-shadow: 0 24px 48px -20px rgba(23, 23, 27, 0.55);

  &::backdrop {
    background: rgba(23, 23, 27, 0.45);
  }

  h2 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.6rem;
  }

  p {
    margin: 0.4rem 0 1rem;
    line-height: 1.5;
    color: var(--texto-2-papel);
  }

  label {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    min-height: 44px;
    border-bottom: 1.5px solid var(--pauta);
    cursor: pointer;
  }

  input {
    width: 1.15rem;
    height: 1.15rem;
    accent-color: var(--grafica);
  }
`;

const readPlans = async () => {
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
  const [plansRes, meRes, subRes] = await Promise.all([
    fetch(`${API_URL}/plans/`),
    fetch(`${API_URL}/plans/me/features`, { headers }),
    fetch(`${API_URL}/subscriptions/my-subscription`, { headers }),
  ]);
  if (!plansRes.ok || !meRes.ok) throw new Error('falha ao carregar os planos');
  const sub = subRes.ok ? (await subRes.json()).subscription : null;
  return { plans: sortPlans(await plansRes.json()), me: await meRes.json(), subscription: sub || null };
};

const dayMonth = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : null);

export default function ChangePlan() {
  const navigate = useNavigate();
  const uid = useId();
  const dialogRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: 'loading' });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // { text, cpf }
  const [excess, setExcess] = useState(null); // { services, max }
  const [keep, setKeep] = useState([]);

  useEffect(() => {
    let cancelled = false;
    readPlans()
      .then((data) => { if (!cancelled) setState({ status: 'ok', ...data }); })
      .catch((e) => {
        console.error('Falha ao carregar os planos', e);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (excess && !dialog.open) dialog.showModal();
    if (!excess && dialog.open) dialog.close();
  }, [excess]);

  const back = <Back to="/minha-assinatura"><ArrowLeft size={18} aria-hidden="true" /> Voltar para minha assinatura</Back>;
  const head = (
    <PageHead>
      <div>
        <h1 data-display>Alterar o plano</h1>
        <p>Escolha o plano e confira o que acontece antes de confirmar.</p>
      </div>
    </PageHead>
  );

  if (state.status === 'loading') return <Loading role="status">Carregando os planos…</Loading>;

  if (state.status === 'error') {
    return (
      <>
        {back}
        <Notice $tone="erro" role="alert">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>Não deu para carregar os planos agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
          </p>
          <PrimaryButton type="button" onClick={() => { setState({ status: 'loading' }); setAttempt((n) => n + 1); }}>
            <RotateCw size={18} aria-hidden="true" /> Tentar de novo
          </PrimaryButton>
        </Notice>
      </>
    );
  }

  const { plans, me, subscription } = state;
  const current = plans.find((p) => p.slug === me.plan_slug) || null;
  const currentPrice = current?.price ?? 0;
  const hasPaid = currentPrice > 0;

  // Upgrade já aguardando o Mercado Pago: concluir ou desistir antes de outro
  if (subscription?.pending_plan) {
    return (
      <>
        {back}
        {head}
        <Notice $tone="alerta">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>
              O upgrade para o {subscription.pending_plan.name} está aguardando o pagamento no Mercado Pago.
              Conclua o pagamento ou desista dele em Minha assinatura antes de escolher outro plano.
            </span>
          </p>
          <Link to="/minha-assinatura">Ir para minha assinatura</Link>
        </Notice>
      </>
    );
  }

  // Já existe troca ou cancelamento agendado: o backend recusa outra troca
  if (subscription?.scheduled_plan || subscription?.scheduled_cancellation_date) {
    return (
      <>
        {back}
        {head}
        <Notice $tone="alerta">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>
              {subscription.scheduled_plan
                ? `Já existe uma troca para o plano ${subscription.scheduled_plan.name} agendada para ${dayMonth(subscription.scheduled_plan_change_date)}. Desfaça essa troca em Minha assinatura para escolher outro plano.`
                : `Sua assinatura tem um cancelamento agendado para ${dayMonth(subscription.scheduled_cancellation_date)}. Mantenha a assinatura em Minha assinatura antes de trocar de plano.`}
            </span>
          </p>
          <Link to="/minha-assinatura">Ir para minha assinatura</Link>
        </Notice>
      </>
    );
  }

  const chosen = plans.find((p) => p.slug === selected) || null;
  const isUpgrade = chosen && chosen.price > currentPrice;
  const isDowngrade = chosen && hasPaid && chosen.price < currentPrice;
  const billingDate = dayMonth(subscription?.next_billing_date);
  // Com um plano em vigor, ele continua valendo até o MP confirmar o novo (backend: keep_current)
  const keepsCurrent = !!current && (currentPrice === 0 || subscription?.status === 'active');

  const send = async (slug) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/subscriptions/change-plan/${slug}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = translateError(data.detail, 'Não deu para trocar de plano agora. Tente de novo.');
        setError({ text, cpf: /CPF/.test(text) });
        return;
      }
      if (data.success === false && data.error === 'services_exceeded') {
        setKeep(data.current_services.slice(0, data.max_allowed).map((s) => s.id));
        setExcess({ services: data.current_services, max: data.max_allowed });
        return;
      }
      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }
      toast.success(data.is_scheduled ? 'Troca de plano agendada.' : 'Plano alterado.');
      navigate('/minha-assinatura');
    } catch {
      setError({ text: 'Não deu para falar com o servidor. Confira sua conexão e tente de novo.' });
    } finally {
      setSaving(false);
    }
  };

  const confirm = (e) => {
    e.preventDefault();
    if (!chosen) {
      setError({ text: 'Escolha um plano diferente do atual.' });
      return;
    }
    send(chosen.slug);
  };

  const keepAndContinue = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/plans/me/remove-excess-services`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep_service_ids: keep }),
      });
      const data = await res.json().catch(() => ({}));
      setExcess(null);
      if (!res.ok) {
        setError({ text: translateError(data.detail, 'Não deu para remover os serviços. Tente de novo.') });
        setSaving(false);
        return;
      }
      await send(chosen.slug);
    } catch {
      setExcess(null);
      setSaving(false);
      setError({ text: 'Não deu para falar com o servidor. Confira sua conexão e tente de novo.' });
    }
  };

  return (
    <>
      {back}
      {head}

      <Layout onSubmit={confirm} noValidate>
        <PlanList>
          <legend>Planos</legend>
          {plans.map((plan) => {
            const isCurrent = plan.slug === me.plan_slug;
            // O grátis não volta depois de um plano pago (regra do backend)
            const blocked = plan.slug === 'free' && hasPaid;
            const off = isCurrent || blocked;
            const on = selected === plan.slug;
            return (
              <PlanSheet key={plan.id} $on={on} $off={off}>
                <input
                  type="radio"
                  name={`${uid}-plano`}
                  value={plan.slug}
                  checked={on || (isCurrent && !selected)}
                  disabled={off}
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
                {blocked && <PlanTag>Não volta depois de um plano pago</PlanTag>}
                <PlanItems>
                  {planItems(plan).map((item) => <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>)}
                </PlanItems>
              </PlanSheet>
            );
          })}
        </PlanList>

        {chosen && (
          <Summary aria-live="polite">
            <h2>{isDowngrade ? `Trocar para o ${chosen.name}` : `Passar para o ${chosen.name}`}</h2>
            <ul>
              {isUpgrade && (
                <>
                  <li>Você vai para o Mercado Pago autorizar a assinatura de {planPrice(chosen.price)} por mês.</li>
                  {keepsCurrent
                    ? <li>Você continua no {current.name}, e na busca, até o Mercado Pago confirmar. Se desistir no meio, nada muda.</li>
                    : <li>Até você concluir o pagamento, sua assinatura fica pendente e seu perfil não aparece na busca.</li>}
                  {keepsCurrent && hasPaid && billingDate
                    ? <li>Com a confirmação, a assinatura do {current.name} é cancelada e a primeira cobrança do novo valor é em {billingDate}, no lugar da próxima cobrança.</li>
                    : <li>A cobrança começa quando você concluir o pagamento.</li>}
                </>
              )}
              {isDowngrade && (
                <>
                  <li>Nada muda agora: você continua no {current?.name} até {billingDate || 'a próxima cobrança'}.</li>
                  <li>Depois disso, o plano passa para o {chosen.name}, por {planPrice(chosen.price)} por mês.</li>
                  <li>Dá para desfazer a troca em Minha assinatura até essa data.</li>
                </>
              )}
            </ul>
          </Summary>
        )}

        {error && (
          <FieldNote role="alert" $tone="erro">
            {error.text}
            {error.cpf && <> <Link to="/profile" style={{ color: 'inherit' }}>Atualizar o perfil</Link></>}
          </FieldNote>
        )}

        <Actions>
          <PrimaryButton type="submit" disabled={saving || !chosen}>
            {saving
              ? 'Enviando…'
              : !chosen
                ? 'Escolha um plano'
                : isDowngrade
                  ? 'Agendar a troca'
                  : 'Ir para o pagamento'}
          </PrimaryButton>
        </Actions>
      </Layout>

      <Dialog ref={dialogRef} aria-labelledby={`${uid}-servicos`} onClose={() => setExcess(null)}>
        {excess && (
          <>
            <h2 id={`${uid}-servicos`}>Quais serviços ficam?</h2>
            <p>O plano {chosen?.name} permite {excess.max} {excess.max === 1 ? 'serviço' : 'serviços'}. Os outros serão apagados do seu perfil.</p>
            {excess.services.map((s) => (
              <label key={s.id}>
                <input
                  type="checkbox"
                  checked={keep.includes(s.id)}
                  onChange={() => setKeep((k) => (k.includes(s.id) ? k.filter((x) => x !== s.id) : k.length < excess.max ? [...k, s.id] : k))}
                />
                {s.title}
              </label>
            ))}
            <Actions>
              <StampButton type="button" onClick={() => setExcess(null)}><X size={18} aria-hidden="true" /> Voltar</StampButton>
              <PrimaryButton type="button" onClick={keepAndContinue} disabled={saving || keep.length !== excess.max}>
                Manter {keep.length} de {excess.max} e continuar
              </PrimaryButton>
            </Actions>
          </>
        )}
      </Dialog>
    </>
  );
}
