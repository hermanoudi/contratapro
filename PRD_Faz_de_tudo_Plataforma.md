### PRD: Faz de tudo Plataforma SaaS MVP

Versão: 1.0
Data: 2025-11-25
Responsável: [A ser definido pelo usuário/time]

---

### Resumo

A plataforma "Faz de tudo" é um novo **SaaS B2B2C** focado em conectar Clientes Consumidores a Prestadores de Serviços (Profissionais Liberais) em uma mesma localidade (Cidade). O MVP se concentra em funcionalidades de **Cadastro e Busca por Proximidade (CEP)**, **Agendamento com Bloqueio de Agenda** e **Monetização via Assinatura Mensal** (R$ 50,00) dos Profissionais para validação de mercado e atingimento da meta de receita. A arquitetura inicial é um Monólito para agilidade.

---

### Contexto e problema

Público-alvo
- Profissional Prestador de Serviço: Barbeiros, pintores, pedreiros, massagistas, eletricistas, diarístas, manicures, etc., que buscam uma ferramenta para exposição e agendamento de serviços em sua região.
- Cliente Consumidor: Pessoas que buscam encontrar prestadores de serviço locais (na mesma cidade) de forma rápida e confiável.

Cenários de uso chave
- O Cliente Consumidor informa o CEP e encontra uma lista filtrada de Profissionais e Serviços disponíveis em sua cidade.
- O Profissional cadastra seus serviços, define seu preço e agenda, e paga a mensalidade para ter visibilidade e receber agendamentos.
- O Cliente Consumidor solicita um horário de agendamento que bloqueia a agenda do Profissional e gera um contato via WhatsApp para finalizar a contratação.

Onde essa feature será implantada
- Novo Sistema (Monólito): A plataforma será construída do zero, iniciando com uma arquitetura monolítica para facilitar a entrega rápida do MVP.

Problemas priorizados
- Dificuldade em encontrar profissionais locais (Alta): É difícil e demorado para Clientes Consumidores encontrarem prestadores de serviço específicos em sua região/cidade (Ex: pintor em Goiânia). O impacto é a perda de tempo e a dificuldade de contratação.
- Falta de canal de exposição centralizado (Média): Profissionais dependem de canais dispersos e não focados em agendamento transacional, dificultando a captação de novos clientes.

---

### Objetivos e métricas

| Objetivo | Métrica | Meta |
| :--- | :--- | :--- |
| Criar uma base sólida de oferta de serviços | Número total de Profissionais Prestadores ativos | 150 Profissionais |
| Garantir a adoção e o engajamento do cliente | Número total de Clientes Consumidores cadastrados | 3.000 Clientes Consumidores |
| Monetizar a plataforma através do público profissional | Receita total gerada pelas mensalidades dos profissionais | R$ 40.000,00 |

---

### Escopo

Incluso
- Cadastro completo do Profissional (incluindo CEP para geolocalização por cidade).
- Cadastro de Serviço (incluindo nome, descrição, 1 a 5 fotos e definição de valores).
- Funcionalidade de Busca por CEP/Cidade (filtro obrigatório e exclusivo por cidade).
- Funcionalidade de Agendamento (seleção de data/hora que bloqueia a agenda).
- Cobrança da Mensalidade do Profissional via cartão de crédito (R$ 50,00/mês).
- Painel básico do Administrador com KPIs (Profissionais e Agendamentos) e gestão de bloqueio/desbloqueio de perfil.

Fora de escopo
- Pagamento do serviço pelo Cliente Consumidor dentro da plataforma.
- Métodos de pagamento para a mensalidade do profissional que não sejam cartão de crédito (Ex: PIX, Boleto).
- Avaliações e comentários dos clientes.
- Funcionalidade de chat interno entre cliente e profissional.
- Múltiplos agendamentos simultâneos para o mesmo profissional.
- Atendimento baseado em "raio de ação" (distância em quilômetros).

---

### Requisitos funcionais

#### FR-001 Cadastro do Profissional
O sistema deve permitir que o Profissional crie seu perfil, informe dados pessoais, de contato (incluindo WhatsApp), sua área de atuação (CEP) e defina sua categoria de serviço, para que ele possa ser aprovado e começar a cadastrar serviços.

**Fluxo principal**
- Profissional clica em **"Ofereça seus serviços"**.
- Preenche **Nome**, **E-mail** e **Senha**.
- Preenche o **CEP** e o sistema busca e apresenta o **Endereço** (cidade e estado). O profissional confirma.
- Profissional preenche o restante do perfil: **Telefone WhatsApp**, **Categoria de Serviço Principal**, e uma **Descrição** breve.
- Profissional **Confirma o Cadastro**.

