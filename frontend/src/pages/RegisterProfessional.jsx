import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin, User, Briefcase, Phone, Lock, Mail, Award, TrendingUp, Users } from 'lucide-react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import logoImage from '../assets/contratapro-logo.png';

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

const FormCard = styled(motion.div)`
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
  box-shadow: ${props => props.$active ? '0 0 15px var(--primary-glow)' : 'none'};
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

const Input = styled.input`
  width: 100%;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

const Select = styled.select`
  width: 100%;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
  height: 180px;
  width: auto;
  object-fit: contain;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    height: 350px;
  }
`;

const MobileLogo = styled.img`
  height: 120px;
  width: auto;
  object-fit: contain;
  margin: 0 auto 1.5rem;
  display: block;

  @media (min-width: 969px) {
    display: none;
  }
`;

export default function RegisterProfessional() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [categories, setCategories] = useState({});
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        cpf: '',
        cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
        whatsapp: '', category: '', description: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchPlans();
    }, []);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await fetch('/api/categories/groups');
            if (res.ok) {
                const data = await res.json();
                console.log('Categorias carregadas:', data);
                setCategories(data);
            } else {
                console.error('Erro ao buscar categorias - status:', res.status);
                toast.error('Erro ao carregar categorias');
            }
        } catch (e) {
            console.error('Erro ao buscar categorias:', e);
            toast.error('Erro ao carregar categorias');
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const res = await fetch('/api/plans/');
            if (res.ok) {
                const data = await res.json();
                // Ordenar: Trial primeiro, depois Bronze, Prata, Ouro
                const ordered = data.sort((a, b) => {
                    const order = { trial: 0, bronze: 1, prata: 2, ouro: 3 };
                    return (order[a.slug] || 99) - (order[b.slug] || 99);
                });
                setPlans(ordered);
                // Selecionar Trial por padrão
                setSelectedPlan(ordered.find(p => p.slug === 'trial')?.id || ordered[0]?.id);
            } else {
                console.error('Erro ao buscar planos - status:', res.status);
                toast.error('Erro ao carregar planos');
            }
        } catch (e) {
            console.error('Erro ao buscar planos:', e);
            toast.error('Erro ao carregar planos');
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCpfChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        let displayValue = value;
        if (value.length > 9) {
            displayValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
        } else if (value.length > 6) {
            displayValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
        } else if (value.length > 3) {
            displayValue = `${value.slice(0, 3)}.${value.slice(3)}`;
        }

        setFormData(prev => ({ ...prev, cpf: displayValue }));
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

    const handleCepChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        let displayValue = value;
        if (value.length > 5) {
            displayValue = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }

        setFormData(prev => ({ ...prev, cep: displayValue }));

        if (value.length === 8) {
            fetchAddress(value);
        }
    };

    const fetchAddress = async (cleanCep) => {
        try {
            const response = await fetch(`/api/cep/${cleanCep}`);
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
                setFormData(prev => ({ ...prev, city: '', state: '', street: '', neighborhood: '' }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            toast.error('Erro ao buscar CEP. Tente novamente.');
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamanho (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Imagem muito grande. Máximo: 5MB');
                return;
            }
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                toast.error('Apenas imagens são permitidas');
                return;
            }
            setProfilePicture(file);
            // Criar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.email || !formData.password || !formData.cpf)) {
            toast.error('Preencha todos os dados básicos incluindo o CPF.');
            return;
        }
        if (step === 1 && formData.cpf.replace(/\D/g, '').length !== 11) {
            toast.error('CPF deve conter 11 dígitos.');
            return;
        }
        if (step === 2 && (!formData.cep || !formData.street || !formData.number || !formData.city)) {
            toast.error('Preencha o endereço completo.');
            return;
        }
        if (step === 3 && (!formData.whatsapp || !formData.category)) {
            toast.error('Preencha os dados profissionais.');
            return;
        }
        setStep(s => Math.min(s + 1, 5));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!profilePicture) {
            toast.error('Foto de perfil é obrigatória para profissionais.');
            return;
        }

        if (!selectedPlan) {
            toast.error('Selecione um plano.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                is_professional: true,
                cpf: formData.cpf.replace(/\D/g, ''),  // Enviar apenas números
                cep: formData.cep.replace('-', '')
            };

            // 1. Criar usuário
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // 2. Fazer login
                const loginRes = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password })
                });

                if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    localStorage.setItem('token', loginData.access_token);

                    // 3. Fazer upload da foto de perfil
                    if (profilePicture) {
                        const formDataPhoto = new FormData();
                        formDataPhoto.append('file', profilePicture);

                        await fetch('/api/users/upload-profile-picture', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${loginData.access_token}` },
                            body: formDataPhoto
                        });
                    }

                    // 4. Atribuir plano selecionado
                    const selectedPlanData = plans.find(p => p.id === selectedPlan);
                    if (selectedPlanData) {
                        await fetch('/api/plans/me/change-plan', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${loginData.access_token}`
                            },
                            body: JSON.stringify({ new_plan_slug: selectedPlanData.slug })
                        });
                    }

                    // 5. Redirecionar baseado no plano
                    const isTrial = selectedPlanData?.slug === 'trial';
                    if (isTrial) {
                        toast.success(`Cadastro realizado! Seu período de trial de 30 dias começou.`);
                        navigate('/dashboard');
                    } else {
                        toast.success(`Cadastro realizado! Agora vamos configurar o pagamento.`);
                        navigate('/subscription/setup');
                    }
                } else {
                    toast.warning('Cadastro realizado, mas erro ao fazer login. Faça login manualmente.');
                    navigate('/login');
                }
            } else {
                const errorData = await response.json();
                toast.error(`Erro ao cadastrar: ${errorData.detail || 'Verifique os dados.'}`);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            toast.error('Erro de conexão com o servidor.');
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
                        Transforme seu talento em oportunidades. Conecte-se com clientes que precisam dos seus serviços.
                    </BrandSubtitle>

                    <FeatureList>
                        <FeatureItem>
                            <FeatureIcon>
                                <Award size={24} />
                            </FeatureIcon>
                            <FeatureText>
                                <h3>Perfil Profissional</h3>
                                <p>Destaque suas habilidades e experiência</p>
                            </FeatureText>
                        </FeatureItem>

                        <FeatureItem>
                            <FeatureIcon>
                                <Users size={24} />
                            </FeatureIcon>
                            <FeatureText>
                                <h3>Novos Clientes</h3>
                                <p>Alcance mais pessoas que procuram seus serviços</p>
                            </FeatureText>
                        </FeatureItem>

                        <FeatureItem>
                            <FeatureIcon>
                                <TrendingUp size={24} />
                            </FeatureIcon>
                            <FeatureText>
                                <h3>Cresça Seu Negócio</h3>
                                <p>Ferramentas para gerenciar e expandir sua atuação</p>
                            </FeatureText>
                        </FeatureItem>
                    </FeatureList>
                </BrandSection>
            </LeftSection>

            <RightSection>
                <FormCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                <MobileLogo src={logoImage} alt="ContrataPro" />
                <StepIndicator>
                    {[1, 2, 3, 4, 5].map(i => (
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
                                    <User size={32} />
                                </div>
                                <Title>Crie sua conta Pro</Title>
                                <Subtitle>Comece a oferecer seus serviços hoje mesmo.</Subtitle>
                            </div>

                            <InputGroup>
                                <Label>Nome Completo</Label>
                                <Input
                                    name="name"
                                    placeholder="Ex: João da Silva"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>CPF *</Label>
                                <Input
                                    name="cpf"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={handleCpfChange}
                                    maxLength={14}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>E-mail</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Senha</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <ButtonGroup>
                                <Button onClick={nextStep}>
                                    Continuar para Endereço <ChevronRight size={20} />
                                </Button>
                            </ButtonGroup>
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
                                <Title>Sua Localização</Title>
                                <Subtitle>Onde você está baseado?</Subtitle>
                            </div>

                            <InputGroup>
                                <Label>CEP</Label>
                                <Input
                                    name="cep"
                                    placeholder="00000-000"
                                    value={formData.cep}
                                    onChange={handleCepChange}
                                    maxLength={9}
                                />
                            </InputGroup>

                            <InputGroup>
                                <Label>Rua / Logradouro</Label>
                                <Input name="street" value={formData.street} onChange={handleChange} placeholder="Rua..." />
                            </InputGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <InputGroup>
                                    <Label>Número</Label>
                                    <Input name="number" value={formData.number} onChange={handleChange} placeholder="123" />
                                </InputGroup>
                                <InputGroup>
                                    <Label>Complemento</Label>
                                    <Input name="complement" value={formData.complement} onChange={handleChange} placeholder="Apto, Sala..." />
                                </InputGroup>
                            </div>

                            <InputGroup>
                                <Label>Bairro</Label>
                                <Input name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Bairro..." />
                            </InputGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <InputGroup>
                                    <Label>Cidade</Label>
                                    <Input name="city" value={formData.city} readOnly style={{ opacity: 0.7 }} />
                                </InputGroup>
                                <InputGroup>
                                    <Label>UF</Label>
                                    <Input name="state" value={formData.state} readOnly style={{ opacity: 0.7 }} />
                                </InputGroup>
                            </div>

                            <ButtonGroup>
                                <Button $variant="outline" onClick={prevStep}>
                                    <ChevronLeft size={20} /> Voltar
                                </Button>
                                <Button onClick={nextStep}>
                                    Continuar <ChevronRight size={20} />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    width: '64px', height: '64px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    color: 'var(--accent)'
                                }}>
                                    <Briefcase size={32} />
                                </div>
                                <Title>Perfil Profissional</Title>
                                <Subtitle>Conte-nos o que você faz de melhor.</Subtitle>
                            </div>

                            <InputGroup>
                                <Label>WhatsApp</Label>
                                <Input
                                    name="whatsapp"
                                    placeholder="(00) 00000-0000"
                                    value={formData.whatsapp}
                                    onChange={handleWhatsAppChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Categoria Principal</Label>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={loadingCategories}
                                >
                                    <option value="">
                                        {loadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria...'}
                                    </option>
                                    {!loadingCategories && Object.entries(categories).map(([group, items]) => (
                                        <optgroup key={group} label={group}>
                                            {items.map((cat) => (
                                                <option key={cat.id} value={cat.slug}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </Select>
                            </InputGroup>
                            <InputGroup>
                                <Label>Descrição Curta</Label>
                                <Input
                                    as="textarea"
                                    rows="3"
                                    name="description"
                                    placeholder="Ex: Especialista em acabamentos finos..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    style={{ resize: 'none', height: '80px' }}
                                />
                            </InputGroup>

                            <ButtonGroup>
                                <Button $variant="outline" onClick={prevStep}>
                                    <ChevronLeft size={20} /> Voltar
                                </Button>
                                <Button onClick={nextStep}>
                                    Continuar para Foto <ChevronRight size={20} />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
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
                                    <User size={32} />
                                </div>
                                <Title>Foto de Perfil</Title>
                                <Subtitle>Adicione uma foto para os clientes te conhecerem</Subtitle>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1.5rem',
                                padding: '2rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '16px',
                                border: '2px dashed var(--border)'
                            }}>
                                {profilePicturePreview ? (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={profilePicturePreview}
                                            alt="Preview"
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '4px solid var(--primary)'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfilePicture(null);
                                                setProfilePicturePreview(null);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary)'
                                    }}>
                                        <User size={80} />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    style={{ display: 'none' }}
                                    id="profile-picture-input"
                                />
                                <label htmlFor="profile-picture-input" style={{ width: '100%' }}>
                                    <div style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        color: 'white',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                    >
                                        {profilePicture ? 'Trocar Foto' : 'Selecionar Foto'}
                                    </div>
                                </label>

                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                    margin: 0
                                }}>
                                    Formatos aceitos: JPG, PNG, GIF (máx 5MB)
                                </p>
                            </div>

                            <ButtonGroup>
                                <Button $variant="outline" onClick={prevStep}>
                                    <ChevronLeft size={20} /> Voltar
                                </Button>
                                <Button onClick={nextStep}>
                                    Continuar para Plano <ChevronRight size={20} />
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div
                            key="step5"
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
                                    <Award size={32} />
                                </div>
                                <Title>Escolha seu Plano</Title>
                                <Subtitle>Selecione o plano ideal para o seu negócio</Subtitle>
                            </div>

                            {loadingPlans ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    Carregando planos...
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    {plans.map(plan => {
                                        const isTrial = plan.slug === 'trial';
                                        const isSelected = selectedPlan === plan.id;
                                        return (
                                            <div
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan.id)}
                                                style={{
                                                    border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border)',
                                                    borderRadius: '12px',
                                                    padding: '1.5rem',
                                                    cursor: 'pointer',
                                                    background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg)',
                                                    transition: 'all 0.2s',
                                                    position: 'relative'
                                                }}
                                            >
                                                {isTrial && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '20px',
                                                        background: '#10b981',
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700
                                                    }}>
                                                        🎁 TESTE GRÁTIS
                                                    </div>
                                                )}
                                                {plan.slug === 'prata' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '20px',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700
                                                    }}>
                                                        ✨ MAIS POPULAR
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{plan.name}</h3>
                                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                                                        {isTrial ? 'GRÁTIS' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                                            {isTrial ? '/30 dias' : '/mês'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {isTrial && 'Experimente todos os recursos sem compromisso'}
                                                    {plan.slug === 'bronze' && 'Ideal para começar no mercado'}
                                                    {plan.slug === 'prata' && 'Perfeito para profissionais que querem crescer'}
                                                    {plan.slug === 'ouro' && 'Máxima visibilidade e destaque'}
                                                </p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                    {isTrial && (
                                                        <>
                                                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Check size={16} color="#10b981" /> 30 dias de teste grátis
                                                            </p>
                                                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Check size={16} color="#10b981" /> Todos os recursos liberados
                                                            </p>
                                                        </>
                                                    )}
                                                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Check size={16} color="#10b981" />
                                                        {plan.max_services ? `Máximo ${plan.max_services} serviço` : 'Serviços ilimitados'}
                                                    </p>
                                                    {plan.can_manage_schedule && (
                                                        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Check size={16} color="#10b981" /> Agenda online
                                                        </p>
                                                    )}
                                                    {plan.priority_in_search > 0 && (
                                                        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Check size={16} color="#10b981" /> ⭐ Prioridade na busca
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <ButtonGroup>
                                <Button $variant="outline" onClick={prevStep}>
                                    <ChevronLeft size={20} /> Voltar
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading || !selectedPlan}>
                                    {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                                    {!loading && <Check size={20} />}
                                </Button>
                            </ButtonGroup>
                        </motion.div>
                    )}
                </AnimatePresence>

                <FooterLink>
                    Já tem uma conta? <Link to="/login">Entrar</Link>
                </FooterLink>
            </FormCard>
            </RightSection>
        </PageContainer>
    );
}
