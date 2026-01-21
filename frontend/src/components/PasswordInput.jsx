import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff, Check, X, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  padding-right: ${props => props.$hasActions ? '5rem' : '3rem'};
  border: 2px solid ${props => props.$isValid === true ? '#10b981' : props.$isValid === false ? '#ef4444' : 'var(--border)'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;

  &:focus {
    outline: none;
    border-color: ${props => props.$isValid === true ? '#10b981' : props.$isValid === false ? '#ef4444' : 'var(--primary)'};
    box-shadow: 0 0 0 3px ${props => props.$isValid === true ? 'rgba(16, 185, 129, 0.1)' : props.$isValid === false ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-glow)'};
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: ${props => props.$position || '0.75rem'};
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: var(--primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  svg {
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$show ? '0' : '-10px'});
  transition: all 0.2s;
`;

const TooltipTitle = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CriteriaList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CriteriaItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.$met ? '#10b981' : 'var(--text-secondary)'};
  transition: color 0.2s;

  svg {
    flex-shrink: 0;
  }
`;

const StrengthBar = styled.div`
  margin-top: 0.75rem;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${props => props.$strength}%;
  background: ${props => {
    if (props.$strength <= 20) return '#ef4444';
    if (props.$strength <= 40) return '#f97316';
    if (props.$strength <= 60) return '#eab308';
    if (props.$strength <= 80) return '#84cc16';
    return '#10b981';
  }};
  transition: all 0.3s;
`;

const StrengthLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  text-align: right;
`;

const GeneratedPasswordDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #166534;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #166534;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const criteriaLabels = {
  min_length: 'Mínimo 8 caracteres',
  has_uppercase: 'Letra maiúscula (A-Z)',
  has_lowercase: 'Letra minúscula (a-z)',
  has_number: 'Número (0-9)',
  has_special: 'Caractere especial (!@#$%...)'
};

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
  const [isFocused, setIsFocused] = useState(false);
  const [criteria, setCriteria] = useState({
    min_length: false,
    has_uppercase: false,
    has_lowercase: false,
    has_number: false,
    has_special: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Validação local (fallback)
  const validateLocally = useCallback((password) => {
    return {
      min_length: password.length >= 8,
      has_uppercase: /[A-Z]/.test(password),
      has_lowercase: /[a-z]/.test(password),
      has_number: /[0-9]/.test(password),
      has_special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }, []);

  // Validar senha quando o valor muda
  useEffect(() => {
    if (!value) {
      setCriteria({
        min_length: false,
        has_uppercase: false,
        has_lowercase: false,
        has_number: false,
        has_special: false
      });
      if (onValidChange) onValidChange(false);
      return;
    }

    // Validação local primeiro (para feedback imediato)
    const localCriteria = validateLocally(value);
    setCriteria(localCriteria);

    const isValid = Object.values(localCriteria).every(Boolean);
    if (onValidChange) onValidChange(isValid);

    // Validação na API (opcional, para consistência)
    const validateWithApi = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/validate-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: value })
        });
        if (res.ok) {
          const data = await res.json();
          setCriteria(data.criteria);
          if (onValidChange) onValidChange(data.is_valid);
        }
      } catch (e) {
        // Fallback: usar validação local
        console.log('Usando validação local');
      }
    };

    // Debounce para não fazer muitas requisições
    const timeoutId = setTimeout(validateWithApi, 300);
    return () => clearTimeout(timeoutId);
  }, [value, onValidChange, validateLocally]);

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/auth/generate-password`);
      if (res.ok) {
        const data = await res.json();
        setGeneratedPassword(data.password);
        onChange({ target: { value: data.password, name } });
        toast.success('Senha forte gerada!');
      } else {
        throw new Error('Erro ao gerar senha');
      }
    } catch (e) {
      // Fallback: gerar localmente
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
      let password = '';
      // Garantir pelo menos um de cada tipo
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
      password += '0123456789'[Math.floor(Math.random() * 10)];
      password += '!@#$%^&*()_+-='[Math.floor(Math.random() * 14)];
      for (let i = 0; i < 12; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      // Embaralhar
      password = password.split('').sort(() => Math.random() - 0.5).join('');
      setGeneratedPassword(password);
      onChange({ target: { value: password, name } });
      toast.success('Senha forte gerada!');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success('Senha copiada!');
  };

  const metCount = Object.values(criteria).filter(Boolean).length;
  const strength = (metCount / 5) * 100;
  const isValid = metCount === 5;

  const getStrengthLabel = () => {
    if (strength <= 20) return 'Muito fraca';
    if (strength <= 40) return 'Fraca';
    if (strength <= 60) return 'Média';
    if (strength <= 80) return 'Boa';
    return 'Forte';
  };

  return (
    <InputContainer>
      <InputWrapper>
        <StyledInput
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          $isValid={value ? isValid : null}
          $hasActions={showGenerateButton}
          disabled={disabled}
          name={name}
          id={id}
          required={required}
          autoComplete="new-password"
        />
        <IconButton
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          $position={showGenerateButton ? '2.5rem' : '0.75rem'}
          tabIndex={-1}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </IconButton>
      </InputWrapper>

      {showTooltip && (
        <Tooltip $show={isFocused && value?.length > 0} role="tooltip" aria-live="polite">
          <TooltipTitle>
            {isValid ? (
              <>
                <Check size={16} color="#10b981" />
                Senha forte!
              </>
            ) : (
              'Requisitos da senha:'
            )}
          </TooltipTitle>
          <CriteriaList>
            {Object.entries(criteria).map(([key, met]) => (
              <CriteriaItem key={key} $met={met} aria-label={`${criteriaLabels[key]}: ${met ? 'atendido' : 'não atendido'}`}>
                {met ? <Check size={16} color="#10b981" /> : <X size={16} color="#d1d5db" />}
                {criteriaLabels[key]}
              </CriteriaItem>
            ))}
          </CriteriaList>
          <StrengthBar role="progressbar" aria-valuenow={strength} aria-valuemin="0" aria-valuemax="100">
            <StrengthFill $strength={strength} />
          </StrengthBar>
          <StrengthLabel>{getStrengthLabel()}</StrengthLabel>
        </Tooltip>
      )}

      {showGenerateButton && (
        <GenerateButton
          type="button"
          onClick={handleGeneratePassword}
          disabled={isGenerating || disabled}
          aria-label="Gerar senha forte automaticamente"
        >
          <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Gerando...' : 'Gerar senha forte'}
        </GenerateButton>
      )}

      {generatedPassword && generatedPassword === value && (
        <GeneratedPasswordDisplay>
          <span style={{ flex: 1, wordBreak: 'break-all' }}>{generatedPassword}</span>
          <CopyButton type="button" onClick={copyToClipboard} aria-label="Copiar senha">
            <Copy size={16} />
          </CopyButton>
        </GeneratedPasswordDisplay>
      )}
    </InputContainer>
  );
}
