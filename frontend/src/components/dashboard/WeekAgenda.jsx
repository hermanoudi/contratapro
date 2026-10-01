import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Ban, X, Clock } from 'lucide-react';
import { PrimaryButton } from '../talao';
import { Notice, IconButton } from './parts';
import { localISO, backendDay, toMinutes, formatPhone, OCCUPYING } from './utils';

/* Agenda da semana do profissional: a grade no desktop, a lista por dia no celular.
   Cada célula diz o que é em texto (Livre, Agendado, Bloqueado): a cor nunca é o único sinal. */

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAYS_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const Nav = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const WeekSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 18rem;
  min-width: 0;

  p {
    flex: 1;
    min-width: 0;
    text-align: center;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }
`;

const BlockButton = styled(PrimaryButton)`
  flex: none;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Legend = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--texto-2-papel);

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
`;

const Swatch = styled.span`
  width: 1rem;
  height: 1rem;
  border: 1.5px solid var(--controle);
  background: ${({ $kind }) => swatchBg($kind)};
`;

const swatchBg = (kind) => {
  if (kind === 'occupied') return 'rgba(207, 224, 245, 0.75)';
  if (kind === 'blocked') return 'repeating-linear-gradient(135deg, var(--papel-2) 0 5px, rgba(23, 23, 27, 0.18) 5px 6px)';
  return 'var(--papel)';
};

/* ---------- Grade (desktop) ---------- */

const Grid = styled.div`
  display: none;

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: 4.5rem repeat(7, minmax(0, 1fr));
    border: 1.5px solid var(--regua);
    border-top: 2px solid var(--grafica);
  }
`;

const Head = styled.div`
  padding: 0.6rem 0.25rem;
  text-align: center;
  border-bottom: 1.5px solid var(--regua);
  border-left: 1px solid var(--regua);
  background: var(--papel);
  opacity: ${({ $off }) => ($off ? 0.45 : 1)};

  strong {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--grafica-escura);
  }

  span {
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
    color: var(--texto-2-papel);
  }

  /* Hoje: sublinhado amarelo, como o dia marcado no calendário de parede */
  ${({ $today }) => ($today ? 'box-shadow: inset 0 -3px 0 var(--amarela);' : '')}
`;

const HourLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  border-bottom: 1px solid var(--regua);
  font-family: var(--f-impresso);
  font-weight: 600;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  color: var(--texto-2-papel);
`;

const cellBase = `
  min-height: 56px;
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid var(--regua);
  border-left: 1px solid var(--regua);
  font-size: 0.9rem;
  line-height: 1.25;
  text-align: left;
  min-width: 0;
`;

const Cell = styled.div`
  ${cellBase}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  background: ${({ $kind }) => (swatchBg($kind === 'empty' ? 'none' : $kind))};
  color: var(--texto-2-papel);
  ${({ $kind }) => ($kind === 'empty' ? 'background: var(--papel-2);' : '')}
`;

// Horário agendado: botão que abre o agendamento
const BookedCell = styled.button`
  ${cellBase}
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: none;
  border-right: none;
  background: ${swatchBg('occupied')};
  cursor: pointer;
  font-family: var(--f-texto);
  color: var(--nanquim);
  overflow: hidden;

  strong {
    font-weight: 600;
    color: var(--carbono);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  span {
    font-size: 0.85rem;
    color: var(--texto-2-papel);
    font-variant-numeric: tabular-nums;
  }

  &:hover {
    box-shadow: inset 0 -2.5px 0 var(--carbono);
  }

  &:focus-visible {
    outline: 2px solid var(--carbono);
    outline-offset: -2px;
  }
`;

const SmallRemove = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 28px;
  height: 28px;
  background: var(--papel);
  border: 1px solid var(--controle);
  border-radius: 2px;
  color: var(--nanquim);
  cursor: pointer;

  &:hover {
    border-color: var(--grafica);
    color: var(--grafica);
  }
`;

/* ---------- Lista por dia (celular) ---------- */

const List = styled.div`
  @media (min-width: 769px) {
    display: none;
  }
