import { useState, useId } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { PrimaryButton, StampButton, FieldLabel, TextInput, FieldNote } from '../talao';
import { Panel, Notice } from '../dashboard/parts';
import { formatPhone } from '../dashboard/utils';
import { translateError } from '../apiErrors';
import AdminDialog, { DialogText, DialogActions } from './AdminDialog';
import {
  useAdminResource, authHeaders, ADMIN_STATUS, adminStatus, StatusWord, TableScroll, Table, TableMeta, Muted,
} from './adminParts';

/* Profissionais: filtro por situação e UF; suspender e reativar pedem
   confirmação num <dialog> (antes era um clique sem volta). */

export default function ProfessionalsPanel() {
  const uid = useId();
  const [attempt, setAttempt] = useState(0);
  const { status, data } = useAdminResource('/admin/professionals', attempt);
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [action, setAction] = useState(null); // { kind: 'suspend'|'reactivate', prof }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <Muted role="status">Carregando os profissionais…</Muted>;
  if (status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p><AlertCircle size={18} aria-hidden="true" /><span>Não deu para carregar os profissionais agora.</span></p>
        <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}><RotateCw size={18} aria-hidden="true" /> Tentar de novo</PrimaryButton>
      </Notice>
    );
  }

  const all = data.professionals || [];
  const states = [...new Set(all.map((p) => p.state).filter(Boolean))].sort();
  const list = all.filter((p) => (!statusFilter || p.subscription_status === statusFilter) && (!stateFilter || p.state === stateFilter));

  const confirm = async () => {
    const { kind, prof } = action;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/professionals/${prof.id}/${kind}`, { method: 'POST', headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(translateError(body.detail, 'Não deu para concluir agora. Tente de novo.'));
        return;
      }
      toast.success(kind === 'suspend' ? `${prof.name} foi suspenso.` : `${prof.name} foi reativado.`);
      setAction(null);
      setAttempt((n) => n + 1);
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel>
      <TableMeta>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1rem' }}>
          <div style={{ minWidth: '11rem' }}>
            <FieldLabel htmlFor={`${uid}-situacao`}>Situação</FieldLabel>
            <TextInput as="select" id={`${uid}-situacao`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todas</option>
              {['active', 'pending', 'inactive', 'cancelled', 'suspended'].map((s) => <option key={s} value={s}>{ADMIN_STATUS[s].label}</option>)}
            </TextInput>
          </div>
          <div style={{ minWidth: '8rem' }}>
            <FieldLabel htmlFor={`${uid}-uf`}>UF</FieldLabel>
            <TextInput as="select" id={`${uid}-uf`} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              <option value="">Todas</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </TextInput>
          </div>
        </div>
        <p aria-live="polite">{list.length} de {all.length} profissionais</p>
      </TableMeta>

      {list.length === 0 ? <Muted>Nenhum profissional com esses filtros.</Muted> : (
        <TableScroll tabIndex={0} aria-label="Profissionais">
          <Table $min="52rem">
            <thead>
              <tr>
                <th scope="col">Profissional</th><th scope="col">Categoria</th><th scope="col">Cidade</th>
                <th scope="col">WhatsApp</th><th scope="col">Situação</th><th scope="col"><span className="sr-only">Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const st = adminStatus(p.subscription_status);
                return (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><small>{p.email}</small></td>
                    <td>{p.category || '—'}</td>
                    <td>{[p.city, p.state].filter(Boolean).join('/') || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{p.whatsapp ? formatPhone(p.whatsapp) : '—'}</td>
                    <td><StatusWord $color={st.color}>{st.label}</StatusWord></td>
                    <td>
                      <StampButton
                        type="button"
                        style={{ minHeight: 40, padding: '0 0.8rem', fontSize: '0.98rem' }}
                        onClick={() => { setError(''); setAction({ kind: p.is_suspended ? 'reactivate' : 'suspend', prof: p }); }}
                        aria-label={`${p.is_suspended ? 'Reativar' : 'Suspender'} ${p.name}`}
                      >
                        {p.is_suspended ? 'Reativar' : 'Suspender'}
                      </StampButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableScroll>
      )}

      <AdminDialog
        open={!!action}
        danger={action?.kind === 'suspend'}
        busy={busy}
        title={action?.kind === 'suspend' ? `Suspender ${action?.prof.name}?` : `Reativar ${action?.prof.name}?`}
        onClose={() => setAction(null)}
      >
        <DialogText>
          {action?.kind === 'suspend'
            ? 'O perfil sai da busca e não recebe agendamentos até ser reativado. Os agendamentos já marcados continuam.'
            : 'A suspensão sai e o perfil volta à situação da assinatura dele: aparece na busca se estiver no Free ou com o plano pago em dia; se cancelou ou não pagou, continua fora.'}
        </DialogText>
        {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}
        <DialogActions>
          <StampButton type="button" onClick={() => setAction(null)} disabled={busy}>Voltar</StampButton>
          <PrimaryButton type="button" onClick={confirm} disabled={busy}>
            {busy ? 'Enviando…' : action?.kind === 'suspend' ? 'Suspender' : 'Reativar'}
          </PrimaryButton>
        </DialogActions>
      </AdminDialog>
    </Panel>
  );
}
