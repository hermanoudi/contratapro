import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, Check, Shield, X, Star, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';

// Detectar ambiente de desenvolvimento
const isDev = import.meta.env.DEV;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  width: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto 2rem;
  }
`;

const PlanCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid ${props => props.$featured ? 'var(--primary)' : 'var(--border)'};
  position: relative;
  transition: all 0.3s;

  ${props => props.$featured && `
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.2);

    @media (max-width: 900px) {
      transform: none;
      order: -1;
    }
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const PlanIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: ${props => props.$color || 'rgba(99, 102, 241, 0.1)'};
  color: ${props => props.$iconColor || 'var(--primary)'};
`;

const PlanName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  margin-bottom: 1.5rem;

  .amount {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);

    small {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
  }

  .period {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .trial-info {
    font-size: 0.875rem;
    color: #10b981;
    font-weight: 600;
  }
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    color: var(--text-secondary);

    svg {
      color: #10b981;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

const PlanButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$featured ? `
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    border: none;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    }
  ` : `
    background: white;
    color: var(--text-primary);
    border: 2px solid var(--border);

    &:hover:not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DevModeBox = styled.div`
  margin: 2rem auto;
  padding: 1.5rem;
  max-width: 500px;
  background: rgba(251, 146, 60, 0.1);
  border-radius: 16px;
  border: 2px dashed rgba(251, 146, 60, 0.3);
  text-align: center;
`;

const DevModeText = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;

  strong {
    color: #f59e0b;
  }
`;

const DevButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #d97706;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  display: block;
  margin: 1.5rem auto 0;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: var(--text-primary);
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;

  svg {
    color: #22c55e;
  }
`;

// Definicao dos planos
const PLANS = [
  {
    id: 'trial',
    name: 'Trial',
    price: 0,
    period: '30 dias gratis',
    icon: Star,
    iconColor: '#10b981',
    iconBg: 'rgba(16, 185, 129, 0.1)',
    features: [
      'Cadastre ate 3 servicos',
      'Perfil visivel na plataforma',
      'Receba solicitacoes de agendamento',
      'Gerencie sua agenda',
      'Sem compromisso'
    ],
    buttonText: 'Comecar Gratis',
    featured: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29.90,
    period: 'por mes',
    icon: Zap,
    iconColor: 'var(--primary)',
    iconBg: 'rgba(99, 102, 241, 0.1)',
    features: [
      'Cadastre ate 5 servicos',
      'Perfil destacado na busca',
      'Solicitacoes ilimitadas',
      'Estatisticas basicas',
      'Suporte por email'
    ],
    buttonText: 'Assinar Basic',
    featured: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.90,
    period: 'por mes',
    icon: Crown,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245, 158, 11, 0.1)',
    features: [
      'Servicos ilimitados',
      'Perfil em destaque maximo',
      'Badge de profissional Premium',
      'Estatisticas avancadas',
      'Suporte prioritario'
    ],
    buttonText: 'Assinar Premium',
    featured: false
  }
];

export default function SubscriptionSetup() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Voce precisa estar logado');
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name);

          // Verificar se ja tem assinatura ativa
          const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (subRes.ok) {
            const subData = await subRes.json();
            if (subData.subscription && subData.subscription.status === 'active') {
              toast.info('Voce ja possui uma assinatura ativa');
              navigate('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan.id);
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Usar endpoint unificado /subscribe/{plan_slug}
      const res = await fetch(`${API_URL}/subscriptions/subscribe/${plan.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();

        if (plan.id === 'trial') {
          // Trial ativado - redirecionar para dashboard
          toast.success(data.message || 'Trial ativado com sucesso!');
          navigate('/dashboard');
        } else {
          // Planos pagos - redirecionar para checkout do Mercado Pago
          if (data.init_point) {
            window.location.href = data.init_point;
          } else {
            toast.success(data.message);
            navigate('/dashboard');
          }
        }
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Erro ao processar assinatura');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleActivateManual = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/subscriptions/activate-manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        window.location.href = '/dashboard';
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Erro ao ativar assinatura');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('Voce pode configurar sua assinatura depois no dashboard');
    navigate('/dashboard');
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Escolha seu Plano</Title>
          <Subtitle>
            Ola{userName && `, ${userName}`}! Escolha o plano ideal para comecar a
            receber clientes e expandir seus servicos.
          </Subtitle>
        </Header>

        <PlansGrid>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} $featured={plan.featured}>
              {plan.featured && <PopularBadge>Mais Popular</PopularBadge>}

              <PlanIcon $color={plan.iconBg} $iconColor={plan.iconColor}>
                <plan.icon size={28} />
              </PlanIcon>

              <PlanName>{plan.name}</PlanName>

              <PlanPrice>
                <div className="amount">
                  {plan.price === 0 ? (
                    <>Gratis</>
                  ) : (
                    <>
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </>
                  )}
                </div>
                <div className="period">{plan.period}</div>
                {plan.id === 'trial' && (
                  <div className="trial-info">Sem cartao de credito</div>
                )}
              </PlanPrice>

              <PlanFeatures>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </PlanFeatures>

              <PlanButton
                $featured={plan.featured}
                onClick={() => handleSelectPlan(plan)}
                disabled={loading}
              >
                {loading && selectedPlan === plan.id ? (
                  'Processando...'
                ) : (
                  <>
                    {plan.id !== 'trial' && <CreditCard size={18} />}
                    {plan.buttonText}
                  </>
                )}
              </PlanButton>
            </PlanCard>
          ))}
        </PlansGrid>

        {/* Botao de ativacao manual - APENAS DESENVOLVIMENTO */}
        {isDev && (
          <DevModeBox>
            <DevModeText>
              <strong>Modo Desenvolvimento:</strong> Como o sandbox do Mercado Pago
              tem limitacoes, use este botao para ativar sua assinatura manualmente.
            </DevModeText>
            <DevButton onClick={handleActivateManual} disabled={loading}>
              <Check size={20} />
              {loading ? 'Ativando...' : 'Ativar Assinatura (DEV)'}
            </DevButton>
          </DevModeBox>
        )}

        <SkipButton onClick={handleSkip} disabled={loading}>
          <X size={18} />
          Configurar depois
        </SkipButton>

        <SecurityBadge>
          <Shield size={18} />
          <span>Pagamento 100% seguro processado pelo Mercado Pago</span>
        </SecurityBadge>
      </Container>
    </PageContainer>
  );
}
