import { useState, useEffect, useId } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar, Settings, AlertCircle, RotateCw, Save, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import { PrimaryButton, PrimaryLink, FieldNote } from '../components/talao';
import { PageHead, Panel, Notice } from '../components/dashboard/parts';
import { localISO } from '../components/dashboard/utils';
import AppointmentRow, { AppointmentGroup as Group } from '../components/dashboard/AppointmentRow';
import { TextField, AddressFields } from '../components/SignupParts';
import { formatWhatsApp, formatCepMask, profileFormData } from '../components/signupUtils';
import { translateError } from '../components/apiErrors';

/* Área do cliente (dentro do AppShell): agendamentos e "Minha conta".
   ?tab=conta abre direto os dados (a página do profissional manda para cá
   quando falta endereço para agendar). */

const Tabs = styled.nav`
  display: flex;
  gap: 0.25rem 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1.5px solid var(--regua);
  overflow-x: auto;

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 48px;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1.15rem;
    letter-spacing: 0.03em;
    color: var(--nanquim);
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
    margin-bottom: -1.5px;

    &[aria-current='page'] {
      color: var(--grafica);
      font-weight: 700;
      border-bottom-color: var(--grafica);
    }

    &:hover {
      color: var(--grafica);
    }
  }
`;

const Empty = styled.div`
  padding: 1.5rem 0;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.4rem;
  }

  p {
    margin: 0.4rem 0 1.25rem;
    color: var(--texto-2-papel);
    line-height: 1.55;
  }
`;

const Muted = styled.p`
  padding: 1rem 0;
  color: var(--texto-2-papel);
`;

const Loading = styled.p`
  padding: 2rem 0;
  color: var(--texto-2-papel);
`;

const AccountPanel = styled(Panel)`
  max-width: 44rem;

  > p {
    margin: -0.5rem 0 1.25rem;
    color: var(--texto-2-papel);
    line-height: 1.5;
  }
`;

const SaveRow = styled.div`
  margin-top: 1.75rem;

  button {
    min-width: 14rem;

    @media (max-width: 480px) {
      width: 100%;
    }
  }
`;

