import { useState, useEffect, useId } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Star, ArrowLeft, ArrowRight, MessageCircle, RotateCw, Check, AlertCircle } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { API_URL } from '../config';
import { translateError } from '../components/apiErrors';
import {
  TalaoPage,
  Wrap,
  paperSurface,
  Display,
  Lead,
  Hand,
  PrimaryButton,
  StampLink,
  Seam,
  TrustNote,
  SiteHeader,
  SiteFooter,
  TalaoSheet,
  Canhoto,
  TalaoBody,
  TalaoHead,
  TalaoBrand,
  SubmitRow,
  Perforation,
  PrintedCircle,
  HandCross,
  FieldNote,
  whatsappLink as buildWhatsappLink,
} from '../components/talao';

/* Perfil público e agendamento (/p/:slug) no mundo "Talão de Orçamento":
   o profissional na via amarela, o pedido de agendamento num talão de verdade
   e as avaliações na via rosa. É a continuação da Home e da busca. */

/* ------------------------------ Regras de data e horário ------------------------------ */

const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// working_hours usa 0 = segunda … 6 = domingo
const weekdayIndex = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1);

// Segunda-feira da semana da data: a API devolve 7 dias a partir do start_date
const weekStart = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - weekdayIndex(d));
  return d;
};

const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

// A mesma normalização da Home: "Uberlandia" e "Uberlândia" são a mesma cidade
const norm = (value) => (value || '').normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();

const formatPrice = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2 });

const longDate = (date) => date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

/* ------------------------------ Perfil: via amarela ------------------------------ */

const Perfil = styled.section`
  ${paperSurface('amarela')}
  padding: clamp(1.25rem, 4vw, 2.5rem) 0 clamp(2.5rem, 6vw, 4rem);
`;

const Back = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  margin-bottom: 1rem;
  padding: 0;
  background: none;
  border: none;
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--grafica-escura);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;

  &:hover {
    color: var(--nanquim);
  }
`;

const PerfilGrid = styled.div`
  display: grid;
  gap: 1.25rem 2rem;
  align-items: start;

  @media (min-width: 640px) {
    grid-template-columns: auto minmax(0, 1fr);
  }
`;

// Mesma moldura do cartão da busca, maior
const Foto = styled.div`
  width: clamp(96px, 22vw, 168px);
  aspect-ratio: 1;
  border: 2px solid var(--nanquim);
  background: var(--papel);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: clamp(2.5rem, 6vw, 4rem);
  box-shadow: 0 16px 28px -20px rgba(91, 74, 18, 0.6);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 1.25rem;
  margin: -0.25rem 0 1rem;
  font-size: 1rem;
  color: var(--texto-2);

  [data-cat] {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: 0.02em;
    color: var(--grafica-escura);
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  strong {
    color: var(--nanquim);
    font-variant-numeric: tabular-nums;
  }
`;

// Selo do plano, carimbado como o da via
const Stamp = styled.span`
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border: 2px solid var(--grafica-escura);
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--grafica-escura);
  transform: rotate(-3deg);
`;

const Description = styled(Lead)`
  max-width: 62ch;
  white-space: pre-line;
`;

const ContactRow = styled.div`
  margin-top: 1.25rem;
`;

/* ------------------------------ Pedido: o talão ------------------------------ */

const Pedido = styled.section`
  padding: clamp(2.5rem, 6vw, 4.5rem) 0;
`;

const PedidoSheet = styled(TalaoSheet)`
  max-width: 62rem;
  margin: 0 auto;
`;

const Com = styled.p`
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.04em;
  color: var(--grafica-escura);
`;

// Cada bloco do pedido é uma linha do talão com rótulo impresso
const Line = styled.fieldset`
  border: none;
  padding: 1rem 0 1.1rem;
  border-bottom: 1.5px solid var(--pauta);
  min-width: 0;

  > legend,
  > h2 {
    float: left;
    width: 100%;
    margin-bottom: 0.6rem;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
  }

  > legend + *,
  > h2 + * {
    clear: both;
  }
`;

const Services = styled.div`
  display: grid;
