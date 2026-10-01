import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { AlertCircle, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import ProfileCompletionBar from '../components/ProfileCompletionBar';
import OnboardingSteps from '../components/OnboardingSteps';
import { API_URL } from '../config';
import { PrimaryButton, StampButton } from '../components/talao';
import { PageHead, Notice } from '../components/dashboard/parts';
import { localISO, weekSunday, weekDatesFrom } from '../components/dashboard/utils';
import WeekAgenda from '../components/dashboard/WeekAgenda';
import ServicesPanel from '../components/dashboard/ServicesPanel';
import SchedulePanel from '../components/dashboard/SchedulePanel';
import BlockDialog from '../components/dashboard/BlockDialog';
import PerformanceReport from '../components/dashboard/PerformanceReport';

/* Painel do profissional (dentro do AppShell) no registro contido do talão.
   ?tab=dashboard | services | schedule vem do menu lateral. */

const Loading = styled.p`
  padding: 2rem 0;
  font-size: 1.05rem;
  color: var(--texto-2-papel);
`;

const TITLES = {
  dashboard: { title: 'Agenda da semana', lead: 'Seus agendamentos, horários livres e bloqueios. Toque num agendamento para ver os detalhes.' },
  services: { title: 'Meus serviços', lead: 'O que aparece no seu perfil para os clientes escolherem e agendarem.' },
  schedule: { title: 'Horários de atendimento', lead: 'Os dias e horários em que você atende. Os clientes só agendam dentro deles.' },
};

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = TITLES[searchParams.get('tab')] ? searchParams.get('tab') : 'dashboard';
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ok | error
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [onboardingClosed, setOnboardingClosed] = useState(false);

  // Semana: resposta guardada com a chave (início da semana + contador de atualização)
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekRefresh, setWeekRefresh] = useState(0);
  const sunday = weekSunday(weekOffset);
  const weekStartISO = localISO(sunday);
  const weekKey = `${weekStartISO}|${weekRefresh}`;
  const [weekResponse, setWeekResponse] = useState({ key: null, items: [] });
  const weekReady = weekResponse.key === weekKey;
  const appointments = weekReady ? weekResponse.items : [];

  // Dados do painel: usuário, serviços, horários e (Premium) resumo do mês
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return undefined;
    }
    let cancelled = false;
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [userRes, servicesRes, scheduleRes] = await Promise.all([
          fetch(`${API_URL}/auth/me?t=${Date.now()}`, { headers, cache: 'no-cache' }),
          fetch(`${API_URL}/services/me`, { headers }),
          fetch(`${API_URL}/schedule/me`, { headers }),
        ]);
        if (!userRes.ok || !servicesRes.ok || !scheduleRes.ok) throw new Error('falha ao carregar o painel');
        const [userData, servicesData, scheduleData] = await Promise.all([userRes.json(), servicesRes.json(), scheduleRes.json()]);
        if (cancelled) return;
        setUser(userData);
        setServices(servicesData);
        setWorkingHours(scheduleData);
        setLoadState('ok');

        const statsRes = await fetch(`${API_URL}/appointments/stats/me`, { headers });
        if (!cancelled && statsRes.ok) setStats(await statsRes.json());
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        if (!cancelled) setLoadState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [navigate, loadAttempt, refreshKey]);

  // Agenda da semana escolhida
  useEffect(() => {
    if (loadState !== 'ok') return undefined;
    const token = localStorage.getItem('token');
    let cancelled = false;
    fetch(`${API_URL}/appointments/me/week?start_date=${weekStartISO}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => { if (!cancelled) setWeekResponse({ key: weekKey, items: Array.isArray(items) ? items : [] }); })
      .catch((error) => {
        console.error('Failed to fetch appointments', error);
        if (!cancelled) setWeekResponse({ key: weekKey, items: [] });
      });
    return () => { cancelled = true; };
  }, [loadState, weekStartISO, weekKey]);

  const refreshWeek = () => setWeekRefresh((n) => n + 1);

  const handleRemoveBlock = async (blockId) => {
    if (!confirm('Remover este bloqueio?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/appointments/block/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Bloqueio removido.');
        refreshWeek();
      } else {
        toast.error('Não deu para remover o bloqueio.');
      }
    } catch {
      toast.error('Não deu para remover o bloqueio. Confira sua conexão.');
    }
  };

  const handleDismissOnboarding = useCallback(() => {
    if (user) localStorage.setItem(`onboarding_dismissed_${user.id}`, 'true');
    setOnboardingClosed(true);
  }, [user]);

  const profileComplete = user && user.profile_picture && user.description && user.city && services.length > 0;
  const showOnboarding = loadState === 'ok' && user && !onboardingClosed
    && !profileComplete && !localStorage.getItem(`onboarding_dismissed_${user.id}`);

  const head = TITLES[activeTab];

  if (loadState === 'loading') return <Loading role="status">Carregando o seu painel…</Loading>;

  if (loadState === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p>
          <AlertCircle size={18} aria-hidden="true" />
          <span>Não deu para carregar o seu painel agora. Pode ser a conexão ou uma instabilidade do nosso lado.</span>
        </p>
        <PrimaryButton type="button" onClick={() => { setLoadState('loading'); setLoadAttempt((n) => n + 1); }}>
          <RotateCw size={18} aria-hidden="true" /> Tentar de novo
        </PrimaryButton>
      </Notice>
    );
  }

  return (
    <>
      {/* Assinatura inativa: a busca só mostra quem está com subscription_status = active */}
      {user && user.subscription_status !== 'active' && (
        <Notice $tone="alerta">
          <p>
            <AlertCircle size={18} aria-hidden="true" />
            <span>Sua assinatura não está ativa, então seu perfil não aparece nas buscas dos clientes.</span>
          </p>
          <StampButton type="button" onClick={() => navigate('/subscription/setup')}>Ativar assinatura</StampButton>
        </Notice>
      )}

      {showOnboarding && (
        <OnboardingSteps user={user} services={services} workingHours={workingHours} onDismiss={handleDismissOnboarding} />
      )}

      <PageHead>
        <div>
          <h1 data-display>{head.title}</h1>
          <p>{head.lead}</p>
        </div>
        {activeTab !== 'dashboard' && <Link to="/dashboard" style={{ color: 'var(--grafica)', fontWeight: 600 }}>Ver a agenda</Link>}
      </PageHead>

      {activeTab === 'dashboard' && (
        <>
          <ProfileCompletionBar user={user} services={services} />
          <WeekAgenda
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            weekDates={weekDatesFrom(sunday)}
            workingHours={workingHours}
            appointments={appointments}
            ready={weekReady}
            onBlockClick={() => setShowBlockModal(true)}
            onRemoveBlock={handleRemoveBlock}
            onOpenAppointment={(id) => navigate(`/appointment/${id}`)}
          />
          {/* Resumo do mês: só no plano Premium */}
          {user?.subscription_plan?.slug === 'premium' && stats && <PerformanceReport stats={stats} />}
        </>
      )}

      {activeTab === 'services' && (
        <ServicesPanel services={services} setServices={setServices} onRefresh={() => setRefreshKey((n) => n + 1)} />
      )}

      {activeTab === 'schedule' && (
        <SchedulePanel workingHours={workingHours} setWorkingHours={setWorkingHours} />
      )}

      <BlockDialog
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onCreated={refreshWeek}
      />
    </>
  );
}
