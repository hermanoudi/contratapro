import { useState, useEffect, useRef, useId } from 'react';
import styled from 'styled-components';
import { X, Mail, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';
import { PrimaryButton, FieldLabel, InputBox, TextInput, FieldNote } from './talao';

/* "Esqueci minha senha" num <dialog> nativo: Esc fecha, o foco fica preso dentro
   e volta para quem abriu. Folha branca reta com a régua de gráfica no alto. */

const Dialog = styled.dialog`
  width: min(28rem, calc(100% - 2rem));
  margin: auto;
  padding: 1.5rem clamp(1.25rem, 4vw, 1.75rem) 1.75rem;
  border: none;
  border-top: 4px solid var(--grafica);
  border-radius: 0;
  background: var(--papel);
  color: var(--nanquim);
  box-shadow: 0 24px 48px -20px rgba(23, 23, 27, 0.55), 0 2px 6px rgba(23, 23, 27, 0.15);

  &::backdrop {
    background: rgba(23, 23, 27, 0.45);
  }
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.75rem;
    line-height: 1.05;
  }
`;

const Close = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 44px;
  height: 44px;
  margin: -0.5rem -0.5rem 0 0;
  background: none;
  border: none;
  color: var(--nanquim);
  cursor: pointer;

  &:hover {
    color: var(--grafica);
  }
`;

const Text = styled.p`
  margin-bottom: 1.25rem;
  line-height: 1.55;
  color: var(--texto-2-papel);
`;

const Full = styled(PrimaryButton)`
  width: 100%;
  margin-top: 1.25rem;
`;

const Done = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem 0 0.25rem;
  border-top: 1.5px solid var(--pauta);

  svg {
    flex: none;
    color: var(--sucesso);
    margin-top: 0.1rem;
  }

  p {
    line-height: 1.55;
  }
`;

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const id = useId();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Abre com o e-mail que a pessoa já digitou no login
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setEmail(initialEmail);
      setSent(false);
      setError('');
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSent(true);
      } else {
        setError('Não deu para enviar o e-mail agora. Tente de novo em instantes.');
      }
    } catch (err) {
      console.error(err);
      setError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      ref={dialogRef}
      aria-labelledby={`${id}-titulo`}
      onClose={onClose}
      // Clique fora da folha (no fundo escuro) fecha
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
    >
      {isOpen && (<>
      <Head>
        <h2 id={`${id}-titulo`}>{sent ? 'Confira seu e-mail' : 'Esqueci minha senha'}</h2>
        <Close type="button" aria-label="Fechar" onClick={onClose}>
          <X size={24} aria-hidden="true" />
        </Close>
      </Head>

      {sent ? (
        <>
          <Done role="status">
            <CheckCircle size={22} aria-hidden="true" />
            <p>
              Se <strong>{email}</strong> estiver cadastrado, você vai receber um link para criar uma senha nova.
              O link vale por 24 horas.
            </p>
          </Done>
          <Full type="button" onClick={onClose}>Voltar para o login</Full>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <Text>Escreva o e-mail do seu cadastro. Mandamos um link para você criar uma senha nova.</Text>

          <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
          <InputBox>
            <Mail size={20} aria-hidden="true" />
            <TextInput
              id={`${id}-email`}
              $icon
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              aria-invalid={error ? true : undefined}
              ref={inputRef}
              required
            />
          </InputBox>
          {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}

          <Full type="submit" disabled={loading || !email}>
            {loading ? 'Enviando…' : 'Enviar o link'}
          </Full>
        </form>
      )}
      </>)}
    </Dialog>
  );
}
