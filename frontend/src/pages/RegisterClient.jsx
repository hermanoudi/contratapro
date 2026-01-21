import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, ChevronRight, ChevronLeft, MapPin, Phone, Check, Shield, Zap, HeartHandshake } from 'lucide-react';
import styled from 'styled-components';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '../config';
import logoImage from '../assets/contratapro-logo.png';
import PasswordInput from '../components/PasswordInput';

const PageContainer = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(168, 85, 247, 0.05) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    animation: pulse 15s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

const BrandSection = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 500px;
`;

const BrandTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
`;

const BrandSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  overflow-y: auto;
`;

const RegisterCard = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border);
    z-index: 0;
    transform: translateY(-50%);
  }
`;

const StepDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$active ? 'var(--primary)' : 'var(--bg-secondary)'};
  border: 2px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 1;
  transition: all 0.3s ease;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  color: var(--text-secondary);
  transition: color 0.2s;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1rem 1rem 3rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:focus + ${IconWrapper} {
    color: var(--primary);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  &:read-only {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${props => props.$variant === 'outline' ? `
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    color: var(--text-primary);
    &:hover {
      border-color: var(--primary);
      color: var(--primary);
      background: rgba(99, 102, 241, 0.05);
    }
  ` : `
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
    }
    &:active {
      transform: translateY(0);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FooterLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);

  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const BrandLogo = styled.img`
  height: 80px;
  width: auto;
  object-fit: contain;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    height: 120px;
  }
`;

const MobileLogo = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;
  margin: 0 auto 1.5rem;
  display: block;

  @media (min-width: 969px) {
    display: none;
  }
`;

export default function RegisterClient() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWhatsAppChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        let displayValue = value;
        if (value.length === 11) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length === 10) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 6) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 2) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }

        setFormData(prev => ({ ...prev, whatsapp: displayValue }));
    };

    const handleCepChange = async (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        let displayValue = value;
        if (value.length > 5) {
            displayValue = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }

        setFormData(prev => ({ ...prev, cep: displayValue }));

        if (value.length === 8) {
            try {
                const response = await fetch(`/api/cep/${value}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        street: data.street,
                        neighborhood: data.neighborhood,
                        city: data.city,
                        state: data.state
                    }));
                    toast.success('Endereço localizado!');
                } else {
                    toast.error('CEP não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                toast.error('Erro ao buscar CEP. Tente novamente.');
            }
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.whatsapp) {
                toast.error('Por favor, preencha todos os campos pessoais.');
                return;
            }
            if (!isPasswordValid) {
                toast.error('Crie uma senha forte que atenda a todos os requisitos.');
                return;
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cep || !formData.street || !formData.number || !formData.city) {
            toast.error('Por favor, preencha os dados de endereço obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    cep: formData.cep.replace('-', ''),
                    is_professional: false
                })
            });

            if (response.ok) {
                toast.success('Conta criada com sucesso! Faça login para continuar.');
                // Preservar a rota de origem ao redirecionar para login
                const from = location.state?.from;
                navigate('/login', from ? { state: { from } } : {});
            } else {
                const data = await response.json();
                toast.error(data.detail || 'Erro ao criar conta');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <LeftSection>
                <BrandSection>
                    <BrandLogo src={logoImage} alt="ContrataPro" />
                    <BrandSubtitle>
                        Crie sua conta e acesse os melhores profissionais da sua região em minutos.
                    </BrandSubtitle>

                    <FeatureList>
                        <FeatureItem>
                            <FeatureIcon>
                                <Shield size={24} />
                            </FeatureIcon>
                            <FeatureText>
                                <h3>Cadastro Seguro</h3>
                                <p>Seus dados protegidos e seguros</p>
                            </FeatureText>
                        </FeatureItem>

                        <FeatureItem>
                            <FeatureIcon>
                                <Zap size={24} />
                            </FeatureIcon>
                            <FeatureText>
                                <h3>Acesso Rápido</h3>
                                <p>Comece a agendar serviços imediatamente</p>
                            </FeatureText>
                        </FeatureItem>

                        <FeatureItem>
                            <FeatureIcon>
                                <HeartHandshake size={24} />
                            </FeatureIcon>
                            <FeatureText>
                                <h3>Suporte Dedicado</h3>
                                <p>Estamos aqui para ajudar você</p>
                            </FeatureText>
                        </FeatureItem>
                    </FeatureList>
                </BrandSection>
            </LeftSection>

            <RightSection>
                <RegisterCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                <MobileLogo src={logoImage} alt="ContrataPro" />
                <StepIndicator>
                    {[1, 2].map(i => (
                        <StepDot key={i} $active={step >= i}>
                            {step > i ? <Check size={16} /> : i}
                        </StepDot>
                    ))}
                </StepIndicator>

                <AnimatePresence mode='wait'>
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    width: '64px', height: '64px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    color: 'var(--primary)'
                                }}>
                                    <UserPlus size={32} />
                                </div>
                                <Title>Criar Conta</Title>
                                <Subtitle>Dados pessoais para seu perfil.</Subtitle>
                            </div>

                            <InputGroup>
                                <Label>Nome Completo</Label>
                                <IconWrapper><User size={20} /></IconWrapper>
                                <Input
                                    name="name"
                                    placeholder="Seu nome completo"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </InputGroup>

                            <InputGroup>
                                <Label>E-mail</Label>
                                <IconWrapper><Mail size={20} /></IconWrapper>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </InputGroup>

                            <InputGroup>
                                <Label>WhatsApp</Label>
                                <IconWrapper><Phone size={20} /></IconWrapper>
                                <Input
                                    name="whatsapp"
                                    placeholder="(00) 00000-0000"
                                    value={formData.whatsapp}
                                    onChange={handleWhatsAppChange}
                                    required
                                />
                            </InputGroup>

                            <InputGroup>
                                <Label>Senha</Label>
                                <PasswordInput
                                    name="password"
                                    placeholder="Crie uma senha forte"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onValidChange={setIsPasswordValid}
                                    showGenerateButton={true}
                                    showTooltip={true}
                                />
                            </InputGroup>

                            <Button onClick={nextStep}>
                                Continuar para Endereço <ChevronRight size={20} />
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    width: '64px', height: '64px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    color: '#10b981'
                                }}>
                                    <MapPin size={32} />
                                </div>
                                <Title>Seu Endereço</Title>
                                <Subtitle>Para serviços presenciais na sua casa.</Subtitle>
                            </div>

                            <InputGroup>
                                <Label>CEP</Label>
                                <IconWrapper><MapPin size={20} /></IconWrapper>
                                <Input
                                    name="cep"
                                    placeholder="00000-000"
                                    value={formData.cep}
                                    onChange={handleCepChange}
                                    maxLength={9}
                                    required
                                />
                            </InputGroup>

                            <InputGroup>
                                <Label>Rua / Logradouro</Label>
                                <Input
                                    name="street"
                                    placeholder="Nome da rua"
                                    value={formData.street}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '1rem' }}
                                    required
                                />
                            </InputGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <InputGroup>
                                    <Label>Número</Label>
                                    <Input
                                        name="number"
                                        placeholder="123"
                                        value={formData.number}
                                        onChange={handleChange}
                                        style={{ paddingLeft: '1rem' }}
                                        required
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <Label>Complemento</Label>
                                    <Input
                                        name="complement"
                                        placeholder="Apto, Bloco..."
                                        value={formData.complement}
                                        onChange={handleChange}
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </InputGroup>
                            </div>

                            <InputGroup>
                                <Label>Bairro</Label>
                                <Input
                                    name="neighborhood"
                                    placeholder="Seu bairro"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '1rem' }}
                                    required
                                />
                            </InputGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <InputGroup>
                                    <Label>Cidade</Label>
                                    <Input name="city" value={formData.city} readOnly style={{ paddingLeft: '1rem' }} />
                                </InputGroup>
                                <InputGroup>
                                    <Label>UF</Label>
                                    <Input name="state" value={formData.state} readOnly style={{ paddingLeft: '1rem' }} />
                                </InputGroup>
                            </div>

                            <ButtonGroup>
                                <Button $variant="outline" onClick={prevStep}>
                                    <ChevronLeft size={20} /> Voltar
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                                    {!loading && <Check size={20} />}
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}
                </AnimatePresence>

                    <FooterLink>
                        Já tem uma conta? <Link to="/login">Entrar</Link>
                    </FooterLink>
                </RegisterCard>
            </RightSection>
        </PageContainer>
    );
}