**Fluxos alternativos e exceções**
- O cadastro é aprovado automaticamente, liberando o profissional para o próximo passo.

**Erros previstos**
- CEP não encontrado: Mensagem de erro e bloqueio do avanço.
- Campos Duplicados (E-mail): Mensagem de erro e bloqueio do avanço até o ajuste.

**Prioridade:** alta

---

#### FR-002 Cadastro de Serviço
Permitir que o Profissional, após o cadastro, defina os detalhes de cada serviço que ele oferece (nome, descrição, preço: custo médio, menor custo e maior custo) e faça o upload de 1 a 5 fotos, para que o serviço seja exibido na busca do cliente.

**Fluxo principal**
- O Profissional acessa o painel e clica em **"Adicionar Novo Serviço"**.
- Preenche o **Nome** e a **Descrição** detalhada.
- Define a **Unidade de Cobrança**: **"Por Hora"** ou **"Por Execução"**.
- Informa os valores em R$ (formato brasileiro): **Custo Médio Estimado, Menor Custo e Maior Custo**.
- Faz o upload de **1 (mínimo) a 5 (máximo)** fotos de portfólio.
- Confirma e clica em **"Salvar Serviço"**.

**Fluxos alternativos e exceções**
- O serviço fica visível na busca do Cliente Consumidor imediatamente, mas o botão de Agendamento/Contato só é liberado após o pagamento da mensalidade (FR-003).

**Erros previstos**
- Limite de Fotos: Erro se tentar enviar mais de 5 fotos.
- Validação de Custos: Falha se o Menor Custo for maior que o Custo Médio Estimado.

**Prioridade:** alta

---

#### FR-003 Cobrança da Mensalidade do Profissional
O sistema deve apresentar o plano de R$ 50,00/mês ao Profissional e permitir que ele efetue o pagamento recorrente da mensalidade exclusivamente via cartão de crédito, o que libera o botão de Agendamento/Contato em seu perfil público.

**Fluxo principal**
- Profissional é direcionado para a tela de **"Assinatura/Pagamento"**.
- O sistema apresenta o plano de **R$ 50,00/mês** (recorrência mensal).
- Profissional insere dados do **Cartão de Crédito**.
- Dados são processados pelo Gateway (**Stripe** - Hipótese).
- O sistema confirma o pagamento e **libera o botão de Agendamento/Contato**.

**Fluxos alternativos e exceções**
- Transação Negada: O Profissional **não é ativado**.
- Cobranças Futuras Falhas: 3 tentativas de retry do sistema, seguido de **bloqueio de perfil** e **remoção da visibilidade**.
- Cancelamento pelo Profissional: Perfil é **bloqueado** na busca.

**Erros previstos**
- Se a transação for negada na primeira tentativa, o profissional não é ativado na plataforma.
- Em caso de cancelamento, todos os agendamentos futuros devem ser **cancelados** e os clientes **avisados** via WhatsApp.

**Prioridade:** alta

---

#### FR-004 Gestão de Agendamento e Disponibilidade (Cliente e Profissional)
Permitir que o Profissional gerencie sua disponibilidade no calendário, e que o Cliente Consumidor use a visualização desse calendário para solicitar o agendamento de um serviço com um horário específico (fornecendo Nome Completo e WhatsApp), gerando um bloqueio temporário na agenda do profissional. O agendamento é o ponto de partida para o contato via WhatsApp.

**Fluxo principal**
- Cliente clica em **"Agendar"** (na página do serviço).
- Cliente vê o **Calendário de Disponibilidade** (slots de 1 hora - Hipótese).
- Cliente seleciona **Serviço, Data e Horário**.
- Cliente preenche **Nome Completo** e **WhatsApp**.
- O sistema registra o agendamento e **bloqueia imediatamente** o horário.
- O sistema **redireciona o Cliente** para o WhatsApp do Profissional com uma **mensagem pré-preenchida**.

**Fluxos alternativos e exceções**
- Duração Padrão: Slot de agendamento padrão de **1 hora**.
- Desbloqueio/Cancelamento pelo Profissional: Profissional pode cancelar/desbloquear. A ação é registrada (auditoria) e notifica o Cliente via **WhatsApp** automaticamente.
- Disponibilidade: Se a agenda não for definida, o sistema assume que está **toda ocupada**.

**Erros previstos**
- Horário Indisponível: Se o horário acabou de ser bloqueado, o cliente recebe a mensagem: "Horário indisponível. Por favor, selecione outro slot."

**Prioridade:** alta

---

#### FR-005 Busca de Profissionais por Cidade
O sistema deve permitir que o Cliente Consumidor informe seu CEP para que o sistema determine sua cidade e apresente uma lista filtrada de Profissionais e Serviços cadastrados que atendem **exclusivamente** naquela mesma cidade. O cliente é obrigado a fornecer o CEP para realizar uma busca.

