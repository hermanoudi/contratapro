import { useState, useId } from 'react';
import styled from 'styled-components';
import { Plus, Trash2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { translateError } from '../apiErrors';
import ImageUpload from '../ImageUpload';
import { PrimaryButton, FieldLabel, InputBox, TextInput, FieldNote } from '../talao';
import { Panel, IconButton, Fieldset, Choices } from './parts';
import { formatCurrency } from './utils';

/* Serviços do profissional: formulário de novo serviço e a lista do que já está no perfil. */

const Form = styled.form`
  display: grid;
  gap: 1rem 1.25rem;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: start;
  }
`;

const Actions = styled.div`
  @media (min-width: 900px) {
    grid-column: 1 / -1;
  }

  button {
    min-width: 12rem;

    @media (max-width: 480px) {
      width: 100%;
    }
  }
`;

const Prefix = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--f-impresso);
  font-weight: 700;
  color: var(--grafica-escura);
  pointer-events: none;
`;

const List = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  background: var(--papel);
  border: 1.5px solid var(--regua);
  border-bottom: 3px solid var(--grafica);
`;

const Photo = styled.div`
  position: relative;
  height: 180px;
  border-bottom: 1.5px solid var(--regua);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
`;

const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.3rem;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  p {
    margin-top: 0.3rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
    color: var(--grafica-escura);

    small {
      font-family: var(--f-texto);
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--texto-2-papel);
    }
  }
`;

const AddPhoto = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  margin-top: 0.6rem;
  padding: 0 0.75rem;
  background: none;
  border: 1.5px solid var(--controle);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.03em;
  color: var(--nanquim);
  cursor: pointer;

  &:hover {
    border-color: var(--grafica);
    color: var(--grafica);
  }
`;

const Empty = styled.p`
  margin-top: 1.5rem;
  color: var(--texto-2-papel);
  line-height: 1.55;
`;

