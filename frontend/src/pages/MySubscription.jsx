import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, Calendar, DollarSign, AlertCircle, X, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';

// Motivos de cancelamento para analytics
const CANCELLATION_REASONS = [
  { id: 'not_using', label: 'Não estou usando a plataforma', description: 'Poucos clientes ou sem tempo para atender' },
  { id: 'too_expensive', label: 'Valor muito alto', description: 'O custo não compensa o retorno' },
  { id: 'found_alternative', label: 'Encontrei outra plataforma', description: 'Estou usando outro serviço similar' },
  { id: 'technical_issues', label: 'Problemas técnicos', description: 'Dificuldades com o sistema ou pagamento' },
  { id: 'temporary_pause', label: 'Pausa temporária', description: 'Pretendo voltar no futuro' },
  { id: 'closing_business', label: 'Encerrando atividades', description: 'Não vou mais prestar serviços' },
  { id: 'payment_issue', label: 'Problema no pagamento', description: 'Pagamento não foi processado corretamente' },
  { id: 'other', label: 'Outro motivo', description: 'Prefiro informar manualmente' }
];
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  max-width: 800px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
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

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  background: ${props => {
    if (props.$status === 'active') return 'rgba(34, 197, 94, 0.1)';
    if (props.$status === 'pending') return 'rgba(251, 146, 60, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  }};
  color: ${props => {
    if (props.$status === 'active') return '#22c55e';
    if (props.$status === 'pending') return '#fb923c';
    return '#ef4444';
  }};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
  }
`;

const InfoCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  svg {
    color: var(--primary);
    margin-bottom: 0.5rem;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
`;

const InfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const Section = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border-color);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.$variant === 'danger' ? '#ef4444' : 'var(--primary)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Alert = styled.div`
  background: rgba(251, 146, 60, 0.1);
  border: 2px solid rgba(251, 146, 60, 0.3);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  svg {
    color: #fb923c;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`;

const AlertText = styled.div`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
`;

const ReasonOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => props.$selected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)'};
  border: 2px solid ${props => props.$selected ? 'var(--primary)' : 'transparent'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$selected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0, 0, 0, 0.04)'};
  }

  input {
    margin-top: 0.25rem;
    accent-color: var(--primary);
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const ReasonContent = styled.div`
  flex: 1;
`;

const ReasonLabel = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const ReasonDescription = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
`;

export default function MySubscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [cancelReasonText, setCancelReasonText] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [userPlan, setUserPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubscription();
        fetchUserPlan();
    }, []);

    const fetchSubscription = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/subscriptions/my-subscription`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setSubscription(data.subscription);
            } else if (res.status === 404) {
                toast.error('Você não possui uma assinatura');
            } else {
                toast.error('Erro ao carregar assinatura');
            }
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/plans/me/features`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUserPlan(data);
            }
        } catch (error) {
            // Erro silencioso - usuário pode não ter plano
        }
    };

    const handleCancelSubscription = async () => {
        if (!selectedReason) {
            toast.error('Por favor, selecione o motivo do cancelamento');
            return;
        }

        if (selectedReason === 'other' && !cancelReasonText.trim()) {
            toast.error('Por favor, descreva o motivo do cancelamento');
            return;
        }

        // Montar o motivo completo para enviar
        const reasonObj = CANCELLATION_REASONS.find(r => r.id === selectedReason);
        const fullReason = selectedReason === 'other'
            ? `Outro: ${cancelReasonText}`
            : `${reasonObj.label}: ${reasonObj.description}`;

        setCancelling(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/subscriptions/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reason: fullReason,
                    reason_code: selectedReason  // Código para analytics
                })
            });

            if (res.ok) {
                toast.success('Assinatura cancelada com sucesso');
                setShowCancelModal(false);
                setSelectedReason('');
                setCancelReasonText('');
                fetchSubscription(); // Atualizar dados
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao cancelar assinatura');
            }
        } catch (error) {
            console.error('Erro ao cancelar assinatura:', error);
            toast.error('Erro ao processar cancelamento');
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Não definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusText = (status) => {
        const statusMap = {
            'active': 'Ativa',
            'pending': 'Pendente',
            'cancelled': 'Cancelada',
            'inactive': 'Inativa'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingSpinner>Carregando dados da assinatura...</LoadingSpinner>
            </PageContainer>
        );
    }

    // Se for Trial, mostrar como ativo sem exigir pagamento
    const isTrial = userPlan?.plan_slug === 'trial';

    if (!subscription && !isTrial) {
        return (
            <PageContainer>
                <Header>
                    <BackButton onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={24} />
                    </BackButton>
                    <Title>Minha Assinatura</Title>
                </Header>
                <Card>
                    <Alert>
                        <AlertCircle size={24} />
                        <AlertText>
                            Você ainda não possui uma assinatura ativa. Para começar a receber solicitações de clientes,
                            você precisa ativar sua assinatura profissional.
                        </AlertText>
                    </Alert>
                    <Button onClick={() => navigate('/subscription/setup')}>
                        Ativar Assinatura
                    </Button>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <BackButton onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} />
                </BackButton>
                <Title>Minha Assinatura</Title>
            </Header>

            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                            {userPlan?.plan_name || 'Plano Profissional Mensal'}
                        </h2>
                        <StatusBadge $status={isTrial ? 'active' : subscription.status}>
                            <CheckCircle size={20} />
                            {isTrial ? 'Ativa (Trial)' : getStatusText(subscription.status)}
                        </StatusBadge>
                    </div>
                </div>

                {/* Para Trial: Mostrar info de trial */}
                {isTrial && (
                    <>
                        <InfoGrid>
                            <InfoCard>
                                <DollarSign size={24} />
                                <InfoLabel>Valor Mensal</InfoLabel>
                                <InfoValue>GRÁTIS</InfoValue>
                            </InfoCard>

                            <InfoCard>
                                <Calendar size={24} />
                                <InfoLabel>Dias Restantes</InfoLabel>
                                <InfoValue style={{ fontSize: '1.5rem', fontWeight: 'bold', color: userPlan?.trial_days_left < 7 ? '#ef4444' : '#10b981' }}>
                                    {userPlan?.trial_days_left !== null ? `${userPlan.trial_days_left} dias` : '30 dias'}
                                </InfoValue>
                            </InfoCard>

                            <InfoCard>
                                <Calendar size={24} />
                                <InfoLabel>Vencimento</InfoLabel>
                                <InfoValue style={{ fontSize: '1.125rem' }}>
                                    {userPlan?.trial_ends_at ? formatDate(userPlan.trial_ends_at) : 'Não definido'}
                                </InfoValue>
                            </InfoCard>
                        </InfoGrid>

                        {userPlan?.trial_days_left < 7 && !userPlan?.trial_expired && (
                            <Alert style={{ background: '#fef3c7', border: '1px solid #f59e0b', marginTop: '1.5rem' }}>
                                <AlertCircle size={24} color="#f59e0b" />
                                <AlertText style={{ color: '#92400e' }}>
                                    <strong>Seu trial está acabando!</strong> Restam apenas {userPlan.trial_days_left} dias.
                                    Considere fazer upgrade para continuar aproveitando todos os benefícios.
                                </AlertText>
                            </Alert>
                        )}

                        {userPlan?.trial_expired && (
                            <Alert style={{ background: '#fee2e2', border: '1px solid #ef4444', marginTop: '1.5rem' }}>
                                <AlertCircle size={24} color="#ef4444" />
                                <AlertText style={{ color: '#991b1b' }}>
                                    <strong>Seu trial expirou!</strong> Faça upgrade para um plano pago para continuar
                                    recebendo solicitações de clientes.
                                </AlertText>
                            </Alert>
                        )}
                    </>
                )}

                {/* Para planos pagos: Mostrar info de pagamento */}
                {!isTrial && subscription && (
                    <InfoGrid>
                        <InfoCard>
                            <DollarSign size={24} />
                            <InfoLabel>Valor Mensal</InfoLabel>
                            <InfoValue>{formatCurrency(subscription.plan_amount)}</InfoValue>
                        </InfoCard>

                        <InfoCard>
                            <Calendar size={24} />
                            <InfoLabel>Próxima Cobrança</InfoLabel>
                            <InfoValue style={{ fontSize: '1.125rem' }}>
                                {formatDate(subscription.next_billing_date)}
                            </InfoValue>
                        </InfoCard>

                        <InfoCard>
                            <CreditCard size={24} />
                            <InfoLabel>Último Pagamento</InfoLabel>
                            <InfoValue style={{ fontSize: '1.125rem' }}>
                                {formatDate(subscription.last_payment_date)}
                            </InfoValue>
                        </InfoCard>
                    </InfoGrid>
                )}

                {/* Benefícios do Plano - Para todos */}
                {userPlan && (
                    <Section>
                        <SectionTitle>Benefícios do Plano</SectionTitle>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem' }}>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                <li style={{ marginBottom: '0.5rem' }}>✓ Perfil visível para todos os clientes</li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    ✓ {userPlan.features.max_services
                                        ? `Máximo ${userPlan.features.max_services} serviço cadastrado`
                                        : 'Receba solicitações ilimitadas de serviços'}
                                </li>
                                {userPlan.features.can_manage_schedule && (
                                    <li style={{ marginBottom: '0.5rem' }}>✓ Gerencie sua agenda e disponibilidade</li>
                                )}
                                {userPlan.features.can_receive_bookings && (
                                    <li style={{ marginBottom: '0.5rem' }}>✓ Receba agendamentos automáticos</li>
                                )}
                                {userPlan.features.priority_in_search > 0 && (
                                    <li style={{ marginBottom: '0.5rem' }}>✓ ⭐ Prioridade na busca</li>
                                )}
                                <li>✓ Sem comissões por serviço realizado</li>
                            </ul>
                        </div>
                    </Section>
                )}

                {/* Gerenciar Assinatura - Para planos pagos ativos ou pendentes */}
                {!isTrial && subscription && ['active', 'pending'].includes(subscription.status) && (
                    <Section>
                        <SectionTitle>Gerenciar Assinatura</SectionTitle>
                        {subscription.status === 'pending' ? (
                            <Alert style={{ background: 'rgba(251, 146, 60, 0.1)', border: '2px solid rgba(251, 146, 60, 0.3)' }}>
                                <AlertCircle size={24} />
                                <AlertText>
                                    <strong>Pagamento pendente:</strong> Sua assinatura ainda não foi ativada.
                                    Se você teve problemas no pagamento ou deseja escolher outro plano,
                                    você pode cancelar esta assinatura e iniciar uma nova.
                                </AlertText>
                            </Alert>
                        ) : (
                            <Alert>
                                <AlertCircle size={24} />
                                <AlertText>
                                    <strong>Atenção:</strong> Ao cancelar sua assinatura, você não aparecerá mais nas buscas
                                    e não poderá receber novas solicitações de clientes. A cobrança recorrente será interrompida
                                    imediatamente no Mercado Pago.
                                </AlertText>
                            </Alert>
                        )}
                        <Button $variant="danger" onClick={() => setShowCancelModal(true)}>
                            <XCircle size={20} />
                            {subscription.status === 'pending' ? 'Cancelar' : 'Cancelar Assinatura'}
                        </Button>
                    </Section>
                )}

                {/* Botão de upgrade para Trial */}
                {isTrial && (
                    <Section>
                        <SectionTitle>Fazer Upgrade</SectionTitle>
                        <Alert style={{ background: '#dbeafe', border: '1px solid #3b82f6' }}>
                            <AlertCircle size={24} color="#3b82f6" />
                            <AlertText style={{ color: '#1e40af' }}>
                                Faça upgrade para um plano pago e desbloqueie todos os recursos sem limite de tempo!
                            </AlertText>
                        </Alert>
                        <Button onClick={() => navigate('/subscription/setup')} style={{ background: '#10b981' }}>
                            Ver Planos e Fazer Upgrade
                        </Button>
                    </Section>
                )}

                {!isTrial && subscription?.status === 'cancelled' && subscription.cancelled_at && (
                    <Section>
                        <Alert>
                            <AlertCircle size={24} />
                            <AlertText>
                                <strong>Assinatura cancelada em:</strong> {formatDate(subscription.cancelled_at)}
                                <br />
                                {subscription.cancellation_reason && (
                                    <>
                                        <strong>Motivo:</strong> {subscription.cancellation_reason}
                                    </>
                                )}
                            </AlertText>
                        </Alert>
                        <Button onClick={() => navigate('/subscription/setup')}>
                            Reativar Assinatura
                        </Button>
                    </Section>
                )}
            </Card>

            {/* Modal de Cancelamento */}
            {showCancelModal && (
                <Modal onClick={() => !cancelling && setShowCancelModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Cancelar Assinatura</ModalTitle>
                            <CloseButton onClick={() => {
                                setShowCancelModal(false);
                                setSelectedReason('');
                                setCancelReasonText('');
                            }} disabled={cancelling}>
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>

                        {subscription?.status === 'pending' ? (
                            <Alert style={{ background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                                <AlertCircle size={20} color="#3b82f6" />
                                <AlertText style={{ color: '#1e40af' }}>
                                    Ao cancelar, você poderá escolher um novo plano ou tentar o pagamento novamente.
                                </AlertText>
                            </Alert>
                        ) : (
                            <Alert>
                                <AlertCircle size={20} />
                                <AlertText>
                                    Sentiremos sua falta! Seu perfil será removido das buscas e você não receberá mais
                                    solicitações de clientes.
                                </AlertText>
                            </Alert>
                        )}

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem'
                            }}>
                                Por que você está cancelando? *
                            </label>
                            <ReasonList>
                                {CANCELLATION_REASONS.map((reason) => (
                                    <ReasonOption
                                        key={reason.id}
                                        $selected={selectedReason === reason.id}
                                    >
                                        <input
                                            type="radio"
                                            name="cancelReason"
                                            value={reason.id}
                                            checked={selectedReason === reason.id}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            disabled={cancelling}
                                        />
                                        <ReasonContent>
                                            <ReasonLabel>{reason.label}</ReasonLabel>
                                            <ReasonDescription>{reason.description}</ReasonDescription>
                                        </ReasonContent>
                                    </ReasonOption>
                                ))}
                            </ReasonList>

                            {selectedReason === 'other' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem'
                                    }}>
                                        Conte-nos mais sobre o motivo *
                                    </label>
                                    <TextArea
                                        value={cancelReasonText}
                                        onChange={(e) => setCancelReasonText(e.target.value)}
                                        placeholder="Seu feedback é muito importante para melhorarmos nossos serviços..."
                                        disabled={cancelling}
                                        style={{ minHeight: '80px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <ModalActions>
                            <Button
                                style={{ flex: 1, background: 'var(--border-color)', color: 'var(--text-primary)' }}
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedReason('');
                                    setCancelReasonText('');
                                }}
                                disabled={cancelling}
                            >
                                {subscription?.status === 'pending' ? 'Voltar' : 'Manter Assinatura'}
                            </Button>
                            <Button
                                style={{ flex: 1 }}
                                $variant="danger"
                                onClick={handleCancelSubscription}
                                disabled={cancelling || !selectedReason}
                            >
                                {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                            </Button>
                        </ModalActions>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
}