`;

// Serviço como item de talão: bolinha impressa, título e o preço à direita
const ServiceOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 52px;
  padding: 0.5rem 0.5rem;
  margin: 0 -0.5rem;
  cursor: pointer;
  border-top: 1px solid ${({ $first }) => ($first ? 'transparent' : 'var(--pauta)')};
  background: ${({ $on }) => ($on ? 'rgba(207, 224, 245, 0.45)' : 'transparent')};
  transition: background-color 160ms var(--ease-out);

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &:focus-within ${PrintedCircle} {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }

  > span:nth-child(3) {
    flex: 1;
    min-width: 0;
    font-weight: 500;
    font-size: 1.05rem;
    overflow-wrap: anywhere;
  }

  strong {
    flex: none;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.25rem;
    font-variant-numeric: tabular-nums;
    color: var(--grafica-escura);

    small {
      font-family: var(--f-texto);
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--texto-2-papel);
    }
  }

  &:hover > span:nth-child(3) {
    color: var(--grafica);
  }
`;

const When = styled.div`
  display: grid;
  gap: 1.25rem 2rem;

  @media (min-width: 860px) {
    grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    align-items: start;
  }
`;

// react-calendar no traço do talão: dias em letra impressa, escolhido em tinta de gráfica
const CalendarWrap = styled.div`
  .react-calendar {
    width: 100%;
    border: 1.5px solid var(--controle);
    border-radius: 2px;
    background: var(--papel);
    font-family: var(--f-texto);
  }

  .react-calendar__navigation {
    margin-bottom: 0;
    border-bottom: 1.5px solid var(--pauta);

    button {
      min-width: 44px;
      font-family: var(--f-impresso);
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--nanquim);
      border-radius: 0;

      &:enabled:hover,
      &:enabled:focus {
        background: var(--papel-2);
      }

      &:disabled {
        background: transparent;
        color: var(--controle);
      }
    }
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5rem 0;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--grafica-escura);

    abbr {
      text-decoration: none;
    }
  }

  .react-calendar__tile {
    min-height: 44px;
    padding: 0.6rem 0;
    border-radius: 0;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
    color: var(--nanquim);

    &:enabled:hover,
    &:enabled:focus {
      background: var(--papel-2);
    }

    &:focus-visible {
      outline: 2px solid var(--carbono);
      outline-offset: -2px;
    }

    &:disabled {
      background: transparent;
      color: var(--controle);
      text-decoration: line-through;
    }
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: var(--controle);
  }

  .react-calendar__tile--now {
    background: transparent;
    font-weight: 700;
    box-shadow: inset 0 -2px 0 var(--amarela);
  }

  .react-calendar__tile--active,
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: var(--grafica);
    color: var(--papel);
    font-weight: 700;
    text-decoration: none;
  }
`;

const DayTitle = styled.p`
  margin-bottom: 0.75rem;
  font-weight: 600;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const Slots = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.25rem, 1fr));
  gap: 0.5rem;
`;

// Horário como quadradinho impresso; escolhido fica preenchido à mão
const Slot = styled.button`
  min-height: 48px;
  border: 1.5px solid ${({ $on }) => ($on ? 'var(--carbono)' : 'var(--controle)')};
  border-radius: 2px;
  background: ${({ $on }) => ($on ? 'rgba(207, 224, 245, 0.55)' : 'var(--papel)')};
  font-family: ${({ $on }) => ($on ? 'var(--f-mao)' : 'var(--f-impresso)')};
  font-weight: 700;
  font-size: ${({ $on }) => ($on ? '1.5rem' : '1.15rem')};
  font-variant-numeric: tabular-nums;
  color: ${({ $on }) => ($on ? 'var(--carbono)' : 'var(--nanquim)')};
  box-shadow: ${({ $on }) => ($on ? 'inset 0 -2.5px 0 var(--carbono)' : 'none')};
  cursor: pointer;
  transition: border-color 160ms var(--ease-out);

  &:hover:not(:disabled) {
    border-color: var(--grafica);
  }

  &:disabled {
    cursor: not-allowed;
    color: var(--controle);
    text-decoration: line-through;
    background: var(--papel-2);
  }
`;

const Muted = styled.p`
  color: var(--texto-2-papel);
  line-height: 1.5;
`;

const DailyPick = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 52px;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &:focus-within ${PrintedCircle} {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }
`;

// Aviso de região ou cadastro dentro do talão
const Notice = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.9rem 0;
  border-bottom: 1.5px solid var(--pauta);
  line-height: 1.5;
  color: ${({ $tone }) => ($tone === 'ok' ? 'var(--carbono)' : 'var(--nanquim)')};

  svg {
    flex: none;
    margin-top: 0.15rem;
    color: ${({ $tone }) => ($tone === 'ok' ? 'var(--carbono)' : 'var(--grafica)')};
  }

  a {
    color: var(--grafica);
    font-weight: 600;
    text-underline-offset: 3px;
  }
`;

