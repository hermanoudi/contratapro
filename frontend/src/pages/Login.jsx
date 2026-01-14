import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ChevronRight, Calendar, Shield, Clock } from 'lucide-react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
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

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const LoginCard = styled(motion.div)`
  width: 100%;
  max-width: 440px;
  padding: 2rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
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
  margin-bottom: 2.5rem;
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
`;

const Button = styled.button`
  width: 100%;
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
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border: none;
  color: white;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  span {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LinkButton = styled.button`
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  text-align: center;
  padding: 0.875rem;
  transition: all 0.2s;
  font-weight: 600;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }
`;

const BrandLogo = styled.img`
  height: 120px;
  width: auto;
  object-fit: contain;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    height: 160px;
  }
`;

const MobileLogo = styled.img`
  height: 50px;
  width: auto;
  object-fit: contain;
  margin: 0 auto 0.75rem;
  display: block;

  @media (min-width: 969px) {
    display: none;
  }

  @media (max-width: 480px) {
    height: 45px;
    margin-bottom: 0.5rem;
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        toast.success('Login realizado com sucesso!');

        // Verificar se há uma rota de origem (de onde o usuário veio)
        const from = location.state?.from;

        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        if (payload.is_admin) {
          navigate('/admin');
        } else if (payload.is_professional) {
          navigate('/dashboard');
        } else {
          // Se veio de outra página (ex: booking), volta para lá
          // Senão, vai para a Home
          navigate(from || '/');
        }
      } else {
        toast.error(data.detail || 'Falha no login');
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
            Encontre o profissional certo para cada serviço na sua região.
          </BrandSubtitle>

          <FeatureList>
            <FeatureItem>
              <FeatureIcon>
                <Calendar size={24} />
              </FeatureIcon>
              <FeatureText>
                <h3>Agendamento Simples</h3>
                <p>Marque serviços em poucos cliques</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <Shield size={24} />
              </FeatureIcon>
              <FeatureText>
                <h3>Profissionais Verificados</h3>
                <p>Todos os prestadores são validados</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <Clock size={24} />
              </FeatureIcon>
              <FeatureText>
                <h3>Atendimento Rápido</h3>
                <p>Respostas em tempo real</p>
              </FeatureText>
            </FeatureItem>
          </FeatureList>
        </BrandSection>
      </LeftSection>

      <RightSection>
        <LoginCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MobileLogo src={logoImage} alt="ContrataPro" />
          <Title>Bem-vindo de volta</Title>
          <Subtitle>Entre com suas credenciais para acessar sua conta</Subtitle>

          <form onSubmit={handleLogin}>
            <InputGroup>
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <IconWrapper><Mail size={20} /></IconWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <IconWrapper><Lock size={20} /></IconWrapper>
            </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ChevronRight size={20} />}
            </Button>
          </form>

          <Divider>
            <span>Ainda não tem conta?</span>
          </Divider>

          <LinksContainer>
            <LinkButton onClick={() => navigate('/register-client')}>
              Criar Conta
            </LinkButton>
            <LinkButton onClick={() => navigate('/register-pro')}>
              Sou Profissional
            </LinkButton>
          </LinksContainer>
        </LoginCard>
      </RightSection>
    </PageContainer>
  );
}
