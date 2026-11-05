import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from './config';

/* Sessão vencida
   O token dura pouco (ver backend/app/routers/auth.py). Quando a API responde 401
   a uma chamada que levou o token salvo, a sessão acabou: o token é apagado e as
   telas logadas mandam a pessoa entrar de novo, voltando depois para onde estava.
   Páginas públicas só passam a se comportar como visitante. */

export const SESSION_EXPIRED = 'contratapro:sessao-encerrada';

const bearerOf = (input, init) => {
  const headers = init?.headers ?? (input instanceof Request ? input.headers : null);
  if (!headers) return null;
  const value = headers instanceof Headers
    ? headers.get('Authorization')
    : headers.Authorization ?? headers.authorization;
  return typeof value === 'string' && value.startsWith('Bearer ') ? value.slice(7) : null;
};

const urlOf = (input) => (typeof input === 'string' ? input : input?.url ?? String(input));

// Instalado uma vez em main.jsx; as chamadas continuam usando fetch() normalmente
export function installSessionGuard() {
  if (window.__contrataproSessionGuard) return;
  window.__contrataproSessionGuard = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const res = await nativeFetch(input, init);
    if (res.status === 401 && urlOf(input).startsWith(API_URL)) {
      const sent = bearerOf(input, init);
      // Só encerra se o token recusado ainda é o salvo: um login novo não é desfeito por resposta atrasada
      if (sent && sent === localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event(SESSION_EXPIRED));
      }
    }
    return res;
  };
}

// Leva ao login guardando o endereço atual
export function goToLogin(navigate, location, expired = false) {
  navigate('/login', {
    replace: true,
    state: { from: `${location.pathname}${location.search}`, expired },
  });
}

// Telas que exigem login: ao fim da sessão, vão para o login e voltam depois
export function useSessionExpiry() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onExpired = () => goToLogin(navigate, location, true);
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, [navigate, location]);
}
