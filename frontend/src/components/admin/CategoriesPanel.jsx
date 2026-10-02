import { useState, useId } from 'react';
import styled from 'styled-components';
import { AlertCircle, RotateCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { PrimaryButton, StampButton, FieldLabel, TextInput, FieldNote } from '../talao';
import { Panel, Notice, IconButton } from '../dashboard/parts';
import { translateError } from '../apiErrors';
import AdminDialog, { DialogText, DialogActions } from './AdminDialog';
import { useAdminResource, authHeaders, TableMeta, SectionTitle, Muted } from './adminParts';

/* Categorias de serviço agrupadas. Criar e editar no mesmo <dialog>;
   excluir pede confirmação (o backend recusa categoria em uso). */

const NEW_GROUP = '__novo__';
const EMPTY = { name: '', slug: '', group: '', image_url: '' };

const slugify = (name) => name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const Group = styled.section`
  & + & {
    margin-top: 1.75rem;
  }
`;

const List = styled.ul`
  list-style: none;
  border-top: 2px solid var(--grafica);

  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 56px;
    padding: 0.35rem 0.25rem;
    border-bottom: 1.5px solid var(--pauta);
  }

  li > span {
    flex: 1;
    min-width: 0;
  }

  b {
    display: block;
    font-weight: 600;
  }

  small {
    display: block;
    font-size: 0.9rem;
    color: var(--texto-2-papel);
    font-family: ui-monospace, monospace;
    overflow-wrap: anywhere;
  }
`;

const Field = styled.div`
  & + & {
    margin-top: 1rem;
  }
`;

export default function CategoriesPanel() {
  const uid = useId();
  const [attempt, setAttempt] = useState(0);
  const { status, data } = useAdminResource('/admin/categories', attempt);
  const [editing, setEditing] = useState(null); // null fechado | {} nova | categoria
  const [form, setForm] = useState(EMPTY);
  const [newGroup, setNewGroup] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') return <Muted role="status">Carregando as categorias…</Muted>;
  if (status === 'error') {
    return (
      <Notice $tone="erro" role="alert">
        <p><AlertCircle size={18} aria-hidden="true" /><span>Não deu para carregar as categorias agora.</span></p>
        <PrimaryButton type="button" onClick={() => setAttempt((n) => n + 1)}><RotateCw size={18} aria-hidden="true" /> Tentar de novo</PrimaryButton>
      </Notice>
    );
  }

  const grouped = data.grouped || {};
  const groups = data.groups || Object.keys(grouped);
  const total = (data.categories || []).length;
  const isEdit = editing && editing.id;

  const openForm = (cat = null) => {
    setError('');
    setNewGroup(false);
    setForm(cat ? { name: cat.name, slug: cat.slug, group: cat.group, image_url: cat.image_url || '' } : EMPTY);
    setEditing(cat || {});
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.group.trim()) {
      setError('Preencha nome, identificador e grupo.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(isEdit ? `${API_URL}/admin/categories/${editing.id}` : `${API_URL}/admin/categories`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: form.name.trim(), slug: form.slug.trim(), group: form.group.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(translateError(body.detail, 'Não deu para salvar a categoria.'));
        return;
      }
      toast.success(isEdit ? 'Categoria atualizada.' : 'Categoria criada.');
      setEditing(null);
      setAttempt((n) => n + 1);
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/categories/${removing.id}`, { method: 'DELETE', headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(translateError(body.detail, 'Não deu para excluir a categoria.'));
        return;
      }
      toast.success('Categoria excluída.');
      setRemoving(null);
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
        <p>{total} categorias em {Object.keys(grouped).length} grupos</p>
        <PrimaryButton type="button" onClick={() => openForm()}><Plus size={18} aria-hidden="true" /> Nova categoria</PrimaryButton>
      </TableMeta>

      {total === 0 ? <Muted>Nenhuma categoria ainda. Crie a primeira em “Nova categoria”.</Muted> : (
        Object.entries(grouped).map(([group, cats]) => (
          <Group key={group} aria-labelledby={`${uid}-${slugify(group)}`}>
            <SectionTitle id={`${uid}-${slugify(group)}`}>{group} <small style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--texto-2-papel)' }}>({cats.length})</small></SectionTitle>
            <List>
              {cats.map((cat) => (
                <li key={cat.id}>
                  <span><b>{cat.name}</b><small>{cat.slug}</small></span>
                  <IconButton type="button" aria-label={`Editar ${cat.name}`} onClick={() => openForm(cat)}><Pencil size={18} aria-hidden="true" /></IconButton>
                  <IconButton type="button" aria-label={`Excluir ${cat.name}`} onClick={() => { setError(''); setRemoving(cat); }}><Trash2 size={18} aria-hidden="true" /></IconButton>
                </li>
              ))}
            </List>
          </Group>
        ))
      )}

      <AdminDialog open={!!editing} busy={busy} title={isEdit ? 'Editar categoria' : 'Nova categoria'} onClose={() => setEditing(null)}>
        <form onSubmit={save} noValidate>
          <Field>
            <FieldLabel htmlFor={`${uid}-nome`}>Nome</FieldLabel>
            <TextInput
              id={`${uid}-nome`}
              value={form.name}
              placeholder="ex.: Eletricista"
              onChange={(e) => { const name = e.target.value; setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) })); }}
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${uid}-slug`}>Identificador</FieldLabel>
            <TextInput id={`${uid}-slug`} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} aria-describedby={`${uid}-slug-nota`} />
            <FieldNote id={`${uid}-slug-nota`}>Vai no endereço da categoria. {isEdit ? 'Mudar quebra os links já divulgados.' : 'Sai do nome; mude só se precisar.'}</FieldNote>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${uid}-grupo`}>Grupo</FieldLabel>
            {newGroup ? (
              <>
                <TextInput id={`${uid}-grupo`} value={form.group} placeholder="Nome do novo grupo" onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))} />
                <FieldNote><button type="button" onClick={() => { setNewGroup(false); setForm((f) => ({ ...f, group: '' })); }} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--grafica)', textDecoration: 'underline', cursor: 'pointer' }}>Escolher um grupo existente</button></FieldNote>
              </>
            ) : (
              <TextInput
                as="select"
                id={`${uid}-grupo`}
                value={form.group}
                onChange={(e) => {
                  if (e.target.value === NEW_GROUP) { setNewGroup(true); setForm((f) => ({ ...f, group: '' })); } else setForm((f) => ({ ...f, group: e.target.value }));
                }}
              >
                <option value="">Escolha…</option>
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
                <option value={NEW_GROUP}>+ Criar um grupo novo</option>
              </TextInput>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor={`${uid}-img`}>Imagem (endereço, opcional)</FieldLabel>
            <TextInput id={`${uid}-img`} type="url" value={form.image_url} placeholder="https://…" onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
          </Field>
          {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}
          <DialogActions>
            <StampButton type="button" onClick={() => setEditing(null)} disabled={busy}>Voltar</StampButton>
            <PrimaryButton type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</PrimaryButton>
          </DialogActions>
        </form>
      </AdminDialog>

      <AdminDialog open={!!removing} danger busy={busy} title={`Excluir ${removing?.name}?`} onClose={() => setRemoving(null)}>
        <DialogText>A categoria some da busca e dos cadastros. Se algum profissional ainda usar esta categoria, a exclusão é recusada.</DialogText>
        {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}
        <DialogActions>
          <StampButton type="button" onClick={() => setRemoving(null)} disabled={busy}>Voltar</StampButton>
          <PrimaryButton type="button" onClick={remove} disabled={busy}>{busy ? 'Excluindo…' : 'Excluir'}</PrimaryButton>
        </DialogActions>
      </AdminDialog>
    </Panel>
  );
}
