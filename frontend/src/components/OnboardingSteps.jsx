import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Clock, CheckCircle } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 1rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--bg-secondary);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover { background: var(--border); color: var(--text-primary); }
`;

const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: 900;
  margin-bottom: 0.375rem;
  color: var(--text-primary);
  padding-right: 2rem;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.$done ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'};
  background: ${props => props.$done ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'};
  cursor: ${props => props.$done ? 'default' : 'pointer'};
  transition: all 0.2s;

  &:hover:not([data-done="true"]) {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.04);
  }
`;

const StepIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$done ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { color: ${props => props.$done ? '#10b981' : 'var(--primary)'}; }
`;

const StepText = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${props => props.$done ? '#059669' : 'var(--text-primary)'};
`;

const StepDesc = styled.div`
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DismissBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
  padding: 0.5rem;

  &:hover { color: var(--text-primary); }
`;

const Congrats = styled.div`
  text-align: center;
  padding: 1rem 0;

  svg { color: #10b981; margin-bottom: 0.75rem; }
  h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; }
  p { color: var(--text-secondary); font-size: 0.9rem; }
`;

function getSteps(user, services, workingHours) {
  return [
    {
      key: 'profile',
      label: 'Completar perfil',
      desc: 'Adicione foto, descrição e localização',
      icon: User,
      done: !!(user?.profile_picture && user?.description && user?.city),
      tab: null,
    },
    {
      key: 'services',
      label: 'Cadastrar serviços',
      desc: 'Adicione os serviços que você oferece',
      icon: Briefcase,
      done: (services?.length || 0) > 0,
      tab: 'services',
    },
    {
      key: 'schedule',
      label: 'Definir disponibilidade',
      desc: 'Configure seus horários de atendimento',
      icon: Clock,
      done: (workingHours?.length || 0) > 0,
      tab: 'schedule',
    },
  ];
}

export default function OnboardingSteps({ user, services, workingHours, onDismiss }) {
  const navigate = useNavigate();
  const steps = getSteps(user, services, workingHours);
  const allDone = steps.every(s => s.done);
  const [showCongrats, setShowCongrats] = useState(false);

  if (allDone && !showCongrats) {
    setShowCongrats(true);
    setTimeout(onDismiss, 3000);
  }

  const handleStepClick = (step) => {
    if (!step.done && step.tab) navigate(`/dashboard?tab=${step.tab}`);
    onDismiss();
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <Card
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <CloseBtn onClick={onDismiss}><X size={16} /></CloseBtn>

          {showCongrats ? (
            <Congrats>
              <CheckCircle size={48} />
              <h3>Perfil completo! 🎉</h3>
              <p>Você está pronto para receber clientes na plataforma.</p>
            </Congrats>
          ) : (
            <>
              <Title>Boas-vindas ao ContrataPro!</Title>
              <Subtitle>Complete estes 3 passos para começar a receber clientes.</Subtitle>

              <Steps>
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <Step
                      key={step.key}
                      $done={step.done}
                      data-done={step.done}
                      onClick={() => !step.done && handleStepClick(step)}
                    >
                      <StepIcon $done={step.done}>
                        <Icon size={18} />
                      </StepIcon>
                      <StepText>
                        <StepTitle $done={step.done}>
                          {i + 1}. {step.label}
                          {step.done && ' ✓'}
                        </StepTitle>
                        <StepDesc>{step.desc}</StepDesc>
                      </StepText>
                    </Step>
                  );
                })}
              </Steps>

              <Footer>
                <DismissBtn onClick={onDismiss}>Agora não</DismissBtn>
              </Footer>
            </>
          )}
        </Card>
      </Overlay>
    </AnimatePresence>
  );
}
