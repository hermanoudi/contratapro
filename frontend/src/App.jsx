import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import { TourProvider } from './contexts/TourContext';
import { TalaoTokens } from './components/talao';

// Só a Home vai no pacote inicial; o resto baixa quando a rota abre
const Search = lazy(() => import('./pages/Search'));
const RegisterProfessional = lazy(() => import('./pages/RegisterProfessional'));
const RegisterClient = lazy(() => import('./pages/RegisterClient'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Booking = lazy(() => import('./pages/Booking'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AppointmentDetail = lazy(() => import('./pages/AppointmentDetail'));
const History = lazy(() => import('./pages/History'));
const SubscriptionSetup = lazy(() => import('./pages/SubscriptionSetup'));
const SubscriptionCallback = lazy(() => import('./pages/SubscriptionCallback'));
const MySubscription = lazy(() => import('./pages/MySubscription'));
const ChangePlan = lazy(() => import('./pages/ChangePlan'));
const ProfessionalProfile = lazy(() => import('./pages/ProfessionalProfile'));
const MyNotifications = lazy(() => import('./pages/MyNotifications'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ReviewSubmit = lazy(() => import('./pages/ReviewSubmit'));
const ServiceCategory = lazy(() => import('./pages/ServiceCategory'));
const ProfessionalLayout = lazy(() => import('./components/ProfessionalLayout'));
const ClientLayout = lazy(() => import('./components/ClientLayout'));
const SharedLayout = lazy(() => import('./components/SharedLayout'));

// Enquanto a página baixa: papel em branco e um aviso para leitor de tela
function PageLoading() {
  return (
    <div role="status" style={{ minHeight: '100vh', background: 'var(--papel)' }}>
      <span className="sr-only">Carregando a página…</span>
    </div>
  );
}

function App() {
  return (
    <TourProvider>
    <Router>
      <TalaoTokens />
      <Toaster
        position="top-right"
        expand={false}
        richColors={false}
        toastOptions={{
          // Tira impressa: nanquim, canto reto, faixa de status no alto
          style: {
            borderRadius: '2px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: '500',
            background: 'var(--nanquim)',
            color: 'var(--papel)',
            border: 'none',
            borderTop: '3px solid var(--grafica)',
            boxShadow: '0 16px 28px -18px rgba(23, 23, 27, 0.6), 0 2px 4px rgba(23, 23, 27, 0.2)',
            fontFamily: 'var(--f-texto)',
          },
          success: {
            style: {
              borderTop: '3px solid var(--sucesso)',
            },
          },
          error: {
            style: {
              borderTop: '3px solid var(--grafica)',
            },
          },
          warning: {
            style: {
              borderTop: '3px solid var(--amarela)',
            },
          },
        }}
      />
      <div className="app-container">
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/servicos/:categoria" element={<ServiceCategory />} />
          <Route path="/register-pro" element={<RegisterProfessional />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nova-senha" element={<ResetPassword />} />
          <Route path="/avaliar/:token" element={<ReviewSubmit />} />
          <Route path="/dashboard" element={<ProfessionalLayout><Dashboard /></ProfessionalLayout>} />
          <Route path="/p/:slug" element={<Booking />} />
          <Route path="/book/:id" element={<Booking />} />
          <Route path="/my-appointments" element={<ClientLayout><ClientDashboard /></ClientLayout>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/appointment/:id" element={<SharedLayout><AppointmentDetail /></SharedLayout>} />
          <Route path="/history" element={<SharedLayout><History /></SharedLayout>} />
          <Route path="/subscription/setup" element={<SubscriptionSetup />} />
          <Route path="/subscription/callback" element={<SubscriptionCallback />} />
          <Route path="/subscription/manage" element={<ProfessionalLayout><MySubscription /></ProfessionalLayout>} />
          <Route path="/minha-assinatura" element={<ProfessionalLayout><MySubscription /></ProfessionalLayout>} />
          <Route path="/alterar-plano" element={<ProfessionalLayout><ChangePlan /></ProfessionalLayout>} />
          <Route path="/profile" element={<ProfessionalLayout><ProfessionalProfile /></ProfessionalLayout>} />
          <Route path="/notifications" element={<SharedLayout><MyNotifications /></SharedLayout>} />
        </Routes>
        </Suspense>
      </div>
    </Router>
    </TourProvider>
  );
}

export default App;
