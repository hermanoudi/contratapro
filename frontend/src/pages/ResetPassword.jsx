import { useState, useEffect, useId } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, Lock, RotateCw } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import AuthLayout, { AuthTitle, AuthLead } from '../components/AuthLayout';
import { PrimaryButton, StampButton, FieldLabel, InputBox, TextInput, FieldNote } from '../components/talao';
import { Group, Actions, FormError } from '../components/SignupParts';
import { translateError } from '../components/signupUtils';
import { API_URL } from '../config';

// Estado do link numa folha só: ícone, título e o que fazer agora
const Status = styled.div`

  svg {
    color: ${({ $tone }) => ($tone === 'ok' ? 'var(--sucesso)' : 'var(--grafica)')};
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(1.9rem, 4vw, 2.4rem);
    line-height: 1.05;
  }

  p {
    margin-top: 0.75rem;
    line-height: 1.55;
    color: var(--texto-2-papel);
  }
`;

const Loading = styled.p`
  color: var(--texto-2-papel);
  font-size: 1.05rem;
`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const id = useId();

  const [linkState, setLinkState] = useState(token ? 'validating' : 'invalid'); // validating | valid | invalid | offline
  const [attempt, setAttempt] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 ? password === confirmPassword : null;

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetch(`${API_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then((response) => (response.ok || response.status < 500 ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        if (cancelled) return;
        if (data.valid) {
          setEmail(data.email);
          setLinkState('valid');
        } else {
          setLinkState('invalid');
        }
      })
      .catch((err) => {
        console.error('Error validating token:', err);
        // Falha de rede não é link vencido: deixa tentar de novo
        if (!cancelled) setLinkState('offline');
      });
    return () => { cancelled = true; };
  }, [token, attempt]);

  const retry = () => {
    setLinkState('validating');
    setAttempt((n) => n + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('A senha ainda não cumpre todas as regras.');
      document.getElementById(`${id}-senha`)?.focus();
      return;
    }
    if (password !== confirmPassword) {
      setError('As duas senhas não são iguais.');
      document.getElementById(`${id}-confirmar`)?.focus();
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
      } else {
        const data = await response.json().catch(() => ({}));
        setError(translateError(data.detail, 'Não deu para trocar a senha. Tente de novo.'));
      }
    } catch (err) {
      console.error(err);
      setError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  let content;
  if (linkState === 'validating') {
    content = <Loading role="status">Conferindo o link…</Loading>;
  } else if (success) {
    content = (
      <Status $tone="ok" role="status">
        <h1><CheckCircle size={30} aria-hidden="true" /> Senha trocada</h1>
        <p>Pronto. Agora é só entrar com a senha nova.</p>
        <Actions $single>
          <PrimaryButton type="button" onClick={() => navigate('/login')}>Ir para o login</PrimaryButton>
        </Actions>
      </Status>
    );
  } else if (linkState === 'offline') {
    content = (
      <Status role="status">
        <h1><AlertCircle size={30} aria-hidden="true" /> Não deu para conferir o link</h1>
        <p>Pode ser a sua conexão ou uma instabilidade do nosso lado. O link continua valendo; tente de novo.</p>
        <Actions $single>
          <PrimaryButton type="button" onClick={retry}><RotateCw size={18} aria-hidden="true" /> Tentar de novo</PrimaryButton>
        </Actions>
      </Status>
    );
  } else if (linkState === 'invalid') {
    content = (
      <Status role="status">
        <h1><AlertCircle size={30} aria-hidden="true" /> Este link não vale mais</h1>
        <p>O link para criar uma senha nova vale por 24 horas e só pode ser usado uma vez. Peça um link novo: ele chega no seu e-mail.</p>
        <Actions>
          <StampButton type="button" onClick={() => navigate('/login')}>Voltar</StampButton>
          <PrimaryButton type="button" onClick={() => setForgotOpen(true)}>Pedir um link novo</PrimaryButton>
        </Actions>
      </Status>
    );
  } else {
    content = (
      <>
        <AuthTitle>Crie uma senha nova</AuthTitle>
        <AuthLead>Para a conta <strong>{email}</strong>.</AuthLead>

        <form onSubmit={handleSubmit} noValidate>
          <Group>
            <FieldLabel htmlFor={`${id}-senha`}>Senha nova</FieldLabel>
            <PasswordInput
              id={`${id}-senha`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Crie uma senha"
              showGenerateButton={true}
              showTooltip={true}
              onValidChange={setPasswordValid}
              required
            />
          </Group>

          <Group>
            <FieldLabel htmlFor={`${id}-confirmar`}>Repita a senha</FieldLabel>
            <InputBox>
              <Lock size={20} aria-hidden="true" />
              <TextInput
                id={`${id}-confirmar`}
                $icon
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="A mesma senha"
                aria-invalid={passwordsMatch === false ? true : undefined}
                aria-describedby={`${id}-confere`}
                required
              />
            </InputBox>
            {confirmPassword.length > 0 && (
              <FieldNote id={`${id}-confere`} aria-live="polite" $tone={passwordsMatch ? undefined : 'erro'}>
                {passwordsMatch ? 'As duas senhas são iguais.' : 'As duas senhas ainda não são iguais.'}
              </FieldNote>
            )}
          </Group>

          {error && <FormError>{error}</FormError>}

          <Actions $single>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Trocando a senha…' : 'Trocar a senha'}
            </PrimaryButton>
          </Actions>
        </form>
      </>
    );
  }

  return (
    <AuthLayout
      asideTitle="Senha nova, mesma conta."
      asideLead="Depois de trocar, entre com a senha nova. Seu cadastro continua como estava."
    >
      {content}
      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </AuthLayout>
  );
}
