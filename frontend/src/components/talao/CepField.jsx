import styled, { keyframes } from 'styled-components';
import { Check } from 'lucide-react';
import { Field } from './Field';
import { Hand } from './type';
import { formatCep } from './useCep';

const writeIn = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
`;

// Linha de status embaixo do campo: ajuda em texto-2, erro em tinta de gráfica
export const FieldStatus = styled.p`
  min-height: 1.9rem;
  padding-top: 0.35rem;
  font-size: 0.95rem;
  color: ${({ $tone }) => ($tone === 'erro' ? 'var(--grafica)' : 'var(--texto-2)')};
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

// A cidade confirmada se escreve à mão, da esquerda para a direita
const CityWrite = styled(Hand)`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1.5rem;
  line-height: 1;
  animation: ${writeIn} 700ms var(--ease-out) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/* Campo de CEP do talão ligado ao useCep. `cep` é o objeto que o hook devolve. */
export default function CepField({ cep, id, inputRef }) {
  return (
    <>
      <Field>
        <span>CEP:</span>
        <input
          type="text"
          ref={inputRef}
          name="cep"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          value={formatCep(cep.cepDigits)}
          onChange={(e) => cep.handleCepChange(e.target.value)}
          aria-describedby={id}
          aria-invalid={cep.cepState === 'notfound' || cep.cepIncomplete || undefined}
        />
      </Field>
      <FieldStatus id={id} aria-live="polite" $tone={cep.status?.tone}>
        {cep.cepState === 'ok' ? (
          <CityWrite key={cep.city}>
            <Check size={20} aria-hidden="true" /> {cep.city}
          </CityWrite>
        ) : (
          cep.status?.text
        )}
      </FieldStatus>
    </>
  );
}
