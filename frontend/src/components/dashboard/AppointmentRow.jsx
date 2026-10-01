import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronRight } from 'lucide-react';
import { statusOf, parseLocalDate } from './utils';

/* Linha de agendamento no registro contido: dia impresso à esquerda,
   serviço e a outra pessoa no meio, situação em palavra e cor.
   Usada em Meus agendamentos e no Histórico. */

export const AppointmentGroup = styled.section`
  & + & {
    margin-top: 2rem;
  }

  > h2 {
    padding-bottom: 0.4rem;
    border-bottom: 2px solid var(--grafica);
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.35rem;
  }
`;

const Item = styled(Link)`
  display: grid;
  grid-template-columns: 4.25rem minmax(0, 1fr) auto;
  gap: 0.25rem 1rem;
  align-items: center;
  min-height: 76px;
  padding: 0.75rem 0.25rem;
  border-bottom: 1.5px solid var(--pauta);
  color: var(--nanquim);
  text-decoration: none;

  &:hover strong {
    color: var(--grafica);
  }

  > svg {
    color: var(--texto-2-papel);
  }
`;

const Day = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--f-impresso);
  line-height: 1;
  color: ${({ $muted }) => ($muted ? 'var(--texto-2-papel)' : 'var(--grafica-escura)')};

  b {
    font-weight: 800;
    font-size: 1.9rem;
    font-variant-numeric: tabular-nums;
  }

  small {
    margin-top: 0.15rem;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

const Info = styled.span`
  min-width: 0;

  strong {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.25rem;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  span {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.95rem;
    color: var(--texto-2-papel);
  }
`;

const Status = styled.b`
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

export default function AppointmentRow({ appt, person }) {
  const date = parseLocalDate(appt.date);
  const status = statusOf(appt.status);
  // Ano só aparece quando não é o corrente (o histórico atravessa anos)
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const when = date.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }),
  });
  return (
    <Item to={`/appointment/${appt.id}`}>
      <Day $muted={appt.status !== 'scheduled'} aria-hidden="true">
        <b>{String(date.getDate()).padStart(2, '0')}</b>
        <small>{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small>
      </Day>
      <Info>
        <strong>{appt.service_title || 'Serviço'}</strong>
        <span>
          {when}, às {appt.start_time.slice(0, 5)}
          {person ? ` · ${person}` : ''}
        </span>
        <span><Status $color={status.color}>{status.label}</Status></span>
      </Info>
      <ChevronRight size={20} aria-hidden="true" />
    </Item>
  );
}
