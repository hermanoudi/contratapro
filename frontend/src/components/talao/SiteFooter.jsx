import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Wrap } from './TalaoPage';

/* Rodapé das páginas públicas: papel branco, picote tracejado antes dos links. */

const Footer = styled.footer`
  background: var(--papel);
  color: var(--nanquim);
  border-top: 2px solid var(--grafica);
  padding: clamp(3rem, 6vw, 4.5rem) 0 2rem;

  p {
    color: var(--texto-2);
    line-height: 1.6;
    max-width: 68ch;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px dashed var(--grafica);

  strong {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
`;

const FooterLinks = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  margin-top: 1.5rem;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--nanquim);
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 0.03em;
    text-underline-offset: 5px;

    &:hover {
      color: var(--grafica);
    }
  }
`;

const Legal = styled.p`
  margin-top: 1.5rem;
  font-size: 0.95rem;
`;

export default function SiteFooter() {
  return (
    <Footer>
      <Wrap>
        <FooterGrid>
          <div>
            <strong>ContrataPro</strong>
            <p>Encontre quem resolve, perto de casa, e marque o horário direto na agenda da pessoa.</p>
          </div>
        </FooterGrid>
        <FooterLinks aria-label="Rodapé">
          <Link to="/login">Entrar</Link>
          <Link to="/register-client">Criar conta</Link>
          <Link to="/register-pro">Sou profissional</Link>
        </FooterLinks>
        <Legal>© {new Date().getFullYear()} ContrataPro. Todos os direitos reservados.</Legal>
      </Wrap>
    </Footer>
  );
}