function ServiceCard({ service, onDelete, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/services/${service.id}/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        toast.success('Foto do serviço enviada.');
        onUpdate();
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(translateError(error.detail, 'Não deu para enviar a foto.'));
      }
    } catch {
      toast.error('Não deu para enviar a foto. Confira sua conexão.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm('Tirar a foto deste serviço?')) return;
    setUploading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/services/${service.id}/image`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Foto removida.');
        onUpdate();
      } else {
        toast.error('Não deu para remover a foto.');
      }
    } catch {
      toast.error('Não deu para remover a foto. Confira sua conexão.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      {service.image_url ? (
        <Photo>
          <img src={service.image_url} alt={`Foto do serviço ${service.title}`} loading="lazy" decoding="async" width="320" height="200" />
          <IconButton type="button" onClick={handleRemoveImage} disabled={uploading} aria-label={`Tirar a foto de ${service.title}`}>
            <X size={18} aria-hidden="true" />
          </IconButton>
        </Photo>
      ) : showUpload ? (
        <div style={{ padding: '1rem 1rem 0' }}>
          <ImageUpload onImageSelect={handleUpload} small disabled={uploading} />
        </div>
      ) : null}

      <CardBody>
        <div>
          <h3>{service.title}</h3>
          <p>
            {formatCurrency(service.price)}
            {service.price ? <small>{service.duration_type === 'daily' ? ' /dia' : ' /hora'}</small> : null}
          </p>
          {!service.image_url && !showUpload && (
            <AddPhoto type="button" onClick={() => setShowUpload(true)}>
              <ImagePlus size={16} aria-hidden="true" /> Adicionar foto
            </AddPhoto>
          )}
        </div>
        <IconButton type="button" $tone="erro" onClick={() => onDelete(service.id)} aria-label={`Excluir o serviço ${service.title}`}>
          <Trash2 size={18} aria-hidden="true" />
        </IconButton>
      </CardBody>
    </Card>
  );
}

export default function ServicesPanel({ services, setServices, onRefresh }) {
  const id = useId();
  const [newService, setNewService] = useState({ title: '', price: '', duration_type: 'hourly' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePriceChange = (e) => {
    // Só números e uma vírgula
    let value = e.target.value.replace(/[^\d,]/g, '');
    const parts = value.split(',');
    if (parts.length > 2) value = parts[0] + ',' + parts.slice(1).join('');
    setNewService({ ...newService, price: value });
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.title.trim()) {
      setError('Escreva o nome do serviço.');
      document.getElementById(`${id}-titulo`)?.focus();
      return;
    }
    const token = localStorage.getItem('token');
    // Vírgula brasileira para ponto
    const numericPrice = newService.price ? parseFloat(newService.price.replace(',', '.')) : null;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/services/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newService, title: newService.title.trim(), price: numericPrice })
      });
      if (res.ok) {
        const saved = await res.json();
        setServices((prev) => [...prev, saved]);
        setNewService({ title: '', price: '', duration_type: 'hourly' });
        setError('');
        toast.success('Serviço adicionado ao seu perfil.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(translateError(data.detail, 'Não deu para adicionar o serviço. Tente de novo.'));
      }
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Excluir este serviço do seu perfil?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
        toast.success('Serviço excluído.');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(translateError(data.detail, 'Não deu para excluir o serviço.'));
      }
    } catch {
      toast.error('Não deu para excluir o serviço. Confira sua conexão.');
    }
  };

  return (
    <>
      <Panel data-tour="add-service-form" aria-labelledby={`${id}-novo`}>
        <h2 id={`${id}-novo`}>Novo serviço</h2>
        <Form onSubmit={handleAddService} noValidate>
          <div data-tour="service-title">
            <FieldLabel htmlFor={`${id}-titulo`}>Nome do serviço</FieldLabel>
            <TextInput
              id={`${id}-titulo`}
              placeholder="ex.: pintura de paredes"
              value={newService.title}
              onChange={(e) => { setNewService({ ...newService, title: e.target.value }); setError(''); }}
              aria-invalid={error && !newService.title.trim() ? true : undefined}
              required
            />
          </div>
          <div data-tour="service-price">
            <FieldLabel htmlFor={`${id}-preco`}>Preço</FieldLabel>
            <InputBox>
              <Prefix aria-hidden="true">R$</Prefix>
              <TextInput
                id={`${id}-preco`}
                $icon
                inputMode="decimal"
                placeholder="0,00 (vazio = a combinar)"
                value={newService.price}
                onChange={handlePriceChange}
              />
            </InputBox>
          </div>
          <Fieldset data-tour="service-duration">
            <legend>Cobrança</legend>
            <Choices>
              <label>
                <input
                  type="radio"
                  name={`${id}-cobranca`}
                  value="hourly"
                  checked={newService.duration_type === 'hourly'}
                  onChange={(e) => setNewService({ ...newService, duration_type: e.target.value })}
                />
                Por hora
              </label>
              <label>
                <input
                  type="radio"
                  name={`${id}-cobranca`}
                  value="daily"
                  checked={newService.duration_type === 'daily'}
                  onChange={(e) => setNewService({ ...newService, duration_type: e.target.value })}
                />
                Diária (o dia todo)
              </label>
            </Choices>
          </Fieldset>
          {error && <FieldNote role="alert" $tone="erro" style={{ gridColumn: '1 / -1' }}>{error}</FieldNote>}
          <Actions>
            <PrimaryButton type="submit" disabled={saving}>
              <Plus size={18} aria-hidden="true" /> {saving ? 'Adicionando…' : 'Adicionar serviço'}
            </PrimaryButton>
          </Actions>
        </Form>
      </Panel>

      <div data-tour="services-list">
        {services.length === 0 ? (
          <Empty>Nenhum serviço no seu perfil ainda. Os clientes só conseguem agendar o que estiver aqui.</Empty>
        ) : (
          <List>
            {services.map((s) => (
              // A chave muda com a foto: o cartão volta ao estado inicial depois de enviar ou tirar
              <ServiceCard key={`${s.id}-${s.image_url || ''}`} service={s} onDelete={handleDeleteService} onUpdate={onRefresh} />
            ))}
          </List>
        )}
      </div>
    </>
  );
}
