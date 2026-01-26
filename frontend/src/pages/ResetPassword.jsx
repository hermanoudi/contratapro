import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '../assets/contratapro-logo.png';
import PasswordInput from '../components/PasswordInput';
import { API_URL } from '../config';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(168, 85, 247, 0.05) 100%);
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
  height: 60px;
  margin: 0 auto 1.5rem;
  display: block;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
`;

const ConfirmInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid ${props =>
    props.$match === true ? '#10b981' :
    props.$match === false ? '#ef4444' : 'var(--border)'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props =>
      props.$match === true ? '#10b981' :
      props.$match === false ? '#ef4444' : 'var(--primary)'};
    box-shadow: 0 0 0 3px ${props =>
      props.$match === true ? 'rgba(16, 185, 129, 0.1)' :
      props.$match === false ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-glow)'};
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const MatchMessage = styled.p`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: ${props => props.$match ? '#10b981' : '#ef4444'};
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: ${props => props.$success ? '#10b981' : '#ef4444'};
`;

const StatusTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
`;

const StatusDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
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
  width: 100%;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }
`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirmPassword.length > 0
    ? password === confirmPassword
    : null;

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/validate-reset-token?token=${token}`
        );
        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        }
      } catch (error) {
        console.error('Error validating token:', error);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas nao conferem');
      return;
    }

    if (!passwordValid) {
      toast.error('A senha nao atende aos criterios de seguranca');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Senha alterada com sucesso!');
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro de conexao');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <PageContainer>
        <Card>
          <Logo src={logoImage} alt="ContrataPro" />
          <Subtitle>Validando link...</Subtitle>
        </Card>
      </PageContainer>
    );
  }

  if (success) {
    return (
      <PageContainer>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Logo src={logoImage} alt="ContrataPro" />
          <StatusContainer>
            <StatusIcon $success>
              <CheckCircle size={40} />
            </StatusIcon>
            <StatusTitle>Senha alterada!</StatusTitle>
            <StatusDescription>
              Sua senha foi redefinida com sucesso. Voce ja pode fazer login
              com sua nova senha.
            </StatusDescription>
            <LinkButton onClick={() => navigate('/login')}>
              Ir para o Login
            </LinkButton>
          </StatusContainer>
        </Card>
      </PageContainer>
    );
  }

  if (!tokenValid) {
    return (
      <PageContainer>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Logo src={logoImage} alt="ContrataPro" />
          <StatusContainer>
            <StatusIcon>
              <AlertCircle size={40} />
            </StatusIcon>
            <StatusTitle>Link invalido</StatusTitle>
            <StatusDescription>
              Este link de recuperacao de senha e invalido ou ja expirou.
              Solicite um novo link de recuperacao.
            </StatusDescription>
            <LinkButton onClick={() => navigate('/login')}>
              Voltar para o Login
            </LinkButton>
          </StatusContainer>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Logo src={logoImage} alt="ContrataPro" />
        <Title>Nova Senha</Title>
        <Subtitle>
          Digite sua nova senha para a conta {email}
        </Subtitle>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Nova Senha</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              showGenerateButton={true}
              showTooltip={true}
              onValidChange={setPasswordValid}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>Confirmar Senha</label>
            <ConfirmInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              $match={passwordsMatch}
              required
            />
            {confirmPassword.length > 0 && (
              <MatchMessage $match={passwordsMatch}>
                {passwordsMatch ? 'Senhas conferem' : 'Senhas nao conferem'}
              </MatchMessage>
            )}
          </FormGroup>

          <Button
            type="submit"
            disabled={loading || !passwordValid || !passwordsMatch}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
