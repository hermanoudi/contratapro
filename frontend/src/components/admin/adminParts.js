import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LayoutDashboard, Briefcase, Users, CreditCard, Tag, Lock } from 'lucide-react';
import { API_URL } from '../../config';

/* Peças do painel do admin no registro contido: tabela pautada que rola
   dentro do próprio quadro no celular, situação em palavra e cor, números
   em lista pautada (sem cartões com ícone) e o carregamento de cada aba. */

export const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Carrega uma rota do admin; recarregar = mudar `attempt`. Carregando = chave diferente.
export function useAdminResource(path, attempt = 0) {
  const key = `${path}|${attempt}`;
  const [response, setResponse] = useState({ key: null, status: 'ok', data: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}${path}`, { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setResponse({ key, status: 'ok', data });
      })
      .catch((e) => {
        console.error(`Falha ao carregar ${path}`, e);
        if (!cancelled) setResponse({ key, status: 'error', data: null });
      });
    return () => { cancelled = true; };
  }, [path, key]);

  if (response.key !== key) return { status: 'loading', data: null };
  return response;
}

// Situação do profissional (subscription_status) e da assinatura
export const ADMIN_STATUS = {
  active: { label: 'Ativo', color: 'var(--sucesso)' },
  pending: { label: 'Pendente', color: 'var(--alerta)' },
  inactive: { label: 'Inativo', color: 'var(--texto-2-papel)' },
  cancelled: { label: 'Cancelado', color: 'var(--erro)' },
  suspended: { label: 'Suspenso', color: 'var(--alerta)' },
  paused: { label: 'Pausado', color: 'var(--alerta)' },
  expired: { label: 'Vencido', color: 'var(--erro)' },
};

export const adminStatus = (status) => ADMIN_STATUS[status] || { label: status || '—', color: 'var(--texto-2-papel)' };

export const StatusWord = styled.b`
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $color }) => $color};
`;

// Quadro que rola na horizontal: a página nunca rola de lado no celular
export const TableScroll = styled.div`
  /* relative: o rótulo sr-only (absoluto) fica preso ao quadro, não alarga a página */
  position: relative;
  overflow-x: auto;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;

  &:focus-visible {
    outline: 2px solid var(--carbono);
    outline-offset: 2px;
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: ${({ $min }) => $min || '40rem'};
  border-collapse: collapse;
  font-size: 0.98rem;

  th {
    padding: 0.6rem 0.75rem 0.5rem;
    text-align: left;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica-escura);
    border-bottom: 2px solid var(--grafica);
    white-space: nowrap;
  }

  td {
    padding: 0.7rem 0.75rem;
    border-bottom: 1.5px solid var(--pauta);
    vertical-align: top;
    line-height: 1.4;
  }

  td small {
    display: block;
    color: var(--texto-2-papel);
    font-size: 0.92rem;
  }

  tbody tr:hover td {
    background: var(--papel-2);
  }
`;

export const TableMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
  margin-bottom: 1rem;

  > p {
    color: var(--texto-2-papel);
    font-variant-numeric: tabular-nums;
  }
`;

// Números do painel: lista pautada, rótulo impresso à esquerda e número à direita
export const Figures = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  column-gap: 2rem;

  > div {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    padding: 0.7rem 0;
    border-bottom: 1.5px solid var(--pauta);
  }

  dt {
    line-height: 1.35;

    small {
      display: block;
      font-size: 0.9rem;
      color: var(--texto-2-papel);
    }
  }

  dd {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: 1.6rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;

export const SectionTitle = styled.h2`
  margin-bottom: 0.75rem;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.35rem;
`;

export const Muted = styled.p`
  padding: 1.5rem 0;
  color: var(--texto-2-papel);
  line-height: 1.5;
`;

export const money = (value) => (value == null || Number.isNaN(Number(value))
  ? '—'
  : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

// Dia de um timestamp (created_at); colunas só de data usam parseLocalDate
export const createdDay = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');

// Abas do /admin/dashboard (?tab=), na ordem do menu
export const ADMIN_TABS = [
  { key: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { key: 'professionals', label: 'Profissionais', icon: Briefcase },
  { key: 'clients', label: 'Clientes', icon: Users },
  { key: 'subscriptions', label: 'Assinaturas', icon: CreditCard },
  { key: 'categories', label: 'Categorias', icon: Tag },
  { key: 'settings', label: 'Minha senha', icon: Lock },
];
