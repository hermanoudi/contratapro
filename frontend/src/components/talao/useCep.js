import { useState } from 'react';
import { API_URL } from '../../config';

export const formatCep = (digits) => (digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits);

// CEP salvo em visitas anteriores (só vale com a cidade junto)
export const readSavedLocation = () => {
  const cep = localStorage.getItem('userCep');
  const city = localStorage.getItem('userCity');
  return cep && city ? { cep, city } : null;
};

/* Campo de CEP do talão: consulta a cidade em /cep, lembra o último CEP válido
   e descreve o estado em uma frase para a linha de status abaixo do campo.
   Estados: idle | loading | ok | notfound | offline (+ incompleto no envio). */
export default function useCep(initial) {
  const [cepDigits, setCepDigits] = useState(initial?.cep ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [cepState, setCepState] = useState(initial?.cep && initial?.city ? 'ok' : 'idle');
  const [cepIncomplete, setCepIncomplete] = useState(false);

  const handleCepChange = async (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    setCepDigits(digits);
    setCepIncomplete(false);

    if (digits.length < 8) {
      setCity('');
      setCepState('idle');
      return;
    }

    setCepState('loading');
    try {
      const res = await fetch(`${API_URL}/cep/${digits}`);
      if (res.ok) {
        const data = await res.json();
        if (data.city) {
          setCity(data.city);
          setCepState('ok');
          localStorage.setItem('userCep', digits);
          localStorage.setItem('userCity', data.city);
          return;
        }
      }
      setCity('');
      setCepState(res.status >= 500 ? 'offline' : 'notfound');
    } catch {
      setCity('');
      setCepState('offline');
    }
  };

  // CEP começado e incompleto: quem envia decide focar o campo em vez de buscar sem a região
  const isIncomplete = cepDigits.length > 0 && cepDigits.length < 8;

  const status = {
    idle: cepIncomplete
      ? { text: `Faltam ${8 - cepDigits.length} números do CEP. Complete ou apague para buscar só pelo serviço.`, tone: 'erro' }
      : cepDigits.length > 0
        ? { text: `Faltam ${8 - cepDigits.length} números.` }
        : { text: 'Com o CEP, mostramos quem atende perto de você.' },
    loading: { text: 'Consultando o CEP…' },
    notfound: { text: 'CEP não encontrado. Confira os números.', tone: 'erro' },
    offline: { text: 'Não deu para consultar o CEP agora. Você pode buscar só pelo serviço.', tone: 'erro' },
  }[cepState];

  return {
    cepDigits,
    city,
    cepState,
    cepIncomplete,
    setCepIncomplete,
    isIncomplete,
    handleCepChange,
    status,
  };
}
