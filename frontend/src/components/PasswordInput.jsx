import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff, Check, Circle, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';

/* Campo de senha nova no registro contido. As regras aparecem logo abaixo, em lista,
   e vão sendo marcadas enquanto a pessoa digita; o campo não fica vermelho no meio
   da digitação: só ganha a borda de sucesso quando tudo foi atendido. */

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  min-height: 52px;
  padding: 0 3.25rem 0 1rem;
  background: var(--papel);
  border: 1.5px solid ${({ $isValid }) => ($isValid ? 'var(--sucesso)' : 'var(--controle)')};
  border-radius: 2px;
  font-family: var(--f-texto);
  font-size: 1.05rem;
  color: var(--nanquim);
  transition: border-color 160ms var(--ease-out), box-shadow 160ms var(--ease-out), background-color 160ms var(--ease-out);

  &::placeholder {
    color: var(--texto-2-papel);
    opacity: 1;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: ${({ $isValid }) => ($isValid ? 'var(--sucesso)' : 'var(--carbono)')};
    background: rgba(207, 224, 245, 0.35);
    box-shadow: inset 0 -2.5px 0 ${({ $isValid }) => ($isValid ? 'var(--sucesso)' : 'var(--carbono)')};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: var(--texto-2-papel);
  cursor: pointer;

  &:hover {
    color: var(--grafica);
  }
`;

const Rules = styled.ul`
  list-style: none;
  display: grid;
  gap: 0.2rem 1rem;
  margin-top: 0.6rem;

  @media (min-width: 420px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Rule = styled.li`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  color: ${({ $met }) => ($met ? 'var(--sucesso)' : 'var(--texto-2-papel)')};

  svg {
    flex: none;
  }
`;

const Strong = styled.p`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--sucesso);
`;

const GenerateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  margin-top: 0.6rem;
  padding: 0 0.8rem;
  background: none;
  border: 1.5px solid var(--controle);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.03em;
  color: var(--nanquim);
  cursor: pointer;
  transition: border-color 160ms var(--ease-out), color 160ms var(--ease-out);

  &:hover:not(:disabled) {
    border-color: var(--grafica);
    color: var(--grafica);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

// A senha gerada aparece por extenso para a pessoa guardar; monoespaçada para não confundir l, I e 1
const Generated = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.9rem;
  background: var(--papel-2);
  border: 1.5px solid var(--sucesso);
  border-radius: 2px;

  code {
    flex: 1;
    font-family: monospace;
    font-size: 0.95rem;
    color: var(--nanquim);
    word-break: break-all;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    color: var(--sucesso);
    cursor: pointer;
  }
`;

const criteriaLabels = {
  min_length: 'Mínimo de 8 caracteres',
  has_uppercase: 'Uma letra maiúscula',
  has_lowercase: 'Uma letra minúscula',
  has_number: 'Um número',
  has_special: 'Um símbolo (!@#$…)'
};

// Validação local, para resposta imediata; a API confirma logo depois
const validateLocally = (password) => ({
  min_length: password.length >= 8,
  has_uppercase: /[A-Z]/.test(password),
  has_lowercase: /[a-z]/.test(password),
  has_number: /[0-9]/.test(password),
  has_special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
});

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Digite sua senha',
  showGenerateButton = true,
  showTooltip = true,
  onValidChange,
  disabled = false,
  name = 'password',
  id,
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  // Resposta da API guardada junto com a senha que ela avaliou
  const [apiResult, setApiResult] = useState({ value: null, criteria: null });

  const localCriteria = useMemo(() => validateLocally(value || ''), [value]);
  const criteria = apiResult.value === value && apiResult.criteria ? apiResult.criteria : localCriteria;
  const isValid = !!value && Object.values(criteria).every(Boolean);

  useEffect(() => {
    if (onValidChange) onValidChange(isValid);
  }, [isValid, onValidChange]);

  // Confirma na API com debounce; sem API, fica a validação local
  useEffect(() => {
    if (!value) return undefined;
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/validate-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: value })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.criteria) setApiResult({ value, criteria: data.criteria });
        }
      } catch {
        // Sem conexão: vale a validação local
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/auth/generate-password`);
      if (!res.ok) throw new Error('Erro ao gerar senha');
      const data = await res.json();
      setGeneratedPassword(data.password);
      onChange({ target: { value: data.password, name } });
    } catch {
      // Sem API: gera no navegador, com um de cada tipo
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
      let password = '';
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
      password += '0123456789'[Math.floor(Math.random() * 10)];
      password += '!@#$%^&*()_+-='[Math.floor(Math.random() * 14)];
      for (let i = 0; i < 12; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      password = password.split('').sort(() => Math.random() - 0.5).join('');
      setGeneratedPassword(password);
      onChange({ target: { value: password, name } });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success('Senha copiada.');
    } catch {
      toast.error('Não deu para copiar. Selecione a senha e copie à mão.');
    }
  };

  const rulesId = id ? `${id}-regras` : undefined;

  return (
    <Wrapper>
      <InputRow>
        <StyledInput
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          $isValid={isValid}
          disabled={disabled}
          name={name}
          id={id}
          required={required}
          autoComplete="new-password"
          aria-describedby={showTooltip ? rulesId : undefined}
        />
        <EyeButton
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </EyeButton>
      </InputRow>

      {showTooltip && (
        isValid ? (
          <Strong id={rulesId} aria-live="polite">
            <Check size={16} aria-hidden="true" /> Senha forte.
          </Strong>
        ) : (
          <Rules id={rulesId} aria-label="A senha precisa ter">
            {Object.entries(criteriaLabels).map(([key, label]) => {
              const met = !!criteria[key];
              return (
                <Rule key={key} $met={met}>
                  {met ? <Check size={16} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}
                  <span>{label}{met ? <span className="sr-only"> (ok)</span> : ''}</span>
                </Rule>
              );
            })}
          </Rules>
        )
      )}

      {showGenerateButton && (
        <GenerateButton type="button" onClick={handleGeneratePassword} disabled={isGenerating || disabled}>
          <RefreshCw size={16} aria-hidden="true" />
          {isGenerating ? 'Gerando…' : 'Gerar uma senha forte'}
        </GenerateButton>
      )}

      {generatedPassword && generatedPassword === value && (
        <Generated>
          <code>{generatedPassword}</code>
          <button type="button" onClick={copyToClipboard} aria-label="Copiar senha">
            <Copy size={18} aria-hidden="true" />
          </button>
        </Generated>
      )}
    </Wrapper>
  );
}
