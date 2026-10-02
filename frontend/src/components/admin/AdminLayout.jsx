import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Power } from 'lucide-react';
import { API_URL } from '../../config';
import { ADMIN_TABS } from './adminParts';
import { LayoutContainer, Overlay, Sidebar, MainContent, NavGroup, NavItem, MenuLink, ShellLogo, ShellTopBar } from '../AppShell';

/* Moldura do painel do admin: o mesmo AppShell do profissional, com o
   menu das abas (?tab=) do /admin/dashboard. */

export default function AdminLayout({ active, children }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled && data) setUser({ ...data, name: `${data.name} (admin)` }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <LayoutContainer>
      <Overlay $isOpen={open} onClick={() => setOpen(false)} />
      <Sidebar $isOpen={open}>
        <ShellLogo />
        <nav style={{ flex: 1 }} aria-label="Menu do admin">
          <NavGroup>
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const current = location.pathname === '/admin/dashboard' && active === tab.key;
              return (
                <MenuLink
                  key={tab.key}
                  active={current}
                  to={tab.key === 'overview' ? '/admin/dashboard' : `/admin/dashboard?tab=${tab.key}`}
                  onNavigate={() => setOpen(false)}
                >
                  <Icon size={20} aria-hidden="true" /> <span>{tab.label}</span>
                </MenuLink>
              );
            })}
          </NavGroup>
        </nav>
        <NavGroup>
          <NavItem onClick={logout}>
            <Power size={20} aria-hidden="true" /> <span>Sair</span>
          </NavItem>
        </NavGroup>
      </Sidebar>
      <MainContent>
        <ShellTopBar user={user} onLogout={logout} isMenuOpen={open} onToggleMenu={() => setOpen((o) => !o)} />
        {children}
      </MainContent>
    </LayoutContainer>
  );
}