// O pedido escrito à mão antes de enviar
const Resumo = styled.p`
  padding: 0.9rem 0 0.25rem;
  min-height: 3.5rem;
  color: var(--texto-2-papel);

  ${Hand} {
    font-size: 1.6rem;
    line-height: 1.25;
  }
`;

const Signup = styled.p`
  margin-top: 0.75rem;
  text-align: center;
  color: var(--texto-2-papel);

  a {
    color: var(--grafica);
    font-weight: 600;
    text-underline-offset: 3px;
  }
`;

/* ------------------------------ Avaliações: via rosa ------------------------------ */

const Mesa = styled.section`
  ${paperSurface('rosa')}
  padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(3rem, 7vw, 5rem);
`;

const Reviews = styled.ul`
  list-style: none;
  max-width: 52rem;
  border-top: 2px solid var(--grafica);
`;

const ReviewItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1.5px solid var(--pauta);

  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem 1rem;
  }

  strong {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
  }

  p {
    margin-top: 0.4rem;
    line-height: 1.55;
    max-width: 65ch;
  }

  time {
    display: block;
    margin-top: 0.35rem;
    font-size: 0.95rem;
    color: var(--texto-2);
  }
`;

const Stars = styled.span`
  display: inline-flex;
  gap: 0.15rem;
  color: var(--grafica);
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
  font-variant-numeric: tabular-nums;

  button {
    min-height: 44px;
  }
`;

const PagerButton = styled.button`
  padding: 0 1rem;
  background: var(--papel);
  border: 2px solid var(--grafica);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--grafica);
  cursor: pointer;

  &:disabled {
    border-color: var(--controle);
    color: var(--controle);
    cursor: not-allowed;
  }
`;

/* ------------------------------ Estados de página ------------------------------ */

const StateSheet = styled.div`
  max-width: 40rem;
  padding: 1.5rem clamp(1.25rem, 3vw, 1.75rem);
  background: var(--papel);
  border-bottom: 5px solid var(--grafica);
  box-shadow: 0 16px 28px -18px rgba(91, 74, 18, 0.55), 0 1px 3px rgba(91, 74, 18, 0.18);

  h1 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(1.9rem, 4vw, 2.4rem);
    line-height: 1.05;
  }

  p {
    margin-top: 0.6rem;
    line-height: 1.55;
    color: var(--texto-2-papel);
  }
`;

const StateActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

/* ------------------------------ Sucesso: a via do cliente ------------------------------ */

const Via = styled.section`
  ${paperSurface('azul')}
  padding: clamp(2rem, 6vw, 4.5rem) 0;
  min-height: 60vh;
`;

const ViaSheet = styled(TalaoSheet)`
  max-width: 40rem;
  margin: 0 auto;
`;

const Agendado = styled.span`
  padding: 0.2rem 0.6rem;
  border: 2.5px solid var(--sucesso);
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sucesso);
  transform: rotate(-5deg);
`;

const ViaLines = styled.dl`
  div {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 0.75rem;
    align-items: baseline;
    padding: 0.7rem 0 0.35rem;
    border-bottom: 1.5px solid var(--pauta);
  }

  dt {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
  }

  dd {
    font-family: var(--f-mao);
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 1.2;
    color: var(--carbono);
    overflow-wrap: anywhere;

    &::first-letter {
      text-transform: uppercase;
    }
  }
`;

const ViaText = styled.p`
  margin-top: 1rem;
  line-height: 1.55;
`;

const ViaActions = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-top: 1.5rem;

  a {
    width: 100%;
  }

  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const WhatsAppLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0 1.2rem;
  border: 2px solid var(--grafica);
  border-radius: 2px;
  background: var(--grafica);
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--papel);
  transition: background-color 160ms var(--ease-out);

  &:hover {
    background: var(--grafica-escura);
    border-color: var(--grafica-escura);
  }

  &[data-stamp] {
    background: var(--papel);
    color: var(--grafica);

    &:hover {
      background: var(--grafica);
      color: var(--papel);
    }
  }
`;

/* ------------------------------ Página ------------------------------ */