**Fluxo principal**
- Cliente acessa a página inicial e vê a caixa de busca (com exemplos de profissionais).
- Cliente digita o **CEP** para realizar a busca.
- O sistema valida o CEP e determina a **Cidade/Estado**.
- O sistema busca apenas Profissionais e Serviços que pertencem à **mesma Cidade**.
- O sistema exibe a lista de resultados filtrada.

**Fluxos alternativos e exceções**
- O Cliente Consumidor pode refinar a busca filtrando por **Categoria de Serviço**.
- O cliente é obrigado a fornecer o CEP para realizar a pesquisa funcional.

**Erros previstos**
- CEP Inválido: Retorna a mensagem: "Localidade não encontrada. Por favor, verifique o CEP."
- Sem Profissionais: Retorna a mensagem: "Infelizmente, ainda não temos atendimento que cobre a localidade desejada..."

**Prioridade:** alta

---

#### FR-006 Painel do Administrador e KPIs
O sistema deve prover uma interface restrita e segura para o Administrador visualizar de forma agregada os principais indicadores de crescimento da plataforma (KPIs), e também permitir a busca e o gerenciamento básico dos dados de Profissionais (incluindo a ação de bloquear/desbloquear perfil).

**Fluxo principal**
- O Administrador acessa a URL restrita e realiza o login (Autenticação).
- O sistema exibe o Dashboard, contendo KPIs (Profissionais Cadastrados, Agendamentos Realizados).
- O Administrador utiliza a **Busca** para localizar um Profissional por **Nome** ou **E-mail**.
- O Administrador visualiza o **Status de Pagamento** (data do último pagamento) e dados cadastrais.
- O Administrador executa a ação de **Bloquear Perfil** ou **Desbloquear Perfil**.
- O sistema permite a **exportação da lista de Profissionais (CSV)**.

**Fluxos alternativos e exceções**
- O Administrador pode ver a data do último pagamento do Profissional (para identificar se ele está ativo).

**Erros previstos**
- Login Inválido: Retorna a mensagem: "Login ou senha inválidos."

**Prioridade:** alta

---

### Requisitos não funcionais

Performance
- Latência de Resposta (APIs Críticas): O tempo de resposta para $95\%$ das requisições (p95) nas APIs de Busca, Agendamento e Cobrança deve ser **menor que 150 milissegundos (ms)**.

Disponibilidade
- Uptime Mensal (MVP): A disponibilidade alvo em ambiente de Produção é de **90%** (Restrição de MVP/Custo inicial).

Segurança e autorização
- Autenticação: Login e senha obrigatórios para Profissionais e Administradores.
- Autorização: Controle de acesso baseado em papel (RBAC).
- Auditoria (Immutable Log): Todas as alterações sensíveis (ex: valor do serviço, status de pagamento) devem ser registradas com quem, o quê e quando.
- Comunicação: Todo o tráfego deve ser criptografado via **HTTPS (TLS/SSL)**.
- Dados de Pagamento: Dados de cartão de crédito não devem ser armazenados, apenas **tokenizados** pela integração de pagamento.

Observabilidade
- Obrigatório o uso de **logs estruturados** (para fácil busca e análise) e **métricas** de erro por *endpoint*.

Confiabilidade e integridade de dados
- Atualizações de **Status de Pagamento**, **Visibilidade do Profissional** na Busca e **Bloqueio/Desbloqueio da Agenda** devem ser **Transacionais**.

Compatibilidade e portabilidade
- Site responsivo, acessível em navegadores web e dispositivos móveis.

Compliance
- Uso de formatos de moeda, data e endereço **brasileiros (R$)**.

---

### Arquitetura e abordagem

Abordagem
- **Monólito único** contendo toda a lógica de negócio (Cadastro, Agendamento, Pagamento, Busca e Admin) para acelerar o desenvolvimento inicial e a validação de mercado.

Componentes
- **API REST Backend** (para lógica de negócio e comunicação com o frontend).
- **Banco de Dados Único (PostgreSQL - Hipótese)** como fonte de verdade para todos os dados.

Integrações
- **Stripe** (Hipótese) para processamento de pagamentos e recorrência.
- **API de Mensageria (WhatsApp)** para notificações automáticas a Clientes e Profissionais.
- **Serviço de Geolocalização/CEP** para validação e coleta de dados de endereço.

### Decisões e trade-offs

#### Decisão: Uso de Arquitetura Monolítica
- **Justificativa:** Entregar o MVP rapidamente, com custo de infraestrutura inicial menor e com o foco em validar a proposta de valor no mercado.
- **Trade-off:** **Maior dificuldade de escalar** componentes isoladamente no futuro, **maior acoplamento** entre as funcionalidades, dificultando futuras manutenções e evoluções.

