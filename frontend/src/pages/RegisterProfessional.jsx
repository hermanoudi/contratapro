import { useState, useEffect, useRef, useId } from 'react';
import styled from 'styled-components';
import { ArrowRight, ArrowLeft, Check, User, Phone, Mail, ImagePlus, RotateCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '../config';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton, StampButton, FieldLabel, FieldNote, TextInput } from '../components/talao';
import { StepHead, Group, Actions, FormError, FooterNote, TextField, AddressFields } from '../components/SignupParts';
import { formatCpf, formatWhatsApp, translateError, validateAddress } from '../components/signupUtils';

// Só o que o ContrataPro faz de fato (PRODUCT.md): cadastro grátis, sem intermediar serviço nem pagamento
const FACTS = [
  { strong: 'Grátis e sem cartão:', text: 'o plano Free não vence. Os planos pagos só dão mais visibilidade.' },
  { strong: 'Clientes da sua região:', text: 'quem busca pelo CEP encontra seu perfil e agenda direto na sua agenda.' },
  { strong: 'Sem intermediário:', text: 'o cliente combina e paga direto com você, por Pix, dinheiro ou como preferirem.' },
];

const TOTAL = 5;

/* ------------------------------ Foto ------------------------------ */

const PhotoBox = styled.div`
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

// Mesma moldura da foto no cartão de profissional: é assim que o cliente vai ver
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

const PhotoActions = styled.div`
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

/* ------------------------------ Planos ------------------------------ */

const PlanList = styled.fieldset`
  border: none;
  display: grid;
  gap: 1rem;

  legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
`;

// Cada plano é uma folha; a escolhida ganha a moldura de gráfica
const PlanSheet = styled.label`
  position: relative;
  display: block;
  padding: 1.1rem 1.25rem 1.1rem 3.25rem;
  background: var(--papel);
  border: ${({ $on }) => ($on ? '2px solid var(--grafica)' : '1.5px solid var(--controle)')};
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 160ms var(--ease-out);

  input {
    position: absolute;
    left: 1.2rem;
    top: 1.35rem;
    width: 1.2rem;
    height: 1.2rem;
    margin: 0;
    accent-color: var(--grafica);
  }

  &:hover {
    border-color: var(--grafica);
  }

  &:focus-within {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }
`;

const PlanHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.25rem 1rem;

  strong {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.5rem;
    line-height: 1.1;
  }

  span {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
    color: var(--grafica-escura);
    font-variant-numeric: tabular-nums;

    small {
      font-family: var(--f-texto);
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--texto-2-papel);
    }
  }
`;

const PlanItems = styled.ul`
  list-style: none;
  margin-top: 0.6rem;
  display: grid;
  gap: 0.3rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    font-size: 0.98rem;
    line-height: 1.4;
  }

  svg {
    flex: none;
    margin-top: 0.15rem;
    color: var(--carbono);
  }
`;

const Loading = styled.p`
  padding: 1rem 0;
  color: var(--texto-2-papel);
