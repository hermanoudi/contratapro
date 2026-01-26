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
import ProfessionalProfile from './pages/ProfessionalProfile';
import AdminTrials from './pages/AdminTrials';
import MyNotifications from './pages/MyNotifications';
import ResetPassword from './pages/ResetPassword';
import ProfessionalLayout from './components/ProfessionalLayout';
import ClientLayout from './components/ClientLayout';
import SharedLayout from './components/SharedLayout';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        expand={false}
        richColors={false}
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            background: '#0f172a',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            fontFamily: 'var(--font-sans)',
          },
          success: {
            style: {
              borderLeft: '4px solid #10b981',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #ef4444',
            },
          },
          warning: {
            style: {
              borderLeft: '4px solid #f59e0b',
            },
          },
        }}
      />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/register-pro" element={<RegisterProfessional />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nova-senha" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProfessionalLayout><Dashboard /></ProfessionalLayout>} />
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
          <Route path="/profile" element={<ProfessionalLayout><ProfessionalProfile /></ProfessionalLayout>} />
          <Route path="/notifications" element={<SharedLayout><MyNotifications /></SharedLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
