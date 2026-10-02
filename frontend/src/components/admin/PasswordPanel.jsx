import { useState, useId } from 'react';
import { Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../config';
import { PrimaryButton, FieldLabel, InputBox, TextInput, FieldNote } from '../talao';
import { Panel } from '../dashboard/parts';
import PasswordInput from '../PasswordInput';
import { translateError } from '../apiErrors';
import { authHeaders } from './adminParts';

/* Troca da senha do admin (mesmo campo forte do cadastro e da nova senha). */

export default function PasswordPanel() {
  const id = useId();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [valid, setValid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const matches = confirm.length > 0 ? password === confirm : null;

  const save = async (e) => {
    e.preventDefault();
    if (!valid) {
      setError('A senha ainda não atende a todos os requisitos.');
      return;
    }
    if (password !== confirm) {
      setError('As duas senhas precisam ser iguais.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/change-password`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(translateError(body.detail, 'Não deu para trocar a senha agora.'));
        return;
      }
      toast.success('Senha trocada. Use a nova no próximo acesso.');
      setPassword('');
      setConfirm('');
    } catch {
      setError('Não deu para falar com o servidor. Confira sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel as="form" onSubmit={save} noValidate style={{ maxWidth: '34rem' }} aria-label="Trocar a senha">
      <div>
        <FieldLabel htmlFor={`${id}-senha`}>Nova senha</FieldLabel>
        <PasswordInput
          id={`${id}-senha`}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Crie uma senha forte"
          showGenerateButton
          showTooltip
          onValidChange={setValid}
          required
        />
      </div>
      <div style={{ marginTop: '1.25rem' }}>
        <FieldLabel htmlFor={`${id}-confirmar`}>Repita a senha</FieldLabel>
        <InputBox>
          <Lock size={20} aria-hidden="true" />
          <TextInput
            id={`${id}-confirmar`}
            $icon
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            aria-invalid={matches === false ? true : undefined}
            aria-describedby={`${id}-confere`}
          />
        </InputBox>
        {matches !== null && (
          <FieldNote id={`${id}-confere`} aria-live="polite" $tone={matches ? undefined : 'erro'}>
            {matches ? 'As duas senhas são iguais.' : 'As duas senhas ainda não são iguais.'}
          </FieldNote>
        )}
      </div>
      {error && <FieldNote role="alert" $tone="erro">{error}</FieldNote>}
      <div style={{ marginTop: '1.75rem' }}>
        <PrimaryButton type="submit" disabled={saving}>
          <Save size={18} aria-hidden="true" /> {saving ? 'Trocando…' : 'Trocar a senha'}
        </PrimaryButton>
      </div>
    </Panel>
  );
}
