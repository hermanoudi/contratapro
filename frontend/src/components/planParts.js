import styled from 'styled-components';

/* Escolha de plano no registro contido: cada plano é uma folha com radio.
   Usado no cadastro do profissional e em Alterar plano. A fonte dos planos
   é sempre GET /plans/ (seed_plans.py), nunca uma lista fixa no front. */

export const PlanList = styled.fieldset`
  border: none;
  display: grid;
  gap: 1rem;

  legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
`;

// A escolhida ganha a moldura de gráfica; a indisponível fica em papel-2
export const PlanSheet = styled.label`
  position: relative;
  display: block;
  padding: 1.1rem 1.25rem 1.1rem 3.25rem;
  background: ${({ $off }) => ($off ? 'var(--papel-2)' : 'var(--papel)')};
  border: ${({ $on }) => ($on ? '2px solid var(--grafica)' : '1.5px solid var(--controle)')};
  border-radius: 2px;
  cursor: ${({ $off }) => ($off ? 'default' : 'pointer')};
  transition: border-color 160ms var(--ease-out);

  input {
    position: absolute;
    left: 1.2rem;
    top: 1.35rem;
    width: 1.2rem;
    height: 1.2rem;
    margin: 0;
    accent-color: var(--grafica);
  }

  &:hover {
    border-color: ${({ $off }) => ($off ? 'var(--controle)' : 'var(--grafica)')};
  }

  &:focus-within {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }
`;

export const PlanHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.25rem 1rem;

  strong {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.5rem;
    line-height: 1.1;
  }

  span {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
    color: var(--grafica-escura);
    font-variant-numeric: tabular-nums;

    small {
      font-family: var(--f-texto);
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--texto-2-papel);
    }
  }
`;

// Situação do plano na folha (Seu plano atual, Indisponível)
export const PlanTag = styled.p`
  margin-top: 0.35rem;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $tone }) => ($tone === 'atual' ? 'var(--sucesso)' : 'var(--texto-2-papel)')};
`;

export const PlanItems = styled.ul`
  list-style: none;
  margin-top: 0.6rem;
  display: grid;
  gap: 0.3rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    font-size: 0.98rem;
    line-height: 1.4;
  }

  svg {
    flex: none;
    margin-top: 0.15rem;
    color: var(--carbono);
  }
`;

export const planPrice = (value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

// Free primeiro, depois Pro e Premium
export const sortPlans = (plans) => {
  const order = { free: 0, pro: 1, premium: 2 };
  return [...plans].sort((a, b) => (order[a.slug] ?? 99) - (order[b.slug] ?? 99));
};

// O que cada plano dá, lido do próprio plano
export const planItems = (plan) => {
  const items = [];
  items.push(plan.max_services ? `Até ${plan.max_services} ${plan.max_services === 1 ? 'serviço' : 'serviços'} no perfil` : 'Serviços ilimitados no perfil');
  items.push(plan.max_appointments_per_month ? `Até ${plan.max_appointments_per_month} agendamentos por mês` : 'Agendamentos ilimitados');
  if (plan.can_manage_schedule) items.push('Agenda online com seus horários');
  if (plan.priority_in_search >= 2) items.push('Aparece no topo da busca');
  else if (plan.priority_in_search === 1) items.push('Aparece antes dos perfis do plano grátis na busca');
  if (plan.badge_label) items.push(`Selo "${plan.badge_label}" no seu perfil`);
  return items;
};

// Plano que a pessoa foi pagar no Mercado Pago: o retorno (/subscription/callback)
// só fala em sucesso quando a assinatura já está nele. sessionStorage pode falhar
// (aba privada, bloqueio), então tudo fica em try/catch.
const INTENT_KEY = 'contratapro:plano-em-pagamento';

export const rememberPlanIntent = (slug) => {
  try { sessionStorage.setItem(INTENT_KEY, slug); } catch { /* sem armazenamento: o retorno usa a regra antiga */ }
};

export const readPlanIntent = () => {
  try { return sessionStorage.getItem(INTENT_KEY); } catch { return null; }
};

export const clearPlanIntent = () => {
  try { sessionStorage.removeItem(INTENT_KEY); } catch { /* nada a limpar */ }
};