export default function ClientDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'conta' ? 'conta' : 'agendamentos';
  const navigate = useNavigate();
  const id = useId();

  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ok | error
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return undefined;
    }
    let cancelled = false;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/appointments/client/me`, { headers }),
      fetch(`${API_URL}/auth/me`, { headers }),
    ])
      .then(async ([apptsRes, userRes]) => {
        if (!apptsRes.ok || !userRes.ok) throw new Error('falha ao carregar');
        const [appts, user] = await Promise.all([apptsRes.json(), userRes.json()]);
        if (cancelled) return;
        setAppointments(Array.isArray(appts) ? appts : []);
        setUserData({
          ...user,
          whatsapp: user.whatsapp ? formatWhatsApp(user.whatsapp) : '',
          cep: user.cep ? formatCepMask(user.cep) : '',
          street: user.street || '',
          number: user.number || '',
          complement: user.complement || '',
          neighborhood: user.neighborhood || '',
          city: user.city || '',
          state: user.state || '',
        });
        setLoadState('ok');
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setLoadState('error');
      });
    return () => { cancelled = true; };
  }, [navigate, attempt]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const found = {};
    if (!userData.name?.trim()) found.name = 'Informe seu nome.';
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    const token = localStorage.getItem('token');
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: profileFormData({
          name: userData.name.trim(),
          whatsapp: userData.whatsapp,
          cep: userData.cep.replace(/\D/g, ''),
          street: userData.street,
          number: userData.number,
          complement: userData.complement,
          neighborhood: userData.neighborhood,
          city: userData.city,
          state: userData.state,
        })
      });
      if (res.ok) {
        toast.success('Seus dados foram salvos.');
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(translateError(data.detail, 'Não deu para salvar seus dados. Tente de novo.'));
      }
    } catch {
      setFormError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  if (loadState === 'loading') return <Loading role="status">Carregando…</Loading>;

  if (loadState === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p>
          <AlertCircle size={18} aria-hidden="true" />
          <span>Não deu para carregar seus agendamentos agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
        </p>
        <PrimaryButton type="button" onClick={() => { setLoadState('loading'); setAttempt((n) => n + 1); }}>
          <RotateCw size={18} aria-hidden="true" /> Tentar de novo
        </PrimaryButton>
      </Notice>
    );
  }

  // Próximos: agendados de hoje em diante, do mais perto ao mais longe. O resto vai para "Anteriores".
  const todayISO = localISO(new Date());
  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' && a.date >= todayISO)
    .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  const past = appointments
    .filter((a) => !upcoming.includes(a))
    .sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time));

  return (
    <>
      <Tabs aria-label="Minha área">
        <Link to="/my-appointments" aria-current={activeTab === 'agendamentos' ? 'page' : undefined}>
          <Calendar size={18} aria-hidden="true" /> Meus agendamentos
        </Link>
        <Link to="/my-appointments?tab=conta" aria-current={activeTab === 'conta' ? 'page' : undefined} data-tour="client-account">
          <Settings size={18} aria-hidden="true" /> Minha conta
        </Link>
      </Tabs>

      {activeTab === 'agendamentos' ? (
        <>
          <PageHead>
            <div>
              <h1 data-display>Meus agendamentos</h1>
              <p>Toque num agendamento para ver os detalhes ou cancelar.</p>
            </div>
          </PageHead>

          {appointments.length === 0 ? (
            <Empty>
              <h2>Nenhum agendamento ainda</h2>
              <p>Busque quem atende perto de você e marque direto na agenda da pessoa.</p>
              <PrimaryLink to="/">Buscar profissionais</PrimaryLink>
            </Empty>
          ) : (
            <>
              <Group aria-labelledby={`${id}-proximos`}>
                <h2 id={`${id}-proximos`}>Próximos</h2>
                {upcoming.length > 0
                  ? upcoming.map((a) => <AppointmentRow key={a.id} appt={a} person={a.professional_name ? `com ${a.professional_name}` : ''} />)
                  : <Muted>Nenhum horário marcado daqui para a frente.</Muted>}
              </Group>
              {past.length > 0 && (
                <Group aria-labelledby={`${id}-anteriores`}>
                  <h2 id={`${id}-anteriores`}>Anteriores</h2>
                  {past.map((a) => <AppointmentRow key={a.id} appt={a} person={a.professional_name ? `com ${a.professional_name}` : ''} />)}
                </Group>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <PageHead>
            <div>
              <h1 data-display>Minha conta</h1>
              <p>Seus dados de contato e o endereço onde o serviço é feito.</p>
            </div>
          </PageHead>

          <AccountPanel as="form" onSubmit={handleUpdateProfile} noValidate aria-label="Meus dados">
            <h2>Contato</h2>
            <TextField
              id={`${id}-name`}
              label="Nome completo"
              icon={User}
              autoComplete="name"
              value={userData.name || ''}
              onChange={(e) => { setUserData({ ...userData, name: e.target.value }); setErrors((p) => ({ ...p, name: undefined })); }}
              error={errors.name}
              required
            />
            <TextField
                id={`${id}-email`}
                label="E-mail"
                icon={Mail}
                type="email"
                value={userData.email || ''}
                readOnly
                hint="O e-mail é o seu login e não muda por aqui."
              />
            <TextField
                id={`${id}-whatsapp`}
                label="WhatsApp"
                icon={Phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(00) 00000-0000"
                value={userData.whatsapp}
                onChange={(e) => setUserData({ ...userData, whatsapp: formatWhatsApp(e.target.value) })}
              />

            <h2 style={{ marginTop: '2rem' }}>Endereço</h2>
            <AddressFields idPrefix={id} formData={userData} setFormData={setUserData} errors={{}} />

            {formError && <FieldNote role="alert" $tone="erro">{formError}</FieldNote>}

            <SaveRow>
              <PrimaryButton type="submit" disabled={saving}>
                <Save size={18} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar meus dados'}
              </PrimaryButton>
            </SaveRow>
          </AccountPanel>
        </>
      )}
    </>
  );
}
