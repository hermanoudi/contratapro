import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Check, AlertCircle, Crown, Star, Zap, X } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  max-width: 1000px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CurrentPlanCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CurrentPlanLabel = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const CurrentPlanName = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const CurrentPlanBadge = styled.span`
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const PlanCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 3px solid ${props => props.$featured ? 'var(--primary)' : props.$current ? '#22c55e' : 'transparent'};
  position: relative;
  transition: all 0.3s;
  opacity: ${props => props.$disabled ? 0.6 : 1};

  ${props => !props.$disabled && `
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
  `}
`;

const PlanBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.$type === 'current' ? '#22c55e' : 'var(--primary)'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PlanIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.$color || 'var(--bg-secondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    color: ${props => props.$iconColor || 'var(--text-secondary)'};
  }
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 1rem;
`;

const PriceValue = styled.span`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const PricePeriod = styled.span`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.95rem;

  svg {
    color: #22c55e;
    flex-shrink: 0;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$variant === 'primary' && `
    background: var(--primary);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    }
  `}

  ${props => props.$variant === 'current' && `
    background: #22c55e;
    color: white;
    cursor: default;
  `}

  ${props => props.$variant === 'downgrade' && `
    background: #f59e0b;
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    }
  `}

  ${props => props.$variant === 'disabled' && `
    background: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: not-allowed;
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Alert = styled.div`
  background: ${props => props.$type === 'warning' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  border: 2px solid ${props => props.$type === 'warning' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: start;
  gap: 0.75rem;
  max-width: 1000px;
  margin: 0 auto 2rem;

  svg {
    color: ${props => props.$type === 'warning' ? '#fb923c' : '#3b82f6'};
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`;

const AlertText = styled.div`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
    transform: rotate(90deg);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'secondary' && `
    background: var(--bg-secondary);
    color: var(--text-primary);
  `}

  ${props => props.$variant === 'primary' && `
    background: var(--primary);
    color: white;
  `}

  ${props => props.$variant === 'warning' && `
    background: #f59e0b;
    color: white;
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ServiceList = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  max-height: 200px;
  overflow-y: auto;
`;

const ServiceItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
  }

  &:last-child {
    margin-bottom: 0;
  }

  input {
    accent-color: var(--primary);
    width: 18px;
    height: 18px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
`;

