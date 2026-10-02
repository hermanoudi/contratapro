/* Dados de SEO compartilhados (separados do componente por causa do Fast Refresh). */

// Configurações pré-definidas para páginas comuns
export const SEO_CONFIGS = {
  home: {
    title: 'ContrataPro - Encontre Profissionais na sua Região',
    description: 'Encontre profissionais autônomos da sua região (eletricista, encanador, diarista, manicure e muito mais) e marque horário direto na agenda deles. Grátis para quem contrata.',
    keywords: 'serviços, prestadores de serviços, profissionais autônomos, contratapro, eletricista, encanador, manicure, diarista, marido de aluguel, pintor, pedreiro, jardineiro'
  },
  search: {
    title: 'Buscar Profissionais',
    description: 'Busque profissionais por serviço e região, compare preços e avaliações e agende online.',
    keywords: 'buscar profissionais, encontrar serviços, prestadores perto de mim'
  },
  registerPro: {
    title: 'Cadastre-se como Profissional',
    description: 'Cadastre-se grátis no ContrataPro, sem cartão, e receba agendamentos de clientes da sua região direto na sua agenda.',
    keywords: 'cadastro profissional, trabalhar como autônomo, divulgar serviços'
  },
  registerClient: {
    title: 'Criar Conta',
    description: 'Crie sua conta no ContrataPro e agende serviços com profissionais da sua região.',
    keywords: 'criar conta, cadastro cliente, contratar serviços'
  },
  login: {
    title: 'Entrar',
    description: 'Acesse sua conta no ContrataPro.',
    noIndex: true
  }
};

// Categorias populares para SEO
export const POPULAR_CATEGORIES = [
  { slug: 'eletricista', name: 'Eletricista', keywords: 'eletricista, instalação elétrica, reparos elétricos' },
  { slug: 'encanador', name: 'Encanador', keywords: 'encanador, hidráulica, vazamentos, canos' },
  { slug: 'manicure', name: 'Manicure', keywords: 'manicure, pedicure, unhas, nail designer' },
  { slug: 'diarista', name: 'Diarista', keywords: 'diarista, faxineira, limpeza residencial' },
  { slug: 'marido-de-aluguel', name: 'Marido de Aluguel', keywords: 'marido de aluguel, pequenos reparos, consertos domésticos' },
  { slug: 'pintor', name: 'Pintor', keywords: 'pintor, pintura residencial, pintura predial' },
  { slug: 'pedreiro', name: 'Pedreiro', keywords: 'pedreiro, construção, reformas, alvenaria' },
  { slug: 'jardineiro', name: 'Jardineiro', keywords: 'jardineiro, paisagismo, manutenção de jardins' },
  { slug: 'mecanico', name: 'Mecânico', keywords: 'mecânico, conserto de carros, manutenção automotiva' },
  { slug: 'personal-trainer', name: 'Personal Trainer', keywords: 'personal trainer, educador físico, treinador' },
  { slug: 'cabeleireiro', name: 'Cabeleireiro', keywords: 'cabeleireiro, corte de cabelo, salão de beleza' },
  { slug: 'fotografo', name: 'Fotógrafo', keywords: 'fotógrafo, fotografia, ensaio fotográfico' }
];
