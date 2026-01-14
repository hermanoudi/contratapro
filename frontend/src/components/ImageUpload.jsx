import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import styled from 'styled-components';

const UploadContainer = styled.div`
  width: 100%;
  max-width: ${props => props.$small ? '200px' : '400px'};
  margin: ${props => props.$small ? '0' : '0 auto'};
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.$isDragging ? 'var(--primary)' : 'var(--border)'};
  border-radius: 12px;
  padding: ${props => props.$small ? '1rem' : '2rem'};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$isDragging ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-secondary)'};

  &:hover {
    border-color: var(--primary);
    background: rgba(139, 92, 246, 0.05);
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-secondary);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: ${props => props.$small ? '150px' : '250px'};
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 1);
  }
`;

const UploadIcon = styled(Upload)`
  margin: 0 auto ${props => props.$small ? '0.25rem' : '0.5rem'} auto;
  color: var(--primary);
`;

const UploadText = styled.p`
  color: var(--text-secondary);
  font-size: ${props => props.$small ? '0.75rem' : '0.875rem'};
  margin: 0;
`;

const UploadHint = styled.p`
  color: var(--text-tertiary);
  font-size: ${props => props.$small ? '0.65rem' : '0.75rem'};
  margin: 0.25rem 0 0 0;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

export default function ImageUpload({
  onImageSelect,
  currentImage = null,
  onRemove,
  small = false,
  disabled = false
}) {
  const [preview, setPreview] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Formato não permitido. Use JPG, PNG ou WEBP');
      return false;
    }

    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo: 5MB');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (!file || disabled) return;

    if (validateFile(file)) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <UploadContainer $small={small}>
      {preview ? (
        <PreviewContainer>
          <PreviewImage src={preview} alt="Preview" $small={small} />
          <RemoveButton onClick={handleRemove} disabled={disabled}>
            <X size={small ? 16 : 18} />
          </RemoveButton>
        </PreviewContainer>
      ) : (
        <UploadArea
          $isDragging={isDragging}
          $small={small}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadIcon size={small ? 24 : 32} $small={small} />
          <UploadText $small={small}>
            {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
          </UploadText>
          <UploadHint $small={small}>JPG, PNG ou WEBP (máx. 5MB)</UploadHint>
        </UploadArea>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </UploadContainer>
  );
}
