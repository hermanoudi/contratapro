import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import { ADMIN_TABS } from '../components/admin/adminParts';
import { PageHead } from '../components/dashboard/parts';
import Overview from '../components/admin/Overview';
import ProfessionalsPanel from '../components/admin/ProfessionalsPanel';
import ClientsPanel from '../components/admin/ClientsPanel';
import SubscriptionsPanel from '../components/admin/SubscriptionsPanel';
import CategoriesPanel from '../components/admin/CategoriesPanel';
import PasswordPanel from '../components/admin/PasswordPanel';

/* Painel do admin no registro contido: uma aba por vez (?tab=), cada uma
   carrega os próprios dados. O backend confere is_admin em todas as rotas;
   a checagem aqui só evita mostrar a tela a quem não é admin. */

const PANELS = {
  overview: { component: Overview, lead: 'Como a plataforma está hoje.' },
  professionals: { component: ProfessionalsPanel, lead: 'Todos os profissionais, com suspensão e reativação.' },
  clients: { component: ClientsPanel, lead: 'Quem se cadastrou para contratar.' },
  subscriptions: { component: SubscriptionsPanel, lead: 'Assinaturas pagas no Mercado Pago.' },
  categories: { component: CategoriesPanel, lead: 'As categorias que aparecem na busca e nos cadastros.' },
  settings: { component: PasswordPanel, lead: 'A senha da sua conta de admin.' },
};

const readIsAdmin = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? !!JSON.parse(atob(token.split('.')[1])).is_admin : null;
  } catch {
    return null;
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAdmin] = useState(readIsAdmin);
  const tab = PANELS[searchParams.get('tab')] ? searchParams.get('tab') : 'overview';

  useEffect(() => {
    if (isAdmin === null) navigate('/login');
    else if (!isAdmin) {
      toast.error('Esta área é só para administradores.');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const { component: Panel, lead } = PANELS[tab];
  const title = ADMIN_TABS.find((t) => t.key === tab).label;

  return (
    <AdminLayout active={tab}>
      <PageHead>
        <div>
          <h1 data-display>{title}</h1>
          <p>{lead}</p>
        </div>
      </PageHead>
      <Panel />
    </AdminLayout>
  );
}
