import { useState, useId } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { PrimaryButton, FieldLabel, TextInput } from '../talao';
import { Panel, Notice } from '../dashboard/parts';
import { parseLocalDate } from '../dashboard/utils';
import {
  useAdminResource, ADMIN_STATUS, adminStatus, StatusWord, TableScroll, Table, TableMeta, Muted, money, createdDay,
} from './adminParts';

/* Assinaturas pagas (a linha "free" do upgrade pendente não vem do backend). */

export default function SubscriptionsPanel() {
  const uid = useId();
  const [attempt, setAttempt] = useState(0);
  const { status, data } = useAdminResource('/admin/subscriptions', attempt);
  const [filter, setFilter] = useState('');

  if (status === 'loading') return <Muted role="status">Carregando as assinaturas…</Muted>;
  if (status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p><AlertCircle size={18} aria-hidden="true" /><span>Não deu para carregar as assinaturas agora.</span></p>
        <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}><RotateCw size={18} aria-hidden="true" /> Tentar de novo</PrimaryButton>
      </Notice>
    );
  }

  const all = data.subscriptions || [];
  const list = all.filter((s) => !filter || s.status === filter);

  return (
    <Panel>
      <TableMeta>
        <div style={{ minWidth: '11rem' }}>
          <FieldLabel htmlFor={`${uid}-situacao`}>Situação</FieldLabel>
          <TextInput as="select" id={`${uid}-situacao`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todas</option>
            {['active', 'pending', 'cancelled', 'suspended', 'paused', 'expired'].map((s) => <option key={s} value={s}>{ADMIN_STATUS[s].label}</option>)}
          </TextInput>
        </div>
        <p aria-live="polite">{list.length} de {all.length} assinaturas</p>
      </TableMeta>

      {list.length === 0 ? <Muted>Nenhuma assinatura com essa situação.</Muted> : (
        <TableScroll tabIndex={0} aria-label="Assinaturas">
          <Table $min="50rem">
            <thead>
              <tr>
                <th scope="col">Profissional</th><th scope="col">Cidade</th><th scope="col">Valor</th>
                <th scope="col">Situação</th><th scope="col">Próxima cobrança</th><th scope="col">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const st = adminStatus(s.status);
                return (
                  <tr key={s.id}>
                    <td><b>{s.professional_name || '—'}</b><small>{s.professional_email || ''}{s.professional_category ? ` · ${s.professional_category}` : ''}</small></td>
                    <td>{[s.professional_city, s.professional_state].filter(Boolean).join('/') || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{money(s.plan_amount)}</td>
                    <td><StatusWord $color={st.color}>{st.label}</StatusWord></td>
                    <td>{s.next_billing_date ? parseLocalDate(s.next_billing_date.slice(0, 10)).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>{createdDay(s.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </Panel>
  );
}
