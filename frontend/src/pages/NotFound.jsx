import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import {
  TalaoPage, Wrap, Hand, PrimaryLink, StampLink, SiteHeader, SiteFooter,
  StateSection, StateSheet, StateActions,
} from '../components/talao';

/* Endereço que não existe: diz o que aconteceu, mostra o que foi digitado e dá as duas saídas. */

// O endereço digitado é escrito à mão: é o que a pessoa preencheu, não o que a gráfica imprimiu
const Typed = styled.p`
  && {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1.5px solid var(--pauta);
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
    color: var(--nanquim);
  }

  > span:first-child {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
  }
`;

const Address = styled(Hand)`
  font-size: 1.45rem;
  line-height: 1.2;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <TalaoPage>
      <SEOHead title="Página não encontrada" description="Este endereço não existe no ContrataPro." noIndex />
      <SiteHeader />
      <main>
        <StateSection>
          <Wrap>
            <StateSheet>
              <h1 data-display>Esta página não existe</h1>
              <p>
                O endereço pode ter sido digitado errado ou a página saiu do ar.
                Pela busca você encontra quem atende na sua região.
              </p>
              <Typed>
                <span>Endereço:</span>
                <Address>{pathname}</Address>
              </Typed>
              <StateActions>
                <PrimaryLink to="/search">
                  <Search size={18} aria-hidden="true" /> Buscar profissionais
                </PrimaryLink>
                <StampLink to="/">Ir para o início</StampLink>
              </StateActions>
            </StateSheet>
          </Wrap>
        </StateSection>
      </main>
      <SiteFooter />
    </TalaoPage>
  );
}
