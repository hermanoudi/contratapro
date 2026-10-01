import styled from 'styled-components';
import { User, ImagePlus } from 'lucide-react';
import { FieldNote } from './talao';

/* Foto de perfil no registro contido: a moldura é a mesma do cartão de
   profissional (é assim que o cliente vê). Usada no cadastro e em Meu perfil. */

const Box = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: var(--papel-2);
  border: 1.5px dashed ${({ $erro }) => ($erro ? 'var(--grafica)' : 'var(--controle)')};

  @media (max-width: 420px) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
`;

const Frame = styled.div`
  flex: none;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border: 2px solid var(--nanquim);
  background: var(--amarela);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--nanquim);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;

  p {
    font-size: 0.95rem;
    color: var(--texto-2-papel);
  }
`;

// O input fica acessível (só escondido da vista): o rótulo estilizado é o botão
const FilePick = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0 1.2rem;
  border: 2px solid var(--grafica);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--grafica);
  cursor: pointer;
  transition: background-color 160ms var(--ease-out), color 160ms var(--ease-out);

  &:hover {
    background: var(--grafica);
    color: var(--papel);
  }

  &:focus-within {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }
`;

const TextButton = styled.button`
  align-self: center;
  background: none;
  border: none;
  padding: 0;
  min-height: 0;
  font-size: 0.95rem;
  color: var(--texto-2-papel);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: var(--grafica);
  }

  @media (min-width: 421px) {
    align-self: flex-start;
  }
`;

export default function PhotoPicker({ id, preview, hasFile, onChange, onRemove, removeLabel = 'Tirar esta foto', error, inputRef }) {
  return (
    <>
      <Box $erro={!!error}>
        <Frame>
          {preview ? <img src={preview} alt="Prévia da sua foto" /> : <User size={56} aria-hidden="true" />}
        </Frame>
        <Side>
          <FilePick>
            <input
              id={id}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={onChange}
              aria-describedby={`${id}-nota`}
              ref={inputRef}
            />
            <ImagePlus size={20} aria-hidden="true" />
            {preview ? 'Trocar a foto' : 'Escolher a foto'}
          </FilePick>
          {hasFile && onRemove && (
            <TextButton type="button" onClick={onRemove}>{removeLabel}</TextButton>
          )}
          <p id={`${id}-nota`}>JPG, PNG ou GIF, até 5 MB.</p>
        </Side>
      </Box>
      {error && <FieldNote $tone="erro" role="alert">{error}</FieldNote>}
    </>
  );
}
