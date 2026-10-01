import { useState, useId } from 'react';
import { Upload, X } from 'lucide-react';
import styled from 'styled-components';

/* Envio de imagem no registro contido. O input de arquivo fica acessível (só escondido
   da vista) dentro do rótulo: abre pelo teclado; arrastar e soltar continua valendo. */

const UploadContainer = styled.div`
  width: 100%;
  max-width: ${(props) => (props.$small ? '260px' : '400px')};
  margin: ${(props) => (props.$small ? '0' : '0 auto')};
`;

const UploadArea = styled.label`
  display: block;
  border: 1.5px dashed ${(props) => (props.$isDragging ? 'var(--grafica)' : 'var(--controle)')};
  border-radius: 2px;
  padding: ${(props) => (props.$small ? '1rem' : '2rem')};
  text-align: center;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  background: ${(props) => (props.$isDragging ? 'rgba(207, 224, 245, 0.45)' : 'var(--papel-2)')};
  transition: border-color 160ms var(--ease-out), background-color 160ms var(--ease-out);

  &:hover {
    border-color: var(--grafica);
  }

  &:focus-within {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }

  svg {
    display: block;
    margin: 0 auto ${(props) => (props.$small ? '0.35rem' : '0.5rem')};
    color: var(--grafica);
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1.5px solid var(--regua);
`;

const PreviewImage = styled.img`
  display: block;
  width: 100%;
  height: ${(props) => (props.$small ? '150px' : '250px')};
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--papel);
  border: 1.5px solid var(--controle);
  border-radius: 2px;
  color: var(--nanquim);
  cursor: pointer;

  &:hover {
    border-color: var(--grafica);
    color: var(--grafica);
  }
`;

const UploadText = styled.span`
  display: block;
  font-weight: 600;
  font-size: ${(props) => (props.$small ? '0.95rem' : '1rem')};
  color: var(--nanquim);
`;

const UploadHint = styled.span`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--texto-2-papel);
`;

const ErrorMessage = styled.p`
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--grafica);
`;

export default function ImageUpload({
  onImageSelect,
  currentImage = null,
  onRemove,
  small = false,
  disabled = false
}) {
  const id = useId();
  const [preview, setPreview] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Esse formato não serve. Use JPG, PNG ou WEBP.');
      return false;
    }
    if (file.size > maxSize) {
      setError('Essa imagem passa de 5 MB. Escolha uma menor.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (!file || disabled) return;
    if (validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      if (onImageSelect) onImageSelect(file);
    }
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError('');
    if (onRemove) onRemove();
  };

  return (
    <UploadContainer $small={small}>
      {preview ? (
        <PreviewContainer>
          <PreviewImage src={preview} alt="Prévia da imagem escolhida" $small={small} />
          <RemoveButton type="button" onClick={handleRemove} disabled={disabled} aria-label="Tirar esta imagem">
            <X size={18} aria-hidden="true" />
          </RemoveButton>
        </PreviewContainer>
      ) : (
        <UploadArea
          htmlFor={id}
          $isDragging={isDragging}
          $small={small}
          $disabled={disabled}
          onDragEnter={(e) => { stop(e); if (!disabled) setIsDragging(true); }}
          onDragLeave={(e) => { stop(e); setIsDragging(false); }}
          onDragOver={stop}
          onDrop={(e) => {
            stop(e);
            setIsDragging(false);
            if (!disabled && e.dataTransfer.files?.length) handleFileSelect(e.dataTransfer.files[0]);
          }}
        >
          <input
            id={id}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => { handleFileSelect(e.target.files?.[0]); e.target.value = ''; }}
            disabled={disabled}
          />
          <Upload size={small ? 22 : 30} aria-hidden="true" />
          <UploadText $small={small}>{isDragging ? 'Solte a imagem aqui' : 'Escolher ou arrastar uma imagem'}</UploadText>
          <UploadHint>JPG, PNG ou WEBP, até 5 MB.</UploadHint>
        </UploadArea>
      )}

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
    </UploadContainer>
  );
}