// Definição dos planos
const PLANS = [
  {
    id: 'trial',
    name: 'Trial',
    slug: 'trial',
    price: 0,
    max_services: 3,
    icon: Zap,
    iconColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    features: [
      '30 dias grátis',
      'Até 3 serviços',
      'Perfil visível para clientes',
      'Receba solicitações',
    ],
    isTrialPlan: true
  },
  {
    id: 'basic',
    name: 'Basic',
    slug: 'basic',
    price: 29.90,
    max_services: 5,
    icon: Star,
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    features: [
      'Até 5 serviços',
      'Perfil visível para clientes',
      'Receba solicitações ilimitadas',
      'Gerencie sua agenda',
      'Sem comissões',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',
    price: 49.90,
    max_services: null,
    icon: Crown,
    iconColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    features: [
      'Serviços ilimitados',
      'Perfil visível para clientes',
      'Receba solicitações ilimitadas',
      'Gerencie sua agenda',
      'Prioridade nas buscas',
      'Sem comissões',
    ],
    featured: true
  }
];

export default function ChangePlan() {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userFeatures, setUserFeatures] = useState(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [excessServices, setExcessServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [pendingPlanChange, setPendingPlanChange] = useState(null);
  const [maxAllowed, setMaxAllowed] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/plans/me/features`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUserFeatures(data);
        setCurrentPlan(data.plan_slug);
      }
    } catch (error) {
      console.error('Erro ao buscar plano atual:', error);
      toast.error('Erro ao carregar dados do plano');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (newPlanSlug) => {
    if (newPlanSlug === currentPlan) return;

    setChangingPlan(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/subscriptions/change-plan/${newPlanSlug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        if (data.success === false && data.error === 'services_exceeded') {
          // Precisa remover serviços antes de fazer downgrade
          setExcessServices(data.current_services);
          setMaxAllowed(data.max_allowed);
          setPendingPlanChange(newPlanSlug);
          setSelectedServices(data.current_services.slice(0, data.max_allowed).map(s => s.id));
          setShowServiceModal(true);
        } else if (data.init_point) {
          // Plano pago - redirecionar para checkout
          toast.success('Redirecionando para pagamento...');
          window.location.href = data.init_point;
        } else if (data.success) {
          // Mudança bem sucedida (trial ou plano grátis)
          toast.success(data.message);
          navigate('/minha-assinatura');
        }
      } else {
        toast.error(data.detail || 'Erro ao alterar plano');
      }
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast.error('Erro ao processar alteração');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else if (prev.length < maxAllowed) {
        return [...prev, serviceId];
      }
      return prev;
    });
  };

  const handleConfirmServiceRemoval = async () => {
    if (selectedServices.length !== maxAllowed) {
      toast.error(`Selecione exatamente ${maxAllowed} serviço(s) para manter`);
      return;
    }

    setChangingPlan(true);
    try {
      const token = localStorage.getItem('token');

      // Primeiro remove os serviços excedentes
      const removeRes = await fetch(`${API_URL}/plans/me/remove-excess-services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keep_service_ids: selectedServices })
      });

      if (!removeRes.ok) {
        const error = await removeRes.json();
        toast.error(error.detail || 'Erro ao remover serviços');
        return;
      }

      // Agora tenta mudar o plano novamente
      setShowServiceModal(false);
      await handleChangePlan(pendingPlanChange);

    } catch (error) {
      console.error('Erro ao remover serviços:', error);
      toast.error('Erro ao processar remoção de serviços');
    } finally {
      setChangingPlan(false);
    }
  };

  const getButtonConfig = (plan) => {
    const isCurrentPlan = plan.slug === currentPlan;
    const currentPlanData = PLANS.find(p => p.slug === currentPlan);
    const isUpgrade = currentPlanData && plan.price > currentPlanData.price;
    const isDowngrade = currentPlanData && plan.price < currentPlanData.price;
    const isTrialToTrial = plan.slug === 'trial' && currentPlan === 'trial';
    const isPaidToTrial = plan.slug === 'trial' && currentPlanData && currentPlanData.price > 0;

    if (isCurrentPlan) {
      return { variant: 'current', text: 'Plano Atual', disabled: true };
    }

    if (isPaidToTrial) {
      return { variant: 'disabled', text: 'Indisponível', disabled: true };
    }

    if (isUpgrade) {
      return { variant: 'primary', text: 'Fazer Upgrade', disabled: false };
    }

    if (isDowngrade) {
      return { variant: 'downgrade', text: 'Fazer Downgrade', disabled: false };
    }

    return { variant: 'primary', text: 'Selecionar', disabled: false };
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner>Carregando planos...</LoadingSpinner>
      </PageContainer>
    );
  }

  const currentPlanData = PLANS.find(p => p.slug === currentPlan);

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/minha-assinatura')}>
          <ArrowLeft size={24} />
        </BackButton>
        <Title>Alterar Plano</Title>
      </Header>

      {currentPlanData && (
        <CurrentPlanCard>
          <CurrentPlanLabel>Seu plano atual:</CurrentPlanLabel>
          <CurrentPlanName>{currentPlanData.name}</CurrentPlanName>
          <CurrentPlanBadge>
            {currentPlanData.price === 0
              ? 'Grátis'
              : `R$ ${currentPlanData.price.toFixed(2).replace('.', ',')}/mês`}
          </CurrentPlanBadge>
        </CurrentPlanCard>
      )}

      {currentPlanData && currentPlanData.price > 0 && (
        <Alert $type="info">
          <AlertCircle size={24} />
          <AlertText>
            <strong>Importante:</strong> Ao mudar de plano, sua assinatura atual será cancelada e uma nova será criada.
            Você precisará completar o pagamento do novo plano.
          </AlertText>
        </Alert>
      )}

      <PlansGrid>
        {PLANS.map((plan) => {
          const PlanIcon_ = plan.icon;
          const buttonConfig = getButtonConfig(plan);
          const isCurrentPlan = plan.slug === currentPlan;

          return (
            <PlanCard
              key={plan.id}
              $featured={plan.featured}
              $current={isCurrentPlan}
              $disabled={buttonConfig.disabled && !isCurrentPlan}
            >
              {plan.featured && !isCurrentPlan && (
                <PlanBadge>
                  <Crown size={14} />
                  Mais Popular
                </PlanBadge>
              )}
              {isCurrentPlan && (
                <PlanBadge $type="current">
                  <Check size={14} />
                  Atual
                </PlanBadge>
              )}

              <PlanIcon $color={plan.bgColor} $iconColor={plan.iconColor}>
                <PlanIcon_ size={28} />
              </PlanIcon>

              <PlanName>{plan.name}</PlanName>

              <PlanPrice>
                {plan.price === 0 ? (
                  <PriceValue>Grátis</PriceValue>
                ) : (
                  <>
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>R$</span>
                    <PriceValue>{plan.price.toFixed(2).replace('.', ',')}</PriceValue>
                    <PricePeriod>/mês</PricePeriod>
                  </>
                )}
              </PlanPrice>

              <FeatureList>
                {plan.features.map((feature, index) => (
                  <Feature key={index}>
                    <Check size={18} />
                    {feature}
                  </Feature>
                ))}
              </FeatureList>

              <ActionButton
                $variant={buttonConfig.variant}
                disabled={buttonConfig.disabled || changingPlan}
                onClick={() => !buttonConfig.disabled && handleChangePlan(plan.slug)}
              >
                {changingPlan ? 'Processando...' : buttonConfig.text}
              </ActionButton>

              {plan.slug === 'trial' && currentPlanData && currentPlanData.price > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  Apenas administradores podem reverter para Trial
                </div>
              )}
            </PlanCard>
          );
        })}
      </PlansGrid>

      {/* Modal para remoção de serviços */}
      {showServiceModal && (
        <Modal onClick={() => !changingPlan && setShowServiceModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Selecione os serviços</ModalTitle>
              <CloseButton onClick={() => setShowServiceModal(false)} disabled={changingPlan}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <Alert $type="warning">
              <AlertCircle size={20} />
              <AlertText>
                O novo plano permite apenas <strong>{maxAllowed} serviço(s)</strong>.
                Selecione quais deseja manter. Os demais serão removidos.
              </AlertText>
            </Alert>

            <ServiceList>
              {excessServices.map((service) => (
                <ServiceItem key={service.id}>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceSelection(service.id)}
                    disabled={changingPlan}
                  />
                  <span>{service.title}</span>
                </ServiceItem>
              ))}
            </ServiceList>

            <div style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>
              Selecionados: {selectedServices.length} / {maxAllowed}
            </div>

            <ModalActions>
              <Button
                $variant="secondary"
                onClick={() => setShowServiceModal(false)}
                disabled={changingPlan}
              >
                Cancelar
              </Button>
              <Button
                $variant="warning"
                onClick={handleConfirmServiceRemoval}
                disabled={changingPlan || selectedServices.length !== maxAllowed}
              >
                {changingPlan ? 'Processando...' : 'Confirmar e Continuar'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}
