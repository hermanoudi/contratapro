# Testes Automatizados - Frontend

Este diretório contém testes automatizados para garantir a qualidade e funcionamento correto das funcionalidades do frontend.

## 🧪 Tecnologias de Teste

- **Vitest**: Framework de testes rápido e moderno, otimizado para Vite
- **React Testing Library**: Biblioteca para testar componentes React
- **@testing-library/jest-dom**: Matchers customizados para assertions DOM
- **jsdom**: Ambiente DOM para testes

## 📝 Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (reexecuta quando arquivos mudam)
npm test -- --watch

# Executar testes com interface UI
npm run test:ui

# Executar testes com cobertura de código
npm run test:coverage

# Executar apenas um arquivo de teste específico
npm test -- dateUtils.test.js
```

## 📂 Estrutura de Testes

```
src/test/
├── setup.js              # Configuração global dos testes
├── dateUtils.test.js     # Testes de formatação de data brasileira
└── README.md            # Esta documentação
```

## ✅ Testes Implementados

### `dateUtils.test.js`

Testa as funções de manipulação de data em formato brasileiro:

#### Formatação de Data
- ✅ `formatDateToBR()`: Converte ISO (yyyy-mm-dd) → Brasileiro (dd/mm/yyyy)
- ✅ `formatDateToISO()`: Converte Brasileiro (dd/mm/yyyy) → ISO (yyyy-mm-dd)

#### Máscara de Data
- ✅ `applyDateMask()`: Aplica máscara automática dd/mm/yyyy
- ✅ Remove caracteres não numéricos
- ✅ Limita a 10 caracteres

#### Validação
- ✅ `validateDate()`: Valida datas válidas e inválidas
- ✅ Detecta anos bissextos
- ✅ Valida limites de dias por mês

#### Horários
- ✅ `validateTimeRange()`: Verifica se horário final > inicial

## 🔧 Criando Novos Testes

### Exemplo: Teste de Componente

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeuComponente from '../components/MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });

  it('deve chamar função ao clicar no botão', async () => {
    const handleClick = vi.fn();
    render(<MeuComponente onClick={handleClick} />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Exemplo: Teste de Função

```javascript
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from '../utils/minhaFuncao';

describe('minhaFuncao', () => {
  it('deve retornar o valor esperado', () => {
    const resultado = minhaFuncao('input');
    expect(resultado).toBe('output esperado');
  });

  it('deve lidar com casos extremos', () => {
    expect(minhaFuncao('')).toBe('');
    expect(minhaFuncao(null)).toBe('');
  });
});
```

## 🎯 Boas Práticas

1. **Nomes Descritivos**: Use `describe` e `it` com descrições claras
2. **Teste Comportamento**: Teste o que o usuário vê/faz, não detalhes de implementação
3. **AAA Pattern**: Arrange (preparar), Act (agir), Assert (verificar)
4. **Isolamento**: Cada teste deve ser independente
5. **Casos Extremos**: Teste valores vazios, nulos, inválidos

## 🚀 Integração Contínua

Os testes devem ser executados antes de:
- Fazer commit
- Criar pull request
- Deploy em produção

## 📊 Cobertura de Código

Execute `npm run test:coverage` para ver relatório de cobertura:

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
dateUtils.test.js   |   100   |   100    |   100   |   100
```

## 🔍 Debug de Testes

Para debugar testes:

```javascript
// Adicione console.log ou use screen.debug()
import { screen } from '@testing-library/react';

screen.debug(); // Mostra todo o DOM
screen.debug(element); // Mostra um elemento específico
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
