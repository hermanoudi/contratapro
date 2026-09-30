import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://contratapro.com.br';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

// Textos de busca seguem o PRODUCT.md: o ContrataPro não verifica profissionais, então nada de "verificados" ou "qualificados"
const defaultMeta = {
  title: 'ContrataPro - Encontre Profissionais na sua Região',
  description: 'Encontre profissionais autônomos perto de você e marque horário direto na agenda deles: eletricista, encanador, manicure, diarista, marido de aluguel e muito mais. Grátis para quem contrata.',
  keywords: 'serviços, prestadores de serviços, profissionais autônomos, eletricista, encanador, manicure, diarista, marido de aluguel, pintor, pedreiro, jardineiro, limpeza, reformas, consertos',
  image: DEFAULT_IMAGE,
  url: BASE_URL,
  type: 'website'
};

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  // Para páginas de categoria/serviço
  category,
  city,
  // Para perfis de profissionais
  professional
}) {
  // Título dinâmico
  let finalTitle = title || defaultMeta.title;
  if (category && city) {
    finalTitle = `${category} em ${city} - ContrataPro`;
  } else if (category) {
    finalTitle = `${category} - Encontre Profissionais | ContrataPro`;
  } else if (title && !title.includes('ContrataPro')) {
    finalTitle = `${title} | ContrataPro`;
  }

  // Descrição dinâmica
  let finalDescription = description || defaultMeta.description;
  if (category && city) {
    finalDescription = `Profissionais de ${category} em ${city}: veja perfis, serviços, preços e avaliações de quem já agendou, e marque horário direto na agenda do profissional.`;
  } else if (category) {
    finalDescription = `Profissionais de ${category} na sua região: veja perfis, serviços, preços e avaliações, e marque horário online. Grátis para quem contrata.`;
  }

  // Keywords dinâmicas
  let finalKeywords = keywords || defaultMeta.keywords;
  if (category) {
    const categoryKeywords = [
      category.toLowerCase(),
      `${category.toLowerCase()} perto de mim`,
      `contratar ${category.toLowerCase()}`,
      `${category.toLowerCase()} profissional`,
      city ? `${category.toLowerCase()} em ${city}` : '',
      city ? `${category.toLowerCase()} ${city}` : ''
    ].filter(Boolean).join(', ');
    finalKeywords = `${categoryKeywords}, ${defaultMeta.keywords}`;
  }

  const finalImage = image || defaultMeta.image;
  const finalUrl = url || defaultMeta.url;
  const finalType = type;

  // Perfis de profissionais
  if (professional) {
    const role = professional.category ? ` - ${professional.category}` : '';
    finalTitle = `${professional.name}${role} | ContrataPro`;
    finalDescription = professional.description ||
      (professional.category
        ? `${professional.name} é profissional de ${professional.category}. Veja serviços, preços e avaliações e agende online no ContrataPro.`
        : `Veja os serviços, preços e avaliações de ${professional.name} e agende online no ContrataPro.`);
  }

  return (
    <Helmet>
      {/* Básico */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={finalType} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="ContrataPro" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Geo */}
      <meta name="geo.region" content="BR" />
      {city && <meta name="geo.placename" content={city} />}
    </Helmet>
  );
}

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
