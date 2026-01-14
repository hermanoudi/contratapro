import { describe, it, expect } from 'vitest';

// Funções de utilidade de data (extraídas do Dashboard.jsx para testabilidade)
export const formatDateToBR = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateToISO = (brDate) => {
  if (!brDate || brDate.length !== 10) return '';
  const [day, month, year] = brDate.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
};

export const applyDateMask = (value) => {
  const numbers = value.replace(/\D/g, '');

  let formatted = '';
  if (numbers.length > 0) {
    formatted = numbers.substring(0, 2); // DD
    if (numbers.length > 2) {
      formatted += '/' + numbers.substring(2, 4); // MM
    }
    if (numbers.length > 4) {
      formatted += '/' + numbers.substring(4, 8); // YYYY
    }
  }

  return formatted;
};

export const validateDate = (isoDate) => {
  if (!isoDate) return false;
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

describe('Date Utilities - Brazilian Format', () => {
  describe('formatDateToBR', () => {
    it('deve converter ISO para formato brasileiro dd/mm/yyyy', () => {
      expect(formatDateToBR('2025-12-29')).toBe('29/12/2025');
      expect(formatDateToBR('2025-01-01')).toBe('01/01/2025');
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(formatDateToBR('')).toBe('');
      expect(formatDateToBR(null)).toBe('');
    });
  });

  describe('formatDateToISO', () => {
    it('deve converter formato brasileiro para ISO yyyy-mm-dd', () => {
      expect(formatDateToISO('29/12/2025')).toBe('2025-12-29');
      expect(formatDateToISO('01/01/2025')).toBe('2025-01-01');
    });

    it('deve retornar string vazia para formato inválido', () => {
      expect(formatDateToISO('')).toBe('');
      expect(formatDateToISO('12/2025')).toBe('');
      expect(formatDateToISO('invalid')).toBe('');
    });
  });

  describe('applyDateMask', () => {
    it('deve aplicar máscara dd/mm/yyyy automaticamente', () => {
      expect(applyDateMask('29')).toBe('29');
      expect(applyDateMask('2912')).toBe('29/12');
      expect(applyDateMask('29122025')).toBe('29/12/2025');
    });

    it('deve remover caracteres não numéricos', () => {
      expect(applyDateMask('29/12/2025')).toBe('29/12/2025');
      expect(applyDateMask('abc29def12xyz2025')).toBe('29/12/2025');
    });

    it('deve limitar a 10 caracteres (dd/mm/yyyy)', () => {
      expect(applyDateMask('291220259999')).toBe('29/12/2025');
    });
  });

  describe('validateDate', () => {
    it('deve validar datas válidas', () => {
      expect(validateDate('2025-12-29')).toBe(true);
      expect(validateDate('2025-02-28')).toBe(true);
      expect(validateDate('2024-02-29')).toBe(true); // ano bissexto
    });

    it('deve rejeitar datas inválidas', () => {
      expect(validateDate('2025-02-29')).toBe(false); // não é ano bissexto
      expect(validateDate('2025-13-01')).toBe(false); // mês inválido
      expect(validateDate('2025-04-31')).toBe(false); // abril tem 30 dias
      expect(validateDate('')).toBe(false);
    });
  });
});

describe('Time Utilities - Brazilian Format', () => {
  describe('validateTimeRange', () => {
    it('deve validar se horário final é maior que inicial', () => {
      const validateTimeRange = (startTime, endTime) => {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      };

      expect(validateTimeRange('08:00', '09:00')).toBe(true);
      expect(validateTimeRange('08:00', '18:00')).toBe(true);
      expect(validateTimeRange('09:00', '08:00')).toBe(false);
      expect(validateTimeRange('08:00', '08:00')).toBe(false);
    });
  });
});
