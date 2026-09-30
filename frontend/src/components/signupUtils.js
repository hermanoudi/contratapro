// Máscaras, mensagens e validações dos cadastros (sem componentes: fast refresh)

/* ------------------------------ Máscaras ------------------------------ */

export const formatWhatsApp = (raw) => {
  const value = raw.replace(/\D/g, '').slice(0, 11);
  if (value.length === 11) return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  if (value.length === 10) return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  if (value.length > 2) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  return value;
};

export const formatCpf = (raw) => {
  const value = raw.replace(/\D/g, '').slice(0, 11);
  if (value.length > 9) return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
  if (value.length > 6) return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
  if (value.length > 3) return `${value.slice(0, 3)}.${value.slice(3)}`;
  return value;
};

export const formatCepMask = (raw) => {
  const value = raw.replace(/\D/g, '').slice(0, 8);
  return value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value;
};

// O backend responde algumas mensagens em inglês ou sem acento; aqui viram português de gente
const KNOWN_ERRORS = {
  'Email already registered': 'Já existe uma conta com este e-mail. Entre com ele ou use outro e-mail.',
  'Token invalido ou expirado': 'Este link não vale mais. Peça um link novo em "Esqueci minha senha".',
  'A senha nao atende aos criterios de seguranca': 'A senha não atende às regras de segurança.',
  'Usuario nao encontrado': 'Não encontramos essa conta. Peça um link novo em "Esqueci minha senha".',
};

export const translateError = (detail, fallback) =>
  (typeof detail === 'string' && (KNOWN_ERRORS[detail] || detail)) || fallback;

// Validação do endereço: devolve { campo: mensagem } só com o que falta
export const validateAddress = (formData) => {
  const errors = {};
  if (formData.cep.replace(/\D/g, '').length !== 8) errors.cep = 'Informe o CEP com 8 números.';
  if (!formData.street.trim()) errors.street = 'Informe a rua.';
  if (!formData.number.trim()) errors.number = 'Informe o número.';
  if (!formData.city.trim()) errors.city = 'Informe a cidade.';
  return errors;
};
