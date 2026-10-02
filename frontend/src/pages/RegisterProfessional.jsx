import { useState, useEffect, useRef, useId } from 'react';
import styled from 'styled-components';
import { ArrowRight, ArrowLeft, Check, User, Phone, Mail, RotateCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PlanList, PlanSheet, PlanHead, PlanItems, planItems, planPrice, sortPlans } from '../components/planParts';
import { API_URL } from '../config';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton, StampButton, FieldLabel, FieldNote, TextInput } from '../components/talao';
import { StepHead, Group, Actions, FormError, FooterNote, TextField, AddressFields } from '../components/SignupParts';
import { formatCpf, formatWhatsApp, validateAddress, photoError } from '../components/signupUtils';
import PhotoPicker from '../components/PhotoPicker';
import { translateError } from '../components/apiErrors';

// Só o que o ContrataPro faz de fato (PRODUCT.md): cadastro grátis, sem intermediar serviço nem pagamento
const FACTS = [
  { strong: 'Grátis e sem cartão:', text: 'o plano Free não vence. Os planos pagos só dão mais visibilidade.' },
  { strong: 'Clientes da sua região:', text: 'quem busca pelo CEP encontra seu perfil e agenda direto na sua agenda.' },
  { strong: 'Sem intermediário:', text: 'o cliente combina e paga direto com você, por Pix, dinheiro ou como preferirem.' },
];

const TOTAL = 5;

// Ação secundária em texto (tentar de novo)
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

const Loading = styled.p`
  padding: 1rem 0;
  color: var(--texto-2-papel);
`;

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
      const ordered = sortPlans(data);
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
    const problem = photoError(file);
    if (problem) {
      setErrors((prev) => ({ ...prev, photo: problem }));
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

          // 4. Todo cadastro nasce no Free; plano pago só entra pelo pagamento
          const selectedPlanData = plans.find((p) => p.id === selectedPlan);
          if (!selectedPlanData || selectedPlanData.slug === 'free') {
            toast.success('Cadastro feito. Seu plano Free já está ativo.');
            navigate('/dashboard');
          } else {
            toast.success(`Cadastro feito. Falta só o pagamento do ${selectedPlanData.name}.`);
            navigate(`/subscription/setup?plano=${selectedPlanData.slug}`);
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

          <PhotoPicker
            id={`${id}-photo`}
            preview={profilePicturePreview}
            hasFile={!!profilePicture}
            onChange={handleProfilePictureChange}
            onRemove={() => { setProfilePicture(null); setProfilePicturePreview(null); }}
            error={errors.photo}
            inputRef={(el) => { fieldRefs.current.photo = el; }}
          />

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
                        {isFree ? 'Grátis' : planPrice(plan.price)}
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