export default function Booking() {
  // Suporta tanto /book/:id quanto /p/:slug
  const { id, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const uid = useId();

  // Determinar se é ID numérico ou slug de texto
  const identifier = slug || id;
  const isSlug = slug || (identifier && isNaN(parseInt(identifier)));

  // Perfil: resposta guardada com a chave do pedido que a gerou
  const [proAttempt, setProAttempt] = useState(0);
  const proKey = `${identifier}|${proAttempt}`;
  const [proResponse, setProResponse] = useState({ key: null, status: 'loading', data: null });
  const proState = proResponse.key === proKey ? proResponse.status : 'loading'; // loading | ok | notfound | error
  const pro = proResponse.key === proKey && proResponse.data ? proResponse.data : location.state?.pro || null;
  const proId = proState === 'ok' ? pro?.id : null;
  const services = proState === 'ok' ? pro?.services || [] : [];
  const workingHours = proState === 'ok' ? pro?.working_hours || [] : [];

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [success, setSuccess] = useState(null);

  const [clientCity, setClientCity] = useState('');
  const [clientChecked, setClientChecked] = useState(false);
  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'));

  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPages, setReviewsPages] = useState(0);

  // Agendamentos da semana do dia escolhido (a API devolve 7 dias a partir da segunda)
  const [apptAttempt, setApptAttempt] = useState(0);
  const weekStartISO = formatDateToISO(weekStart(selectedDate));
  const apptKey = `${proId}|${weekStartISO}|${apptAttempt}`;
  const [apptResponse, setApptResponse] = useState({ key: null, items: [] });
  const apptsReady = apptResponse.key === apptKey;
  const appointments = apptsReady ? apptResponse.items : [];

  // Dados do cliente logado (cidade, para conferir a região)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData) setClientCity(userData.city || '');
      })
      .catch((e) => console.error('Erro ao buscar dados do cliente:', e))
      .finally(() => setClientChecked(true));
  }, []);

  // Perfil do profissional
  useEffect(() => {
    let cancelled = false;
    // Usar endpoint de slug ou ID conforme o tipo do parâmetro
    const endpoint = isSlug ? `${API_URL}/users/p/${identifier}` : `${API_URL}/users/${identifier}/public`;
    fetch(endpoint)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setProResponse({ key: proKey, status: 'notfound', data: null });
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (cancelled) return;
        setProResponse({ key: proKey, status: 'ok', data });
        // Começa no primeiro dia com horário ainda livre: hoje só se o expediente não acabou
        const hours = data.working_hours || [];
        if (hours.length) {
          const now = new Date();
          const opens = (d, isToday) => {
            const wh = hours.find((w) => w.day_of_week === weekdayIndex(d));
            if (!wh) return false;
            return !isToday || parseInt(wh.end_time.split(':')[0]) - 1 > now.getHours();
          };
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          for (let i = 0; i < 60 && !opens(d, i === 0); i++) d.setDate(d.getDate() + 1);
          setSelectedDate(d);
        }
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setProResponse({ key: proKey, status: 'error', data: null });
      });
    return () => { cancelled = true; };
  }, [identifier, isSlug, proKey]);

  // Semana de agendamentos: ocupados e bloqueios
  useEffect(() => {
    if (!proId) return undefined;
    let cancelled = false;
    fetch(`${API_URL}/appointments/professional/${proId}/week?start_date=${weekStartISO}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => { if (!cancelled) setApptResponse({ key: apptKey, items: Array.isArray(items) ? items : [] }); })
      .catch(() => { if (!cancelled) setApptResponse({ key: apptKey, items: [] }); });
    return () => { cancelled = true; };
  }, [proId, weekStartISO, apptKey]);

  // Avaliações (página 1 quando o perfil chega)
  const loadReviews = async (page) => {
    if (!proId) return;
    try {
      const res = await fetch(`${API_URL}/reviews/providers/${proId}/reviews?page=${page}&size=5`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.items || []);
        setReviewsPage(page);
        setReviewsPages(data.pages || 0);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!proId) return;
    let cancelled = false;
    fetch(`${API_URL}/reviews/providers/${proId}/reviews?page=1&size=5`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setReviews(data.items || []);
        setReviewsPage(1);
        setReviewsPages(data.pages || 0);
      })
      .catch((e) => console.error(e));
    return () => { cancelled = true; };
  }, [proId]);

  // Mesma cidade? Só com as duas cidades conhecidas
  const matching = pro?.city && clientCity ? norm(clientCity) === norm(pro.city) : null;

  const todayISO = formatDateToISO(new Date());
  const selectedISO = formatDateToISO(selectedDate);
  const worksOn = (date) => workingHours.some((w) => w.day_of_week === weekdayIndex(date));

  // Ocupado se algum agendamento/bloqueio do dia cruza o intervalo [início, fim)
  const overlaps = (dateISO, startMin, endMin) =>
    appointments.some((a) => {
      if (a.date !== dateISO) return false;
      const aStart = toMinutes(a.start_time);
      const aEnd = toMinutes(a.end_time);
      if (aStart === null || aEnd === null) return true;
      return aStart < endMin && startMin < aEnd;
    });

  const isDayAvailable = () => {
    if (selectedISO < todayISO) return false;
    if (!worksOn(selectedDate)) return false;
    // Diária: o dia inteiro precisa estar livre
    return !appointments.some((a) => a.date === selectedISO);
  };

  const getAvailableSlots = () => {
    const wh = workingHours.find((w) => w.day_of_week === weekdayIndex(selectedDate));
    if (!wh) return [];
    const start = parseInt(wh.start_time.split(':')[0]);
    const end = parseInt(wh.end_time.split(':')[0]);
    const currentHour = new Date().getHours();
    const slots = [];
    for (let h = start; h < end; h++) {
      const time = `${String(h).padStart(2, '0')}:00`;
      const isPast = selectedISO === todayISO && h <= currentHour;
      slots.push({ time, isOccupied: isPast || overlaps(selectedISO, h * 60, (h + 1) * 60) });
    }
    return slots;
  };

  const isDaily = selectedService?.duration_type === 'daily';

  const goBack = () => {
    // Quem chegou direto (Google, link compartilhado) volta para a busca, não para fora do site
    if (location.key !== 'default') navigate(-1);
    else navigate(pro?.category ? `/search?service=${encodeURIComponent(pro.category)}` : '/search');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!selectedService) {
      setBookError('Escolha o serviço.');
      document.querySelector(`input[name="${uid}-servico"]`)?.focus();
      return;
    }
    if (!selectedSlot) {
      setBookError(isDaily ? 'Marque o dia da diária.' : 'Escolha um horário livre.');
      return;
    }
    if (!clientCity || matching === false) return;

    setBooking(true);
    try {
      let requestBody;

      if (selectedService.duration_type === 'daily') {
        // Para serviços diários, enviar apenas a data
        // O backend irá buscar o horário de trabalho completo do dia
        requestBody = {
          professional_id: proId,
          service_id: selectedService.id,
          date: formatDateToISO(selectedDate)
        };
      } else {
        // Para serviços por hora, usar o slot selecionado
        requestBody = {
          professional_id: proId,
          service_id: selectedService.id,
          date: formatDateToISO(selectedDate),
          start_time: selectedSlot + ':00',
          end_time: (parseInt(selectedSlot.split(':')[0]) + 1).toString().padStart(2, '0') + ':00:00'
        };
      }

      const res = await fetch(`${API_URL}/appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        const appointmentData = await res.json();
        setSuccess({
          whatsappLink: appointmentData.whatsapp_link || '',
          service: selectedService.title,
          date: longDate(selectedDate),
          time: isDaily ? 'O dia todo' : selectedSlot,
        });
        window.scrollTo(0, 0);
      } else {
        const data = await res.json().catch(() => ({}));
        setBookError(translateError(data.detail, 'Não deu para agendar. Tente de novo.'));
        // Horário tomado ou fora da agenda: some com a escolha e recarrega a semana
        if (res.status === 400) {
          setSelectedSlot(null);
          setApptAttempt((n) => n + 1);
        }
      }
    } catch (err) {
      console.error(err);
      setBookError('Não deu para falar com o servidor. Confira sua conexão e tente de novo.');
    } finally {
      setBooking(false);
    }
  };

  const firstName = (pro?.name || '').trim().split(/\s+/)[0] || 'o profissional';
  const initial = (pro?.name || '?').trim().charAt(0).toUpperCase();
  const rating = Number(pro?.average_rating);
  const hasReviews = pro?.total_reviews > 0 && Number.isFinite(rating) && rating > 0;
  const proWhatsapp = buildWhatsappLink(pro?.whatsapp, pro?.name, selectedService?.title || pro?.category);

  /* ---------- Estados de página ---------- */

  if (proState !== 'ok' && !(proState === 'loading' && pro)) {
    const states = {
      loading: { title: 'Abrindo o perfil…', text: '' },
      notfound: { title: 'Não encontramos este perfil', text: 'O endereço pode ter mudado ou o profissional saiu do ContrataPro. Busque quem atende na sua região.' },
      error: { title: 'O perfil não carregou agora', text: 'Pode ser a sua conexão ou uma instabilidade do nosso lado. Tente de novo.' },
    }[proState];
    return (
      <TalaoPage>
        <SiteHeader />
        <main>
          <Perfil>
            <Wrap>
              <StateSheet role="status">
                <h1 data-display>{states.title}</h1>
                {states.text && <p>{states.text}</p>}
                {proState !== 'loading' && (
                  <StateActions>
                    {proState === 'error' && (
                      <PrimaryButton type="button" onClick={() => setProAttempt((n) => n + 1)}>
                        <RotateCw size={18} aria-hidden="true" /> Tentar de novo
                      </PrimaryButton>
                    )}
                    <StampLink to="/search">Buscar profissionais</StampLink>
                  </StateActions>
                )}
              </StateSheet>
            </Wrap>
          </Perfil>
        </main>
        <SiteFooter />
      </TalaoPage>
    );
  }

  if (success) {
    return (
      <TalaoPage>
        <SiteHeader />
        <main>
          <Via aria-labelledby={`${uid}-ok`}>
            <Wrap>
              <ViaSheet>
                <Canhoto aria-hidden="true" />
                <TalaoBody>
                  <TalaoHead>
                    <TalaoBrand>
                      <strong>CONTRATAPRO</strong>
                      <span>Via do cliente</span>
                    </TalaoBrand>
                    <Agendado>Agendado</Agendado>
                  </TalaoHead>
                  <h1 id={`${uid}-ok`} className="sr-only">Horário agendado</h1>
                  <ViaLines>
                    <div><dt>Com</dt><dd>{pro.name}</dd></div>
                    <div><dt>Serviço</dt><dd>{success.service}</dd></div>
                    <div><dt>Dia</dt><dd>{success.date}</dd></div>
                    <div><dt>Horário</dt><dd>{success.time}</dd></div>
                  </ViaLines>
                  <ViaText>
                    Você e {firstName} recebem um aviso por e-mail. O preço final depende do serviço feito:
                    combine o orçamento direto com {firstName}.
                  </ViaText>
                  <ViaActions>
                    {success.whatsappLink && (
                      <WhatsAppLink href={success.whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle size={20} aria-hidden="true" /> Avisar no WhatsApp
                      </WhatsAppLink>
                    )}
                    <StampLink to="/my-appointments">Ver meus agendamentos</StampLink>
                  </ViaActions>
                  <Perforation>
                    O pagamento é combinado entre você e {firstName}. O ContrataPro não cobra nada de quem contrata.
                  </Perforation>
                </TalaoBody>
              </ViaSheet>
            </Wrap>
          </Via>
        </main>
        <SiteFooter />
      </TalaoPage>
    );
  }

  /* ---------- Perfil + pedido ---------- */

  const slots = selectedService && !isDaily ? getAvailableSlots() : [];
  const canBook = isLoggedIn && !!clientCity && matching !== false;

  return (
    <TalaoPage>
      <SiteHeader />
      <main>
        <Perfil aria-labelledby={`${uid}-nome`}>
          <Wrap>
            <Back type="button" onClick={goBack}>
              <ArrowLeft size={18} aria-hidden="true" /> Voltar para a busca
            </Back>
            <PerfilGrid>
              <Foto>
                {pro.profile_picture ? <img src={pro.profile_picture} alt={`Foto de ${pro.name}`} /> : <span aria-hidden="true">{initial}</span>}
              </Foto>
              <div>
                <Display as="h1" id={`${uid}-nome`}>{pro.name}</Display>
                <Meta>
                  {pro.category && <span data-cat>{pro.category}</span>}
                  {pro.city && <span><MapPin size={16} aria-hidden="true" /> {pro.city}{pro.state ? `, ${pro.state}` : ''}</span>}
                  {hasReviews ? (
                    <span>
                      <Star size={16} fill="var(--grafica)" color="var(--grafica)" aria-hidden="true" />
                      <strong>{rating.toFixed(1).replace('.', ',')}</strong>
                      · {pro.total_reviews} {pro.total_reviews === 1 ? 'avaliação' : 'avaliações'}
                    </span>
                  ) : (
                    <span>Ainda sem avaliações</span>
                  )}
                  {pro.subscription_plan?.badge_label && <Stamp>{pro.subscription_plan.badge_label}</Stamp>}
                </Meta>
                {pro.description && <Description>{pro.description}</Description>}
                {proWhatsapp && (
                  <ContactRow>
                    <WhatsAppLink data-stamp href={proWhatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={18} aria-hidden="true" /> Tirar dúvida no WhatsApp
                    </WhatsAppLink>
                  </ContactRow>
                )}
              </div>
            </PerfilGrid>
          </Wrap>
        </Perfil>
        <Seam $from="amarela" $to="papel" aria-hidden="true" />

        <Pedido aria-labelledby={`${uid}-pedido`}>
          <Wrap>
            <PedidoSheet as="form" onSubmit={handleBook} noValidate>
              <Canhoto aria-hidden="true" />
              <TalaoBody>
                <TalaoHead>
                  <TalaoBrand>
                    <strong>CONTRATAPRO</strong>
                    <span id={`${uid}-pedido`}>Pedido de agendamento</span>
                  </TalaoBrand>
                  <Com>com {pro.name}</Com>
                </TalaoHead>

                {proState === 'loading' ? (
                  <Line as="div"><Muted role="status">Carregando os serviços e a agenda…</Muted></Line>
                ) : services.length === 0 ? (
                  <Line as="div">
                    <Muted>
                      {firstName} ainda não cadastrou serviços para agendar.
                      {proWhatsapp ? ' Dá para combinar direto pelo WhatsApp.' : ''}
                    </Muted>
                  </Line>
                ) : (
                  <>
                    <Line>
                      <legend>Serviço</legend>
                      <Services>
                        {services.map((s, i) => {
                          const on = selectedService?.id === s.id;
                          return (
                            <ServiceOption key={s.id} $on={on} $first={i === 0}>
                              <input
                                type="radio"
                                name={`${uid}-servico`}
                                value={s.id}
                                checked={on}
                                onChange={() => { setSelectedService(s); setSelectedSlot(null); setBookError(''); }}
                              />
                              <PrintedCircle>{on && <HandCross />}</PrintedCircle>
                              <span>{s.title}</span>
                              <strong>
                                {Number(s.price) > 0 ? formatPrice(s.price) : 'A combinar'}
                                <small>{Number(s.price) > 0 ? (s.duration_type === 'daily' ? ' /dia' : ' /hora') : ''}</small>
                              </strong>
                            </ServiceOption>
                          );
                        })}
                      </Services>
                    </Line>

                    <Line as="div">
                      <h2 data-display>Dia e horário</h2>
                      <When>
                        <CalendarWrap>
                          <Calendar
                            onChange={(date) => { setSelectedDate(date); setSelectedSlot(null); setBookError(''); }}
                            value={selectedDate}
                            minDate={new Date()}
                            tileDisabled={({ date, view }) => view === 'month' && (formatDateToISO(date) < todayISO || !worksOn(date))}
                            locale="pt-BR"
                            formatShortWeekday={(locale, date) => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()]}
                            formatMonthYear={(locale, date) => {
                              const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                              return `${months[date.getMonth()]} ${date.getFullYear()}`;
                            }}
                            prev2Label={null}
                            next2Label={null}
                          />
                        </CalendarWrap>

                        <div aria-live="polite">
                          <DayTitle>{longDate(selectedDate)}</DayTitle>
                          {!selectedService ? (
                            <Muted>Escolha o serviço para ver os horários livres.</Muted>
                          ) : !apptsReady ? (
                            <Muted role="status">Conferindo a agenda deste dia…</Muted>
                          ) : isDaily ? (
                            isDayAvailable() ? (
                              <DailyPick>
                                <input
                                  type="checkbox"
                                  checked={selectedSlot === 'daily'}
                                  onChange={(e) => { setSelectedSlot(e.target.checked ? 'daily' : null); setBookError(''); }}
                                />
                                <PrintedCircle>{selectedSlot === 'daily' && <HandCross />}</PrintedCircle>
                                <span>Quero a diária neste dia (ocupa o dia de trabalho inteiro de {firstName})</span>
                              </DailyPick>
                            ) : (
                              <Muted>Este dia já está ocupado ou {firstName} não atende nele. Escolha outro dia no calendário.</Muted>
                            )
                          ) : slots.length === 0 ? (
                            <Muted>{firstName} não atende neste dia. Escolha outro no calendário.</Muted>
                          ) : slots.every((s) => s.isOccupied) ? (
                            <Muted>Nenhum horário livre neste dia. Escolha outro no calendário.</Muted>
                          ) : (
                            <Slots role="group" aria-label="Horários">
                              {slots.map((slot) => (
                                <Slot
                                  key={slot.time}
                                  type="button"
                                  $on={selectedSlot === slot.time}
                                  aria-pressed={selectedSlot === slot.time}
                                  disabled={slot.isOccupied}
                                  aria-label={slot.isOccupied ? `${slot.time}, ocupado` : slot.time}
                                  onClick={() => { setSelectedSlot(slot.time); setBookError(''); }}
                                >
                                  {slot.time}
                                </Slot>
                              ))}
                            </Slots>
                          )}
                        </div>
                      </When>
                    </Line>

                    {isLoggedIn && clientChecked && !clientCity && (
                      <Notice>
                        <AlertCircle size={20} aria-hidden="true" />
                        <span>Falta o seu endereço no cadastro para agendar. Complete em <Link to="/my-appointments">Minha conta</Link> e volte aqui.</span>
                      </Notice>
                    )}
                    {matching === false && (
                      <Notice>
                        <AlertCircle size={20} aria-hidden="true" />
                        <span>{firstName} atende só em {pro.city}{pro.state ? `, ${pro.state}` : ''}. Seu cadastro diz {clientCity}, então não dá para agendar por aqui.</span>
                      </Notice>
                    )}
                    {matching === true && (
                      <Notice $tone="ok">
                        <Check size={20} aria-hidden="true" />
                        <span>Atende em {pro.city}, a sua cidade.</span>
                      </Notice>
                    )}

                    <Resumo aria-live="polite">
                      {selectedService && selectedSlot ? (
                        <>Seu pedido: <Hand>{selectedService.title}, {longDate(selectedDate)}{isDaily ? ', o dia todo' : `, às ${selectedSlot}`}</Hand></>
                      ) : (
                        'Escolha o serviço, o dia e o horário.'
                      )}
                    </Resumo>

                    {bookError && <FieldNote role="alert" $tone="erro">{bookError}</FieldNote>}

                    <SubmitRow>
                      {isLoggedIn ? (
                        <PrimaryButton type="submit" disabled={booking || !canBook}>
                          {booking ? 'Agendando…' : <>Agendar <ArrowRight size={20} aria-hidden="true" /></>}
                        </PrimaryButton>
                      ) : (
                        <PrimaryButton type="submit">
                          Entrar para agendar <ArrowRight size={20} aria-hidden="true" />
                        </PrimaryButton>
                      )}
                    </SubmitRow>
                    {!isLoggedIn && (
                      <Signup>
                        Ainda não tem conta?{' '}
                        <Link to="/register-client" state={{ from: location.pathname }}>Criar conta grátis</Link>
                      </Signup>
                    )}
                  </>
                )}

                <Perforation>
                  Agendar não cobra nada. O preço final e o pagamento você combina direto com {firstName}.
                </Perforation>
              </TalaoBody>
            </PedidoSheet>
          </Wrap>
        </Pedido>

        <Seam $from="papel" $to="rosa" aria-hidden="true" />
        <Mesa aria-labelledby={`${uid}-avaliacoes`}>
          <Wrap>
            <Display id={`${uid}-avaliacoes`}>O que dizem os clientes</Display>
            {reviews.length > 0 ? (
              <>
                <Reviews>
                  {reviews.map((review, idx) => (
                    <ReviewItem key={`${reviewsPage}-${idx}`}>
                      <header>
                        <strong>{review.customer_name}</strong>
                        <Stars aria-label={`${review.rating} de 5 estrelas`}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'transparent'} aria-hidden="true" />
                          ))}
                        </Stars>
                      </header>
                      {review.comment && <p>{review.comment}</p>}
                      <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('pt-BR')}</time>
                    </ReviewItem>
                  ))}
                </Reviews>
                {reviewsPages > 1 && (
                  <Pager>
                    <PagerButton type="button" onClick={() => loadReviews(reviewsPage - 1)} disabled={reviewsPage <= 1}>Anteriores</PagerButton>
                    <span>{reviewsPage} de {reviewsPages}</span>
                    <PagerButton type="button" onClick={() => loadReviews(reviewsPage + 1)} disabled={reviewsPage >= reviewsPages}>Próximas</PagerButton>
                  </Pager>
                )}
              </>
            ) : (
              <Lead>Ainda sem avaliações. Só quem agenda pelo ContrataPro pode avaliar, depois do serviço feito.</Lead>
            )}
            <TrustNote />
          </Wrap>
        </Mesa>
        <Seam $from="rosa" $to="papel" aria-hidden="true" />
      </main>
      <SiteFooter />
    </TalaoPage>
  );
}
