import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Briefcase, Clock, Power,
    PauseCircle, PlayCircle, History as HistoryIcon, CreditCard, User, Bell, HelpCircle
} from 'lucide-react';
import { API_URL } from '../config';
import { toast } from 'sonner';
import { useTour } from '../contexts/tour';
import {
    LayoutContainer, Overlay, Sidebar, MainContent, NavGroup, NavItem, MenuLink, ShellLogo, ShellTopBar,
} from './AppShell';

export default function ProfessionalLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { startWelcomeTour, startTour } = useTour();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!data.is_professional) {
                        navigate('/my-appointments');
                        return;
                    }
                    setUser(data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUser();
    }, [navigate]);

    // Iniciar tour de boas-vindas no primeiro acesso
    useEffect(() => {
        if (user && location.pathname === '/dashboard' && !location.search) {
            // Pequeno delay para garantir que elementos estao renderizados
            const timer = setTimeout(() => {
                startWelcomeTour('professional');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, location.pathname, location.search, startWelcomeTour]);

    // Funcao para reiniciar o tour manualmente
    const handleRestartTour = () => {
        startTour('welcome', 'professional');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleSuspension = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/users/toggle-suspension`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUser(prev => ({ ...prev, is_suspended: data.is_suspended }));
            toast.success(data.is_suspended ? 'Atendimentos suspensos' : 'Atendimentos retomados');
        }
    };

    const isActive = (path) => location.pathname === path;

    const closeMenu = () => setIsSidebarOpen(false);

    return (
        <LayoutContainer>
            <Overlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

            <Sidebar $isOpen={isSidebarOpen}>
                <ShellLogo />

                <nav style={{ flex: 1 }} data-tour="sidebar-nav" aria-label="Menu do profissional">
                    <NavGroup>
                        <MenuLink
                            active={isActive('/dashboard') && !location.search}
                            to="/dashboard" onNavigate={closeMenu}
                            data-tour="nav-dashboard"
                        >
                            <CalendarIcon size={20} aria-hidden="true" /> <span>Painel</span>
                        </MenuLink>
                        <MenuLink
                            active={location.search.includes('tab=services')}
                            to="/dashboard?tab=services" onNavigate={closeMenu}
                            data-tour="nav-services"
                        >
                            <Briefcase size={20} aria-hidden="true" /> <span>Serviços</span>
                        </MenuLink>
                        <MenuLink
                            active={location.search.includes('tab=schedule')}
                            to="/dashboard?tab=schedule" onNavigate={closeMenu}
                            data-tour="nav-schedule"
                        >
                            <Clock size={20} aria-hidden="true" /> <span>Horários</span>
                        </MenuLink>
                        <MenuLink active={isActive('/history')} to="/history" onNavigate={closeMenu}>
                            <HistoryIcon size={20} aria-hidden="true" /> <span>Histórico</span>
                        </MenuLink>
                        <MenuLink active={isActive('/notifications')} to="/notifications" onNavigate={closeMenu}>
                            <Bell size={20} aria-hidden="true" /> <span>Notificações</span>
                        </MenuLink>
                        <MenuLink
                            active={isActive('/subscription/manage') || isActive('/minha-assinatura') || isActive('/alterar-plano')}
                            to="/subscription/manage" onNavigate={closeMenu}
                            data-tour="nav-subscription"
                        >
                            <CreditCard size={20} aria-hidden="true" /> <span>Assinatura</span>
                        </MenuLink>
                        <MenuLink active={isActive('/profile')} to="/profile" onNavigate={closeMenu}>
                            <User size={20} aria-hidden="true" /> <span>Meu perfil</span>
                        </MenuLink>
                    </NavGroup>

                    <NavGroup>
                        <NavItem onClick={toggleSuspension} $tone={user?.is_suspended ? 'sucesso' : 'alerta'}>
                            {user?.is_suspended ? <PlayCircle size={20} aria-hidden="true" /> : <PauseCircle size={20} aria-hidden="true" />}
                            <span>{user?.is_suspended ? 'Retomar atendimentos' : 'Suspender atendimentos'}</span>
                        </NavItem>
                        <NavItem onClick={handleRestartTour}>
                            <HelpCircle size={20} aria-hidden="true" /> <span>Ver tour guiado</span>
                        </NavItem>
                    </NavGroup>
                </nav>

                <NavGroup>
                    <NavItem onClick={handleLogout}>
                        <Power size={20} aria-hidden="true" /> <span>Sair</span>
                    </NavItem>
                </NavGroup>
            </Sidebar>

            <MainContent>
                <ShellTopBar
                    user={user}
                    onLogout={handleLogout}
                    isMenuOpen={isSidebarOpen}
                    onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
                    suspended={!!user?.is_suspended}
                />
                {children}
            </MainContent>
        </LayoutContainer>
    );
}
