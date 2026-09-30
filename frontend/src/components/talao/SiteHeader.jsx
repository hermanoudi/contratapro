import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, X, LogOut } from 'lucide-react';
import { API_URL } from '../../config';
import logoImage from '../../assets/contratapro-logo-grafica.png';
import { Wrap } from './TalaoPage';
import { StampLink } from './buttons';

/* Topo das páginas públicas: logo em uma cor, conta à direita, menu em gaveta no celular. */

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--papel);
  border-bottom: 2px solid var(--grafica);
`;

const TopbarInner = styled(Wrap)`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;

  img {
    height: 34px;
    width: auto;
    display: block;
  }
`;

const TopNav = styled.nav`
  display: none;
  align-items: center;
  gap: 1.5rem;

  @media (min-width: 860px) {
    display: flex;
  }
`;

const TopLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.03em;
  color: var(--nanquim);
  text-decoration: none;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;

  &:hover {
    color: var(--grafica);
    text-decoration-line: underline;
  }
`;

const TopButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.03em;
  color: var(--nanquim);

  &:hover {
    color: var(--grafica);
  }
`;

const TopStamp = styled(StampLink)`
  min-height: 44px;
  font-size: 1rem;
  padding: 0 0.9rem;
  white-space: nowrap;

  @media (max-width: 380px) {
    font-size: 0.95rem;
    padding: 0 0.55rem;
  }
`;

const MobileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (min-width: 860px) {
    display: none;
  }
`;

const MenuToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: var(--nanquim);
  cursor: pointer;
`;

const MobilePanel = styled.nav`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--papel);
  border-bottom: 2px solid var(--grafica);
  padding: 0.5rem clamp(1rem, 4vw, 2.5rem) 1.25rem;
  display: flex;
  flex-direction: column;

  a, button {
    min-height: 48px;
    border-bottom: 1px solid var(--pauta);
    width: 100%;
    justify-content: flex-start;
  }

  a:last-child {
    border-bottom: 2px solid var(--grafica);
    justify-content: center;
    margin-top: 1rem;
  }

  @media (min-width: 860px) {
    display: none;
  }
`;

export default function SiteHeader() {
  const menuToggleRef = useRef(null);
  const [userInfo, setUserInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Usuário logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setUserInfo)
      .catch(() => {
        localStorage.removeItem('token');
        setUserInfo(null);
      });
  }, []);

  // Esc fecha o menu mobile
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const closeMenu = () => setMenuOpen(false);

  const accountLinks = (onClick) =>
    userInfo ? (
      <>
        {!userInfo.is_professional && !userInfo.is_admin && (
          <TopLink to="/my-appointments" onClick={onClick}>Meus agendamentos</TopLink>
        )}
        {userInfo.is_professional && <TopLink to="/dashboard" onClick={onClick}>Meu painel</TopLink>}
        {userInfo.is_admin && <TopLink to="/admin" onClick={onClick}>Admin</TopLink>}
        <TopButton type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" /> Sair
        </TopButton>
      </>
    ) : (
      <>
        <TopLink to="/login" onClick={onClick}>Entrar</TopLink>
        <TopLink to="/register-client" onClick={onClick}>Criar conta</TopLink>
        <TopStamp to="/register-pro" onClick={onClick}>Sou profissional</TopStamp>
      </>
    );

  return (
    <Topbar>
      <TopbarInner>
        <Logo to="/" aria-label="ContrataPro, página inicial">
          <img src={logoImage} alt="" width="120" height="34" />
        </Logo>

        <TopNav aria-label="Conta">{accountLinks()}</TopNav>

        <MobileActions>
          {!userInfo && <TopStamp to="/register-pro">Sou profissional</TopStamp>}
          <MenuToggle
            ref={menuToggleRef}
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </MenuToggle>
        </MobileActions>
      </TopbarInner>

      {menuOpen && (
        <MobilePanel id="menu-mobile" aria-label="Menu">
          {accountLinks(closeMenu)}
        </MobilePanel>
      )}
    </Topbar>
  );
}
