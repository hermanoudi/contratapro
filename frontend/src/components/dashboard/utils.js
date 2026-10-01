// Datas sempre no fuso local: toISOString() é UTC e vira o dia depois das 21h no Brasil
export const localISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// A agenda do painel começa no domingo (a API devolve 7 dias a partir do start_date)
export const weekSunday = (offset = 0) => {
  const now = new Date();
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  sunday.setDate(sunday.getDate() - sunday.getDay() + offset * 7);
  return sunday;
};

export const weekDatesFrom = (sunday) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

// working_hours usa 0 = segunda … 6 = domingo
export const backendDay = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1);

export const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return phone;
};

export const formatCurrency = (value) => {
  if (!value) return 'A combinar';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Agendamentos que ocupam a agenda: cancelado não ocupa nada
export const OCCUPYING = ['scheduled', 'completed', 'blocked'];
