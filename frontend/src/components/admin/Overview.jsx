import { useState } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { PrimaryButton } from '../talao';
import { Panel, Notice } from '../dashboard/parts';
import { parseLocalDate } from '../dashboard/utils';
import {
  useAdminResource, adminStatus, StatusWord, TableScroll, Table, Figures, SectionTitle, Muted, money, createdDay,
} from './adminParts';

/* Visão geral do admin: números em listas pautadas. A receita é a soma das
   assinaturas pagas ativas que vão renovar (o Free é visível sem pagar). */

export default function Overview() {
  const [attempt, setAttempt] = useState(0);
  const { status, data } = useAdminResource('/admin/dashboard', attempt);

  if (status === 'loading') return <Muted role="status">Carregando os números…</Muted>;
  if (status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p><AlertCircle size={18} aria-hidden="true" /><span>Não deu para carregar os números agora.</span></p>
        <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}><RotateCw size={18} aria-hidden="true" /> Tentar de novo</PrimaryButton>
      </Notice>
    );
  }

  const { summary, revenue, last_appointment: last } = data;
  const byState = data.professionals_by_state || [];
  const activeByState = Object.fromEntries((data.active_professionals_by_state || []).map((s) => [s.state, s.count]));

  return (
    <>
      <Panel aria-labelledby="adm-plataforma">
        <SectionTitle id="adm-plataforma">Plataforma</SectionTitle>
        <Figures>
          <div><dt>Profissionais cadastrados</dt><dd>{summary.total_professionals}</dd></div>
          <div><dt>Visíveis na busca<small>Free e assinantes ativos</small></dt><dd>{summary.active_professionals}</dd></div>
          <div><dt>Clientes cadastrados</dt><dd>{summary.total_clients}</dd></div>
          <div><dt>Agendamentos no mês</dt><dd>{summary.appointments_this_month}</dd></div>
          <div>
            <dt>Último agendamento feito<small>{last?.start_time ? `às ${last.start_time}` : 'nenhum ainda'}</small></dt>
            <dd>{last?.date ? parseLocalDate(last.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}</dd>
          </div>
        </Figures>
      </Panel>

      <Panel aria-labelledby="adm-receita" style={{ marginTop: '1.5rem' }}>
        <SectionTitle id="adm-receita">Receita</SectionTitle>
        <Figures>
          <div><dt>Receita mensal recorrente<small>Assinaturas pagas ativas que vão renovar</small></dt><dd>{money(revenue.monthly)}</dd></div>
          <div><dt>Projeção anual<small>Se nada mudar</small></dt><dd>{money(revenue.annual_projected)}</dd></div>
          <div><dt>Assinantes pagantes</dt><dd>{revenue.paying_subscribers ?? '—'}</dd></div>
          <div><dt>Novas assinaturas no mês</dt><dd>{summary.new_subscribers_this_month}</dd></div>
          <div><dt>Cancelamentos no mês</dt><dd>{summary.cancellations_this_month}</dd></div>
        </Figures>
      </Panel>

      <Panel aria-labelledby="adm-situacao" style={{ marginTop: '1.5rem' }}>
        <SectionTitle id="adm-situacao">Situação dos profissionais</SectionTitle>
        <Figures>
          <div><dt><StatusWord $color="var(--sucesso)">Ativos</StatusWord></dt><dd>{summary.active_professionals}</dd></div>
          <div><dt><StatusWord $color="var(--texto-2-papel)">Inativos</StatusWord></dt><dd>{summary.inactive_professionals}</dd></div>
          <div><dt><StatusWord $color="var(--erro)">Cancelados</StatusWord></dt><dd>{summary.cancelled_professionals}</dd></div>
          <div><dt><StatusWord $color="var(--alerta)">Suspensos</StatusWord></dt><dd>{summary.suspended_professionals}</dd></div>
        </Figures>
      </Panel>

      <Panel aria-labelledby="adm-estados" style={{ marginTop: '1.5rem' }}>
        <SectionTitle id="adm-estados">Profissionais por estado</SectionTitle>
        {byState.length === 0 ? <Muted>Nenhum profissional com estado informado.</Muted> : (
          <TableScroll tabIndex={0} aria-label="Profissionais por estado">
            <Table $min="18rem">
              <thead><tr><th scope="col">UF</th><th scope="col">Cadastrados</th><th scope="col">Ativos</th></tr></thead>
              <tbody>
                {byState.map((s) => (
                  <tr key={s.state}><td><b>{s.state}</b></td><td>{s.count}</td><td>{activeByState[s.state] || 0}</td></tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </Panel>

      <Panel aria-labelledby="adm-recentes" style={{ marginTop: '1.5rem' }}>
        <SectionTitle id="adm-recentes">Cadastros recentes</SectionTitle>
        <TableScroll tabIndex={0} aria-label="Profissionais cadastrados recentemente">
          <Table $min="44rem">
            <thead>
              <tr><th scope="col">Profissional</th><th scope="col">Categoria</th><th scope="col">Cidade</th><th scope="col">Situação</th><th scope="col">Cadastro</th></tr>
            </thead>
            <tbody>
              {(data.recent_professionals || []).map((p) => {
                const st = adminStatus(p.subscription_status);
                return (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><small>{p.email}</small></td>
                    <td>{p.category || '—'}</td>
                    <td>{[p.city, p.state].filter(Boolean).join('/') || '—'}</td>
                    <td><StatusWord $color={st.color}>{st.label}</StatusWord></td>
                    <td>{createdDay(p.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableScroll>
      </Panel>
    </>
  );
}
