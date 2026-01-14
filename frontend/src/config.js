// Configuração da URL da API
// Em produção (Vercel), usa /api que será redirecionado pelo vercel.json
// Em desenvolvimento, usa a variável de ambiente ou localhost:8000
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:8000');

export { API_URL };