`;

const Day = styled.section`
  & + & {
    margin-top: 1.25rem;
  }

  h3 {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 0.4rem;
    margin-bottom: 0.25rem;
    border-bottom: 2px solid var(--grafica);
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.25rem;

    span {
      font-family: var(--f-texto);
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--texto-2-papel);
      font-variant-numeric: tabular-nums;
    }
  }

  ${({ $today }) => ($today ? 'h3 { box-shadow: inset 0 -3px 0 var(--amarela); }' : '')}
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 52px;
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid var(--regua);
  background: ${({ $kind }) => swatchBg($kind)};

  > b {
    flex: none;
    width: 3.25rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
  }

  > span {
    flex: 1;
    min-width: 0;
    color: var(--texto-2-papel);
  }
`;

const RowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 52px;
  padding: 0.35rem 0.5rem;
  border: none;
  border-bottom: 1px solid var(--regua);
  background: ${swatchBg('occupied')};
  font-family: var(--f-texto);
  text-align: left;
  cursor: pointer;

  > b {
    flex: none;
    width: 3.25rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
    color: var(--nanquim);
  }

  > span {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    strong {
      font-weight: 600;
      color: var(--carbono);
    }

    small {
      font-size: 0.9rem;
      color: var(--texto-2-papel);
    }
  }
`;

const Loading = styled.p`
  padding: 1rem 0;
  color: var(--texto-2-papel);
`;

/* ---------- Regras ---------- */

const hoursForDay = (workingHours, date) => {
  const set = new Set();
  workingHours
    .filter((wh) => wh.day_of_week === backendDay(date))
    .forEach((wh) => {
      const start = parseInt(wh.start_time.split(':')[0]);
      const end = parseInt(wh.end_time.split(':')[0]);
      for (let h = start; h < end; h++) set.add(h);
    });
  return [...set].sort((a, b) => a - b);
};

// O que ocupa a hora: agendado e bloqueio têm prioridade sobre um já concluído
const slotFor = (appointments, dateISO, hour) => {
  const found = appointments.filter((a) => {
    if (a.date !== dateISO || (!OCCUPYING.includes(a.status) && !a.is_manual_block)) return false;
    const s = toMinutes(a.start_time);
    const e = toMinutes(a.end_time);
    if (s === null || e === null) return true;
    return s < (hour + 1) * 60 && hour * 60 < e;
  });
  const appt = found.find((a) => a.is_manual_block || a.status === 'blocked')
    || found.find((a) => a.status === 'scheduled')
    || found[0];
  if (!appt) return { kind: 'available', label: 'Livre' };
  if (appt.is_manual_block || appt.status === 'blocked') return { kind: 'blocked', label: 'Bloqueado', id: appt.id };
  return {
    kind: 'occupied',
    label: appt.client_name || 'Agendado',
    phone: appt.client_whatsapp,
    done: appt.status === 'completed',
    id: appt.id,
  };
};

