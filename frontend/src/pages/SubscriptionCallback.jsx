import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { toast } from 'sonner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  background: ${props => {
        if (props.$status === 'success') return 'rgba(34, 197, 94, 0.1)';
        if (props.$status === 'error') return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(251, 146, 60, 0.1)';
    }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: ${props => {
        if (props.$status === 'success') return '#22c55e';
        if (props.$status === 'error') return '#ef4444';
        return '#fb923c';
    }};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled.button`
  padding: 1.25rem 2rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
  }
`;

const Info = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;

  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    color: var(--text-secondary);

    strong {
      color: var(--text-primary);
    }
  }
`;

export default function SubscriptionCallback() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error, pending
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Sessão expirada. Faça login novamente.');
            navigate('/login');
            return;
        }

        // Parâmetros do Mercado Pago
        const collection_status = searchParams.get('collection_status');
        const status_param = searchParams.get('status');

        // Determinar status baseado nos parâmetros
        if (collection_status === 'approved' || status_param === 'approved') {
            setStatus('success');
            setMessage('Pagamento aprovado! Sua assinatura está sendo ativada. Aguarde alguns instantes...');
            toast.success('Pagamento aprovado!');

            // Verificar status várias vezes até confirmar ativação
            let attempts = 0;
            const maxAttempts = 10;
            const checkInterval = setInterval(async () => {
                attempts++;
                const isActive = await checkSubscriptionStatus(token);

                if (isActive || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    if (isActive) {
                        setMessage('Sua assinatura foi ativada com sucesso! Você já pode começar a receber solicitações de clientes.');
                        toast.success('Assinatura ativada!');
                    } else {
                        setMessage('Pagamento aprovado! Sua assinatura será ativada em breve (até 48h).');
                    }
                }
            }, 2000); // Verifica a cada 2 segundos

        } else if (collection_status === 'pending' || status_param === 'pending') {
            setStatus('pending');
            setMessage('Seu pagamento está em análise. Você receberá uma confirmação em breve.');
            toast.info('Pagamento em análise');
        } else if (collection_status === 'rejected' || status_param === 'rejected') {
            setStatus('error');
            setMessage('Seu pagamento foi rejeitado. Verifique os dados do cartão e tente novamente.');
            toast.error('Pagamento rejeitado');
        } else {
            setStatus('error');
            setMessage('Houve um problema ao processar seu pagamento. Tente novamente ou entre em contato com o suporte.');
            toast.error('Erro ao processar pagamento');
        }
    }, [searchParams, navigate]);

    const checkSubscriptionStatus = async (token) => {
        try {
            const res = await fetch('/api/subscriptions/my-subscription', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Status da assinatura:', data);

                // Retorna true se a assinatura está ativa
                if (data.subscription && data.subscription.status === 'active') {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return false;
        }
    };

    const handleContinue = () => {
        navigate('/dashboard');
    };

    const getIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle size={60} />;
            case 'error':
                return <XCircle size={60} />;
            case 'pending':
                return <Clock size={60} />;
            default:
                return <Loader size={60} className="spin" />;
        }
    };

    const getTitle = () => {
        switch (status) {
            case 'success':
                return 'Assinatura Ativada!';
            case 'error':
                return 'Ops! Algo deu errado';
            case 'pending':
                return 'Pagamento em Análise';
            default:
                return 'Processando...';
        }
    };

    if (status === 'loading') {
        return (
            <PageContainer>
                <Card>
                    <IconWrapper $status="loading">
                        <Loader size={60} style={{ animation: 'spin 1s linear infinite' }} />
                    </IconWrapper>
                    <Title>Processando...</Title>
                    <Message>Aguarde enquanto confirmamos seu pagamento.</Message>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Card>
                <IconWrapper $status={status}>
                    {getIcon()}
                </IconWrapper>

                <Title>{getTitle()}</Title>
                <Message>{message}</Message>

                {status === 'success' && (
                    <Info>
                        <p><strong>Próximos passos:</strong></p>
                        <p>• Configure seu perfil e adicione seus serviços</p>
                        <p>• Defina sua disponibilidade de horários</p>
                        <p>• Comece a receber solicitações de clientes</p>
                    </Info>
                )}

                {status === 'pending' && (
                    <Info>
                        <p><strong>O que acontece agora?</strong></p>
                        <p>• Seu pagamento está sendo processado</p>
                        <p>• Você receberá um email de confirmação</p>
                        <p>• Isso pode levar até 48 horas</p>
                    </Info>
                )}

                {status === 'error' && (
                    <Info>
                        <p><strong>O que fazer?</strong></p>
                        <p>• Verifique os dados do seu cartão</p>
                        <p>• Tente novamente com outro método de pagamento</p>
                        <p>• Entre em contato com o suporte se o problema persistir</p>
                    </Info>
                )}

                <Button onClick={handleContinue}>
                    {status === 'error' ? 'Tentar Novamente' : 'Ir para Dashboard'}
                </Button>
            </Card>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </PageContainer>
    );
}
