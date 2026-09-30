import { useState, useEffect, useRef, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCw, ArrowRight, Check, Plus } from 'lucide-react';
import { API_URL } from '../config';
import StructuredData from '../components/SEO/StructuredData';
import SEOHead, { SEO_CONFIGS } from '../components/SEO/SEOHead';
import {
  TalaoPage,
  Wrap,
  paperSurface,
  Display,
  Lead,
  PrimaryButton,
  PrimaryLink,
  StampLink,
  Field,
  FormError,
  Seam,
  ProCard,
  CardsGrid,
  BlankCard,
  SiteHeader,
  SiteFooter,
  NoticeSheet,
  NoticeActions,
  CepField,
  useCep,
  TalaoSheet,
  Canhoto,
  TalaoBody,
  TalaoHead,
  TalaoBrand,
  SubmitRow,
  Perforation,
  PrintedCircle,
  HandCross,
  readSavedLocation,
} from '../components/talao';

/* Home no mundo "Talão de Orçamento". Tokens e peças compartilhadas vivem em
   components/talao; aqui fica só o que é próprio da Home (hero, talão de pedido,
   vias e perguntas). */


/* ------------------------------ Hero: via amarela ------------------------------ */

const Hero = styled.section`
  ${paperSurface('amarela')}
  padding: clamp(2rem, 6vw, 5rem) 0 clamp(3rem, 7vw, 6rem);

  /* Celular pequeno: o botão de busca precisa caber na primeira tela (360×640) */
  @media (max-width: 559px) {
    padding-top: 1rem;
  }
`;

// Mobile: título, talão e só depois a chamada para profissionais
const HeroGrid = styled(Wrap)`
  display: grid;
  grid-template-areas: 'text' 'talao' 'foot';
  gap: 1.75rem;

  @media (max-width: 559px) {
    gap: 1rem;
  }

  > div:first-child {
    grid-area: text;
  }

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 32rem);
    grid-template-areas: 'text talao' 'foot talao';
    column-gap: clamp(2rem, 4vw, 4rem);
    row-gap: 0;

    > div:first-child {
      align-self: end;
    }
  }
`;

const HeroTitle = styled.h1`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2.6rem, 6.4vw, 5.25rem);
  line-height: 0.95;
  letter-spacing: -0.015em;
  text-wrap: balance;

  @media (max-width: 559px) {
    font-size: 2.3rem;
  }
`;

// No celular o talão já explica o pedido; o texto de apoio só aparece com espaço
const HeroLead = styled(Lead)`
  margin-top: 1.25rem;

  @media (max-width: 559px) {
    display: none;
  }
`;

const HeroFoot = styled.p`
  grid-area: foot;
  align-self: start;
  display: flex;

  @media (min-width: 960px) {
    margin-top: 1.75rem;
  }
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.75rem;
  font-size: 1.05rem;
  color: var(--texto-2);

  a {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 0.02em;
    color: var(--grafica);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    &:hover {
      color: var(--grafica-escura);
    }
  }
`;

/* O talão: folha branca com canhoto perfurado */
const Talao = styled(TalaoSheet).attrs({ as: 'form' })`
  grid-area: talao;
  align-self: center;
`;

// Contagem real em letra miúda impressa, sob o nome do talão: nunca com cara de número de pedido
const Contagem = styled.p`
  flex-basis: 100%;
  font-family: var(--f-impresso);
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  line-height: 1.25;
  color: var(--grafica-escura);

  strong {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
`;


const Checklist = styled.fieldset`
  border: none;
  margin-top: 0.6rem;

  legend {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
    margin-bottom: 0.4rem;
  }
`;

const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;

`;

const CheckItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  padding: 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: var(--f-texto);
  font-weight: 500;
  font-size: 1rem;
  color: var(--nanquim);
  min-width: 0;

  > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover > span:last-child {
    color: var(--grafica);
  }
`;





/* ------------------------------ Duas vias ------------------------------ */

const Section = styled.section`
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;

  /* Duas seções no mesmo papel não somam o respiro */
  & + & {
    padding-top: 0;
  }
`;

const SectionHead = styled.div`
  margin-bottom: clamp(2rem, 4vw, 3rem);
`;

const Via = styled.article`
  ${({ $paper }) => paperSurface($paper)}
  border-top: 6px solid var(--grafica);
  padding: clamp(1.25rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
`;

const ViaHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--grafica);
`;

const ViaTitle = styled.h3`
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  line-height: 1.05;
`;

// Carimbo da via, como o da gráfica no canto do talão
const ViaStamp = styled.span`
  flex: none;
  padding: 0.2rem 0.55rem;
  border: 2px solid var(--grafica-escura);
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--grafica-escura);
  transform: rotate(-4deg);
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25rem;

  th {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
    text-align: left;
    padding: 0 0 0.35rem;
    border-bottom: 1.5px solid var(--grafica);
  }

  td {
    padding: 0.8rem 0;
    border-bottom: 1.5px solid var(--pauta);
    vertical-align: top;
    line-height: 1.5;
    color: var(--nanquim);
  }

  td:first-child,
  th:first-child {
    width: 4rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  /* Texto vermelho pequeno sobre rosa/azul precisa da tinta escura para passar 4.5:1 */
  th,
  td:first-child {
    color: var(--grafica-escura);
  }
`;

const ViaNote = styled.p`
  font-family: var(--f-mao);
  font-weight: 700;
  font-size: 1.45rem;
  line-height: 1.2;
  color: var(--carbono);
  transform: rotate(-1deg);
  margin-bottom: 1.5rem;
`;

const ViaAction = styled.div`
  margin-top: auto;

  > * {
    width: 100%;
  }

  @media (min-width: 560px) {
    > * {
      width: auto;
    }
  }
`;

/* ------------------------------ Profissionais: via rosa ------------------------------ */

const Mesa = styled.section`
  ${paperSurface('rosa')}
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;
`;
const MesaNote = styled.p`
  margin-top: 1.75rem;
  color: var(--texto-2);
  max-width: 62ch;
  line-height: 1.55;

  a {
    color: var(--grafica-escura);
    font-weight: 600;
    text-underline-offset: 4px;
  }
`;

/* ------------------------------ O combinado ------------------------------ */

const CombinadoGrid = styled.div`
  display: grid;
  gap: 2rem;
  border: 2px solid var(--grafica);
  padding: clamp(1.25rem, 3vw, 2.25rem);

  @media (min-width: 880px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3rem;
  }
`;

const ListTitle = styled.h3`
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--grafica);
`;

const RuledList = styled.ul`
  list-style: none;

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
    color: ${({ $mark }) => ($mark === 'carbono' ? 'var(--carbono)' : 'var(--grafica)')};
  }
`;

const Perguntas = styled.div`
  max-width: 52rem;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  details {
    border-bottom: 1.5px solid var(--pauta);
  }

  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    min-height: 56px;
    font-weight: 600;
    font-size: 1.08rem;

    &::-webkit-details-marker {
      display: none;
    }

    svg {
      flex: none;
      color: var(--grafica);
      transition: transform 200ms var(--ease-out);
    }

    &:hover {
      color: var(--grafica);
    }
  }

  details[open] summary svg {
    transform: rotate(45deg);
  }

  @media (prefers-reduced-motion: reduce) {
    summary svg {
      transition: none;
    }
  }

  details p {
    padding: 0 0 1.1rem;
    line-height: 1.6;
    color: var(--texto-2);
    max-width: 65ch;
  }
