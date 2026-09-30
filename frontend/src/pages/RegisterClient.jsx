import { useState, useEffect, useRef, useId } from 'react';
import { Mail, User, Phone, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API_URL } from '../config';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';
import { PrimaryButton, StampButton, FieldLabel, FieldNote } from '../components/talao';
import { StepHead, Group, Actions, FormError, FooterNote, TextField, AddressFields } from '../components/SignupParts';
import { formatWhatsApp, translateError, validateAddress } from '../components/signupUtils';

// Só o que o ContrataPro faz de fato (PRODUCT.md)
const FACTS = [
  { strong: 'Grátis para quem contrata:', text: 'você não paga nada ao ContrataPro.' },
  { strong: 'Perto de você:', text: 'busque pelo CEP e veja perfil, serviços, preços e avaliações de quem atende na sua região.' },
  { strong: 'Direto na agenda:', text: 'marque o horário na agenda da pessoa e combine o pagamento com ela.' },
];

export default function RegisterClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const id = useId();
  const headingRef = useRef(null);
  const firstStepRender = useRef(true);
  const fieldRefs = useRef({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Troca de passo: o foco vai para o título do passo novo
  useEffect(() => {
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setFormError('');
  };

  const focusFirst = (found) => {
    const first = Object.keys(found)[0];
    const el = fieldRefs.current[first] || document.getElementById(`${id}-${first}`);
    el?.focus();
  };

  const nextStep = (e) => {
    e.preventDefault();
    const found = {};
    if (!formData.name.trim()) found.name = 'Informe seu nome.';
    if (!formData.email.trim()) found.email = 'Informe seu e-mail.';
    if (formData.whatsapp.replace(/\D/g, '').length < 10) found.whatsapp = 'Informe o WhatsApp com DDD.';
    if (!formData.password) found.password = 'Crie uma senha.';
    else if (!isPasswordValid) found.password = 'A senha ainda não cumpre todas as regras abaixo.';
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirst(found);
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setErrors({});
    setFormError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateAddress(formData);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirst(found);
      return;
    }

    setLoading(true);
    setFormError('');
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cep: formData.cep.replace('-', ''),
          is_professional: false
        })
      });

      if (response.ok) {
        toast.success('Conta criada. Agora é só entrar.');
        // Preservar a rota de origem ao redirecionar para login
        const from = location.state?.from;
        navigate('/login', from ? { state: { from } } : {});
      } else {
        const data = await response.json().catch(() => ({}));
        setFormError(translateError(data.detail, 'Não deu para criar a conta. Confira os dados e tente de novo.'));
      }
    } catch (error) {
      console.error(error);
      setFormError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      asideTitle="Encontre quem resolve, perto de casa."
      facts={FACTS}
    >
      {step === 1 && (
        <form onSubmit={nextStep} noValidate>
          <StepHead ref={headingRef} step={1} total={2} title="Crie sua conta" lead="Seus dados de contato para os agendamentos." />

          <TextField
            id={`${id}-name`}
            label="Nome completo"
            icon={User}
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
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
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, whatsapp: formatWhatsApp(e.target.value) }));
              setErrors((prev) => ({ ...prev, whatsapp: undefined }));
            }}
            error={errors.whatsapp}
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
            <PrimaryButton type="submit">
              Continuar para o endereço <ArrowRight size={20} aria-hidden="true" />
            </PrimaryButton>
          </Actions>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <StepHead ref={headingRef} step={2} total={2} title="Seu endereço" lead="Para serviços presenciais na sua casa." />

          <AddressFields
            idPrefix={id}
            formData={formData}
            setFormData={(update) => { setFormData(update); setFormError(''); }}
            errors={errors}
            cepRef={(el) => { fieldRefs.current.cep = el; }}
          />

          {formError && <FormError>{formError}</FormError>}

          <Actions>
            <StampButton type="button" onClick={prevStep}>
              <ArrowLeft size={20} aria-hidden="true" /> Voltar
            </StampButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Criando a conta…' : <>Criar minha conta <Check size={20} aria-hidden="true" /></>}
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
