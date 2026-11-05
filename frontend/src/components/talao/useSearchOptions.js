import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

// Cidade salva em visitas anteriores
export const readSavedCity = () => {
  try {
    return localStorage.getItem('userCity') || '';
  } catch {
    return '';
  }
};

export const saveCity = (city) => {
  try {
    if (city) localStorage.setItem('userCity', city);
  } catch {
    // sem armazenamento: segue sem lembrar
  }
};

/* Categorias e cidades que existem de verdade entre os profissionais cadastrados.
   Se a API falhar, as listas ficam vazias e os campos continuam aceitando texto livre. */
export default function useSearchOptions() {
  const [options, setOptions] = useState({ categories: [], cities: [] });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/users/search-options`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setOptions({
          categories: Array.isArray(data.categories) ? data.categories : [],
          cities: Array.isArray(data.cities) ? data.cities : [],
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return options;
}
