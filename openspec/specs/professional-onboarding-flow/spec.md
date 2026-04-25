## ADDED Requirements

### Requirement: Exibir stepper de onboarding para profissionais com perfil incompleto
Após o primeiro login de um profissional recém-cadastrado, o sistema SHALL exibir um overlay de boas-vindas com stepper de 3 etapas: (1) Completar perfil, (2) Cadastrar serviços, (3) Definir disponibilidade. O overlay SHALL ser descartável e não reaparecer após ser dispensado ou após todas as etapas serem concluídas. O estado SHALL ser persistido em `localStorage` com a chave `onboarding_dismissed_<userId>`.

#### Scenario: Profissional novo vê o stepper ao entrar no dashboard
- **WHEN** um profissional com `profile_completion < 100%` acessa `/dashboard` pela primeira vez (sem chave `onboarding_dismissed_<userId>` no localStorage)
- **THEN** o sistema exibe um overlay com o componente `OnboardingSteps` mostrando as 3 etapas e a etapa atual destacada

#### Scenario: Profissional dispensa o stepper
- **WHEN** o profissional clica em "Agora não" ou no botão X do overlay
- **THEN** o sistema define `localStorage.onboarding_dismissed_<userId> = true` e oculta o overlay; o stepper não reaparece em sessões futuras

#### Scenario: Profissional conclui todas as etapas
- **WHEN** todas as 3 etapas estiverem marcadas como concluídas (perfil preenchido + ao menos 1 serviço + disponibilidade configurada)
- **THEN** o overlay exibe uma mensagem de parabéns e fecha automaticamente após 3 segundos, definindo o flag no localStorage

### Requirement: Barra de completude de perfil no dashboard
O dashboard do profissional SHALL exibir uma barra de progresso visual indicando a porcentagem de completude do perfil (foto, bio, cidade, serviços cadastrados). A barra SHALL aparecer no topo do dashboard quando a completude for inferior a 100% e SHALL linkar para a seção correspondente ao clicar em cada item faltante.

#### Scenario: Barra exibida com perfil incompleto
- **WHEN** o profissional acessa o dashboard com campos de perfil faltando (ex: sem foto ou sem bio)
- **THEN** o sistema exibe `ProfileCompletionBar` com percentual calculado e lista dos itens pendentes como links clicáveis

#### Scenario: Barra oculta com perfil completo
- **WHEN** o profissional tem foto, bio, cidade e ao menos 1 serviço cadastrado
- **THEN** o sistema NÃO exibe a `ProfileCompletionBar`
