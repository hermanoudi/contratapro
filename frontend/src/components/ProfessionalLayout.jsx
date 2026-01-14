import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Briefcase, Clock, Power, Menu, X,
    PauseCircle, PlayCircle, History as HistoryIcon, CreditCard, User
} from 'lucide-react';
import { API_URL } from '../config';
import styled from 'styled-components';
import { toast } from 'sonner';
import logoImage from '../assets/contratapro-logo.png';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    backdrop-filter: blur(2px);
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 999;
  transition: transform 0.3s ease;
  overflow-y: auto;

  @media (max-width: 768px) {
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    width: 85%;
    max-width: 320px;
    box-shadow: ${props => props.$isOpen ? '0 0 50px rgba(0,0,0,0.3)' : 'none'};
    padding: 1.5rem;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  width: calc(100% - 280px);

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
    padding-top: 4rem;
  }
`;

const MenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.75rem;
  border-radius: 12px;
  color: var(--text-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: flex;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  border-radius: 12px;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  text-align: left;

  &:hover {
    background: var(--bg-primary);
    color: var(--primary);
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);

  @media (max-width: 768px) {
    padding: 0.75rem 0;
    margin-bottom: 1.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  .avatar {
    width: 32px;
    height: 32px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .details {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .logout {
    font-size: 0.75rem;
    color: #ef4444;
    cursor: pointer;
    font-weight: 700;
    text-align: left;
    background: none;
    border: none;
    padding: 0;
    margin-top: 2px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function ProfessionalLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <LayoutContainer>
            <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </MenuButton>

            <Overlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

            <Sidebar $isOpen={isSidebarOpen}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={logoImage} alt="ContrataPro" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                </div>

                <nav style={{ flex: 1 }}>
                    <NavItem $active={isActive('/dashboard') && !location.search} onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }}>
                        <CalendarIcon size={20} /> Dashboard
                    </NavItem>
                    <NavItem $active={location.search.includes('tab=services')} onClick={() => { navigate('/dashboard?tab=services'); setIsSidebarOpen(false); }}>
                        <Briefcase size={20} /> Serviços
                    </NavItem>
                    <NavItem $active={location.search.includes('tab=schedule')} onClick={() => { navigate('/dashboard?tab=schedule'); setIsSidebarOpen(false); }}>
                        <Clock size={20} /> Horários
                    </NavItem>
                    <NavItem $active={isActive('/history')} onClick={() => { navigate('/history'); setIsSidebarOpen(false); }}>
                        <HistoryIcon size={20} /> Histórico
                    </NavItem>
                    <NavItem $active={isActive('/subscription/manage')} onClick={() => { navigate('/subscription/manage'); setIsSidebarOpen(false); }}>
                        <CreditCard size={20} /> Assinatura
                    </NavItem>
                    <NavItem $active={isActive('/profile')} onClick={() => { navigate('/profile'); setIsSidebarOpen(false); }}>
                        <User size={20} /> Meu Perfil
                    </NavItem>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <NavItem onClick={toggleSuspension} style={{ color: user?.is_suspended ? '#10b981' : '#ef4444' }}>
                            {user?.is_suspended ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
                            {user?.is_suspended ? 'Retomar Atendimentos' : 'Suspender Atendimentos'}
                        </NavItem>
                    </div>
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <NavItem onClick={handleLogout}>
                        <Power size={20} /> Sair
                    </NavItem>
                </div>
            </Sidebar>

            <MainContent>
                <TopBar>
                    <UserInfo>
                        <div className="avatar">{user?.name?.[0]}</div>
                        <div className="details">
                            <span className="name">{user?.name}</span>
                            <button className="logout" onClick={handleLogout}>Sair</button>
                        </div>
                    </UserInfo>
                </TopBar>
                {children}
            </MainContent>
        </LayoutContainer>
    );
}