---

### Dependências

#### Organizacional: Design/UX do Site Responsivo e Agendamento
O time de Design/UX deve entregar o *layout* e a experiência do usuário (UX) completos, incluindo o fluxo de cadastro do profissional, a busca do cliente e o design do **Calendário de Agendamento** (similar ao Google Calendar).

#### Organizacional: Definição de Termos Legais/Comerciais (Prioridade Média)
A área Jurídica e Comercial deve definir e aprovar os termos de uso, política de privacidade, e a política de cancelamento da mensalidade, **antes da fase de QA/Teste final**.

---

### Riscos e mitigação

#### Falha na integração do sistema de Geolocalização (CEP)
- **Probabilidade:** media
- **Impacto:** Alto (Compromete o valor central do produto).
- **Mitigação:**
  - Definir e testar o contrato de integração da API de CEP **antes** do desenvolvimento.
  - Implementar uma rotina de *caching* dos resultados de CEP válidos.
- **Plano de contingência:** Permitir que o profissional insira manualmente a **Cidade/Estado** (como *fallback*), com validação manual posterior do Administrador (FR-006).

#### Alta taxa de falha na cobrança da mensalidade
- **Probabilidade:** media
- **Impacto:** Alto (Compromete diretamente a meta de receita).
- **Mitigação:**
  - Garantir que o fluxo de pagamento recorrente (Stripe - Hipótese) utilize recursos de *retry* eficientes e validação de cartão em tempo real.
  - Comunicar de forma clara no frontend a **necessidade de um cartão válido**.
- **Plano de contingência:** Notificar o Profissional via **E-mail e WhatsApp** quando a cobrança falhar, e oferecer um link direto para a atualização dos dados do cartão, antes de bloquear o perfil.

#### Perda de Agendamentos devido à baixa disponibilidade (90%)
- **Probabilidade:** alta
- **Impacto:** Alto (Gera frustração para Clientes e Profissionais).
- **Mitigação:**
  - Priorizar a **transacionalidade** e a **observabilidade** dos serviços críticos de **Agendamento** e **Cobrança**.
  - Isolar o **Serviço de Agendamento** dentro do Monólito para facilitar a migração ou escalabilidade prioritária, caso o $90\%$ se mostre insuficiente.
- **Plano de contingência:** Em caso de indisponibilidade, exibir uma mensagem de erro orientando o Cliente a tentar novamente **em 5 minutos**.

---

### Critérios de aceitação
Checklist objetivo que define se a feature está pronta.

- Um novo Profissional consegue concluir o cadastro inicial, e o sistema registra as coordenadas geográficas (latitude/longitude) da cidade com base no CEP fornecido.
- É possível cadastrar um serviço com os 5 campos de preço (Médio, Menor, Maior, Unidade) e realizar o upload de no mínimo 1 e no máximo 5 fotos por serviço.
- O sistema impede o salvamento do serviço se o campo 'Menor Custo' for maior que o 'Custo Médio Estimado'.
- Todo Profissional com pagamento da mensalidade negado **não** tem o botão **"Agendar"** exibido em seu perfil público.
- Se o Profissional ativo for bloqueado pelo Administrador, seu perfil é **removido imediatamente** da lista de resultados da Busca.
- A busca de serviços na cidade **X** não retorna resultados de profissionais cadastrados na cidade **Y**.
- Ao pesquisar em uma cidade sem profissionais cadastrados, a mensagem de erro amigável **"Infelizmente, ainda não temos atendimento que cobre a localidade desejada..."** é exibida.
- Ao selecionar um slot de 1 hora na agenda, o sistema registra o agendamento no backend e **bloqueia imediatamente** o horário para novos clientes.
- O cancelamento de um agendamento pelo Profissional gera automaticamente uma notificação via **WhatsApp** para o Cliente Consumidor.
- O Painel Admin exibe corretamente os contadores (KPIs) de **Total de Profissionais** e **Total de Agendamentos** realizados.

---

### Testes e validação

Tipos de teste obrigatórios
- Testes unitários para regras de negócio críticas (validação de preço, lógica de agendamento).
- Testes de integração para fluxo principal (Cadastro, Pagamento, Busca por CEP).
- Teste de segurança para controle de acesso (permissões de Admin/Profissional).
- Teste de carga para a API de Busca, visando garantir a latência de 150 ms.

Estratégia de validação
- TDD para lógica crítica de estoque de agenda e cálculo de recorrência de pagamento.
- QA manual guiado por roteiro para cobrir todos os fluxos de alta prioridade.
- Validação exploratória interna do time de Produto e QA.
