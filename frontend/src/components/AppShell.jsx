import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, X, PauseCircle } from 'lucide-react';
import logoImage from '../assets/contratapro-logo-grafica.png';

/* Moldura das páginas logadas no registro contido do talão: menu lateral em papel-2
   com a margem vermelha do bloco, barra de cima com a régua de gráfica. Sem vias,
   picote nem letra à mão: aqui a pessoa está trabalhando. */

export const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--papel);
  color: var(--nanquim);
`;

export const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(23, 23, 27, 0.45);
    z-index: 998;
  }
`;

export const Sidebar = styled.aside`
  width: 280px;
  background: var(--papel-2);
  /* A margem vermelha do bloco de pedidos */
  border-right: 2px solid var(--grafica);
  padding: 1.25rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 999;
  transition: transform 240ms var(--ease-out);
  overflow-y: auto;

  @media (max-width: 768px) {
    transform: translateX(${(props) => (props.$isOpen ? '0' : '-100%')});
    width: 85%;
    max-width: 320px;
    box-shadow: ${(props) => (props.$isOpen ? '16px 0 40px -20px rgba(23, 23, 27, 0.5)' : 'none')};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: 1.5rem;

  img {
    height: 34px;
    width: auto;
    display: block;
  }
`;

export function ShellLogo() {
  return (
    <LogoLink to="/" aria-label="ContrataPro, página inicial">
      <img src={logoImage} alt="" width="120" height="34" />
    </LogoLink>
  );
}

export const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 2rem 2rem;
  width: calc(100% - 280px);
  min-width: 0;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 0 1rem 1.5rem;
  }
`;

// Grupo do menu separado por pauta, com rótulo impresso quando precisa
export const NavGroup = styled.div`
  & + & {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1.5px solid var(--pauta);
  }

  > p {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--texto-2-papel);
    margin: 0 0 0.25rem 0.75rem;
  }
`;

// Item do menu: letra impressa; o ativo fica em tinta de gráfica e sublinhado, como os links do topo da Home
export const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 48px;
  padding: 0 0.75rem;
  background: ${(props) => (props.$active ? 'var(--papel)' : 'transparent')};
  border: none;
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: ${(props) => (props.$active ? 700 : 600)};
  font-size: 1.15rem;
  letter-spacing: 0.03em;
  color: ${(props) => (props.$tone === 'alerta' ? 'var(--alerta)' : props.$tone === 'sucesso' ? 'var(--sucesso)' : props.$active ? 'var(--grafica)' : 'var(--nanquim)')};
  cursor: pointer;
  text-align: left;
  transition: color 160ms var(--ease-out), background-color 160ms var(--ease-out);

  > span {
    text-decoration-line: ${(props) => (props.$active ? 'underline' : 'none')};
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
  }

  svg {
    flex: none;
  }

  text-decoration: none;

  &:hover {
    background: var(--papel);
    color: ${(props) => (props.$tone ? undefined : 'var(--grafica)')};
  }

  &:focus-visible {
    outline: 2px solid var(--carbono);
    outline-offset: -2px;
  }
`;

// Item que leva a uma página: link de verdade (abre em nova aba, mostra o endereço)
export function MenuLink({ to, active = false, onNavigate, children, ...rest }) {
  return (
    <NavItem as={Link} to={to} $active={active} aria-current={active ? 'page' : undefined} onClick={onNavigate} {...rest}>
      {children}
    </NavItem>
  );
}

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 64px;
  margin: 0 -2rem 2rem;
  padding: 0 2rem;
  background: var(--papel);
  border-bottom: 2px solid var(--grafica);

  @media (max-width: 768px) {
    height: 56px;
    margin: 0 -1rem 1.5rem;
    padding: 0 1rem;
  }
`;

const BarStart = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  /* No celular o logo mora na barra; no desktop ele fica no menu lateral */
  a {
    margin: 0;

    @media (min-width: 769px) {
      display: none;
    }
  }
`;

const MenuToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-left: -0.5rem;
  background: none;
  border: none;
  color: var(--nanquim);
  cursor: pointer;

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

// Estado que muda o que o cliente vê: fica à vista em todas as telas
const Status = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--alerta);
  white-space: nowrap;

  /* No celular o texto encolhe, mas não some: só o ícone não diz nada */
  [data-curto] {
    display: none;
  }

  @media (max-width: 480px) {
    [data-longo] {
      display: none;
    }

    [data-curto] {
      display: inline;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;

  .avatar {
    flex: none;
    width: 36px;
    height: 36px;
    border: 2px solid var(--nanquim);
    background: var(--amarela);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.15rem;
    color: var(--nanquim);
  }

  .details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.1rem;
    line-height: 1.1;
    color: var(--nanquim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 16rem;
  }

  .logout {
    align-self: flex-start;
    min-height: 0;
    min-width: 0;
    font-size: 0.9rem;
    color: var(--texto-2-papel);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      color: var(--grafica);
    }
  }

  @media (max-width: 480px) {
    .details {
      display: none;
    }
  }
`;

/* Barra de cima: botão do menu (celular), aviso de atendimentos suspensos e quem está logado */
export function ShellTopBar({ user, onLogout, isMenuOpen, onToggleMenu, suspended = false }) {
  return (
    <Bar>
      <BarStart>
        <MenuToggle
          type="button"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          onClick={onToggleMenu}
        >
          {isMenuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
        </MenuToggle>
        <ShellLogo />
        {suspended && (
          <Status role="status">
            <PauseCircle size={18} aria-hidden="true" />
            <span data-longo>Atendimentos suspensos</span>
            <span data-curto>Suspenso</span>
          </Status>
        )}
      </BarStart>
      <UserInfo>
        <div className="avatar" aria-hidden="true">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="details">
          <span className="name">{user?.name}</span>
          <button type="button" className="logout" onClick={onLogout}>Sair</button>
        </div>
      </UserInfo>
    </Bar>
  );
}
