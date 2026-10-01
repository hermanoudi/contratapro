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


// Validação do endereço: devolve { campo: mensagem } só com o que falta
export const validateAddress = (formData) => {
  const errors = {};
  if (formData.cep.replace(/\D/g, '').length !== 8) errors.cep = 'Informe o CEP com 8 números.';
  if (!formData.street.trim()) errors.street = 'Informe a rua.';
  if (!formData.number.trim()) errors.number = 'Informe o número.';
  if (!formData.city.trim()) errors.city = 'Informe a cidade.';
  return errors;
};

// PUT /users/me só aceita FormData (por causa da foto). Campos undefined
// ficam de fora; string vazia vai e limpa o campo (ex.: complemento).
export const profileFormData = (fields) => {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, value);
  });
  return body;
};

// Valida a imagem da foto de perfil: devolve a mensagem de erro ou null
export const photoError = (file) => {
  if (!file.type.startsWith('image/')) return 'Escolha um arquivo de imagem (JPG, PNG ou GIF).';
  if (file.size > 5 * 1024 * 1024) return 'Essa imagem passa de 5 MB. Escolha uma menor.';
  return null;
};
