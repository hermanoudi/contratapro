import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar, ChevronLeft, LogOut, History as HistoryIcon, Bell, HelpCircle
} from 'lucide-react';
import { API_URL } from '../config';
import { useTour } from '../contexts/tour';
import {
    LayoutContainer, Overlay, Sidebar, MainContent, NavGroup, NavItem, MenuLink, ShellLogo, ShellTopBar,
} from './AppShell';

export default function ClientLayout({ children }) {
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
        if (user && location.pathname === '/my-appointments') {
            const timer = setTimeout(() => {
                startWelcomeTour('client');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, location.pathname, startWelcomeTour]);

    const handleRestartTour = () => {
        startTour('welcome', 'client');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const closeMenu = () => setIsSidebarOpen(false);

    return (
        <LayoutContainer>
            <Overlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

            <Sidebar $isOpen={isSidebarOpen}>
                <ShellLogo />

                <nav style={{ flex: 1 }} data-tour="client-nav" aria-label="Minha área">
                    <NavGroup>
                        <p>Minha área</p>
                        <MenuLink
                            active={isActive('/my-appointments')}
                            to="/my-appointments" onNavigate={closeMenu}
                            data-tour="client-appointments"
                        >
                            <Calendar size={20} aria-hidden="true" /> <span>Meus agendamentos</span>
                        </MenuLink>
                        <MenuLink active={isActive('/history')} to="/history" onNavigate={closeMenu}>
                            <HistoryIcon size={20} aria-hidden="true" /> <span>Histórico</span>
                        </MenuLink>
                        <MenuLink active={isActive('/notifications')} to="/notifications" onNavigate={closeMenu}>
                            <Bell size={20} aria-hidden="true" /> <span>Notificações</span>
                        </MenuLink>
                    </NavGroup>
                </nav>

                <NavGroup>
                    <MenuLink to="/" onNavigate={closeMenu}>
                        <ChevronLeft size={20} aria-hidden="true" /> <span>Voltar para o início</span>
                    </MenuLink>
                    <NavItem onClick={handleRestartTour}>
                        <HelpCircle size={20} aria-hidden="true" /> <span>Ver tour guiado</span>
                    </NavItem>
                    <NavItem onClick={() => { handleLogout(); setIsSidebarOpen(false); }}>
                        <LogOut size={20} aria-hidden="true" /> <span>Sair</span>
                    </NavItem>
                </NavGroup>
            </Sidebar>

            <MainContent>
                <ShellTopBar
                    user={user}
                    onLogout={handleLogout}
                    isMenuOpen={isSidebarOpen}
                    onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                {children}
            </MainContent>
        </LayoutContainer>
    );
}
