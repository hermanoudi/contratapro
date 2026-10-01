import { useState, useEffect, useId } from 'react';
import styled from 'styled-components';
import { AlertCircle, RotateCw, Save, User, Mail, Phone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import { PrimaryButton, FieldLabel, TextInput, FieldNote } from '../components/talao';
import { PageHead, Panel, Notice } from '../components/dashboard/parts';
import { TextField, AddressFields } from '../components/SignupParts';
import { formatWhatsApp, formatCepMask, validateAddress, profileFormData, photoError } from '../components/signupUtils';
import { translateError } from '../components/apiErrors';
import PhotoPicker from '../components/PhotoPicker';

/* Meu perfil (ProfessionalLayout) no registro contido: o que o cliente vê
   no cartão da busca e na página pública. PUT /users/me é FormData. */

const Sheet = styled(Panel).attrs({ as: 'form' })`
  max-width: 46rem;
`;

const Section = styled.section`
  & + & {
    margin-top: 2rem;
  }

  > h2 {
    padding-bottom: 0.4rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid var(--grafica);
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
  }

  > p {
    margin: -0.5rem 0 1rem;
    line-height: 1.5;
    color: var(--texto-2-papel);
  }
`;

const Group = styled.div`
  & + & {
    margin-top: 1.1rem;
  }
`;

const SaveRow = styled.div`
  margin-top: 2rem;

  button {
    min-width: 14rem;

    @media (max-width: 480px) {
      width: 100%;
    }
  }
`;

const PublicLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  font-weight: 600;
  color: var(--grafica);
  text-underline-offset: 3px;
`;

const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;

const DESCRIPTION_MAX = 500;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

async function loadProfile() {
  const [meRes, catRes] = await Promise.all([
    fetch(`${API_URL}/auth/me`, { headers: authHeaders() }),
    fetch(`${API_URL}/categories/groups`).catch(() => null),
  ]);
  if (!meRes.ok) throw new Error(String(meRes.status));
  const me = await meRes.json();
  const categories = catRes && catRes.ok ? await catRes.json() : null;
  return { me, categories };
}

const toForm = (me) => ({
  name: me.name || '',
  email: me.email || '',
  whatsapp: me.whatsapp ? formatWhatsApp(me.whatsapp) : '',
  category: me.category || '',
  description: me.description || '',
  cep: me.cep ? formatCepMask(me.cep) : '',
  street: me.street || '',
  number: me.number || '',
  complement: me.complement || '',
  neighborhood: me.neighborhood || '',
  city: me.city || '',
  state: me.state || '',
});

export default function ProfessionalProfile() {
  const id = useId();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: 'loading' });
  const [form, setForm] = useState(null);
  const [photo, setPhoto] = useState({ file: null, preview: null });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadProfile()
      .then(({ me, categories }) => {
        if (cancelled) return;
        setState({ status: 'ok', me, categories });
        setForm(toForm(me));
        setPhoto({ file: null, preview: me.profile_picture || null });
      })
      .catch((e) => {
        console.error('Falha ao carregar o perfil', e);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const set = (field) => (e) => {
    const value = field === 'whatsapp' ? formatWhatsApp(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const pickPhoto = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const problem = photoError(file);
    if (problem) {
      setErrors((p) => ({ ...p, photo: problem }));
      return;
    }
    setErrors((p) => ({ ...p, photo: undefined }));
    const reader = new FileReader();
    reader.onloadend = () => setPhoto({ file, preview: reader.result });
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const found = {};
    if (!form.name.trim()) found.name = 'Informe seu nome.';
    const phone = form.whatsapp.replace(/\D/g, '');
    if (phone.length < 10) found.whatsapp = 'Informe o WhatsApp com DDD.';
    if (!form.category) found.category = 'Escolha a sua categoria.';
    Object.assign(found, validateAddress(form));
    return found;
  };

  const save = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError('');
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const body = profileFormData({
        name: form.name.trim(),
        whatsapp: form.whatsapp,
        category: form.category,
        description: form.description.trim(),
        cep: form.cep.replace(/\D/g, ''),
        street: form.street,
        number: form.number,
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
      });
      if (photo.file) body.append('profile_picture', photo.file);
      const res = await fetch(`${API_URL}/users/me`, { method: 'PUT', headers: authHeaders(), body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(translateError(data.detail, 'Não deu para salvar o seu perfil. Tente de novo.'));
        return;
      }
      setState((s) => ({ ...s, me: data }));
      setPhoto({ file: null, preview: data.profile_picture || photo.preview });
      toast.success('Perfil salvo. É assim que os clientes veem você agora.');
    } catch {
      setFormError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  if (state.status === 'loading') return <Loading role="status">Carregando o seu perfil…</Loading>;

  if (state.status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p>
          <AlertCircle size={18} aria-hidden="true" />
          <span>Não deu para carregar o seu perfil agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
        </p>
        <PrimaryButton type="button" onClick={() => { setState({ status: 'loading' }); setAttempt((n) => n + 1); }}>
          <RotateCw size={18} aria-hidden="true" /> Tentar de novo
        </PrimaryButton>
      </Notice>
    );
  }

  const { me, categories } = state;

  return (
    <>
      <PageHead>
        <div>
          <h1 data-display>Meu perfil</h1>
          <p>O que os clientes veem no seu cartão da busca e na sua página.</p>
        </div>
        {me.slug && (
          <PublicLink href={`/p/${me.slug}`} target="_blank" rel="noopener noreferrer">
            Ver minha página <ExternalLink size={16} aria-hidden="true" />
          </PublicLink>
        )}
      </PageHead>

      <Sheet onSubmit={save} noValidate aria-label="Meu perfil">
        <Section aria-labelledby={`${id}-foto-titulo`}>
          <h2 id={`${id}-foto-titulo`}>Foto</h2>
          <p>Quem vai receber você em casa quer ver seu rosto.</p>
          <PhotoPicker
            id={`${id}-photo`}
            preview={photo.preview}
            hasFile={!!photo.file}
            onChange={pickPhoto}
            onRemove={() => setPhoto({ file: null, preview: me.profile_picture || null })}
            removeLabel="Manter a foto anterior"
            error={errors.photo}
          />
        </Section>

        <Section aria-labelledby={`${id}-contato-titulo`}>
          <h2 id={`${id}-contato-titulo`}>Contato</h2>
          <TextField id={`${id}-name`} label="Nome" icon={User} autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} required />
          <TextField id={`${id}-email`} label="E-mail" icon={Mail} type="email" value={form.email} readOnly hint="O e-mail é o seu login e não muda por aqui." />
          <TextField
            id={`${id}-whatsapp`}
            label="WhatsApp"
            icon={Phone}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={form.whatsapp}
            onChange={set('whatsapp')}
            error={errors.whatsapp}
            hint="Os clientes falam com você por aqui."
            required
          />
        </Section>

        <Section aria-labelledby={`${id}-trabalho-titulo`}>
          <h2 id={`${id}-trabalho-titulo`}>O seu trabalho</h2>
          <Group>
            <FieldLabel htmlFor={`${id}-category`}>Categoria</FieldLabel>
            <TextInput
              as="select"
              id={`${id}-category`}
              value={form.category}
              onChange={set('category')}
              aria-invalid={errors.category ? true : undefined}
              aria-describedby={errors.category ? `${id}-category-nota` : undefined}
            >
              <option value="">Escolha…</option>
              {/* Categoria atual continua na lista mesmo se as categorias não carregarem */}
              {!categories && form.category && <option value={form.category}>{me.category}</option>}
              {categories && Object.entries(categories).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                </optgroup>
              ))}
            </TextInput>
            {errors.category
              ? <FieldNote id={`${id}-category-nota`} $tone="erro">{errors.category}</FieldNote>
              : !categories && <FieldNote>Não deu para carregar a lista de categorias. A atual continua salva.</FieldNote>}
          </Group>
          <Group>
            <FieldLabel htmlFor={`${id}-description`}>Sobre você</FieldLabel>
            <TextInput
              as="textarea"
              id={`${id}-description`}
              rows={4}
              maxLength={DESCRIPTION_MAX}
              placeholder="Ex.: faço acabamento fino, levo o material, atendo aos sábados"
              value={form.description}
              onChange={set('description')}
              aria-describedby={`${id}-description-nota`}
              style={{ resize: 'vertical', padding: '0.75rem 1rem', minHeight: '7rem' }}
            />
            <FieldNote id={`${id}-description-nota`}>
              Aparece na sua página. {form.description.length} de {DESCRIPTION_MAX} letras.
            </FieldNote>
          </Group>
        </Section>

        <Section aria-labelledby={`${id}-endereco-titulo`}>
          <h2 id={`${id}-endereco-titulo`}>Endereço</h2>
          <p>A cidade aparece na busca; a rua e o número, só para quem agendou com você.</p>
          <AddressFields idPrefix={id} formData={form} setFormData={setForm} errors={errors} />
        </Section>

        {formError && <FieldNote role="alert" $tone="erro">{formError}</FieldNote>}

        <SaveRow>
          <PrimaryButton type="submit" disabled={saving}>
            <Save size={18} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar o perfil'}
          </PrimaryButton>
        </SaveRow>
      </Sheet>
    </>
  );
}
