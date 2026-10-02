import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCw } from 'lucide-react';
import { API_URL } from '../config';
import AuthLayout from '../components/AuthLayout';
import { PrimaryLink, StampLink } from '../components/talao';
import { StepHead } from '../components/SignupParts';
import { readPlanIntent, clearPlanIntent } from '../components/planParts';

/* Volta do Mercado Pago. Só diz "ativado" quando a assinatura já está no
   plano que a pessoa foi pagar e não há upgrade pendente; até lá, consulta
   a assinatura a cada 2 s (até 10 vezes). Quem confirma é o webhook. */

const ATTEMPTS = 10;
const INTERVAL = 2000;

const Stamp = styled.p`
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.2rem 0.6rem;
  border: 2px solid ${({ $color }) => $color};
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  transform: rotate(-3deg);
`;

const Text = styled.div`
  display: grid;
  gap: 0.75rem;
  line-height: 1.55;

  p:last-child {
    color: var(--texto-2-papel);
  }
`;

const Waiting = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--texto-2-papel);

  svg {
    animation: girar 1.2s linear infinite;
  }

  @keyframes girar {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    svg {
      animation: none;
    }
  }
`;

const Actions = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;

  @media (min-width: 521px) {
    grid-template-columns: auto auto;
    justify-content: start;
  }
`;

// O que o Mercado Pago manda de volta na URL
const readReturn = (params) => {
  const status = params.get('collection_status') || params.get('status');
  if (status === 'rejected') return 'rejected';
  if (status === 'pending' || status === 'in_process') return 'review';
  if (status === 'approved' || status === 'success' || params.get('preapproval_id')) return 'check';
  return 'unknown';
};

// A assinatura já está no plano pago que a pessoa foi pagar?
const isConfirmed = (sub, intended) => {
  if (!sub || sub.status !== 'active' || sub.pending_plan) return false;
  return intended ? sub.plan?.slug === intended : true;
};

export default function SubscriptionCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const kind = readReturn(params);
  // checking | confirmed | slow | review | rejected | unknown
  const [state, setState] = useState(kind === 'check' ? 'checking' : kind);
  const [planName, setPlanName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return undefined;
    }
    if (kind !== 'check') return undefined;

    const intended = readPlanIntent();
    let attempts = 0;
    let timer = null;
    let cancelled = false;

    const check = async () => {
      attempts += 1;
      try {
        const res = await fetch(`${API_URL}/subscriptions/my-subscription`, { headers: { Authorization: `Bearer ${token}` } });
        const sub = res.ok ? (await res.json()).subscription : null;
        if (cancelled) return;
        if (isConfirmed(sub, intended)) {
          clearPlanIntent();
          setPlanName(sub.plan?.name || null);
          setState('confirmed');
          return;
        }
      } catch {
        // Falha de rede numa tentativa: tenta de novo na próxima
      }
      if (cancelled) return;
      if (attempts >= ATTEMPTS) {
        setState('slow');
        return;
      }
      timer = setTimeout(check, INTERVAL);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [kind, navigate]);

  const content = {
    checking: {
      title: 'Confirmando o pagamento',
      body: <Waiting role="status"><RotateCw size={18} aria-hidden="true" /> Estamos esperando a confirmação do Mercado Pago. Leva alguns segundos.</Waiting>,
    },
    confirmed: {
      stamp: { text: 'Pago', color: 'var(--sucesso)' },
      title: planName ? `Plano ${planName} ativo` : 'Assinatura ativa',
      body: (
        <Text>
          <p>O Mercado Pago confirmou o pagamento. Seu perfil já aparece na busca com os recursos do novo plano.</p>
          <p>Você recebe a confirmação por e-mail. A cobrança se repete todo mês até você cancelar em Minha assinatura.</p>
        </Text>
      ),
    },
    slow: {
      stamp: { text: 'Aguardando', color: 'var(--alerta)' },
      title: 'O pagamento ainda não foi confirmado',
      body: (
        <Text>
          <p>O Mercado Pago ainda não avisou que o pagamento foi aprovado. Isso costuma levar poucos minutos e, às vezes, algumas horas.</p>
          <p>Você recebe um e-mail quando confirmar, e pode acompanhar em Minha assinatura. Enquanto isso, nada muda no seu plano atual.</p>
        </Text>
      ),
    },
    review: {
      stamp: { text: 'Em análise', color: 'var(--alerta)' },
      title: 'Pagamento em análise',
      body: (
        <Text>
          <p>O Mercado Pago está analisando o pagamento. Quando aprovar, a assinatura é ativada sozinha e você recebe um e-mail.</p>
          <p>Enquanto isso, nada muda no seu plano atual.</p>
        </Text>
      ),
    },
    rejected: {
      stamp: { text: 'Recusado', color: 'var(--erro)' },
      title: 'O pagamento foi recusado',
      body: (
        <Text>
          <p>O Mercado Pago não aprovou o pagamento. Confira os dados do cartão ou tente outro cartão.</p>
          <p>Nenhuma cobrança foi feita e o seu plano atual continua o mesmo.</p>
        </Text>
      ),
    },
    unknown: {
      title: 'Não sabemos como terminou o pagamento',
      body: (
        <Text>
          <p>Voltamos do Mercado Pago sem a resposta do pagamento. Se você concluiu, a confirmação chega por e-mail em alguns minutos.</p>
          <p>Confira em Minha assinatura; de lá dá para concluir o pagamento ou recomeçar.</p>
        </Text>
      ),
    },
  }[state];

  return (
    <AuthLayout asideTitle="Seu plano no ContrataPro" asideLead="O pagamento é feito e confirmado pelo Mercado Pago.">
      {content.stamp && <Stamp $color={content.stamp.color}>{content.stamp.text}</Stamp>}
      <StepHead eyebrow="Assinatura" title={content.title} />
      <div aria-live="polite">{content.body}</div>

      {state !== 'checking' && (
        <Actions>
          {state === 'confirmed' && <PrimaryLink to="/dashboard">Ir para o painel</PrimaryLink>}
          {state === 'rejected' && <PrimaryLink to="/minha-assinatura">Tentar de novo</PrimaryLink>}
          {['slow', 'review', 'unknown'].includes(state) && <PrimaryLink to="/minha-assinatura">Ver minha assinatura</PrimaryLink>}
          <StampLink to={state === 'confirmed' ? '/minha-assinatura' : '/dashboard'}>
            {state === 'confirmed' ? 'Ver minha assinatura' : 'Ir para o painel'}
          </StampLink>
        </Actions>
      )}
    </AuthLayout>
  );
}
