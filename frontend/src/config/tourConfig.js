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
      content: 'Este é o seu painel. Um tour rápido pelo que você vai usar no dia a dia.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar-nav"]',
      title: 'Menu',
      content: 'Pelo menu você vai à agenda (Painel), aos seus serviços e aos seus horários.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-dashboard"]',
      title: 'Sua agenda',
      content: 'Aqui ficam os agendamentos da semana. Livre fica em branco, agendado em azul e bloqueado riscado.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-services"]',
      title: 'Seus serviços',
      content: 'Cadastre os serviços que você oferece, com o preço e se é por hora ou por dia.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-schedule"]',
      title: 'Horários de atendimento',
      content: 'Marque os dias e horários em que você atende. Os clientes só agendam dentro deles.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-subscription"]',
      title: 'Sua assinatura',
      content: 'Veja o seu plano e as cobranças. Com o plano ativo, seu perfil aparece na busca.',
      placement: 'right',
    },
  ],

  // Tour da aba Servicos
  services: [
    {
      target: '[data-tour="add-service-form"]',
      title: 'Adicionar serviço',
      content: 'Preencha o nome, o preço e se o serviço é por hora ou por dia.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="service-title"]',
      title: 'Nome do serviço',
      content: 'Use um nome claro, como "Instalação de tomadas".',
      placement: 'right',
    },
    {
      target: '[data-tour="service-price"]',
      title: 'Preço',
      content: 'O preço aparece para o cliente no seu cartão da busca e no seu perfil.',
      placement: 'right',
    },
    {
      target: '[data-tour="service-duration"]',
      title: 'Por hora ou por dia',
      content: 'Por hora: serviços curtos. Por dia: serviços que ocupam o dia todo.',
      placement: 'right',
    },
    {
      target: '[data-tour="services-list"]',
      title: 'Seus serviços',
      content: 'Os serviços cadastrados ficam aqui. Dá para pôr uma foto ou excluir.',
      placement: 'top',
    },
  ],

  // Tour da aba Horarios
  schedule: [
    {
      target: '[data-tour="schedule-form"]',
      title: 'Seus horários',
      content: 'Defina os dias e horários em que você trabalha.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="schedule-day"]',
      title: 'Dia da semana',
      content: 'Escolha o dia que você quer marcar.',
      placement: 'right',
    },
    {
      target: '[data-tour="schedule-start"]',
      title: 'Início',
      content: 'Quando você começa a atender neste dia.',
      placement: 'right',
    },
    {
      target: '[data-tour="schedule-end"]',
      title: 'Término',
      content: 'Quando você encerra o atendimento.',
      placement: 'right',
    },
    {
      target: '[data-tour="schedule-list"]',
      title: 'Horários marcados',
      content: 'Seus horários de atendimento, dia a dia.',
      placement: 'top',
    },
  ],

  // Tour da agenda/calendario
  calendar: [
    {
      target: '[data-tour="calendar-navigation"]',
      title: 'Outras semanas',
      content: 'Use as setas para ver outras semanas.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="calendar-grid"]',
      title: 'A semana',
      content: 'A semana inteira. Toque num agendamento para ver os detalhes; para fechar um horário, use Bloquear horário.',
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
      content: 'Aqui você acompanha os serviços que agendou com os profissionais. Um tour rápido!',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="client-nav"]',
      title: 'Menu',
      content: 'Pelo menu você vai aos seus agendamentos, ao histórico e às notificações.',
      placement: 'right',
    },
    {
      target: '[data-tour="client-appointments"]',
      title: 'Seus agendamentos',
      content: 'Aqui ficam os serviços que você agendou: os próximos e os anteriores.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="client-account"]',
      title: 'Sua conta',
      content: 'Atualize aqui seus dados e o endereço onde o serviço é feito.',
      placement: 'bottom',
    },
  ],

  // Tour de busca
  search: [
    {
      target: '[data-tour="search-input"]',
      title: 'Buscar serviço',
      content: 'Digite o serviço que você precisa, como "eletricista".',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="search-cep"]',
      title: 'Sua região',
      content: 'Digite seu CEP para ver quem atende perto de você.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="search-results"]',
      title: 'Resultados',
      content: 'Compare os profissionais pelas avaliações, pelos serviços e pelos preços.',
      placement: 'top',
    },
  ],

  // Tour de agendamento
  booking: [
    {
      target: '[data-tour="booking-services"]',
      title: 'Escolha o serviço',
      content: 'Escolha o serviço que você precisa.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="booking-calendar"]',
      title: 'Escolha o dia',
      content: 'Escolha o melhor dia para você.',
      placement: 'left',
    },
    {
      target: '[data-tour="booking-slots"]',
      title: 'Horários livres',
      content: 'Só aparecem os horários livres. Escolha o melhor para você.',
      placement: 'top',
    },
    {
      target: '[data-tour="booking-confirm"]',
      title: 'Confirmar',
      content: 'Confira o pedido e confirme o agendamento.',
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
