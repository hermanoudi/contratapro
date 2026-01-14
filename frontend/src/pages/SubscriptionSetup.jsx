import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, Check, Shield, X } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';
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

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: var(--primary);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const PriceBox = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;

  .amount {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary);
    margin-bottom: 0.5rem;

    small {
      font-size: 1.5rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      font-size: 2.5rem;

      small {
        font-size: 1.25rem;
      }
    }
  }

  .period {
    font-size: 1rem;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;

  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);

    &:last-child {
      border-bottom: none;
    }

    svg {
      color: #22c55e;
      flex-shrink: 0;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1.25rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: var(--text-secondary);
  border: 2px solid var(--border);
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    transform: none;
    box-shadow: none;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);

  svg {
    color: #22c55e;
  }
`;

export default function SubscriptionSetup() {
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Você precisa estar logado');
            navigate('/login');
            return;
        }

        // Buscar nome do usuário
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserName(data.name);

                    // Verificar se já tem assinatura
                    const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (subRes.ok) {
                        const subData = await subRes.json();
                        if (subData.subscription && subData.subscription.status === 'active') {
                            toast.info('Você já possui uma assinatura ativa');
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

    const handleCreateSubscription = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/subscriptions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                // Redirecionar para checkout HOSPEDADO do Mercado Pago (seguro, PCI compliant)
                window.location.href = data.init_point;
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao criar assinatura');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao conectar com o servidor');
            setLoading(false);
        }
    };

    const handleSkip = () => {
        toast.info('Você pode configurar sua assinatura depois no dashboard');
        navigate('/dashboard');
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
                // Forçar reload da página para atualizar dados do usuário
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

    return (
        <PageContainer>
            <Card>
                <IconWrapper>
                    <CreditCard size={40} />
                </IconWrapper>

                <Title>Ative sua Assinatura</Title>
                <Subtitle>
                    Olá{userName && `, ${userName}`}! Para começar a receber solicitações de clientes, ative sua assinatura mensal.
                </Subtitle>

                <PriceBox>
                    <div className="amount">
                        R$ <span>1</span><small>,00</small>
                    </div>
                    <div className="period">por mês</div>
                </PriceBox>

                <FeaturesList>
                    <li>
                        <Check size={24} />
                        <span>Perfil visível para todos os clientes da plataforma</span>
                    </li>
                    <li>
                        <Check size={24} />
                        <span>Receba solicitações ilimitadas de agendamento</span>
                    </li>
                    <li>
                        <Check size={24} />
                        <span>Gerencie sua agenda e disponibilidade</span>
                    </li>
                    <li>
                        <Check size={24} />
                        <span>Cancele a qualquer momento, sem multas</span>
                    </li>
                </FeaturesList>

                <Button onClick={handleCreateSubscription} disabled={loading}>
                    <CreditCard size={24} />
                    {loading ? 'Carregando...' : 'Ir para Pagamento Seguro'}
                </Button>

                {/* Botão de ativação manual - APENAS DESENVOLVIMENTO */}
                <div style={{
                    margin: '1rem 0',
                    padding: '1rem',
                    background: 'rgba(251, 146, 60, 0.1)',
                    borderRadius: '12px',
                    border: '2px dashed rgba(251, 146, 60, 0.3)'
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        ⚠️ <strong>Modo Desenvolvimento:</strong> Como o sandbox do Mercado Pago tem limitações,
                        use este botão para ativar sua assinatura manualmente
                    </p>
                    <Button
                        onClick={handleActivateManual}
                        disabled={loading}
                        style={{ background: '#f59e0b' }}
                    >
                        <Check size={24} />
                        {loading ? 'Ativando...' : 'Ativar Assinatura (DEV)'}
                    </Button>
                </div>

                <SecondaryButton onClick={handleSkip} disabled={loading}>
                    <X size={20} />
                    Configurar Depois
                </SecondaryButton>

                <SecurityBadge>
                    <Shield size={18} />
                    <span>Pagamento 100% seguro processado pelo Mercado Pago</span>
                </SecurityBadge>
            </Card>
        </PageContainer>
    );
}
