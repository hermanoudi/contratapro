import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Search from './pages/Search';
import RegisterProfessional from './pages/RegisterProfessional';
import RegisterClient from './pages/RegisterClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentDetail from './pages/AppointmentDetail';
import History from './pages/History';
import SubscriptionSetup from './pages/SubscriptionSetup';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import SubscriptionCallback from './pages/SubscriptionCallback';
import MySubscription from './pages/MySubscription';
import ChangePlan from './pages/ChangePlan';
import ProfessionalProfile from './pages/ProfessionalProfile';
import AdminTrials from './pages/AdminTrials';
import MyNotifications from './pages/MyNotifications';
import ResetPassword from './pages/ResetPassword';
import ReviewSubmit from './pages/ReviewSubmit';
import ServiceCategory from './pages/ServiceCategory';
import ProfessionalLayout from './components/ProfessionalLayout';
import ClientLayout from './components/ClientLayout';
import SharedLayout from './components/SharedLayout';
import { TourProvider } from './contexts/TourContext';
import { TalaoTokens } from './components/talao';

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
              borderTop: '3px solid #4caf73',
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
          <Route path="/admin/trials" element={<AdminTrials />} />
          <Route path="/appointment/:id" element={<SharedLayout><AppointmentDetail /></SharedLayout>} />
          <Route path="/history" element={<SharedLayout><History /></SharedLayout>} />
          <Route path="/subscription/setup" element={<SubscriptionSetup />} />
          <Route path="/subscription/checkout" element={<SubscriptionCheckout />} />
          <Route path="/subscription/callback" element={<SubscriptionCallback />} />
          <Route path="/subscription/manage" element={<ProfessionalLayout><MySubscription /></ProfessionalLayout>} />
          <Route path="/minha-assinatura" element={<ProfessionalLayout><MySubscription /></ProfessionalLayout>} />
          <Route path="/alterar-plano" element={<ProfessionalLayout><ChangePlan /></ProfessionalLayout>} />
          <Route path="/profile" element={<ProfessionalLayout><ProfessionalProfile /></ProfessionalLayout>} />
          <Route path="/notifications" element={<SharedLayout><MyNotifications /></SharedLayout>} />
        </Routes>
      </div>
    </Router>
    </TourProvider>
  );
}

export default App;
