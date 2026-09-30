import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRight, MapPin, RotateCw } from 'lucide-react';
import SEOHead, { POPULAR_CATEGORIES } from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';
import { API_URL } from '../config';
import {
  TalaoPage,
  Wrap,
  paperSurface,
  Display,
  Lead,
  PrimaryButton,
  PrimaryLink,
  StampButton,
  StampLink,
  Seam,
  ProCard,
  CardsGrid,
  BlankCard,
  NoticeSheet,
  NoticeActions,
  ResultsBar,
  ResultsCount,
  TrustNote,
  SiteHeader,
  SiteFooter,
  whatsappLink,
} from '../components/talao';

/* Página de categoria (/servicos/:categoria), porta de entrada vinda do Google:
   diz o que é a categoria na via amarela, mostra quem atende na via rosa e oferece
   as outras categorias como uma lista impressa no papel branco. */

/* ------------------------------ Topo: via amarela ------------------------------ */

const Topo = styled.section`
  ${paperSurface('amarela')}
  padding: clamp(1.5rem, 5vw, 3.5rem) 0 clamp(2.5rem, 6vw, 4.5rem);
`;

const Trilha = styled.nav`
  margin-bottom: 1.25rem;

  ol {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.5rem;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--texto-2);
  }

  li + li::before {
    content: '/';
    margin-right: 0.5rem;
    color: var(--grafica-escura);
  }

  a {
    color: var(--grafica-escura);
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 4px;

    &:hover {
      color: var(--nanquim);
    }
  }
`;

const Regiao = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin-top: clamp(1.5rem, 3vw, 2rem);

  p {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 500;
    color: var(--nanquim);
  }

  svg {
    color: var(--grafica);
  }
`;

/* ------------------------------ Profissionais: via rosa ------------------------------ */

const Mesa = styled.section`
  ${paperSurface('rosa')}
  padding: clamp(2rem, 5vw, 3.5rem) 0 clamp(3.5rem, 8vw, 6rem);
`;

/* ------------------------------ Outras categorias: papel ------------------------------ */

const Outras = styled.section`
  padding: clamp(3rem, 7vw, 5.5rem) 0;
`;

// Lista impressa: uma pauta por categoria, como as linhas de um talão
const Categorias = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: clamp(1rem, 3vw, 2.5rem);
  border-top: 2px solid var(--grafica);

  @media (min-width: 760px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 52px;
    border-bottom: 1.5px solid var(--pauta);
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 1.2rem;
    letter-spacing: 0.02em;
    color: var(--nanquim);
    text-decoration: none;

    svg {
      flex: none;
      color: var(--grafica);
      transition: transform 160ms var(--ease-out);
    }

    &:hover {
      color: var(--grafica);

      svg {
        transform: translateX(3px);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a svg {
      transition: none;
    }
  }
`;

/* ------------------------------ Página ------------------------------ */

