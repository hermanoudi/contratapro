import { useState } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { PrimaryButton } from '../talao';
import { Panel, Notice } from '../dashboard/parts';
import { useAdminResource, TableScroll, Table, TableMeta, Muted, createdDay } from './adminParts';

/* Clientes cadastrados (só leitura). */

export default function ClientsPanel() {
  const [attempt, setAttempt] = useState(0);
  const { status, data } = useAdminResource('/admin/clients', attempt);

  if (status === 'loading') return <Muted role="status">Carregando os clientes…</Muted>;
  if (status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p><AlertCircle size={18} aria-hidden="true" /><span>Não deu para carregar os clientes agora.</span></p>
        <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}><RotateCw size={18} aria-hidden="true" /> Tentar de novo</PrimaryButton>
      </Notice>
    );
  }

  const clients = data.clients || [];

  return (
    <Panel>
      <TableMeta><p>{clients.length} {clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}</p></TableMeta>
      {clients.length === 0 ? <Muted>Nenhum cliente cadastrado ainda.</Muted> : (
        <TableScroll tabIndex={0} aria-label="Clientes">
          <Table $min="34rem">
            <thead><tr><th scope="col">Cliente</th><th scope="col">Cidade</th><th scope="col">Cadastro</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b><small>{c.email}</small></td>
                  <td>{[c.city, c.state].filter(Boolean).join('/') || '—'}</td>
                  <td>{createdDay(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </Panel>
  );
}
