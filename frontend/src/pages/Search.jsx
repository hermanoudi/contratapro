import { useState, useEffect, useRef, useId } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, RotateCw } from 'lucide-react';
import { API_URL } from '../config';
import SEOHead from '../components/SEO/SEOHead';
import {
  TalaoPage,
  Wrap,
  paperSurface,
  Display,
  Lead,
  PrimaryButton,
  StampButton,
  Field,
  FormError,
  Seam,
  ProCard,
  CardsGrid,
  BlankCard,
  NoticeSheet,
  NoticeActions,
  CepField,
  useCep,
  readSavedLocation,
  SiteHeader,
  SiteFooter,
  whatsappLink,
  ResultsBar,
  ResultsCount,
  TrustNote,
} from '../components/talao';

/* Busca no mundo "Talão de Orçamento": o pedido fica na via amarela, já preenchido
   à mão e pronto para ser corrigido; os profissionais aparecem na via rosa, como na Home. */

/* ------------------------------ Pedido: via amarela ------------------------------ */

const Pedido = styled.section`
  ${paperSurface('amarela')}
  padding: clamp(1.5rem, 5vw, 3.5rem) 0 clamp(2rem, 5vw, 3.5rem);
`;

const PedidoLead = styled(Lead)`
  margin-bottom: clamp(1.25rem, 3vw, 2rem);
`;

// O talão aberto na mesa: folha branca emoldurada, sem inclinação (aqui é para editar)
const PedidoSheet = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0 1.75rem;
  background: var(--papel);
  border: 2px solid var(--grafica);
  box-shadow: 0 22px 36px -18px rgba(23, 23, 27, 0.45), 0 2px 4px rgba(23, 23, 27, 0.12);
  padding: 0.25rem clamp(1rem, 3vw, 1.75rem) 1.25rem;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) auto;
    align-items: start;
  }
`;

const SubmitCell = styled.div`
  padding-top: 0.5rem;

  button {
    width: 100%;
    min-height: 54px;
    font-size: 1.2rem;
  }

  @media (min-width: 900px) {
    padding-top: 1.1rem;

    button {
      width: auto;
    }
  }
`;

/* ------------------------------ Resultado: via rosa ------------------------------ */

const Mesa = styled.section`
  ${paperSurface('rosa')}
  padding: clamp(2rem, 5vw, 3.5rem) 0 clamp(3.5rem, 8vw, 6rem);
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
`;

const drawStroke = keyframes`
  to { stroke-dashoffset: 0; }
`;

// Filtro de marcar: quadrado impresso (vários ao mesmo tempo), X à mão quando ligado
const FilterToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--f-texto);
  font-weight: 500;
  font-size: 1rem;
  color: var(--nanquim);

  &:hover > span:last-child {
    color: var(--grafica-escura);
  }
`;

