# Guia do Cliente - ContrataPro

> Este guia explica como utilizar a plataforma ContrataPro para encontrar e agendar servicos com profissionais verificados.

---

## Sumario

1. [Cadastro](#1-cadastro)
2. [Primeiro Acesso](#2-primeiro-acesso)
3. [Buscar Profissionais](#3-buscar-profissionais)
4. [Agendar um Servico](#4-agendar-um-servico)
5. [Meus Agendamentos](#5-meus-agendamentos)
6. [Minha Conta](#6-minha-conta)
7. [Dicas Uteis](#7-dicas-uteis)

---

## 1. Cadastro

### Tour Step: `tour-client-register`

O cadastro de cliente e simples e gratuito!

### Etapa 1: Dados Pessoais
**Tour ID:** `tour-client-register-step1`

| Campo | Descricao | Obrigatorio |
|-------|-----------|:-----------:|
| Nome completo | Como voce quer ser chamado | Sim |
| E-mail | Usado para login e notificacoes | Sim |
| WhatsApp | Para confirmacao de agendamentos | Sim |
| Senha | Minimo 8 caracteres seguros | Sim |

> **Dica Tour:** "Preencha seus dados. E rapido e gratuito!"

### Etapa 2: Endereco
**Tour ID:** `tour-client-register-step2`

| Campo | Descricao | Obrigatorio |
|-------|-----------|:-----------:|
| CEP | Digite e o endereco sera preenchido automaticamente | Sim |
| Rua | Preenchido automaticamente | Sim |
| Numero | Numero da sua residencia | Sim |
| Complemento | Apto, bloco, etc | Nao |
| Bairro | Preenchido automaticamente | Sim |
| Cidade | Preenchido automaticamente | Sim |
| Estado | Preenchido automaticamente | Sim |

> **Dica Tour:** "Seu endereco ajuda a encontrar profissionais proximos a voce."

### Por que Informar o Endereco?
**Tour ID:** `tour-client-register-why-address`

- Encontrar profissionais na sua regiao
- Verificar se o profissional atende sua area
- Facilitar o deslocamento no dia do servico

> **Dica Tour:** "Profissionais preferem atender clientes proximos. Seu CEP ajuda no match!"

---

## 2. Primeiro Acesso

### Tour Step: `tour-client-first-login`

Apos o cadastro, voce pode:

1. **Buscar profissionais** diretamente
2. **Acessar seu painel** para ver agendamentos
3. **Completar seu perfil** se necessario

> **Dica Tour:** "Pronto! Agora voce pode buscar e agendar servicos com profissionais verificados."

---

## 3. Buscar Profissionais

### Tour Step: `tour-client-search`

### 3.1 Acessar a Busca
**Tour ID:** `tour-client-search-access`

- Clique em **"Buscar"** no menu
- Ou use a barra de busca na pagina inicial

> **Dica Tour:** "Use a busca para encontrar o profissional ideal para seu servico."

### 3.2 Filtros de Busca
**Tour ID:** `tour-client-search-filters`

| Filtro | Descricao | Exemplo |
|--------|-----------|---------|
| Servico | O que voce precisa | "Eletricista", "Encanador" |
| CEP | Sua localizacao | "38400-000" |

> **Dica Tour:** "Digite o servico que precisa e seu CEP para ver profissionais proximos."

### 3.3 Resultados da Busca
**Tour ID:** `tour-client-search-results`

Cada profissional mostra:

| Informacao | Descricao |
|------------|-----------|
| Foto | Imagem do profissional |
| Nome | Nome completo |
| Verificado | Selo de perfil verificado |
| Categoria | Tipo de servico |
| Avaliacao | Nota media (estrelas) |
| Descricao | Apresentacao do profissional |
| Localizacao | Cidade e estado |
| Servicos | Lista com precos |

> **Dica Tour:** "Compare profissionais pela avaliacao, servicos e precos."

### 3.4 Acoes Disponiveis
**Tour ID:** `tour-client-search-actions`

Para cada profissional:

| Botao | Acao |
|-------|------|
| **Ver Agenda e Reservar** | Abre a pagina de agendamento |
| **WhatsApp** | Envia mensagem direta ao profissional |

> **Dica Tour:** "Clique em 'Ver Agenda' para agendar ou use o WhatsApp para tirar duvidas."

---

## 4. Agendar um Servico

### Tour Step: `tour-client-booking`

### 4.1 Acessar Perfil do Profissional
**Tour ID:** `tour-client-booking-access`

Voce pode acessar o perfil de duas formas:

1. **Pela busca:** Clique em "Ver Agenda e Reservar"
2. **Por link direto:** `contratapro.com.br/p/nome-do-profissional`

> **Dica Tour:** "Esta e a pagina do profissional. Aqui voce ve servicos, precos e disponibilidade."

### 4.2 Escolher o Servico
**Tour ID:** `tour-client-booking-service`

1. Veja a lista de servicos oferecidos
2. Cada servico mostra:
   - Nome do servico
   - Preco (ou "Sob consulta")
   - Tipo: Por hora ou Por dia
3. Clique no servico desejado para selecionar

> **Dica Tour:** "Escolha o servico que precisa. O preco mostrado e uma referencia."

### 4.3 Escolher a Data
**Tour ID:** `tour-client-booking-date`

1. Use o calendario para navegar entre os dias
2. Dias disponiveis estao clicaveis
3. Dias passados estao desabilitados
4. Clique na data desejada

> **Dica Tour:** "Selecione a data que deseja realizar o servico."

### 4.4 Escolher o Horario
**Tour ID:** `tour-client-booking-time`

**Para servicos por hora:**
- Veja os horarios disponiveis (em verde)
- Horarios ocupados aparecem em vermelho
- Clique no horario desejado

**Para servicos por dia:**
- Clique em "Agendar este dia"
- O profissional reserva o dia todo para voce

> **Dica Tour:** "Verde = disponivel. Escolha o melhor horario para voce."

### 4.5 Verificacao de Regiao
**Tour ID:** `tour-client-booking-location`

O sistema verifica se o profissional atende sua regiao:

| Icone | Significado |
|-------|-------------|
| Check Verde | Profissional atende sua area |
| Alerta Vermelho | Fora da area de atendimento |

> **Dica Tour:** "Verificamos se o profissional atende na sua cidade."

### 4.6 Confirmar Agendamento
**Tour ID:** `tour-client-booking-confirm`

1. Revise suas escolhas:
   - Servico selecionado
   - Data escolhida
   - Horario selecionado
2. Clique em **"Confirmar Agendamento"**

**Importante:** Voce precisa estar logado para confirmar.

> **Dica Tour:** "Revise tudo e confirme. O profissional sera notificado!"

### 4.7 Confirmacao
**Tour ID:** `tour-client-booking-success`

Apos confirmar, voce vera:
- Mensagem de sucesso
- Nome do profissional
- Aviso sobre precos (podem variar)
- Botao para confirmar via WhatsApp
- Botao para voltar ao inicio

> **Dica Tour:** "Agendamento feito! Recomendamos confirmar pelo WhatsApp tambem."

---

## 5. Meus Agendamentos

### Tour Step: `tour-client-appointments`

### 5.1 Acessar Agendamentos
**Tour ID:** `tour-client-appointments-access`

1. Faca login na plataforma
2. Clique em **"Meus Agendamentos"** no menu
3. Ou acesse seu painel de cliente

> **Dica Tour:** "Veja todos os seus agendamentos em um so lugar."

### 5.2 Lista de Agendamentos
**Tour ID:** `tour-client-appointments-list`

Cada agendamento mostra:

| Informacao | Descricao |
|------------|-----------|
| Status | Agendado, Concluido, Cancelado |
| Categoria | Tipo de servico |
| Servico | Nome do servico agendado |
| Profissional | Nome de quem vai atender |
| Data e Hora | Quando sera realizado |

> **Dica Tour:** "Acompanhe o status de todos os seus agendamentos."

### 5.3 Status dos Agendamentos
**Tour ID:** `tour-client-appointments-status`

| Status | Cor | Significado |
|--------|-----|-------------|
| Agendado | Azul | Confirmado, aguardando data |
| Concluido | Verde | Servico realizado |
| Cancelado | Vermelho | Cancelado por voce ou profissional |
| Suspenso | Amarelo | Temporariamente pausado |

> **Dica Tour:** "Azul = confirmado e aguardando. Verde = ja foi realizado."

### 5.4 Ver Detalhes
**Tour ID:** `tour-client-appointments-details`

Clique em um agendamento para ver:
- Informacoes completas do servico
- Dados do profissional
- Endereco de atendimento
- Opcoes de contato

> **Dica Tour:** "Clique para ver todos os detalhes e entrar em contato se necessario."

---

## 6. Minha Conta

### Tour Step: `tour-client-account`

### 6.1 Acessar Configuracoes
**Tour ID:** `tour-client-account-access`

1. Clique no seu nome/avatar
2. Selecione **"Minha Conta"**

> **Dica Tour:** "Mantenha seus dados atualizados para melhor experiencia."

### 6.2 Editar Perfil
**Tour ID:** `tour-client-account-edit`

Voce pode atualizar:

| Campo | Pode Editar? |
|-------|:------------:|
| Nome | Sim |
| E-mail | Sim |
| WhatsApp | Sim |
| CEP | Sim |
| Endereco | Sim |
| Cidade/Estado | Automatico pelo CEP |

> **Dica Tour:** "Mudou de endereco? Atualize aqui para encontrar profissionais na nova regiao."

### 6.3 Salvar Alteracoes
**Tour ID:** `tour-client-account-save`

1. Faca as alteracoes necessarias
2. Clique em **"Salvar"**
3. Aguarde a confirmacao

> **Dica Tour:** "Nao esqueca de salvar apos fazer alteracoes!"

---

## 7. Dicas Uteis

### Tour Step: `tour-client-tips`

### 7.1 Antes de Agendar
**Tour ID:** `tour-client-tips-before`

- [ ] Verifique o perfil completo do profissional
- [ ] Leia as avaliacoes de outros clientes
- [ ] Compare precos entre profissionais
- [ ] Confirme se atende sua regiao

> **Dica Tour:** "Pesquise bem antes de agendar. Compare opcoes!"

### 7.2 No Dia do Servico
**Tour ID:** `tour-client-tips-day`

- [ ] Confirme o agendamento pelo WhatsApp
- [ ] Tenha o endereco correto disponivel
- [ ] Esteja disponivel no horario marcado
- [ ] Prepare o ambiente se necessario

> **Dica Tour:** "Confirme pelo WhatsApp no dia anterior. Evita imprevistos!"

### 7.3 Apos o Servico
**Tour ID:** `tour-client-tips-after`

- [ ] Avalie o profissional na plataforma
- [ ] Deixe um comentario util
- [ ] Indique para amigos se gostou

> **Dica Tour:** "Sua avaliacao ajuda outros clientes e motiva o profissional!"

### 7.4 Problemas?
**Tour ID:** `tour-client-tips-problems`

Se algo der errado:

1. **Fale com o profissional** primeiro (WhatsApp)
2. **Registre uma reclamacao** se nao resolver
3. **Contate o suporte** ContrataPro

> **Dica Tour:** "Estamos aqui para ajudar! Use o suporte se precisar."

---

## Estrutura para Tour Guiado

```javascript
// Configuracao sugerida para react-joyride ou similar
const tourStepsClient = [
  {
    id: 'tour-client-first-login',
    target: '.main-container',
    title: 'Bem-vindo ao ContrataPro!',
    content: 'Aqui voce encontra profissionais verificados para qualquer servico.',
    placement: 'center'
  },
  {
    id: 'tour-client-search-access',
    target: '.search-button',
    title: 'Busque Profissionais',
    content: 'Use a busca para encontrar o profissional ideal.',
    placement: 'bottom'
  },
  {
    id: 'tour-client-search-filters',
    target: '.search-filters',
    title: 'Filtre sua Busca',
    content: 'Digite o servico que precisa e seu CEP para ver profissionais proximos.',
    placement: 'bottom'
  },
  {
    id: 'tour-client-search-results',
    target: '.search-results',
    title: 'Resultados',
    content: 'Compare profissionais pela avaliacao, servicos e precos.',
    placement: 'top'
  },
  {
    id: 'tour-client-booking-service',
    target: '.services-list',
    title: 'Escolha o Servico',
    content: 'Clique no servico que voce precisa.',
    placement: 'right'
  },
  {
    id: 'tour-client-booking-date',
    target: '.calendar-container',
    title: 'Escolha a Data',
    content: 'Selecione o melhor dia para voce.',
    placement: 'left'
  },
  {
    id: 'tour-client-booking-time',
    target: '.time-slots',
    title: 'Escolha o Horario',
    content: 'Verde = disponivel. Escolha o melhor horario!',
    placement: 'top'
  },
  {
    id: 'tour-client-booking-confirm',
    target: '.confirm-button',
    title: 'Confirme',
    content: 'Revise e confirme seu agendamento. O profissional sera notificado!',
    placement: 'top'
  },
  {
    id: 'tour-client-appointments-access',
    target: '.appointments-link',
    title: 'Seus Agendamentos',
    content: 'Acompanhe todos os seus agendamentos aqui.',
    placement: 'bottom'
  }
];
```

---

## Perguntas Frequentes

### Como cancelar um agendamento?
**Tour ID:** `tour-client-faq-cancel`

1. Acesse "Meus Agendamentos"
2. Encontre o agendamento
3. Clique em "Cancelar"
4. Confirme o cancelamento

> **Importante:** Cancele com antecedencia para nao prejudicar o profissional.

### Posso reagendar?
**Tour ID:** `tour-client-faq-reschedule`

Sim! Entre em contato com o profissional pelo WhatsApp para combinar nova data.

### O preco pode mudar?
**Tour ID:** `tour-client-faq-price`

Sim, o preco mostrado e uma referencia. O valor final pode variar conforme:
- Complexidade do servico
- Materiais necessarios
- Deslocamento

> **Dica:** Combine o valor final com o profissional antes do servico.

### Como avaliar um profissional?
**Tour ID:** `tour-client-faq-review`

Apos o servico ser concluido:
1. Acesse "Meus Agendamentos"
2. Encontre o servico concluido
3. Clique em "Avaliar"
4. De sua nota e comentario

---

## Precisa de Ajuda?

- **WhatsApp Suporte:** (xx) xxxxx-xxxx
- **E-mail:** suporte@contratapro.com.br
- **Central de Ajuda:** contratapro.com.br/ajuda

---

*Ultima atualizacao: Fevereiro 2026*
