import { useState, useId } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '../config';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import AuthLayout, { AuthTitle, AuthLead } from '../components/AuthLayout';
import { PrimaryButton, StampButton, FieldLabel, InputBox, TextInput, FieldNote } from '../components/talao';

// Só o que o ContrataPro faz de fato (PRODUCT.md): nada de "verificados"
const FACTS = [
  { strong: 'Para quem contrata:', text: 'busque pelo CEP, veja perfil, preços e avaliações e marque direto na agenda. É grátis.' },
  { strong: 'Para quem trabalha:', text: 'receba agendamentos na sua agenda, sem intermediário. Cadastro grátis e sem cartão.' },
  { strong: 'Pagamento:', text: 'combinado direto entre vocês, por Pix, dinheiro ou como preferirem.' },
];

const Group = styled.div`
  & + & {
    margin-top: 1.25rem;
  }
`;

const PasswordHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
`;

// Link de texto no tom do papel; vira tinta de gráfica no hover
const TextLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  min-height: 0;
  min-width: 0;
  font-size: 0.95rem;
  color: var(--texto-2-papel);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: var(--grafica);
  }
`;

const Submit = styled(PrimaryButton)`
  width: 100%;
  min-height: 54px;
  margin-top: 1.75rem;
  font-size: 1.2rem;
`;

const Divider = styled.p`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0 1rem;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--texto-2-papel);

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1.5px;
    background: var(--pauta);
  }
`;

const Secondary = styled.div`
  display: grid;
  gap: 0.75rem;

  @media (min-width: 420px) {
    grid-template-columns: 1fr 1fr;
  }

  button {
    width: 100%;
    padding: 0 0.75rem;
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const id = useId();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => ({}));

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
        // O backend responde 401 em inglês; o resto já vem em português
        setError(response.status === 401 || typeof data.detail !== 'string'
          ? 'E-mail ou senha não conferem. Confira e tente de novo.'
          : data.detail);
      }
    } catch (err) {
      console.error(err);
      setError('Não deu para falar com o servidor agora. Confira sua conexão e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      asideTitle="Profissionais da sua região, com agenda aberta pra você."
      facts={FACTS}
    >
      <AuthTitle>Entre na sua conta</AuthTitle>
      <AuthLead>Use o e-mail e a senha do seu cadastro.</AuthLead>

      <form onSubmit={handleLogin}>
        <Group>
          <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
          <InputBox>
            <Mail size={20} aria-hidden="true" />
            <TextInput
              id={`${id}-email`}
              $icon
              type="email"
              name="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              aria-invalid={error ? true : undefined}
              required
            />
          </InputBox>
        </Group>

        <Group>
          <PasswordHead>
            <FieldLabel htmlFor={`${id}-senha`}>Senha</FieldLabel>
            <TextLink type="button" onClick={() => setForgotPasswordOpen(true)}>
              Esqueci minha senha
            </TextLink>
          </PasswordHead>
          <InputBox>
            <Lock size={20} aria-hidden="true" />
            <TextInput
              id={`${id}-senha`}
              $icon
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              aria-invalid={error ? true : undefined}
              required
            />
          </InputBox>
        </Group>

        {error && <FieldNote id={`${id}-erro`} role="alert" $tone="erro">{error}</FieldNote>}

        <Submit type="submit" disabled={loading}>
          {loading ? 'Entrando…' : <>Entrar <ArrowRight size={20} aria-hidden="true" /></>}
        </Submit>
      </form>

      <Divider>Ainda não tem conta?</Divider>

      <Secondary>
        <StampButton type="button" onClick={() => navigate('/register-client')}>Criar conta</StampButton>
        <StampButton type="button" onClick={() => navigate('/register-pro')}>Sou profissional</StampButton>
      </Secondary>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialEmail={email}
      />
    </AuthLayout>
  );
}
