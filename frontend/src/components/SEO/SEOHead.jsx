import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://contratapro.com.br';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const defaultMeta = {
  title: 'ContrataPro - Encontre Profissionais na sua Regiao',
  description: 'Encontre e contrate profissionais qualificados para servicos residenciais: eletricista, encanador, manicure, diarista, marido de aluguel e muito mais.',
  keywords: 'servicos, prestadores de servicos, profissionais, eletricista, encanador, manicure, diarista, marido de aluguel, pintor, pedreiro, jardineiro, limpeza, reformas, consertos',
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
  // Para paginas de categoria/servico
  category,
  city,
  // Para perfis de profissionais
  professional
}) {
  // Construir titulo dinamico
  let finalTitle = title || defaultMeta.title;
  if (category && city) {
    finalTitle = `${category} em ${city} - ContrataPro`;
  } else if (category) {
    finalTitle = `${category} - Encontre Profissionais | ContrataPro`;
  } else if (title && !title.includes('ContrataPro')) {
    finalTitle = `${title} | ContrataPro`;
  }

  // Construir descricao dinamica
  let finalDescription = description || defaultMeta.description;
  if (category && city) {
    finalDescription = `Encontre os melhores profissionais de ${category} em ${city}. Agendamento online, profissionais verificados e avaliados. Contrate agora!`;
  } else if (category) {
    finalDescription = `Encontre profissionais de ${category} qualificados na sua regiao. Compare precos, veja avaliacoes e agende online. ContrataPro.`;
  }

  // Construir keywords dinamicas
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

  // Para perfis de profissionais
  if (professional) {
    finalTitle = `${professional.name} - ${professional.category} | ContrataPro`;
    finalDescription = professional.description ||
      `${professional.name} e profissional de ${professional.category}. Veja avaliacoes, servicos oferecidos e agende online no ContrataPro.`;
  }

  return (
    <Helmet>
      {/* Basico */}
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

// Configuracoes pre-definidas para paginas comuns
export const SEO_CONFIGS = {
  home: {
    title: 'ContrataPro - Encontre Profissionais na sua Regiao',
    description: 'Plataforma para encontrar e contratar profissionais qualificados. Eletricista, encanador, manicure, diarista, marido de aluguel e mais de 50 categorias.',
    keywords: 'servicos, prestadores de servicos, profissionais, contratapro, eletricista, encanador, manicure, diarista, marido de aluguel, pintor, pedreiro, jardineiro'
  },
  search: {
    title: 'Buscar Profissionais',
    description: 'Busque profissionais por categoria, localizacao e avaliacao. Compare precos e agende online.',
    keywords: 'buscar profissionais, encontrar servicos, prestadores perto de mim'
  },
  registerPro: {
    title: 'Cadastre-se como Profissional',
    description: 'Cadastre-se no ContrataPro e comece a receber clientes. Aumente sua visibilidade e gerencie seus agendamentos.',
    keywords: 'cadastro profissional, trabalhar como autonomo, divulgar servicos'
  },
  registerClient: {
    title: 'Criar Conta',
    description: 'Crie sua conta no ContrataPro e encontre os melhores profissionais para seus servicos.',
    keywords: 'criar conta, cadastro cliente, contratar servicos'
  },
  login: {
    title: 'Entrar',
    description: 'Acesse sua conta no ContrataPro.',
    noIndex: true
  }
};

// Categorias populares para SEO
export const POPULAR_CATEGORIES = [
  { slug: 'eletricista', name: 'Eletricista', keywords: 'eletricista, instalacao eletrica, reparos eletricos' },
  { slug: 'encanador', name: 'Encanador', keywords: 'encanador, hidraulica, vazamentos, canos' },
  { slug: 'manicure', name: 'Manicure', keywords: 'manicure, pedicure, unhas, nail designer' },
  { slug: 'diarista', name: 'Diarista', keywords: 'diarista, faxineira, limpeza residencial' },
  { slug: 'marido-de-aluguel', name: 'Marido de Aluguel', keywords: 'marido de aluguel, pequenos reparos, consertos domesticos' },
  { slug: 'pintor', name: 'Pintor', keywords: 'pintor, pintura residencial, pintura predial' },
  { slug: 'pedreiro', name: 'Pedreiro', keywords: 'pedreiro, construcao, reformas, alvenaria' },
  { slug: 'jardineiro', name: 'Jardineiro', keywords: 'jardineiro, paisagismo, manutencao de jardins' },
  { slug: 'mecanico', name: 'Mecanico', keywords: 'mecanico, conserto de carros, manutencao automotiva' },
  { slug: 'personal-trainer', name: 'Personal Trainer', keywords: 'personal trainer, educador fisico, treinador' },
  { slug: 'cabeleireiro', name: 'Cabeleireiro', keywords: 'cabeleireiro, corte de cabelo, salao de beleza' },
  { slug: 'fotografo', name: 'Fotografo', keywords: 'fotografo, fotografia, ensaio fotografico' }
];
