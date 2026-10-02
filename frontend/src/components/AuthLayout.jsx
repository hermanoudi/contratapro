import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Check } from 'lucide-react';
import logoImage from '../assets/contratapro-logo-grafica.png';

/* Moldura das páginas de entrada (login, cadastro, nova senha) no registro contido:
   à esquerda, papel-2 com a margem vermelha e o que o ContrataPro faz de verdade;
   à direita, o formulário em papel branco. No celular fica só o formulário. */

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  background: var(--papel);
  color: var(--nanquim);

  @media (min-width: 969px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

const Aside = styled.aside`
  display: none;

  @media (min-width: 969px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(2.5rem, 5vw, 4.5rem);
    background: var(--papel-2);
    border-right: 2px solid var(--grafica);
  }
`;

const AsideInner = styled.div`
  max-width: 30rem;

  > p {
    margin-top: 1rem;
    font-size: 1.15rem;
    line-height: 1.55;
    color: var(--texto-2-papel);
  }
`;

const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;

  img {
    height: ${({ $size }) => ($size === 'grande' ? '44px' : '34px')};
    width: auto;
    display: block;
  }
`;

// Frase de marca, não título de seção: o h1 é o do formulário
const AsideTitle = styled.p`
  margin-top: 2.5rem;
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2rem, 3.4vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.01em;
  text-wrap: balance;
`;

// Fatos em lista com pauta, como a lista "O que o ContrataPro faz" da Home
const Facts = styled.ul`
  list-style: none;
  margin-top: 2rem;
  border-top: 2px solid var(--grafica);

  li {
    display: flex;
    gap: 0.75rem;
    padding: 0.85rem 0;
    border-bottom: 1.5px solid var(--pauta);
    line-height: 1.5;
  }

  svg {
    flex: none;
    margin-top: 0.15rem;
    color: var(--carbono);
  }

  strong {
    font-weight: 600;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 1rem 2.5rem;

  @media (min-width: 969px) {
    justify-content: center;
    padding: 3rem 2rem;
  }
`;

const MobileTop = styled.div`
  width: 100%;
  max-width: 26rem;
  margin-bottom: 1.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--grafica);

  @media (min-width: 969px) {
    display: none;
  }
`;

const Column = styled.div`
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '32rem' : '26rem')};
`;

export const AuthTitle = styled.h1`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2rem, 4vw, 2.5rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
`;

export const AuthLead = styled.p`
  margin: 0.5rem 0 2rem;
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--texto-2-papel);
`;

/* facts: [{ strong, text }] — só o que o ContrataPro faz de fato (PRODUCT.md) */
export default function AuthLayout({ asideTitle, asideLead, facts = [], wide = false, children }) {
  return (
    <Page>
      <Aside>
        <AsideInner>
          <LogoLink to="/" aria-label="ContrataPro, página inicial" $size="grande">
            <img src={logoImage} alt="" width="156" height="44" />
          </LogoLink>
          <AsideTitle>{asideTitle}</AsideTitle>
          {asideLead && <p>{asideLead}</p>}
          {facts.length > 0 && (
            <Facts>
              {facts.map((fact) => (
                <li key={fact.strong}>
                  <Check size={20} aria-hidden="true" />
                  <span><strong>{fact.strong}</strong> {fact.text}</span>
                </li>
              ))}
            </Facts>
          )}
        </AsideInner>
      </Aside>

      <Main>
        <MobileTop>
          <LogoLink to="/" aria-label="ContrataPro, página inicial">
            <img src={logoImage} alt="" width="120" height="34" />
          </LogoLink>
        </MobileTop>
        <Column $wide={wide}>{children}</Column>
      </Main>
    </Page>
  );
}
