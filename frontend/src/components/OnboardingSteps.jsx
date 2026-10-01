import { useEffect, useRef, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { X, User, Briefcase, Clock, Check, ChevronRight } from 'lucide-react';

/* Boas-vindas do profissional: os três passos para começar a receber clientes,
   num <dialog> nativo (Esc fecha, foco preso) no registro contido. */

const Dialog = styled.dialog`
  width: min(30rem, calc(100% - 2rem));
  margin: auto;
  padding: 1.5rem clamp(1.25rem, 4vw, 1.75rem) 1.5rem;
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

  h2 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.85rem;
    line-height: 1.05;
  }
`;

const Close = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
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
`;

const Lead = styled.p`
  margin: 0.4rem 0 1.25rem;
  line-height: 1.5;
  color: var(--texto-2-papel);
`;

const Steps = styled.ol`
  list-style: none;
  border-top: 2px solid var(--grafica);
`;

const StepRow = styled.li`
  border-bottom: 1.5px solid var(--pauta);
`;

const stepInner = `
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  min-height: 64px;
  padding: 0.5rem 0.25rem;
  text-align: left;
`;

const StepButton = styled.button`
  ${stepInner}
  background: none;
  border: none;
  font-family: var(--f-texto);
  color: var(--nanquim);
  cursor: pointer;

  &:hover strong {
    color: var(--grafica);
  }
`;

const StepDone = styled.div`
  ${stepInner}
  color: var(--texto-2-papel);
`;

const Num = styled.span`
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 2px solid ${({ $done }) => ($done ? 'var(--sucesso)' : 'var(--grafica)')};
  border-radius: 50%;
  font-family: var(--f-impresso);
  font-weight: 700;
  color: ${({ $done }) => ($done ? 'var(--sucesso)' : 'var(--grafica)')};
`;

const StepText = styled.span`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
  }

  small {
    display: block;
    font-size: 0.95rem;
    color: var(--texto-2-papel);
  }
`;

const Later = styled.button`
  margin-top: 1rem;
  min-height: 44px;
  padding: 0;
  background: none;
  border: none;
  color: var(--texto-2-papel);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: var(--grafica);
  }
`;

const Congrats = styled.p`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  margin-top: 1rem;
  line-height: 1.5;

  svg {
    flex: none;
    color: var(--sucesso);
  }
`;

function getSteps(user, services, workingHours) {
  return [
    {
      key: 'profile',
      label: 'Completar o perfil',
      desc: 'Foto, descrição e localização',
      icon: User,
      done: !!(user?.profile_picture && user?.description && user?.city),
      to: '/profile',
    },
    {
      key: 'services',
      label: 'Cadastrar os serviços',
      desc: 'O que você faz e quanto cobra',
      icon: Briefcase,
      done: (services?.length || 0) > 0,
      to: '/dashboard?tab=services',
    },
    {
      key: 'schedule',
      label: 'Marcar os horários',
      desc: 'Os dias e horários em que você atende',
      icon: Clock,
      done: (workingHours?.length || 0) > 0,
      to: '/dashboard?tab=schedule',
    },
  ];
}

export default function OnboardingSteps({ user, services, workingHours, onDismiss }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const id = useId();
  const steps = getSteps(user, services, workingHours);
  // Parabéns é derivado: tudo feito
  const allDone = steps.every((s) => s.done);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Com tudo feito, a mensagem fica 3 segundos e fecha sozinha
  useEffect(() => {
    if (!allDone) return undefined;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [allDone, onDismiss]);

  const go = (step) => {
    navigate(step.to);
    onDismiss();
  };

  return (
    <Dialog
      ref={ref}
      aria-labelledby={`${id}-titulo`}
      onClose={onDismiss}
      onClick={(e) => { if (e.target === ref.current) onDismiss(); }}
    >
      <Head>
        <h2 id={`${id}-titulo`}>{allDone ? 'Perfil pronto' : 'Boas-vindas ao ContrataPro'}</h2>
        <Close type="button" aria-label="Fechar" onClick={onDismiss}>
          <X size={24} aria-hidden="true" />
        </Close>
      </Head>

      {allDone ? (
        <Congrats role="status">
          <Check size={22} aria-hidden="true" />
          Tudo certo: os clientes da sua região já podem encontrar você e agendar.
        </Congrats>
      ) : (
        <>
          <Lead>Três passos para começar a receber clientes.</Lead>
          <Steps>
            {steps.map((step, i) => {
              const Icon = step.icon;
              const inner = (
                <>
                  <Num $done={step.done} aria-hidden="true">{step.done ? <Check size={16} /> : i + 1}</Num>
                  <StepText>
                    <strong>{step.label}</strong>
                    <small>{step.done ? 'Feito' : step.desc}</small>
                  </StepText>
                  {!step.done && <Icon size={20} aria-hidden="true" />}
                  {!step.done && <ChevronRight size={18} aria-hidden="true" />}
                </>
              );
              return (
                <StepRow key={step.key}>
                  {step.done ? <StepDone>{inner}</StepDone> : <StepButton type="button" onClick={() => go(step)}>{inner}</StepButton>}
                </StepRow>
              );
            })}
          </Steps>
          <Later type="button" onClick={onDismiss}>Agora não</Later>
        </>
      )}
    </Dialog>
  );
}
