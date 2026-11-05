import styled from 'styled-components';
import { Field } from './Field';

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

/* Campo de cidade do talão. Sugere só as cidades que têm profissionais cadastrados,
   mas aceita texto livre (a busca no servidor é por trecho do nome). */
export default function CityField({ value, onChange, cities = [], id, inputRef }) {
  const listId = `${id}-lista`;
  return (
    <>
      <Field>
        <span>Cidade:</span>
        <input
          type="text"
          ref={inputRef}
          name="city"
          autoComplete="off"
          placeholder="ex.: São Paulo"
          list={cities.length ? listId : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={id}
        />
      </Field>
      {cities.length > 0 && (
        <datalist id={listId}>
          {cities.map((name) => <option key={name} value={name} />)}
        </datalist>
      )}
      <FieldStatus id={id} aria-live="polite">
        Com a cidade, mostramos quem atende perto de você.
      </FieldStatus>
    </>
  );
}
