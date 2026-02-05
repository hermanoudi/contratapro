/**
 * Configuracao do Tour Guiado - ContrataPro
 *
 * Biblioteca: react-joyride
 * Documentacao: https://docs.react-joyride.com/
 */

// ============================================
// TOUR DO PROFISSIONAL
// ============================================

export const tourStepsProfessional = {
  // Tour de boas-vindas (primeiro login)
  welcome: [
    {
      target: 'body',
      title: 'Bem-vindo ao ContrataPro!',
      content: 'Este e seu painel de controle. Vamos fazer um tour rapido para voce conhecer as principais funcionalidades.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar-nav"]',
      title: 'Menu de Navegacao',
      content: 'Use o menu lateral para navegar entre Dashboard (agenda), Servicos e Horarios.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-dashboard"]',
      title: 'Sua Agenda',
      content: 'Aqui voce ve todos os agendamentos da semana. Verde = disponivel, Vermelho = ocupado.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-services"]',
      title: 'Seus Servicos',
      content: 'Cadastre os servicos que voce oferece, com precos e tipo de duracao.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-schedule"]',
      title: 'Horarios de Trabalho',
      content: 'Configure os dias e horarios que voce esta disponivel para atender.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-subscription"]',
      title: 'Sua Assinatura',
      content: 'Gerencie seu plano e mantenha sua assinatura ativa para aparecer nas buscas.',
      placement: 'right',
    },
  ],

  // Tour da aba Servicos
  services: [
    {
      target: '[data-tour="add-service-form"]',
      title: 'Adicionar Servico',
      content: 'Preencha o nome, preco e tipo de duracao do servico.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="service-title"]',
      title: 'Nome do Servico',
      content: 'Use um nome claro e objetivo. Ex: "Instalacao de Tomadas"',
      placement: 'right',
    },
    {
      target: '[data-tour="service-price"]',
      title: 'Preco',
      content: 'Defina um valor justo. O preco aparece para o cliente na busca.',
      placement: 'right',
    },
    {
      target: '[data-tour="service-duration"]',
      title: 'Tipo de Duracao',
      content: 'Hora: servicos rapidos (1h). Dia: servicos que ocupam o dia todo.',
      placement: 'right',
    },
    {
      target: '[data-tour="services-list"]',
      title: 'Seus Servicos',
      content: 'Servicos cadastrados aparecem aqui. Voce pode adicionar imagens e excluir.',
      placement: 'top',
    },
  ],

  // Tour da aba Horarios
  schedule: [
    {
      target: '[data-tour="schedule-form"]',
      title: 'Configurar Horarios',
      content: 'Defina os dias e horarios que voce trabalha.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="schedule-day"]',
      title: 'Dia da Semana',
      content: 'Escolha o dia que voce quer configurar.',
      placement: 'right',
    },
    {
      target: '[data-tour="schedule-start"]',
      title: 'Horario de Inicio',
      content: 'Quando voce comeca a atender neste dia.',
      placement: 'right',
    },
    {
      target: '[data-tour="schedule-end"]',
      title: 'Horario de Termino',
      content: 'Quando voce encerra o atendimento.',
      placement: 'right',
    },
    {
      target: '[data-tour="schedule-list"]',
      title: 'Horarios Configurados',
      content: 'Seus horarios de trabalho organizados por dia.',
      placement: 'top',
    },
  ],

  // Tour da agenda/calendario
  calendar: [
    {
      target: '[data-tour="calendar-navigation"]',
      title: 'Navegacao da Semana',
      content: 'Use as setas para ver outras semanas.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="calendar-grid"]',
      title: 'Grade de Horarios',
      content: 'Veja sua semana completa. Clique em horarios para bloquear ou ver detalhes.',
      placement: 'top',
    },
  ],
};

// ============================================
// TOUR DO CLIENTE
// ============================================

export const tourStepsClient = {
  // Tour de boas-vindas (primeiro login)
  welcome: [
    {
      target: 'body',
      title: 'Bem-vindo ao ContrataPro!',
      content: 'Aqui voce encontra profissionais verificados para qualquer servico. Vamos conhecer a plataforma!',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="client-nav"]',
      title: 'Menu',
      content: 'Navegue entre Meus Agendamentos e Minha Conta.',
      placement: 'right',
    },
    {
      target: '[data-tour="client-appointments"]',
      title: 'Seus Agendamentos',
      content: 'Aqui voce ve todos os servicos que agendou com profissionais.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="client-account"]',
      title: 'Sua Conta',
      content: 'Atualize seus dados pessoais e endereco aqui.',
      placement: 'bottom',
    },
  ],

  // Tour de busca
  search: [
    {
      target: '[data-tour="search-input"]',
      title: 'Buscar Servico',
      content: 'Digite o servico que voce precisa. Ex: "Eletricista"',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="search-cep"]',
      title: 'Sua Localizacao',
      content: 'Digite seu CEP para encontrar profissionais proximos.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="search-results"]',
      title: 'Resultados',
      content: 'Compare profissionais pela avaliacao, servicos e precos.',
      placement: 'top',
    },
  ],

  // Tour de agendamento
  booking: [
    {
      target: '[data-tour="booking-services"]',
      title: 'Escolha o Servico',
      content: 'Clique no servico que voce precisa.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="booking-calendar"]',
      title: 'Escolha a Data',
      content: 'Selecione o melhor dia para voce.',
      placement: 'left',
    },
    {
      target: '[data-tour="booking-slots"]',
      title: 'Horarios Disponiveis',
      content: 'Verde = livre. Escolha o melhor horario!',
      placement: 'top',
    },
    {
      target: '[data-tour="booking-confirm"]',
      title: 'Confirmar',
      content: 'Revise e confirme seu agendamento.',
      placement: 'top',
    },
  ],
};

// ============================================
// CONFIGURACOES GLOBAIS (EXPORTADAS PARA TourContext)
// ============================================

export const tourOptions = {
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  disableOverlayClose: false,
  spotlightClicks: true,
  scrollToFirstStep: true,
  scrollOffset: 100,
  locale: {
    back: 'Voltar',
    close: 'Fechar',
    last: 'Finalizar',
    next: 'Proximo',
    skip: 'Pular tour',
  },
};