export default function ServiceCategory() {
  const { categoria } = useParams();
  const [attempt, setAttempt] = useState(0);
  // Região da última visita; "Ver todas as cidades" limpa só nesta página
  const [city, setCity] = useState(() => localStorage.getItem('userCity') || '');

  // Encontrar categoria nos dados pré-definidos
  const categoryData = POPULAR_CATEGORIES.find((c) => c.slug === categoria);
  const categoryName = categoryData?.name || categoria?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // Resposta guardada com a chave do pedido que a gerou: chave diferente = ainda carregando
  const requestKey = `${categoryName}|${city}|${attempt}`;
  const [response, setResponse] = useState({ key: null, status: 'ok', items: [] });

  useEffect(() => {
    if (!categoryName) return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams({ service: categoryName });
    if (city) params.append('city', city);

    fetch(`${API_URL}/users/search-by-service?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((items) => setResponse({ key: requestKey, status: 'ok', items: Array.isArray(items) ? items : [] }))
      .catch((err) => {
        if (err.name !== 'AbortError') setResponse({ key: requestKey, status: 'error', items: [] });
      });
    return () => controller.abort();
  }, [categoryName, city, requestKey]);

  const results = response.key === requestKey ? response : { status: 'loading', items: [] };

  // Leva o pedido para a busca, onde dá para trocar o CEP
  const searchParams = new URLSearchParams({ service: categoryName || '' });
  const savedCep = localStorage.getItem('userCep');
  if (city) searchParams.set('city', city);
  if (city && savedCep) searchParams.set('cep', savedCep);
  const searchHref = `/search?${searchParams}`;

  const relatedCategories = POPULAR_CATEGORIES.filter((c) => c.slug !== categoria);

  return (
    <TalaoPage>
      <SEOHead
        category={categoryName}
        city={city}
        url={`https://contratapro.com.br/servicos/${categoria}`}
      />
      <StructuredData type="service" />
      <SiteHeader />

      <main>
        <Topo aria-labelledby="titulo-categoria">
          <Wrap>
            <Trilha aria-label="Você está em">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li><Link to="/search">Buscar</Link></li>
                <li aria-current="page">{categoryName}</li>
              </ol>
            </Trilha>

            <Display as="h1" id="titulo-categoria">
              {categoryName}{city ? ` em ${city}` : ''}
            </Display>
            <Lead>
              Quem trabalha como {categoryName?.toLowerCase()} e se cadastrou no ContrataPro. Veja o perfil, os serviços
              e os preços de cada um, leia as avaliações de quem já agendou e marque o horário direto na agenda da pessoa.
              Para quem contrata, é grátis.
            </Lead>

            <Regiao>
              {city ? (
                <>
                  <p><MapPin size={18} aria-hidden="true" /> Mostrando quem atende em {city}.</p>
                  <StampButton type="button" onClick={() => setCity('')}>Ver todas as cidades</StampButton>
                </>
              ) : (
                <>
                  <p><MapPin size={18} aria-hidden="true" /> Mostrando todas as cidades.</p>
                  <PrimaryLink to={searchHref}>
                    Buscar perto de você <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryLink>
                </>
              )}
            </Regiao>
          </Wrap>
        </Topo>

        <Seam $from="amarela" $to="rosa" aria-hidden="true" />
        <Mesa aria-label={`Profissionais de ${categoryName}`} aria-busy={results.status === 'loading'}>
          <Wrap>
            {results.status === 'ok' && results.items.length > 0 && (
              <ResultsBar>
                <ResultsCount role="status">
                  <strong>{results.items.length}</strong>{' '}
                  {results.items.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
                </ResultsCount>
              </ResultsBar>
            )}

            <CardsGrid>
              {results.status === 'loading' && [0, 1, 2].map((i) => <BlankCard key={i} aria-hidden="true" />)}

              {results.status === 'error' && (
                <>
                  <NoticeSheet>
                    <div role="status">
                      <h3>Os perfis não carregaram agora.</h3>
                      <p>Pode ser a sua conexão ou uma instabilidade do nosso lado. Tente de novo em instantes.</p>
                    </div>
                    <NoticeActions>
                      <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}>
                        <RotateCw size={18} aria-hidden="true" /> Tentar de novo
                      </PrimaryButton>
                    </NoticeActions>
                  </NoticeSheet>
                  <BlankCard aria-hidden="true" data-extra />
                </>
              )}

              {results.status === 'ok' && results.items.length === 0 && (
                <>
                  <NoticeSheet>
                    <div role="status">
                      <h3>
                        {city
                          ? `Ninguém cadastrado como ${categoryName?.toLowerCase()} em ${city} ainda.`
                          : `Ninguém cadastrado como ${categoryName?.toLowerCase()} ainda.`}
                      </h3>
                      <p>
                        O ContrataPro está começando.
                        {city ? ' Veja quem atende em outras cidades, ou mostre' : ' Conhece alguém bom de serviço? Mostre'}{' '}
                        o ContrataPro para quem trabalha com isso: o cadastro é grátis e sem cartão.
                      </p>
                    </div>
                    <NoticeActions>
                      {city && (
                        <PrimaryButton type="button" onClick={() => setCity('')}>
                          Ver outras cidades <ArrowRight size={18} aria-hidden="true" />
                        </PrimaryButton>
                      )}
                      <StampLink to="/register-pro">Sou profissional, quero me cadastrar</StampLink>
                    </NoticeActions>
                  </NoticeSheet>
                  <BlankCard aria-hidden="true" data-extra />
                </>
              )}

              {results.status === 'ok' && results.items.map((pro) => (
                <ProCard
                  key={pro.id}
                  pro={pro}
                  cep={city ? savedCep || '' : ''}
                  badge={pro.subscription_plan?.badge_label}
                  contactHref={whatsappLink(pro.whatsapp, pro.name, categoryName)}
                />
              ))}
            </CardsGrid>

            {results.status === 'ok' && results.items.length > 0 && <TrustNote />}
          </Wrap>
        </Mesa>
        <Seam $from="rosa" $to="papel" aria-hidden="true" />

        <Outras aria-labelledby="titulo-outras">
          <Wrap>
            <Display id="titulo-outras">Outras categorias</Display>
            <Categorias>
              {relatedCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/servicos/${cat.slug}`}>
                    {cat.name} <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </Categorias>
          </Wrap>
        </Outras>
      </main>

      <SiteFooter />
    </TalaoPage>
  );
}
