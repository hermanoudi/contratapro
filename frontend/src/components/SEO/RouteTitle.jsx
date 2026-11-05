import { matchPath, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEOHead from './SEOHead';
import { SEO_CONFIGS } from './seoData';

/* Título de cada rota, num lugar só: a aba do navegador e o leitor de tela dizem
   em que página a pessoa está. Páginas com SEO próprio (Home, Busca, Categoria,
   perfil do profissional) declaram o delas por cima deste, que vale como reserva. */

// Públicas e indexáveis: descrição e canônico completos
const INDEXED = [
  { path: '/register-pro', seo: SEO_CONFIGS.registerPro, url: 'https://contratapro.com.br/register-pro' },
  { path: '/register-client', seo: SEO_CONFIGS.registerClient, url: 'https://contratapro.com.br/register-client' },
];

// Áreas logadas, links pessoais e passos de fluxo: só o título, fora dos buscadores (exceto o perfil)
const PRIVATE = [
  { path: '/login', title: 'Entrar' },
  { path: '/nova-senha', title: 'Criar nova senha' },
  { path: '/avaliar/:token', title: 'Avaliar atendimento' },
  { path: '/dashboard', title: 'Painel do profissional' },
  { path: '/my-appointments', title: 'Meus agendamentos' },
  { path: '/admin/*', title: 'Administração' },
  { path: '/appointment/:id', title: 'Detalhe do agendamento' },
  { path: '/history', title: 'Histórico' },
  { path: '/notifications', title: 'Notificações' },
  { path: '/subscription/setup', title: 'Escolha seu plano' },
  { path: '/subscription/callback', title: 'Pagamento da assinatura' },
  { path: '/subscription/manage', title: 'Minha assinatura' },
  { path: '/minha-assinatura', title: 'Minha assinatura' },
  { path: '/alterar-plano', title: 'Alterar o plano' },
  { path: '/profile', title: 'Meu perfil' },
  // Perfil público: só a reserva enquanto carrega; o Booking põe nome e indexação
  { path: '/p/:slug', title: 'Perfil do profissional', indexable: true },
  { path: '/book/:id', title: 'Perfil do profissional', indexable: true },
];

const find = (list, pathname) => list.find((r) => matchPath(r.path, pathname));

export default function RouteTitle() {
  const { pathname } = useLocation();

  const indexed = find(INDEXED, pathname);
  if (indexed) return <SEOHead {...indexed.seo} url={indexed.url} />;

  const page = find(PRIVATE, pathname);
  if (!page) return null;

  return (
    <Helmet>
      <title>{`${page.title} | ContrataPro`}</title>
      {!page.indexable && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