`;

const formatPrice = (value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

// O que cada plano dá, lido do próprio plano (seed_plans.py é a fonte)
const planItems = (plan) => {
  const items = [];
  items.push(plan.max_services ? `Até ${plan.max_services} ${plan.max_services === 1 ? 'serviço' : 'serviços'} no perfil` : 'Serviços ilimitados no perfil');
  items.push(plan.max_appointments_per_month ? `Até ${plan.max_appointments_per_month} agendamentos por mês` : 'Agendamentos ilimitados');
  if (plan.can_manage_schedule) items.push('Agenda online com seus horários');
  if (plan.priority_in_search >= 2) items.push('Aparece no topo da busca');
  else if (plan.priority_in_search === 1) items.push('Aparece antes dos perfis do plano grátis na busca');
  if (plan.badge_label) items.push(`Selo "${plan.badge_label}" no seu perfil`);
  return items;
};

/* ------------------------------ Página ------------------------------ */

export default function RegisterProfessional() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const id = useId();
  const headingRef = useRef(null);
  const firstStepRender = useRef(true);
  const fieldRefs = useRef({});
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [categories, setCategories] = useState({});
  const [categoriesState, setCategoriesState] = useState('loading'); // loading | ok | error
  const [plans, setPlans] = useState([]);
  const [plansState, setPlansState] = useState('loading'); // loading | ok | error
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    cpf: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    whatsapp: '', category: '', description: ''
  });

  const fetchCategories = async () => {
    setCategoriesState('loading');
    try {
      const res = await fetch(`${API_URL}/categories/groups`);
      if (!res.ok) throw new Error(String(res.status));
      setCategories(await res.json());
      setCategoriesState('ok');
    } catch (e) {
      console.error('Erro ao buscar categorias:', e);
      setCategoriesState('error');
    }
  };

  const fetchPlans = async () => {
    setPlansState('loading');
    try {
      const res = await fetch(`${API_URL}/plans/`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      // Ordenar: Free primeiro, depois Pro, Premium
      const ordered = [...data].sort((a, b) => {
        const order = { free: 0, pro: 1, premium: 2 };
        return (order[a.slug] ?? 99) - (order[b.slug] ?? 99);
      });
      setPlans(ordered);
      // Selecionar Free por padrão
      setSelectedPlan((current) => current ?? (ordered.find((p) => p.slug === 'free')?.id || ordered[0]?.id));
      setPlansState('ok');
    } catch (e) {
      console.error('Erro ao buscar planos:', e);
      setPlansState('error');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPlans();
  }, []);

  // Troca de passo: o foco vai para o título do passo novo
  useEffect(() => {
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const clear = (name) => {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clear(e.target.name);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    // Validar tipo e tamanho (máx 5MB)
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Escolha um arquivo de imagem (JPG, PNG ou GIF).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Essa imagem passa de 5 MB. Escolha uma menor.' }));
      return;
    }
    clear('photo');
    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const focusFirst = (found) => {
    const first = Object.keys(found)[0];
    const el = fieldRefs.current[first] || document.getElementById(`${id}-${first}`);
    el?.focus();
  };

  // Regras de cada passo (as mesmas de antes, agora com o erro no próprio campo)
  const validateStep = () => {
    const found = {};
    if (step === 1) {
      if (!formData.name.trim()) found.name = 'Informe seu nome.';
      if (formData.cpf.replace(/\D/g, '').length !== 11) found.cpf = 'O CPF precisa ter 11 números.';
      if (!formData.email.trim()) found.email = 'Informe seu e-mail.';
      if (!formData.password) found.password = 'Crie uma senha.';
      else if (!isPasswordValid) found.password = 'A senha ainda não cumpre todas as regras abaixo.';
    }
    if (step === 2) Object.assign(found, validateAddress(formData));
    if (step === 3) {
      if (formData.whatsapp.replace(/\D/g, '').length < 10) found.whatsapp = 'Informe o WhatsApp com DDD.';
      if (!formData.category) found.category = 'Escolha a categoria do seu trabalho.';
    }
    if (step === 4 && !profilePicture) found.photo = 'A foto é obrigatória: é ela que o cliente vê no seu cartão.';
    if (step === 5 && !selectedPlan) found.plan = 'Escolha um plano.';
    return found;
  };

  const nextStep = (e) => {
    e.preventDefault();
    const found = validateStep();
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirst(found);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL));
  };

  const prevStep = () => {
    setErrors({});
    setFormError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateStep();
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        is_professional: true,
        cpf: formData.cpf.replace(/\D/g, ''),  // Enviar apenas números
        cep: formData.cep.replace('-', '')
      };

      // 1. Criar usuário
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // 2. Fazer login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem('token', loginData.access_token);

          // 3. Fazer upload da foto de perfil
          if (profilePicture) {
            const formDataPhoto = new FormData();
            formDataPhoto.append('file', profilePicture);

            await fetch(`${API_URL}/users/upload-profile-picture`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${loginData.access_token}` },
              body: formDataPhoto
            });
          }

          // 4. Atribuir plano selecionado
          const selectedPlanData = plans.find((p) => p.id === selectedPlan);
          if (selectedPlanData) {
            await fetch(`${API_URL}/plans/me/change-plan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.access_token}`
              },
              body: JSON.stringify({ new_plan_slug: selectedPlanData.slug })
            });
          }

          // 5. Redirecionar baseado no plano
          const isFreePlan = selectedPlanData?.slug === 'free';
          if (isFreePlan) {
            toast.success('Cadastro feito. Seu plano Free já está ativo.');
            navigate('/dashboard');
          } else {
            toast.success('Cadastro feito. Agora é só configurar o pagamento do plano.');
            navigate('/subscription/setup');
          }
        } else {
          toast.warning('Cadastro feito, mas não deu para entrar automaticamente. Entre com seu e-mail e senha.');
          navigate('/login');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormError(translateError(errorData.detail, 'Não deu para concluir o cadastro. Confira os dados e tente de novo.'));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setFormError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const back = (
    <StampButton type="button" onClick={prevStep}>
      <ArrowLeft size={20} aria-hidden="true" /> Voltar
    </StampButton>
  );

  return (
    <AuthLayout asideTitle="Seu trabalho, na agenda de quem mora perto." facts={FACTS} wide={step === 5}>
      {step === 1 && (
        <form onSubmit={nextStep} noValidate>
          <StepHead ref={headingRef} step={1} total={TOTAL} title="Crie sua conta de profissional" lead="Seus dados de acesso. O cadastro é grátis e sem cartão." />

          <TextField
            id={`${id}-name`}
            label="Nome completo"
            icon={User}
            name="name"
            autoComplete="name"
            placeholder="Como os clientes vão te ver"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <TextField
            id={`${id}-cpf`}
            label="CPF"
            name="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            value={formData.cpf}
            onChange={(e) => { setFormData((prev) => ({ ...prev, cpf: formatCpf(e.target.value) })); clear('cpf'); }}
            error={errors.cpf}
            required
          />
          <TextField
            id={`${id}-email`}
            label="E-mail"
            icon={Mail}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Group>
            <FieldLabel htmlFor={`${id}-password`}>Senha</FieldLabel>
            <PasswordInput
              id={`${id}-password`}
              name="password"
              placeholder="Crie uma senha"
              value={formData.password}
              onChange={handleChange}
              onValidChange={setIsPasswordValid}
              showGenerateButton={true}
              showTooltip={true}
              required
            />
            {errors.password && <FieldNote $tone="erro" role="alert">{errors.password}</FieldNote>}
          </Group>

          <Actions $single>
            <PrimaryButton type="submit">Continuar para o endereço <ArrowRight size={20} aria-hidden="true" /></PrimaryButton>
          </Actions>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={nextStep} noValidate>
          <StepHead ref={headingRef} step={2} total={TOTAL} title="Onde você atende" lead="Pelo seu endereço, os clientes da região encontram você na busca por CEP." />
          <AddressFields
            idPrefix={id}
            formData={formData}
            setFormData={(update) => { setFormData(update); setFormError(''); }}
            errors={errors}
            cepRef={(el) => { fieldRefs.current.cep = el; }}
          />
          <Actions>
            {back}
            <PrimaryButton type="submit">Continuar <ArrowRight size={20} aria-hidden="true" /></PrimaryButton>
          </Actions>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={nextStep} noValidate>
          <StepHead ref={headingRef} step={3} total={TOTAL} title="Seu trabalho" lead="Como os clientes falam com você e o que você faz." />

          <TextField
            id={`${id}-whatsapp`}
            label="WhatsApp"
            icon={Phone}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            value={formData.whatsapp}
            onChange={(e) => { setFormData((prev) => ({ ...prev, whatsapp: formatWhatsApp(e.target.value) })); clear('whatsapp'); }}
            error={errors.whatsapp}
            required
          />

          <Group>
            <FieldLabel htmlFor={`${id}-category`}>Categoria principal</FieldLabel>
            <TextInput
              as="select"
              id={`${id}-category`}
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={categoriesState === 'loading'}
              aria-invalid={errors.category ? true : undefined}
              aria-describedby={errors.category || categoriesState === 'error' ? `${id}-category-nota` : undefined}
              required
            >
              <option value="">
                {categoriesState === 'loading' ? 'Carregando as categorias…' : 'Escolha uma categoria'}
              </option>
              {Object.entries(categories).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </optgroup>
              ))}
            </TextInput>
            {categoriesState === 'error' ? (
              <FieldNote id={`${id}-category-nota`} $tone="erro">
                Não deu para carregar as categorias.{' '}
                <TextButton type="button" onClick={fetchCategories}><RotateCw size={14} aria-hidden="true" /> Tentar de novo</TextButton>
              </FieldNote>
            ) : errors.category && (
              <FieldNote id={`${id}-category-nota`} $tone="erro">{errors.category}</FieldNote>
            )}
          </Group>

          <Group>
            <FieldLabel htmlFor={`${id}-description`}>Descrição curta</FieldLabel>
            <TextInput
              as="textarea"
              id={`${id}-description`}
              rows={3}
              name="description"
              placeholder="Ex.: faço acabamento fino, atendo aos sábados"
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'vertical', padding: '0.75rem 1rem', minHeight: '6rem' }}
            />
            <FieldNote>Opcional. Aparece no seu perfil.</FieldNote>
          </Group>

          <Actions>
            {back}
            <PrimaryButton type="submit">Continuar para a foto <ArrowRight size={20} aria-hidden="true" /></PrimaryButton>
          </Actions>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={nextStep} noValidate>
          <StepHead ref={headingRef} step={4} total={TOTAL} title="Sua foto" lead="Quem vai receber você em casa quer ver seu rosto. É esta foto que aparece no seu cartão na busca." />

          <PhotoBox $erro={!!errors.photo}>
            <Frame>
              {profilePicturePreview ? <img src={profilePicturePreview} alt="Prévia da sua foto" /> : <User size={56} aria-hidden="true" />}
            </Frame>
            <PhotoActions>
              <FilePick>
                <input
                  id={`${id}-photo`}
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  aria-describedby={`${id}-photo-nota`}
                  ref={(el) => { fieldRefs.current.photo = el; }}
                />
                <ImagePlus size={20} aria-hidden="true" />
                {profilePicture ? 'Trocar a foto' : 'Escolher a foto'}
              </FilePick>
              {profilePicture && (
                <TextButton type="button" onClick={() => { setProfilePicture(null); setProfilePicturePreview(null); }}>
                  Tirar esta foto
                </TextButton>
              )}
              <p id={`${id}-photo-nota`}>JPG, PNG ou GIF, até 5 MB.</p>
            </PhotoActions>
          </PhotoBox>
          {errors.photo && <FieldNote $tone="erro" role="alert">{errors.photo}</FieldNote>}

          <Actions>
            {back}
            <PrimaryButton type="submit">Continuar para o plano <ArrowRight size={20} aria-hidden="true" /></PrimaryButton>
          </Actions>
        </form>
      )}

      {step === 5 && (
        <form onSubmit={handleSubmit} noValidate>
          <StepHead ref={headingRef} step={5} total={TOTAL} title="Escolha seu plano" lead="Dá para começar no Free e passar para um plano pago depois." />

          {plansState === 'loading' && <Loading role="status">Carregando os planos…</Loading>}
          {plansState === 'error' && (
            <FieldNote $tone="erro" role="alert">
              Não deu para carregar os planos.{' '}
              <TextButton type="button" onClick={fetchPlans}><RotateCw size={14} aria-hidden="true" /> Tentar de novo</TextButton>
            </FieldNote>
          )}
          {plansState === 'ok' && (
            <PlanList>
              <legend>Planos</legend>
              {plans.map((plan) => {
                const isFree = plan.slug === 'free';
                const on = selectedPlan === plan.id;
                return (
                  <PlanSheet key={plan.id} $on={on}>
                    <input
                      type="radio"
                      name="plano"
                      value={plan.id}
                      checked={on}
                      onChange={() => { setSelectedPlan(plan.id); clear('plan'); }}
                    />
                    <PlanHead>
                      <strong>{plan.name}</strong>
                      <span>
                        {isFree ? 'Grátis' : formatPrice(plan.price)}
                        <small>{isFree ? ' sem prazo' : ' por mês'}</small>
                      </span>
                    </PlanHead>
                    <PlanItems>
                      {planItems(plan).map((item) => (
                        <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>
                      ))}
                    </PlanItems>
                  </PlanSheet>
                );
              })}
            </PlanList>
          )}
          {errors.plan && <FieldNote $tone="erro" role="alert">{errors.plan}</FieldNote>}
          {formError && <FormError>{formError}</FormError>}

          <Actions>
            {back}
            <PrimaryButton type="submit" disabled={loading || plansState !== 'ok'}>
              {loading ? 'Criando o cadastro…' : <>Criar meu cadastro <Check size={20} aria-hidden="true" /></>}
            </PrimaryButton>
          </Actions>
        </form>
      )}

      <FooterNote>
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </FooterNote>
    </AuthLayout>
  );
}
