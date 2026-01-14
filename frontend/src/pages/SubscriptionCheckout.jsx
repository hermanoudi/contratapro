import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, Lock, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1rem;

  &:hover {
    color: var(--primary);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SubmitButton = styled.button`
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
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SummaryCard = styled(Card)`
  height: fit-content;
`;

const PlanName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const PriceDisplay = styled.div`
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  text-align: center;

  .amount {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary);
    margin-bottom: 0.25rem;

    small {
      font-size: 1.25rem;
    }
  }

  .period {
    color: var(--text-secondary);
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;

    svg {
      color: #22c55e;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 1.5rem;

  svg {
    color: #22c55e;
    flex-shrink: 0;
  }
`;

export default function SubscriptionCheckout() {
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardholderName: '',
        expirationMonth: '',
        expirationYear: '',
        securityCode: '',
        identificationType: 'CPF',
        identificationNumber: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Você precisa estar logado');
            navigate('/login');
            return;
        }

        // Carregar SDK do Mercado Pago
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [navigate]);

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        // Formatar número do cartão
        if (name === 'cardNumber') {
            value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            value = value.substring(0, 19); // Máximo 16 dígitos + 3 espaços
        }

        // Formatar CVV
        if (name === 'securityCode') {
            value = value.replace(/\D/g, '').substring(0, 4);
        }

        // Formatar mês
        if (name === 'expirationMonth') {
            value = value.replace(/\D/g, '').substring(0, 2);
            if (parseInt(value) > 12) value = '12';
        }

        // Formatar ano
        if (name === 'expirationYear') {
            value = value.replace(/\D/g, '').substring(0, 2);
        }

        // Formatar CPF
        if (name === 'identificationNumber') {
            value = value.replace(/\D/g, '').substring(0, 11);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');

        try {
            // Validações básicas
            const cardNumber = cardData.cardNumber.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                toast.error('Número do cartão inválido');
                setLoading(false);
                return;
            }

            if (!cardData.cardholderName.trim()) {
                toast.error('Nome do titular é obrigatório');
                setLoading(false);
                return;
            }

            if (!cardData.expirationMonth || !cardData.expirationYear) {
                toast.error('Data de validade inválida');
                setLoading(false);
                return;
            }

            if (cardData.securityCode.length < 3) {
                toast.error('Código de segurança inválido');
                setLoading(false);
                return;
            }

            if (cardData.identificationNumber.length !== 11) {
                toast.error('CPF inválido');
                setLoading(false);
                return;
            }

            // Inicializar SDK do Mercado Pago
            const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-f4e37e9e-b156-4d26-9d46-fe1d2b7954e7';
            const mp = new window.MercadoPago(publicKey);

            // Criar token do cartão
            const cardToken = await mp.createCardToken({
                cardNumber: cardNumber,
                cardholderName: cardData.cardholderName,
                cardExpirationMonth: cardData.expirationMonth,
                cardExpirationYear: cardData.expirationYear,
                securityCode: cardData.securityCode,
                identificationType: cardData.identificationType,
                identificationNumber: cardData.identificationNumber
            });

            if (!cardToken || !cardToken.id) {
                toast.error('Erro ao processar dados do cartão');
                setLoading(false);
                return;
            }

            // Enviar para o backend
            const res = await fetch('/api/subscriptions/create-with-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    card_token_id: cardToken.id,
                    payment_method_id: cardToken.payment_method_id
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Assinatura criada com sucesso!');
                navigate('/subscription/callback?status=success');
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao criar assinatura');
                setLoading(false);
            }
        } catch (error) {
            console.error('Erro:', error);
            toast.error(error.message || 'Erro ao processar pagamento');
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <Container>
                <BackButton onClick={() => navigate('/subscription/setup')}>
                    <ArrowLeft size={20} />
                    Voltar
                </BackButton>

                <Grid>
                    <Card>
                        <Title>
                            <CreditCard size={28} />
                            Dados do Cartão
                        </Title>

                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label>Número do Cartão</Label>
                                <Input
                                    type="text"
                                    name="cardNumber"
                                    value={cardData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="0000 0000 0000 0000"
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Nome (como está no cartão)</Label>
                                <Input
                                    type="text"
                                    name="cardholderName"
                                    value={cardData.cardholderName}
                                    onChange={handleInputChange}
                                    placeholder="NOME SOBRENOME"
                                    required
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </FormGroup>

                            <InputRow>
                                <FormGroup>
                                    <Label>Validade</Label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Input
                                            type="text"
                                            name="expirationMonth"
                                            value={cardData.expirationMonth}
                                            onChange={handleInputChange}
                                            placeholder="MM"
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        <Input
                                            type="text"
                                            name="expirationYear"
                                            value={cardData.expirationYear}
                                            onChange={handleInputChange}
                                            placeholder="AA"
                                            required
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <Label>CVV</Label>
                                    <Input
                                        type="text"
                                        name="securityCode"
                                        value={cardData.securityCode}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        required
                                    />
                                </FormGroup>
                            </InputRow>

                            <FormGroup>
                                <Label>CPF do Titular</Label>
                                <Input
                                    type="text"
                                    name="identificationNumber"
                                    value={cardData.identificationNumber}
                                    onChange={handleInputChange}
                                    placeholder="00000000000"
                                    required
                                />
                            </FormGroup>

                            <SecurityNote>
                                <Lock size={16} />
                                <span>Seus dados estão protegidos e criptografados pelo Mercado Pago</span>
                            </SecurityNote>

                            <SubmitButton type="submit" disabled={loading}>
                                <Lock size={20} />
                                {loading ? 'Processando...' : 'Confirmar Assinatura'}
                            </SubmitButton>
                        </Form>
                    </Card>

                    <SummaryCard>
                        <PlanName>Resumo da Assinatura</PlanName>

                        <PriceDisplay>
                            <div className="amount">
                                R$ <span>50</span><small>,00</small>
                            </div>
                            <div className="period">por mês</div>
                        </PriceDisplay>

                        <FeaturesList>
                            <li>
                                <Check size={16} />
                                <span>Perfil visível para todos os clientes</span>
                            </li>
                            <li>
                                <Check size={16} />
                                <span>Solicitações ilimitadas</span>
                            </li>
                            <li>
                                <Check size={16} />
                                <span>Gestão de agenda</span>
                            </li>
                            <li>
                                <Check size={16} />
                                <span>Cancele quando quiser</span>
                            </li>
                        </FeaturesList>
                    </SummaryCard>
                </Grid>
            </Container>
        </PageContainer>
    );
}
