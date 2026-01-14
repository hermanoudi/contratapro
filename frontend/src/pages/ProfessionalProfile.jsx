import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, MapPin, Camera, Save, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`;

const ProfileSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfilePictureWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
`;

const ProfilePicture = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'linear-gradient(135deg, var(--primary), var(--accent))'};
  background-size: cover;
  background-position: center;
  border: 4px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  font-weight: bold;
  overflow: hidden;
`;

const UploadButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary);
  border: 3px solid white;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background: var(--accent);
    transform: scale(1.1);
  }

  svg {
    color: white;
  }

  input {
    display: none;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border);

  svg {
    color: var(--primary);
  }
`;

const Form = styled.form``;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: var(--bg-secondary);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  cursor: pointer;
  background: white;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: var(--bg-secondary);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

export default function ProfessionalProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState({});
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    category: '',
    description: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    loadProfile();
    loadCategories();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

      const data = await response.json();

      setFormData({
        name: data.name || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        category: data.category || '',
        description: data.description || '',
        cep: data.cep || '',
        street: data.street || '',
        number: data.number || '',
        complement: data.complement || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || ''
      });

      if (data.profile_picture) {
        setProfilePicturePreview(data.profile_picture);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories/groups');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error('Erro ao buscar categorias:', e);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    let displayValue = value;
    if (value.length === 11) {
      displayValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length === 10) {
      displayValue = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      displayValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }

    setFormData(prev => ({ ...prev, whatsapp: displayValue }));
  };

  const handleCepChange = async (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    let displayValue = value;
    if (value.length > 5) {
      displayValue = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }

    setFormData(prev => ({ ...prev, cep: displayValue }));

    if (value.length === 8) {
      try {
        const response = await fetch(`/api/cep/${value}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            street: data.street,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state
          }));
          toast.success('Endereço localizado!');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo: 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Apenas imagens são permitidas');
        return;
      }

      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (profilePictureFile) {
        formDataToSend.append('profile_picture', profilePictureFile);
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      toast.success('Perfil atualizado com sucesso!');
      setProfilePictureFile(null);
      await loadProfile();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Carregando perfil...</LoadingState>
      </PageContainer>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais e profissionais</p>
      </PageHeader>

      <Form onSubmit={handleSubmit}>
        <ProfileSection>
          <ProfileHeader>
            <ProfilePictureWrapper>
              <ProfilePicture $imageUrl={profilePicturePreview}>
                {!profilePicturePreview && getInitials(formData.name)}
              </ProfilePicture>
              <UploadButton>
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </UploadButton>
            </ProfilePictureWrapper>
            <ProfileInfo>
              <h2>{formData.name}</h2>
              <p>{formData.email}</p>
            </ProfileInfo>
          </ProfileHeader>

          <SectionTitle>
            <User size={20} />
            Dados Pessoais
          </SectionTitle>

          <InputGrid>
            <InputGroup>
              <Label>Nome Completo</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
              />
            </InputGroup>
          </InputGrid>
        </ProfileSection>

        <ProfileSection>
          <SectionTitle>
            <Briefcase size={20} />
            Informações Profissionais
          </SectionTitle>

          <InputGrid>
            <InputGroup>
              <Label>WhatsApp</Label>
              <Input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleWhatsAppChange}
                placeholder="(00) 00000-0000"
              />
            </InputGroup>
            <InputGroup>
              <Label>Categoria</Label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {Object.entries(categories).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </InputGroup>
          </InputGrid>

          <InputGroup>
            <Label>Descrição / Sobre Você</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Conte um pouco sobre sua experiência e serviços..."
            />
          </InputGroup>
        </ProfileSection>

        <ProfileSection>
          <SectionTitle>
            <MapPin size={20} />
            Endereço
          </SectionTitle>

          <InputGrid>
            <InputGroup>
              <Label>CEP</Label>
              <Input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleCepChange}
                placeholder="00000-000"
              />
            </InputGroup>
            <InputGroup>
              <Label>Número</Label>
              <Input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
              />
            </InputGroup>
          </InputGrid>

          <InputGroup style={{ marginBottom: '1.5rem' }}>
            <Label>Rua</Label>
            <Input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGrid>
            <InputGroup>
              <Label>Bairro</Label>
              <Input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
              />
            </InputGroup>
            <InputGroup>
              <Label>Complemento</Label>
              <Input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </InputGroup>
          </InputGrid>

          <InputGrid style={{ marginTop: '1.5rem' }}>
            <InputGroup>
              <Label>Cidade</Label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </InputGroup>
            <InputGroup>
              <Label>Estado</Label>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                maxLength={2}
                placeholder="UF"
              />
            </InputGroup>
          </InputGrid>
        </ProfileSection>

        <SaveButton type="submit" disabled={saving}>
          <Save size={20} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </SaveButton>
      </Form>
    </PageContainer>
  );
}