export default function WeekAgenda({
  weekOffset,
  onWeekChange,
  weekDates,
  workingHours,
  appointments,
  ready,
  onBlockClick,
  onRemoveBlock,
  onOpenAppointment,
}) {
  const todayISO = localISO(new Date());
  const start = weekDates[0];
  const end = weekDates[6];
  const range = `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  const weekLabel = weekOffset === 0 ? `Esta semana · ${range}` : weekOffset === 1 ? `Próxima semana · ${range}` : range;

  const perDay = weekDates.map((date) => hoursForDay(workingHours, date));
  const allHours = [...new Set(perDay.flat())].sort((a, b) => a - b);
  const time = (h) => `${String(h).padStart(2, '0')}:00`;

  return (
    <div>
      <Nav data-tour="calendar-navigation">
        <WeekSwitch>
          <IconButton type="button" onClick={() => onWeekChange(weekOffset - 1)} disabled={weekOffset === 0} aria-label="Semana anterior">
            <ChevronLeft size={20} aria-hidden="true" />
          </IconButton>
          <p aria-live="polite">{weekLabel}</p>
          <IconButton type="button" onClick={() => onWeekChange(weekOffset + 1)} aria-label="Próxima semana">
            <ChevronRight size={20} aria-hidden="true" />
          </IconButton>
        </WeekSwitch>
        <BlockButton type="button" onClick={onBlockClick}>
          <Ban size={18} aria-hidden="true" /> Bloquear horário
        </BlockButton>
      </Nav>

      {workingHours.length === 0 ? (
        <Notice>
          <p>
            <Clock size={18} aria-hidden="true" />
            <span>
              Você ainda não marcou seus horários de atendimento. Sem eles, os clientes não conseguem agendar.{' '}
              <Link to="/dashboard?tab=schedule">Definir meus horários</Link>
            </span>
          </p>
        </Notice>
      ) : (
        <div data-tour="calendar-grid">
          <Legend aria-label="Legenda">
            <li><Swatch $kind="available" aria-hidden="true" /> Livre</li>
            <li><Swatch $kind="occupied" aria-hidden="true" /> Agendado</li>
            <li><Swatch $kind="blocked" aria-hidden="true" /> Bloqueado</li>
          </Legend>

          {!ready ? (
            <Loading role="status">Carregando a semana…</Loading>
          ) : (
            <>
              <Grid role="grid" aria-label={`Agenda: ${weekLabel}`}>
                <Head aria-hidden="true" />
                {weekDates.map((date, i) => (
                  <Head key={i} $off={perDay[i].length === 0} $today={localISO(date) === todayISO}>
                    <strong>{DAYS[date.getDay()]}</strong>
                    <span>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                  </Head>
                ))}
                {allHours.map((hour) => (
                  <div key={hour} style={{ display: 'contents' }}>
                    <HourLabel>{time(hour)}</HourLabel>
                    {weekDates.map((date, i) => {
                      if (!perDay[i].includes(hour)) return <Cell key={i} $kind="empty" aria-label="Sem atendimento" />;
                      const slot = slotFor(appointments, localISO(date), hour);
                      if (slot.kind === 'occupied') {
                        return (
                          <BookedCell
                            key={i}
                            type="button"
                            onClick={() => onOpenAppointment(slot.id)}
                            aria-label={`${DAYS_FULL[date.getDay()]} ${time(hour)}: ${slot.done ? 'atendido' : 'agendado'} com ${slot.label}. Abrir agendamento`}
                          >
                            <strong>{slot.label}</strong>
                            <span>{slot.done ? 'Atendido' : slot.phone ? formatPhone(slot.phone) : 'Agendado'}</span>
                          </BookedCell>
                        );
                      }
                      return (
                        <Cell key={i} $kind={slot.kind}>
                          <span>{slot.label}</span>
                          {slot.kind === 'blocked' && slot.id && (
                            <SmallRemove
                              type="button"
                              onClick={() => onRemoveBlock(slot.id)}
                              aria-label={`Remover bloqueio de ${DAYS_FULL[date.getDay()]} às ${time(hour)}`}
                            >
                              <X size={14} aria-hidden="true" />
                            </SmallRemove>
                          )}
                        </Cell>
                      );
                    })}
                  </div>
                ))}
              </Grid>

              <List>
                {weekDates.map((date, i) => {
                  if (perDay[i].length === 0) return null;
                  return (
                    <Day key={i} $today={localISO(date) === todayISO}>
                      <h3>
                        {DAYS_FULL[date.getDay()]}
                        <span>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      </h3>
                      {perDay[i].map((hour) => {
                        const slot = slotFor(appointments, localISO(date), hour);
                        if (slot.kind === 'occupied') {
                          return (
                            <RowButton key={hour} type="button" onClick={() => onOpenAppointment(slot.id)}>
                              <b>{time(hour)}</b>
                              <span>
                                <strong>{slot.label}</strong>
                                <small>{slot.done ? 'Atendido' : slot.phone ? formatPhone(slot.phone) : 'Agendado'}</small>
                              </span>
                              <ChevronRight size={18} aria-hidden="true" />
                            </RowButton>
                          );
                        }
                        return (
                          <Row key={hour} $kind={slot.kind}>
                            <b>{time(hour)}</b>
                            <span>{slot.label}</span>
                            {slot.kind === 'blocked' && slot.id && (
                              <IconButton type="button" onClick={() => onRemoveBlock(slot.id)} aria-label={`Remover bloqueio de ${DAYS_FULL[date.getDay()]} às ${time(hour)}`}>
                                <X size={18} aria-hidden="true" />
                              </IconButton>
                            )}
                          </Row>
                        );
                      })}
                    </Day>
                  );
                })}
              </List>
            </>
          )}
        </div>
      )}
    </div>
  );
}
