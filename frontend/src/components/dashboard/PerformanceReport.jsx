import styled from 'styled-components';
import { Panel } from './parts';

/* Resumo do mês (plano Premium): uma lista pautada, como o fechamento de um talão,
   no lugar de cartões com número grande e ícone. */

const Lines = styled.dl`
  display: grid;
  max-width: 40rem;

  div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    padding: 0.6rem 0;
    border-bottom: 1.5px solid var(--pauta);
  }

  dt {
    color: var(--texto-2-papel);
  }

  dd {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.3rem;
    font-variant-numeric: tabular-nums;
    text-align: right;
    overflow-wrap: anywhere;
  }
`;

export default function PerformanceReport({ stats }) {
  const month = new Date(stats.year, stats.month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const rating = stats.total_reviews > 0 ? `${String(stats.average_rating).replace('.', ',')} de 5` : '—';
  const rows = [
    ['Agendamentos no mês', stats.total_appointments_month],
    ['Concluídos', stats.completed_appointments_month],
    ['Taxa de conclusão', `${String(stats.completion_rate).replace('.', ',')}%`],
    ['Avaliação média', rating],
    ['Avaliações recebidas', stats.total_reviews],
    ['Serviço mais agendado', stats.top_service || '—'],
  ];

  return (
    <Panel aria-labelledby="resumo-mes" style={{ marginTop: '2rem' }}>
      <h2 id="resumo-mes">Resumo de {month}</h2>
      <Lines>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </Lines>
    </Panel>
  );
}
