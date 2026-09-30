import { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { MapPin } from 'lucide-react';
import { API_URL } from '../config';
import { FieldLabel, InputBox, TextInput, FieldNote } from './talao';
import { formatCepMask } from './signupUtils';

/* Peças dos cadastros (cliente e profissional) no registro contido. */

/* ------------------------------ Estrutura ------------------------------ */

const Head = styled.div`
  margin-bottom: 1.75rem;

  > p:first-child {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica-escura);
    margin-bottom: 0.35rem;
  }

  h1 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(2rem, 4vw, 2.5rem);
    line-height: 1.05;
    letter-spacing: -0.01em;

    &:focus {
      outline: none;
    }
  }

  > p:last-child:not(:first-child) {
    margin-top: 0.5rem;
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--texto-2-papel);
  }
`;

// A ordem dos passos é informação real aqui: "Passo 1 de 2" fica à vista
export const StepHead = forwardRef(function StepHead({ step, total, title, lead }, ref) {
  return (
    <Head>
      <p>Passo {step} de {total}</p>
      <h1 ref={ref} tabIndex={-1}>{title}</h1>
      {lead && <p>{lead}</p>}
    </Head>
  );
});

export const Group = styled.div`
  & + & {
    margin-top: 1.25rem;
  }
`;

export const Row = styled.div`
  display: grid;
  gap: 1.25rem 1rem;
  grid-template-columns: ${({ $cols }) => $cols || '1fr 1fr'};

  & + &,
  ${Group} + &,
  & + ${Group} {
    margin-top: 1.25rem;
  }

  > ${Group} + ${Group} {
    margin-top: 0;
  }
`;

export const Actions = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
  grid-template-columns: ${({ $single }) => ($single ? '1fr' : 'auto minmax(0, 1fr)')};

  button {
    width: 100%;
    min-height: 54px;
  }

  /* Celular estreito: a ação principal vem em cima, inteira; "Voltar" desce */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;

    > :first-child:not(:last-child) {
      order: 2;
    }
  }
`;

export const FormError = styled(FieldNote).attrs({ role: 'alert', $tone: 'erro' })`
  margin-top: 1.25rem;
`;

export const FooterNote = styled.p`
  margin-top: 1.75rem;
  padding-top: 1rem;
  border-top: 1.5px solid var(--pauta);
  text-align: center;
  color: var(--texto-2-papel);

  a {
    color: var(--grafica);
    font-weight: 600;
    text-underline-offset: 3px;
  }
`;

/* Campo com rótulo ligado, ícone opcional e erro próprio */
export function TextField({ id, label, icon: Icon, error, hint, ...inputProps }) {
  const noteId = error || hint ? `${id}-nota` : undefined;
  return (
    <Group>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputBox>
        {Icon && <Icon size={20} aria-hidden="true" />}
        <TextInput
          id={id}
          $icon={!!Icon}
          aria-invalid={error ? true : undefined}
          aria-describedby={noteId}
          {...inputProps}
        />
      </InputBox>
      {(error || hint) && (
        <FieldNote id={noteId} $tone={error ? 'erro' : undefined}>{error || hint}</FieldNote>
      )}
    </Group>
  );
}

/* ------------------------------ Endereço ------------------------------ */

/* Bloco de endereço com busca do CEP. Se a busca falhar, cidade e UF ficam
   editáveis: o cadastro nunca trava por causa do serviço de CEP. */
export function AddressFields({ idPrefix, formData, setFormData, errors = {}, cepRef }) {
  const [cepState, setCepState] = useState(formData.city ? 'ok' : 'idle'); // idle | loading | ok | notfound | offline

  const handleCepChange = async (e) => {
    const display = formatCepMask(e.target.value);
    const digits = display.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, cep: display }));

    if (digits.length < 8) {
      setCepState('idle');
      return;
    }

    setCepState('loading');
    try {
      const response = await fetch(`${API_URL}/cep/${digits}`);
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || '',
          state: data.state || '',
        }));
        setCepState(data.city ? 'ok' : 'notfound');
      } else {
        setFormData((prev) => ({ ...prev, city: '', state: '' }));
        setCepState(response.status >= 500 ? 'offline' : 'notfound');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepState('offline');
    }
  };

  const cepNote = errors.cep || {
    idle: 'Preenchemos rua, bairro e cidade pelo CEP.',
    loading: 'Consultando o CEP…',
    ok: `Endereço em ${formData.city}${formData.state ? ` - ${formData.state}` : ''}. Confira e complete.`,
    notfound: 'CEP não encontrado. Confira os números ou preencha o endereço à mão.',
    offline: 'Não deu para consultar o CEP agora. Preencha o endereço à mão.',
  }[cepState];

  const cityLocked = cepState === 'ok' && !!formData.city;
  const set = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <>
      <Group>
        <FieldLabel htmlFor={`${idPrefix}-cep`}>CEP</FieldLabel>
        <InputBox>
          <MapPin size={20} aria-hidden="true" />
          <TextInput
            ref={cepRef}
            id={`${idPrefix}-cep`}
            $icon
            name="cep"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            maxLength={9}
            value={formData.cep}
            onChange={handleCepChange}
            aria-invalid={errors.cep || cepState === 'notfound' ? true : undefined}
            aria-describedby={`${idPrefix}-cep-nota`}
            required
          />
        </InputBox>
        <FieldNote
          id={`${idPrefix}-cep-nota`}
          aria-live="polite"
          $tone={errors.cep || cepState === 'notfound' || cepState === 'offline' ? 'erro' : undefined}
        >
          {cepNote}
        </FieldNote>
      </Group>

      <TextField
        id={`${idPrefix}-rua`}
        label="Rua"
        name="street"
        autoComplete="address-line1"
        placeholder="Nome da rua"
        value={formData.street}
        onChange={set}
        error={errors.street}
        required
      />

      <Row $cols="minmax(0, 1fr) minmax(0, 1.4fr)">
        <TextField
          id={`${idPrefix}-numero`}
          label="Número"
          name="number"
          inputMode="numeric"
          placeholder="123"
          value={formData.number}
          onChange={set}
          error={errors.number}
          required
        />
        <TextField
          id={`${idPrefix}-complemento`}
          label="Complemento"
          name="complement"
          autoComplete="address-line2"
          placeholder="Apto, bloco"
          value={formData.complement}
          onChange={set}
        />
      </Row>

      <TextField
        id={`${idPrefix}-bairro`}
        label="Bairro"
        name="neighborhood"
        placeholder="Seu bairro"
        value={formData.neighborhood}
        onChange={set}
      />

      <Row $cols="minmax(0, 2.4fr) minmax(0, 1fr)">
        <TextField
          id={`${idPrefix}-cidade`}
          label="Cidade"
          name="city"
          autoComplete="address-level2"
          placeholder={cityLocked ? undefined : 'Sua cidade'}
          value={formData.city}
          onChange={set}
          readOnly={cityLocked}
          error={errors.city}
          required
        />
        <TextField
          id={`${idPrefix}-uf`}
          label="UF"
          name="state"
          autoComplete="address-level1"
          placeholder={cityLocked ? undefined : 'MG'}
          maxLength={2}
          value={formData.state}
          onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
          readOnly={cityLocked}
          required
        />
      </Row>
    </>
  );
}

