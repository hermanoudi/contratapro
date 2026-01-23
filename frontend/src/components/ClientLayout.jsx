import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Calendar, Clock, User, Briefcase, ChevronLeft, Settings, LogOut, History as HistoryIcon, Menu, X, Bell
} from 'lucide-react';
import styled from 'styled-components';
import { API_URL } from '../config';
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

export default function ClientLayout({ children }) {
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', paddingLeft: '1rem', letterSpacing: '0.05em' }}>
                            Minha Área
                        </div>
                        <NavItem $active={isActive('/my-appointments')} onClick={() => { navigate('/my-appointments'); setIsSidebarOpen(false); }}>
                            <Calendar size={20} /> Meus Agendamentos
                        </NavItem>
                        <NavItem $active={isActive('/history')} onClick={() => { navigate('/history'); setIsSidebarOpen(false); }}>
                            <HistoryIcon size={20} /> Histórico
                        </NavItem>
                        <NavItem $active={isActive('/notifications')} onClick={() => { navigate('/notifications'); setIsSidebarOpen(false); }}>
                            <Bell size={20} /> Notificações
                        </NavItem>
                    </div>
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <NavItem onClick={() => { navigate('/'); setIsSidebarOpen(false); }}>
                        <ChevronLeft size={20} /> Voltar para Home
                    </NavItem>
                    <NavItem onClick={() => { handleLogout(); setIsSidebarOpen(false); }}>
                        <LogOut size={20} /> Sair
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