`;

/* ------------------------------ Componentes ------------------------------ */


/* ------------------------------ Página ------------------------------ */

export default function Home() {
  const navigate = useNavigate();
  const serviceInputRef = useRef(null);
  const formId = useId();


  const [service, setService] = useState('');
  const [formError, setFormError] = useState('');
  // CEP salvo em visitas anteriores
  const [savedLocation] = useState(readSavedLocation);
  const cep = useCep(savedLocation);
  const { cepDigits, city } = cep;
  const cepInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(null);
  // Texto que a pessoa digitou antes de marcar um atalho, para desmarcar sem perder o que escreveu
  const typedServiceRef = useRef('');
  const checklistRefs = useRef([]);

  const [pros, setPros] = useState({ status: 'loading', items: [], fromCity: null });
  const [prosAttempt, setProsAttempt] = useState(0);

  // Categorias para o checklist e autocomplete (sem categorias, o campo livre continua funcionando)
  useEffect(() => {
    fetch(`${API_URL}/categories/groups`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const names = Object.values(data).flat().map((c) => c.name);
        setCategories([...new Set(names)]);
      })
      .catch(() => {});
  }, []);

  // Numeração do talão: só aparece com o número real de agendamentos
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/users/stats/public`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Number.isFinite(data.appointments_count)) setBookingsCount(data.appointments_count);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Profissionais reais: primeiro da cidade do visitante, senão de qualquer lugar
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const fetchPros = async (cityName) => {
        const params = new URLSearchParams({ limit: '6' });
        if (cityName) params.append('city', cityName);
        const res = await fetch(`${API_URL}/users/search?${params}`);
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      };
      try {
        // A busca por cidade é parcial (ilike); só conta como "da cidade" quem é exatamente dela
        const norm = (value) => (value || '').normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();
        let items = city ? (await fetchPros(city)).filter((pro) => norm(pro.city) === norm(city)) : [];
        let fromCity = city || null;
        if (!items.length) {
          items = await fetchPros(null);
          fromCity = null;
        }
        if (!cancelled) setPros({ status: 'ok', items, fromCity });
      } catch {
        if (!cancelled) setPros({ status: 'error', items: [], fromCity: null });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [city, prosAttempt]);

  const pickCategory = (name) => {
    setService((current) => {
      if (current === name) return typedServiceRef.current;
      if (!checklist.includes(current)) typedServiceRef.current = current;
      return name;
    });
    setFormError('');
  };

  // Setas só movem o foco entre os atalhos visíveis; Espaço/Enter escolhe, sem apagar o que foi digitado
  const onChecklistKey = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const items = checklistRefs.current.filter((el) => el && el.offsetParent !== null);
    const next = items[(items.indexOf(e.currentTarget) + step + items.length) % items.length];
    next.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // CEP começado e incompleto: avisa no próprio CEP em vez de buscar sem a região
    if (cep.isIncomplete) {
      cep.setCepIncomplete(true);
      cepInputRef.current?.focus();
      return;
    }
    if (!service.trim() && !city) {
      setFormError('Escreva o serviço ou um CEP válido para começar.');
      serviceInputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams();
    if (service.trim()) params.append('service', service.trim());
    if (city) params.append('city', city);
    if (cep.cepState === 'ok' && cepDigits.length === 8) params.append('cep', cepDigits);
    navigate(`/search?${params}`);
  };

  const focusTalao = () => {
    document.getElementById(formId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    serviceInputRef.current?.focus({ preventScroll: true });
  };

  const retryPros = () => {
    setPros({ status: 'loading', items: [], fromCity: null });
    setProsAttempt((n) => n + 1);
  };

  const checklist = categories.slice(0, 4);

  return (
    <TalaoPage>
      <SEOHead {...SEO_CONFIGS.home} url="https://contratapro.com.br" />
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="service" />

      <SiteHeader />

      <main>
        <Hero aria-labelledby="titulo-home">
          <HeroGrid>
            <div>
              <HeroTitle id="titulo-home" data-display>
                Profissionais da sua região, com agenda aberta pra você.
              </HeroTitle>
              <HeroLead>
                Escreva o serviço e o seu CEP. Você vê quem atende no seu bairro, confere o perfil e marca
                o horário direto na agenda da pessoa. Para quem contrata, é grátis.
              </HeroLead>
            </div>

            <Talao $tilt id={formId} onSubmit={handleSubmit} noValidate aria-label="Pedido de serviço">
              <Canhoto aria-hidden="true" />
              <TalaoBody>
                <TalaoHead>
                  <TalaoBrand>
                    <strong>CONTRATAPRO</strong>
                    <span>Pedido de serviço</span>
                  </TalaoBrand>
                  {/* Só a contagem real da API; sem ela, o talão sai sem número */}
                  {bookingsCount > 0 && (
                    <Contagem>
                      <strong>{bookingsCount.toLocaleString('pt-BR')}</strong>{' '}
                      {bookingsCount === 1 ? 'agendamento já feito' : 'agendamentos já feitos'} no ContrataPro
                    </Contagem>
                  )}
                </TalaoHead>

                <Field>
                  <span>Serviço:</span>
                  <input
                    ref={serviceInputRef}
                    type="text"
                    aria-invalid={formError ? true : undefined}
                    aria-describedby={formError ? `${formId}-erro` : undefined}
                    name="service"
                    list={categories.length ? `${formId}-servicos` : undefined}
                    placeholder="ex.: eletricista, diarista"
                    autoComplete="off"
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      typedServiceRef.current = e.target.value;
                      setFormError('');
                    }}
                  />
                </Field>
                {formError && <FormError id={`${formId}-erro`} role="alert">{formError}</FormError>}
                {categories.length > 0 && (
                  <datalist id={`${formId}-servicos`}>
                    {categories.map((name) => <option key={name} value={name} />)}
                  </datalist>
                )}

                {checklist.length > 0 && (
                  <Checklist>
                    <legend id={`${formId}-mais`}>Mais pedidos (escolha um):</legend>
                    <ChecklistGrid role="radiogroup" aria-labelledby={`${formId}-mais`}>
                      {checklist.map((name, i) => {
                        const checked = service === name;
                        const focusable = checked || (!checklist.includes(service) && i === 0);
                        return (
                          <CheckItem
                            key={name}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            tabIndex={focusable ? 0 : -1}
                            data-name={name}
                            ref={(el) => { checklistRefs.current[i] = el; }}
                            onClick={() => pickCategory(name)}
                            onKeyDown={onChecklistKey}
                          >
                            <PrintedCircle>{checked && <HandCross />}</PrintedCircle>
                            <span>{name}</span>
                          </CheckItem>
                        );
                      })}
                    </ChecklistGrid>
                  </Checklist>
                )}

                <CepField
                  cep={{ ...cep, handleCepChange: (value) => { setFormError(''); cep.handleCepChange(value); } }}
                  id={`${formId}-cep`}
                  inputRef={cepInputRef}
                />


                <SubmitRow>
                  <PrimaryButton type="submit">
                    Buscar profissionais <ArrowRight size={20} aria-hidden="true" />
                  </PrimaryButton>
                </SubmitRow>

                <Perforation>
                  Buscar não compromete nada: você só vê quem atende. Grátis para quem contrata, e o pagamento você
                  combina direto com o profissional.
                </Perforation>
              </TalaoBody>
            </Talao>

            <HeroFoot>
              É profissional autônomo?
              <Link to="/register-pro">
                Cadastre-se grátis, sem cartão <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </HeroFoot>
          </HeroGrid>
        </Hero>
        <Seam $from="amarela" $to="rosa" aria-hidden="true" />
        <Mesa aria-labelledby="titulo-pros" aria-busy={pros.status === 'loading'}>
            <Wrap>
              <SectionHead>
                <Display id="titulo-pros">
                  {pros.fromCity ? `Quem atende em ${pros.fromCity}` : 'Gente que já está no ContrataPro'}
                </Display>
                <Lead>
                  Cada perfil é preenchido pelo próprio profissional, com os serviços, os preços e a agenda dele. As
                  avaliações só vêm de clientes que agendaram pelo ContrataPro.
                </Lead>
              </SectionHead>

              {(pros.status === 'error' || (pros.status === 'ok' && pros.items.length === 0)) && (
                <CardsGrid>
                  <NoticeSheet>
                    {pros.status === 'error' ? (
                      <>
                        <div role="status">
                          <h3>Os perfis não carregaram agora.</h3>
                          <p>
                            Pode ser a sua conexão ou uma instabilidade do nosso lado. Tente de novo, ou preencha o
                            pedido lá em cima: a busca mostra quem atende perto de você.
                          </p>
                        </div>
                        <NoticeActions>
                          <PrimaryButton type="button" onClick={retryPros}>
                            <RotateCw size={18} aria-hidden="true" /> Tentar de novo
                          </PrimaryButton>
                          <StampLink as="button" type="button" onClick={focusTalao}>Preencher o pedido</StampLink>
                        </NoticeActions>
                      </>
                    ) : (
                      <>
                        <div role="status">
                          <h3>Ainda não há profissionais cadastrados.</h3>
                          <p>
                            O ContrataPro está começando. Conhece alguém bom de serviço? Mostre o ContrataPro para essa
                            pessoa: o cadastro é grátis e sem cartão.
                          </p>
                        </div>
                        <NoticeActions>
                          <StampLink to="/register-pro">Sou profissional, quero me cadastrar</StampLink>
                        </NoticeActions>
                      </>
                    )}
                  </NoticeSheet>
                  <BlankCard aria-hidden="true" data-extra />
                </CardsGrid>
              )}

              {(pros.status === 'loading' || pros.items.length > 0) && (
                <CardsGrid>
                  {pros.status === 'loading'
                    ? [0, 1, 2].map((i) => <BlankCard key={i} aria-hidden="true" />)
                    : pros.items.map((pro) => <ProCard key={pro.id} pro={pro} cep={cepDigits} />)}
                </CardsGrid>
              )}

              {pros.status === 'ok' && city && !pros.fromCity && (
                <MesaNote>
                  Ainda não temos profissionais cadastrados em {city}; estes são de outras cidades. Conhece alguém bom
                  de serviço aí? <Link to="/register-pro">Mostre o ContrataPro para essa pessoa</Link>.
                </MesaNote>
              )}
            </Wrap>
        </Mesa>
        <Seam $from="rosa" $to="papel" aria-hidden="true" />

        <Section aria-labelledby="titulo-combinado">
          <Wrap>
            <SectionHead>
              <Display id="titulo-combinado">O combinado, preto no branco</Display>
              <Lead>Antes de chamar alguém na sua casa, é bom saber exatamente o que o ContrataPro faz e o que fica entre você e o profissional.</Lead>
            </SectionHead>

            <CombinadoGrid>
              <div>
                <ListTitle>O que o ContrataPro faz</ListTitle>
                <RuledList $mark="carbono">
                  <li><Check size={20} aria-hidden="true" />Mostra o perfil, os serviços e os preços que o profissional cadastrou.</li>
                  <li><Check size={20} aria-hidden="true" />Deixa você marcar horário direto na agenda dele.</li>
                  <li><Check size={20} aria-hidden="true" />Avisa por e-mail quando o agendamento é feito ou muda.</li>
                  <li><Check size={20} aria-hidden="true" />Só libera avaliação para quem agendou de verdade.</li>
                </RuledList>
              </div>
              <div>
                <ListTitle>O que fica entre você e o profissional</ListTitle>
                <RuledList $mark="grafica">
                  <li><ArrowRight size={20} aria-hidden="true" />O pagamento: Pix, dinheiro ou o que vocês combinarem. O ContrataPro não cobra nada de quem contrata.</li>
                  <li><ArrowRight size={20} aria-hidden="true" />O orçamento final e a execução do serviço.</li>
                  <li><ArrowRight size={20} aria-hidden="true" />A conversa antes: o ContrataPro não checa antecedentes. Antes de marcar, leia as avaliações de quem já agendou, confira os serviços e preços do perfil e converse com a pessoa.</li>
                </RuledList>
              </div>
            </CombinadoGrid>
          </Wrap>
        </Section>

        <Section aria-labelledby="via-profissional">
          <Wrap>
            <Via $paper="azul" aria-labelledby="via-profissional">
              <ViaHead>
                <ViaTitle as="h2" id="via-profissional" data-display>Você oferece serviços?</ViaTitle>
                <ViaStamp>Sem cartão</ViaStamp>
              </ViaHead>
              <ItemsTable>
                <thead>
                  <tr><th scope="col">Passo</th><th scope="col">Como funciona</th></tr>
                </thead>
                <tbody>
                  <tr><td>01</td><td>Crie seu perfil de graça, em minutos, sem cartão de crédito.</td></tr>
                  <tr><td>02</td><td>Cadastre seus serviços e preços e marque os horários em que você atende.</td></tr>
                  <tr><td>03</td><td>Clientes da sua região encontram você e agendam direto na sua agenda.</td></tr>
                </tbody>
              </ItemsTable>
              <ViaNote>Sem intermediário: o cliente fala e paga direto com você.</ViaNote>
              <ViaAction>
                <PrimaryLink to="/register-pro">
                  Quero oferecer serviços <ArrowRight size={18} aria-hidden="true" />
                </PrimaryLink>
              </ViaAction>
            </Via>
          </Wrap>
        </Section>

        <Section aria-labelledby="titulo-perguntas">
          <Wrap>
            <Perguntas>
              <h2 id="titulo-perguntas">Perguntas que todo mundo faz</h2>
              <details>
                <summary>O ContrataPro verifica os profissionais? <Plus size={22} aria-hidden="true" /></summary>
                <p>Não. Mostramos o perfil que o profissional preencheu e as avaliações de clientes que agendaram pela plataforma. Antes de fechar, leia essas avaliações, confira os serviços e preços do perfil e converse com a pessoa.</p>
              </details>
              <details>
                <summary>Por que a busca é por região? <Plus size={22} aria-hidden="true" /></summary>
                <p>Porque quem mora perto chega mais rápido, gasta menos com deslocamento e fica mais fácil de encontrar de novo.</p>
              </details>
            </Perguntas>
          </Wrap>
        </Section>
      </main>

      <SiteFooter />
    </TalaoPage>
  );
}