const Box = styled.span`
  flex: none;
  position: relative;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--grafica-escura);

  svg {
    position: absolute;
    inset: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    overflow: visible;
  }

  path {
    stroke: var(--carbono);
    stroke-width: 3.2;
    stroke-linecap: round;
    fill: none;
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
    animation: ${drawStroke} 220ms var(--ease-out) forwards;
  }

  path + path {
    animation-delay: 160ms;
  }

  @media (prefers-reduced-motion: reduce) {
    path {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3 L21 21" />
      <path d="M21 3 L3 21" />
    </svg>
  );
}

/* ------------------------------ Regras ------------------------------ */

const FILTERS = [
  { id: 'rating', label: '4 estrelas ou mais', test: (pro) => (pro.average_rating || 0) >= 4 },
  { id: 'badge', label: 'Com selo', test: (pro) => !!pro.subscription_plan?.badge_label },
];

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/* ------------------------------ Página ------------------------------ */

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formId = useId();
  const serviceInputRef = useRef(null);
  const cepInputRef = useRef(null);

  // Chegando direto em /search, sem pedido: usa a região salva na última visita
  const hasQuery = searchParams.has('service') || searchParams.has('city');
  const [savedLocation] = useState(readSavedLocation);
  const query = {
    service: (searchParams.get('service') || '').trim(),
    city: hasQuery ? (searchParams.get('city') || '').trim() : savedLocation?.city || '',
  };

  const [service, setService] = useState(query.service);
  const [formError, setFormError] = useState('');
  const cep = useCep(
    hasQuery
      ? { cep: searchParams.get('cep') || '', city: searchParams.get('city') || '' }
      : savedLocation
  );

  const [attempt, setAttempt] = useState(0);
  // Resposta guardada com a chave do pedido que a gerou: chave diferente = ainda carregando
  const requestKey = `${query.service}|${query.city}|${attempt}`;
  const [response, setResponse] = useState({ key: null, status: 'ok', items: [] });
  const [activeFilters, setActiveFilters] = useState([]);

  // Voltar/avançar no navegador troca o pedido: o campo acompanha a URL
  const [shownService, setShownService] = useState(query.service);
  if (shownService !== query.service) {
    setShownService(query.service);
    setService(query.service);
  }

  // A URL é o pedido: toda mudança nela refaz a busca
  useEffect(() => {
    if (!query.service && !query.city) return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query.service) params.append('service', query.service);
    if (query.city) params.append('city', query.city);

    fetch(`${API_URL}/users/search-by-service?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((items) => setResponse({ key: requestKey, status: 'ok', items: Array.isArray(items) ? items : [] }))
      .catch((err) => {
        if (err.name !== 'AbortError') setResponse({ key: requestKey, status: 'error', items: [] });
      });
    return () => controller.abort();
  }, [query.service, query.city, requestKey]);

  const results = !query.service && !query.city
    ? { status: 'idle', items: [] }
    : response.key === requestKey
      ? response
      : { status: 'loading', items: [] };

  const toggleFilter = (id) => {
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const visible = results.items.filter((pro) =>
    FILTERS.every((f) => !activeFilters.includes(f.id) || f.test(pro))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // CEP começado e incompleto: avisa no próprio CEP em vez de buscar sem a região
    if (cep.isIncomplete) {
      cep.setCepIncomplete(true);
      cepInputRef.current?.focus();
      return;
    }
    if (!service.trim() && !cep.city) {
      setFormError('Escreva o serviço ou um CEP válido para buscar.');
      serviceInputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams();
    if (service.trim()) params.set('service', service.trim());
    if (cep.city) params.set('city', cep.city);
    if (cep.cepState === 'ok' && cep.cepDigits.length === 8) params.set('cep', cep.cepDigits);
    setSearchParams(params);
  };

  const searchAllCities = () => {
    setSearchParams(query.service ? { service: query.service } : {});
    cep.handleCepChange('');
  };

  const editRequest = () => {
    serviceInputRef.current?.focus();
    serviceInputRef.current?.select();
  };

  const title = query.service && query.city
    ? `${capitalize(query.service)} em ${query.city}`
    : query.service
      ? `${capitalize(query.service)}, em qualquer cidade`
      : query.city
        ? `Profissionais em ${query.city}`
        : 'Quem você procura?';

  // SEO dinâmico baseado na busca
  const seoTitle = query.service
    ? `${query.service}${query.city ? ` em ${query.city}` : ''} - Encontre Profissionais`
    : 'Buscar Profissionais';
  const seoDescription = query.service
    ? `Encontre profissionais de ${query.service}${query.city ? ` em ${query.city}` : ''}. Compare preços, veja avaliações e agende online.`
    : 'Busque profissionais da sua região. Eletricista, encanador, manicure, diarista e muito mais.';

  const showResults = results.status !== 'idle';

  return (
    <TalaoPage>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        category={query.service}
        city={query.city}
        url={`https://contratapro.com.br/search${query.service ? `?service=${encodeURIComponent(query.service)}` : ''}`}
      />
      <SiteHeader />

      <main>
        <Pedido aria-labelledby="titulo-busca">
          <Wrap>
            <Display as="h1" id="titulo-busca">{title}</Display>
            <PedidoLead>
              {showResults
                ? 'Quem se cadastrou no ContrataPro e oferece esse serviço. Os primeiros da lista assinam um plano de destaque; as avaliações só vêm de quem agendou.'
                : 'Escreva o serviço e o seu CEP. Você vê quem atende no seu bairro e marca o horário direto na agenda da pessoa.'}
            </PedidoLead>

            <PedidoSheet onSubmit={handleSubmit} noValidate aria-label="Pedido de serviço">
              <div>
                <Field>
                  <span>Serviço:</span>
                  <input
                    ref={serviceInputRef}
                    type="text"
                    name="service"
                    placeholder="ex.: eletricista, diarista"
                    autoComplete="off"
                    value={service}
                    aria-invalid={formError ? true : undefined}
                    aria-describedby={formError ? `${formId}-erro` : undefined}
                    onChange={(e) => {
                      setService(e.target.value);
                      setFormError('');
                    }}
                  />
                </Field>
                {formError && <FormError id={`${formId}-erro`} role="alert">{formError}</FormError>}
              </div>
              <div>
                <CepField
                  cep={{ ...cep, handleCepChange: (value) => { setFormError(''); cep.handleCepChange(value); } }}
                  id={`${formId}-cep`}
                  inputRef={cepInputRef}
                />
              </div>
              <SubmitCell>
                <PrimaryButton type="submit">
                  Buscar <ArrowRight size={20} aria-hidden="true" />
                </PrimaryButton>
              </SubmitCell>
            </PedidoSheet>
          </Wrap>
        </Pedido>

        {showResults ? (
          <>
            <Seam $from="amarela" $to="rosa" aria-hidden="true" />
            <Mesa aria-label="Profissionais encontrados" aria-busy={results.status === 'loading'}>
              <Wrap>
                {results.status === 'ok' && results.items.length > 0 && (
                  <ResultsBar>
                    <ResultsCount role="status">
                      {activeFilters.length > 0 ? (
                        <><strong>{visible.length}</strong> de <strong>{results.items.length}</strong> profissionais</>
                      ) : (
                        <>
                          <strong>{results.items.length}</strong>{' '}
                          {results.items.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
                        </>
                      )}
                    </ResultsCount>
                    <Filters role="group" aria-label="Filtrar">
                      {FILTERS.map((f) => {
                        const on = activeFilters.includes(f.id);
                        return (
                          <FilterToggle key={f.id} type="button" aria-pressed={on} onClick={() => toggleFilter(f.id)}>
                            <Box>{on && <CheckMark />}</Box>
                            <span>{f.label}</span>
                          </FilterToggle>
                        );
                      })}
                    </Filters>
                  </ResultsBar>
                )}

                <CardsGrid>
                  {results.status === 'loading' && [0, 1, 2].map((i) => <BlankCard key={i} aria-hidden="true" />)}

                  {results.status === 'error' && (
                    <>
                      <NoticeSheet>
                        <div role="status">
                          <h3>A busca não carregou agora.</h3>
                          <p>Pode ser a sua conexão ou uma instabilidade do nosso lado. Seu pedido continua aí em cima; é só tentar de novo.</p>
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
                            {query.city
                              ? `Ninguém encontrado em ${query.city} para esse pedido.`
                              : 'Ninguém encontrado para esse pedido.'}
                          </h3>
                          <p>
                            Tente outro nome para o serviço (por exemplo, “pintor” em vez de “pintura”)
                            {query.city ? ' ou veja quem atende em outras cidades.' : '.'}
                          </p>
                        </div>
                        <NoticeActions>
                          {query.city && (
                            <PrimaryButton type="button" onClick={searchAllCities}>
                              Ver outras cidades <ArrowRight size={18} aria-hidden="true" />
                            </PrimaryButton>
                          )}
                          <StampButton type="button" onClick={editRequest}>Mudar o pedido</StampButton>
                        </NoticeActions>
                      </NoticeSheet>
                      <BlankCard aria-hidden="true" data-extra />
                    </>
                  )}

                  {results.status === 'ok' && results.items.length > 0 && visible.length === 0 && (
                    <>
                      <NoticeSheet>
                        <div role="status">
                          <h3>Nenhum profissional com esses filtros.</h3>
                          <p>Há {results.items.length} {results.items.length === 1 ? 'profissional' : 'profissionais'} para o seu pedido; os filtros marcados esconderam todos.</p>
                        </div>
                        <NoticeActions>
                          <StampButton type="button" onClick={() => setActiveFilters([])}>Limpar filtros</StampButton>
                        </NoticeActions>
                      </NoticeSheet>
                      <BlankCard aria-hidden="true" data-extra />
                    </>
                  )}

                  {results.status === 'ok' && visible.map((pro) => (
                    <ProCard
                      key={pro.id}
                      pro={pro}
                      cep={cep.cepDigits}
                      badge={pro.subscription_plan?.badge_label}
                      contactHref={whatsappLink(pro.whatsapp, pro.name, pro.services?.[0]?.title)}
                    />
                  ))}
                </CardsGrid>

                {results.status === 'ok' && visible.length > 0 && (
                  <TrustNote />
                )}
              </Wrap>
            </Mesa>
            <Seam $from="rosa" $to="papel" aria-hidden="true" />
          </>
        ) : (
          <Seam $from="amarela" $to="papel" aria-hidden="true" />
        )}
      </main>

      <SiteFooter />
    </TalaoPage>
  );
}
