import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Users, Briefcase, Calendar, Shield, Power, DollarSign, TrendingUp, MapPin, CheckCircle, XCircle, AlertCircle, PauseCircle, Filter, Clock, Settings, Lock, Eye, EyeOff, Tag, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';
import PasswordInput from '../components/PasswordInput';
const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
`;

const Sidebar = styled.div`
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 2rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 968px) {
    display: none;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);

  h1 {
    fontSize: 2rem;
    fontWeight: 800;
    margin: 0;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  .avatar {
    width: 32px;
    height: 32px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .details {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .logout {
    font-size: 0.75rem;
    color: #ef4444;
    cursor: pointer;
    font-weight: 700;
    text-align: left;
    background: none;
    border: none;
    padding: 0;
    margin-top: 2px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bgColor || 'var(--primary-glow)'};
    color: ${props => props.$color || 'var(--primary)'};
  }

  .info {
    flex: 1;
    h3 { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 0.25rem; }
    p { font-size: 1.75rem; font-weight: 800; margin: 0; color: var(--text-primary); }
    small { font-size: 0.75rem; color: var(--text-secondary); }
  }
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
    color: var(--text-primary);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    background: var(--bg-secondary);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  tbody tr:hover {
    background: var(--bg-secondary);
  }
`;

const Badge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: ${props => {
    switch(props.$status) {
      case 'active': return 'rgba(34, 197, 94, 0.1)';
      case 'inactive': return 'rgba(156, 163, 175, 0.1)';
      case 'cancelled': return 'rgba(239, 68, 68, 0.1)';
      case 'suspended': return 'rgba(251, 146, 60, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'active': return '#16a34a';
      case 'inactive': return '#6b7280';
      case 'cancelled': return '#dc2626';
      case 'suspended': return '#ea580c';
      default: return '#6b7280';
    }
  }};
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: ${props => props.$variant === 'danger' ? '#ef4444' : 'white'};
  color: ${props => props.$variant === 'danger' ? 'white' : 'var(--text-primary)'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#dc2626' : 'var(--bg-secondary)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  select {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: white;
    color: var(--text-primary);
    font-size: 0.875rem;
  }
`;

const StateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const StateCard = styled.div`
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);

  .state {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 600;
  }

  .count {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--primary);
    margin-top: 0.25rem;
  }

  .active {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
`;

const SettingsCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  max-width: 500px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0 0 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    padding-right: 3rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  button {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--text-primary);
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: var(--primary-dark, #2563eb);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PasswordRequirements = styled.ul`
  margin: 0.75rem 0 1.5rem;
  padding-left: 1.25rem;
  font-size: 0.8rem;
  color: var(--text-secondary);

  li {
    margin-bottom: 0.25rem;
  }
`;

const CategoryCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    margin: 0;
  }
`;

const CategoryGroup = styled.div`
  margin-bottom: 1.5rem;

  h3 {
    color: var(--primary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary);
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .name {
      font-weight: 500;
    }

    .slug {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &.edit {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);

    &:hover {
      background: var(--primary);
      color: white;
    }
  }

  &.delete {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--accent);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;

  h2 {
    margin: 0 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  button {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;

    &.primary {
      background: var(--primary);
      color: white;
      border: none;

      &:hover {
        background: var(--accent);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }
    }
  }
`;

const FormInput = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  input, select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  .help {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
`;

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [professionals, setProfessionals] = useState([]);
    const [clients, setClients] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [statusFilter, setStatusFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    // Estados para CRUD de categorias
    const [categories, setCategories] = useState([]);
    const [groupedCategories, setGroupedCategories] = useState({});
    const [availableGroups, setAvailableGroups] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', group: '', image_url: '' });
    const [savingCategory, setSavingCategory] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [isNewGroup, setIsNewGroup] = useState(false);
    const navigate = useNavigate();

    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.is_admin) {
            toast.error('Acesso negado. Apenas administradores podem acessar.');
            navigate('/');
            return;
        }

        fetchAdminData();
    }, [navigate]);

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');

        try {
            const [userRes, dashboardRes, professionalsRes, clientsRes, subscriptionsRes] = await Promise.all([
                fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/professionals`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/clients`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/subscriptions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (userRes.ok) {
                const userData = await userRes.json();
                setUserName(userData.name);
            }

            if (dashboardRes.ok) {
                const data = await dashboardRes.json();
                setDashboardData(data);
            }

            if (professionalsRes.ok) {
                const data = await professionalsRes.json();
                setProfessionals(data.professionals);
            }

            if (clientsRes.ok) {
                const data = await clientsRes.json();
                setClients(data.clients);
            }

            if (subscriptionsRes.ok) {
                const data = await subscriptionsRes.json();
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            toast.error('Erro ao carregar dados do dashboard');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendProfessional = async (professionalId, professionalName) => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/api/admin/professionals/${professionalId}/suspend`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success(`Profissional ${professionalName} suspenso com sucesso`);
                fetchAdminData();
            } else {
                toast.error('Erro ao suspender profissional');
            }
        } catch (error) {
            toast.error('Erro ao suspender profissional');
            console.error(error);
        }
    };

    const handleReactivateProfessional = async (professionalId, professionalName) => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/api/admin/professionals/${professionalId}/reactivate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success(`Profissional ${professionalName} reativado com sucesso`);
                fetchAdminData();
            } else {
                toast.error('Erro ao reativar profissional');
            }
        } catch (error) {
            toast.error('Erro ao reativar profissional');
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Validações
        if (!isPasswordValid) {
            toast.error('Crie uma senha forte que atenda a todos os requisitos');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        setChangingPassword(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_password: newPassword })
            });

            if (res.ok) {
                toast.success('Senha alterada com sucesso!');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao alterar senha');
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            toast.error('Erro de conexão ao alterar senha. Verifique se o backend está rodando.');
        } finally {
            setChangingPassword(false);
        }
    };

    // ============================================
    // Funções de CRUD de Categorias
    // ============================================

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/admin/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Categorias carregadas:', data);
                setCategories(data.categories || []);
                setGroupedCategories(data.grouped || {});
                setAvailableGroups(data.groups || []);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Erro ao buscar categorias:', res.status, errorData);
                toast.error(`Erro ao carregar categorias: ${errorData.detail || res.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            toast.error('Erro de conexão ao carregar categorias');
        }
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleCategoryNameChange = (name) => {
        setCategoryForm(prev => ({
            ...prev,
            name,
            slug: editingCategory ? prev.slug : generateSlug(name)
        }));
    };

    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name,
                slug: category.slug,
                group: category.group,
                image_url: category.image_url || ''
            });
            setIsNewGroup(false);
        } else {
            setEditingCategory(null);
            setCategoryForm({ name: '', slug: '', group: '', image_url: '' });
            setIsNewGroup(false);
        }
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', slug: '', group: '', image_url: '' });
        setIsNewGroup(false);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();

        if (!categoryForm.name || !categoryForm.slug || !categoryForm.group) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        setSavingCategory(true);
        const token = localStorage.getItem('token');

        try {
            const url = editingCategory
                ? `${API_URL}/admin/categories/${editingCategory.id}`
                : `${API_URL}/admin/categories`;

            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryForm)
            });

            if (res.ok) {
                toast.success(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!');
                closeCategoryModal();
                fetchCategories();
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao salvar categoria');
            }
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            toast.error('Erro de conexão');
        } finally {
            setSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        if (!window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            return;
        }

        setDeletingCategory(category.id);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/admin/categories/${category.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Categoria excluída!');
                fetchCategories();
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao excluir categoria');
            }
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            toast.error('Erro de conexão');
        } finally {
            setDeletingCategory(null);
        }
    };

    // Carregar categorias quando a aba for selecionada
    useEffect(() => {
        if (activeTab === 'categories') {
            fetchCategories();
        }
    }, [activeTab]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'active': return <CheckCircle size={14} />;
            case 'inactive': return <AlertCircle size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            case 'suspended': return <PauseCircle size={14} />;
            default: return null;
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'active': return 'Ativo';
            case 'inactive': return 'Inativo';
            case 'cancelled': return 'Cancelado';
            case 'suspended': return 'Suspenso';
            default: return status;
        }
    };

    const filteredProfessionals = professionals.filter(prof => {
        if (statusFilter && prof.subscription_status !== statusFilter) return false;
        if (stateFilter && prof.state !== stateFilter) return false;
        return true;
    });

    if (loading) {
        return (
            <AdminContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
                    <p>Carregando...</p>
                </div>
            </AdminContainer>
        );
    }

    return (
        <AdminContainer>
            <Sidebar>
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>ContrataPro Admin</h2>
                </div>

                <nav style={{ flex: 1 }}>
                    <div
                        onClick={() => setActiveTab('overview')}
                        style={{
                            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: activeTab === 'overview' ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <TrendingUp size={20} /> Visão Geral
                    </div>
                    <div
                        onClick={() => setActiveTab('professionals')}
                        style={{
                            color: activeTab === 'professionals' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: activeTab === 'professionals' ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <Briefcase size={20} /> Profissionais
                    </div>
                    <div
                        onClick={() => setActiveTab('clients')}
                        style={{
                            color: activeTab === 'clients' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: activeTab === 'clients' ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <Users size={20} /> Clientes
                    </div>
                    <div
                        onClick={() => setActiveTab('subscriptions')}
                        style={{
                            color: activeTab === 'subscriptions' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: activeTab === 'subscriptions' ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <DollarSign size={20} /> Assinaturas
                    </div>
                    <div
                        onClick={() => setActiveTab('categories')}
                        style={{
                            color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: activeTab === 'categories' ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <Tag size={20} /> Categorias
                    </div>
                    <div
                        onClick={() => navigate('/admin/trials')}
                        style={{
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <Clock size={20} /> Gerenciar Trials
                    </div>
                    <div
                        onClick={() => setActiveTab('settings')}
                        style={{
                            color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            padding: '1rem',
                            background: activeTab === 'settings' ? 'var(--primary-glow)' : 'transparent',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Settings size={20} /> Configurações
                    </div>
                </nav>

                <button
                    onClick={handleLogout}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem' }}
                >
                    <Power size={20} /> Sair
                </button>
            </Sidebar>

            <MainContent>
                <TopBar>
                    <h1>Dashboard Administrativo</h1>
                    <UserInfo>
                        <div className="avatar">{userName?.[0]}</div>
                        <div className="details">
                            <span className="name">{userName} (Admin)</span>
                            <button className="logout" onClick={handleLogout}>Sair</button>
                        </div>
                    </UserInfo>
                </TopBar>

                {activeTab === 'overview' && dashboardData && (
                    <>
                        <StatGrid>
                            <StatCard>
                                <div className="icon"><Users /></div>
                                <div className="info">
                                    <h3>Total de Clientes</h3>
                                    <p>{dashboardData.summary.total_clients}</p>
                                </div>
                            </StatCard>
                            <StatCard>
                                <div className="icon"><Briefcase /></div>
                                <div className="info">
                                    <h3>Total de Profissionais</h3>
                                    <p>{dashboardData.summary.total_professionals}</p>
                                </div>
                            </StatCard>
                            <StatCard $bgColor="rgba(34, 197, 94, 0.1)" $color="#16a34a">
                                <div className="icon"><CheckCircle /></div>
                                <div className="info">
                                    <h3>Profissionais Ativos</h3>
                                    <p>{dashboardData.summary.active_professionals}</p>
                                </div>
                            </StatCard>
                            <StatCard $bgColor="rgba(59, 130, 246, 0.1)" $color="#2563eb">
                                <div className="icon"><Calendar /></div>
                                <div className="info">
                                    <h3>Agendamentos (Mês)</h3>
                                    <p>{dashboardData.summary.appointments_this_month}</p>
                                </div>
                            </StatCard>
                            <StatCard $bgColor="rgba(251, 146, 60, 0.1)" $color="#ea580c">
                                <div className="icon"><Calendar /></div>
                                <div className="info">
                                    <h3>Último Agendamento</h3>
                                    {dashboardData.last_appointment ? (
                                        <>
                                            <p style={{ fontSize: '1.25rem' }}>{new Date(dashboardData.last_appointment.date).toLocaleDateString('pt-BR')}</p>
                                            <small>{dashboardData.last_appointment.start_time}</small>
                                        </>
                                    ) : (
                                        <p>-</p>
                                    )}
                                </div>
                            </StatCard>
                        </StatGrid>

                        <Card>
                            <h2><DollarSign size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />Faturamento da Plataforma</h2>
                            <StatGrid>
                                <StatCard $bgColor="rgba(34, 197, 94, 0.1)" $color="#16a34a">
                                    <div className="icon"><DollarSign /></div>
                                    <div className="info">
                                        <h3>Faturamento Diário</h3>
                                        <p>R$ {dashboardData.revenue.daily.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <small>Média por dia</small>
                                    </div>
                                </StatCard>

                                <StatCard $bgColor="rgba(59, 130, 246, 0.1)" $color="#2563eb">
                                    <div className="icon"><TrendingUp /></div>
                                    <div className="info">
                                        <h3>Faturamento Semanal</h3>
                                        <p>R$ {dashboardData.revenue.weekly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <small>Média por semana</small>
                                    </div>
                                </StatCard>

                                <StatCard $bgColor="rgba(139, 92, 246, 0.1)" $color="#8b5cf6">
                                    <div className="icon"><DollarSign /></div>
                                    <div className="info">
                                        <h3>Faturamento Mensal</h3>
                                        <p>R$ {dashboardData.revenue.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <small>{dashboardData.summary.active_professionals} profissionais × R$ 50,00</small>
                                    </div>
                                </StatCard>

                                <StatCard $bgColor="rgba(251, 146, 60, 0.1)" $color="#ea580c">
                                    <div className="icon"><TrendingUp /></div>
                                    <div className="info">
                                        <h3>Projeção Anual</h3>
                                        <p>R$ {dashboardData.revenue.annual_projected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <small>Baseado no faturamento atual</small>
                                    </div>
                                </StatCard>
                            </StatGrid>
                        </Card>

                        <Card>
                            <h2>Métricas de Assinatura</h2>
                            <StatGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <StatCard $bgColor="rgba(34, 197, 94, 0.1)" $color="#16a34a">
                                    <div className="icon"><TrendingUp /></div>
                                    <div className="info">
                                        <h3>Total de Assinantes</h3>
                                        <p>{dashboardData.summary.active_professionals}</p>
                                        <small>Assinaturas ativas</small>
                                    </div>
                                </StatCard>

                                <StatCard $bgColor="rgba(59, 130, 246, 0.1)" $color="#2563eb">
                                    <div className="icon"><CheckCircle /></div>
                                    <div className="info">
                                        <h3>Novos Assinantes (Mês)</h3>
                                        <p>{dashboardData.summary.new_subscribers_this_month}</p>
                                        <small>Novas assinaturas este mês</small>
                                    </div>
                                </StatCard>

                                <StatCard $bgColor="rgba(239, 68, 68, 0.1)" $color="#ef4444">
                                    <div className="icon"><XCircle /></div>
                                    <div className="info">
                                        <h3>Cancelamentos (Mês)</h3>
                                        <p>{dashboardData.summary.cancellations_this_month}</p>
                                        <small>Cancelamentos este mês</small>
                                    </div>
                                </StatCard>
                            </StatGrid>
                        </Card>

                        <Card>
                            <h2>Status das Assinaturas</h2>
                            <StatGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <CheckCircle size={16} color="#16a34a" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ativos</span>
                                    </div>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{dashboardData.summary.active_professionals}</p>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <AlertCircle size={16} color="#6b7280" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Inativos</span>
                                    </div>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{dashboardData.summary.inactive_professionals}</p>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <XCircle size={16} color="#dc2626" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cancelados</span>
                                    </div>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{dashboardData.summary.cancelled_professionals}</p>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <PauseCircle size={16} color="#ea580c" />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Suspensos</span>
                                    </div>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{dashboardData.summary.suspended_professionals}</p>
                                </div>
                            </StatGrid>
                        </Card>

                        <Card>
                            <h2><MapPin size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />Profissionais por Estado</h2>
                            <StateGrid>
                                {dashboardData.professionals_by_state.map(item => {
                                    const activeInState = dashboardData.active_professionals_by_state.find(a => a.state === item.state);
                                    return (
                                        <StateCard key={item.state}>
                                            <div className="state">{item.state}</div>
                                            <div className="count">{item.count}</div>
                                            <div className="active">{activeInState?.count || 0} ativos</div>
                                        </StateCard>
                                    );
                                })}
                            </StateGrid>
                        </Card>

                        <Card>
                            <h2>Profissionais Recentes</h2>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>E-mail</th>
                                        <th>Categoria</th>
                                        <th>Cidade/Estado</th>
                                        <th>Status</th>
                                        <th>Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recent_professionals.map(prof => (
                                        <tr key={prof.id}>
                                            <td style={{ fontWeight: 600 }}>{prof.name}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{prof.email}</td>
                                            <td>{prof.category}</td>
                                            <td>{prof.city}/{prof.state}</td>
                                            <td>
                                                <Badge $status={prof.subscription_status}>
                                                    {getStatusIcon(prof.subscription_status)}
                                                    {getStatusLabel(prof.subscription_status)}
                                                </Badge>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                {new Date(prof.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </>
                )}

                {activeTab === 'professionals' && (
                    <>
                        <Card>
                            <h2>Gerenciar Profissionais</h2>
                            <FilterBar>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Filter size={18} />
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <option value="">Todos os Status</option>
                                        <option value="active">Ativos</option>
                                        <option value="inactive">Inativos</option>
                                        <option value="cancelled">Cancelados</option>
                                        <option value="suspended">Suspensos</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} />
                                    <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                                        <option value="">Todos os Estados</option>
                                        {Array.from(new Set(professionals.map(p => p.state))).sort().map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    {filteredProfessionals.length} profissionais encontrados
                                </div>
                            </FilterBar>

                            <Table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>E-mail</th>
                                        <th>Categoria</th>
                                        <th>Localização</th>
                                        <th>WhatsApp</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProfessionals.map(prof => (
                                        <tr key={prof.id}>
                                            <td style={{ fontWeight: 600 }}>{prof.name}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{prof.email}</td>
                                            <td>{prof.category}</td>
                                            <td>{prof.city}/{prof.state}</td>
                                            <td>{formatPhoneNumber(prof.whatsapp)}</td>
                                            <td>
                                                <Badge $status={prof.subscription_status}>
                                                    {getStatusIcon(prof.subscription_status)}
                                                    {getStatusLabel(prof.subscription_status)}
                                                </Badge>
                                            </td>
                                            <td>
                                                {prof.is_suspended ? (
                                                    <ActionButton onClick={() => handleReactivateProfessional(prof.id, prof.name)}>
                                                        Reativar
                                                    </ActionButton>
                                                ) : (
                                                    <ActionButton
                                                        $variant="danger"
                                                        onClick={() => handleSuspendProfessional(prof.id, prof.name)}
                                                    >
                                                        Suspender
                                                    </ActionButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </>
                )}

                {activeTab === 'clients' && (
                    <>
                        <Card>
                            <h2>Clientes Cadastrados</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Total de {clients.length} clientes cadastrados na plataforma
                            </p>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>E-mail</th>
                                        <th>Cidade/Estado</th>
                                        <th>Data de Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map(client => (
                                        <tr key={client.id}>
                                            <td style={{ fontWeight: 600 }}>{client.name}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{client.email}</td>
                                            <td>{client.city}/{client.state}</td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                {new Date(client.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </>
                )}

                {activeTab === 'subscriptions' && (
                    <>
                        <Card>
                            <h2>Assinaturas da Plataforma</h2>
                            <FilterBar>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Filter size={18} />
                                    <select value={subscriptionStatusFilter} onChange={(e) => setSubscriptionStatusFilter(e.target.value)}>
                                        <option value="">Todos os Status</option>
                                        <option value="pending">Pendente</option>
                                        <option value="active">Ativa</option>
                                        <option value="cancelled">Cancelada</option>
                                        <option value="suspended">Suspensa</option>
                                        <option value="paused">Pausada</option>
                                    </select>
                                </div>
                                <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    {subscriptions.filter(sub => !subscriptionStatusFilter || sub.status === subscriptionStatusFilter).length} assinaturas encontradas
                                </div>
                            </FilterBar>

                            <Table>
                                <thead>
                                    <tr>
                                        <th>Profissional</th>
                                        <th>E-mail</th>
                                        <th>Categoria</th>
                                        <th>Localização</th>
                                        <th>Valor</th>
                                        <th>Status</th>
                                        <th>Próx. Cobrança</th>
                                        <th>Criada em</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions
                                        .filter(sub => !subscriptionStatusFilter || sub.status === subscriptionStatusFilter)
                                        .map(sub => (
                                            <tr key={sub.id}>
                                                <td style={{ fontWeight: 600 }}>{sub.professional_name || '-'}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{sub.professional_email || '-'}</td>
                                                <td>{sub.professional_category || '-'}</td>
                                                <td style={{ fontSize: '0.875rem' }}>
                                                    {sub.professional_city && sub.professional_state
                                                        ? `${sub.professional_city}/${sub.professional_state}`
                                                        : '-'}
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                                    R$ {sub.plan_amount.toFixed(2)}
                                                </td>
                                                <td>
                                                    <Badge $status={sub.status}>
                                                        {getStatusIcon(sub.status)}
                                                        {getStatusLabel(sub.status)}
                                                    </Badge>
                                                </td>
                                                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {sub.next_billing_date
                                                        ? new Date(sub.next_billing_date).toLocaleDateString('pt-BR')
                                                        : '-'}
                                                </td>
                                                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>

                            {subscriptions.filter(sub => !subscriptionStatusFilter || sub.status === subscriptionStatusFilter).length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <DollarSign size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>Nenhuma assinatura encontrada</p>
                                </div>
                            )}
                        </Card>
                    </>
                )}

                {activeTab === 'categories' && (
                    <>
                        <CategoryCard>
                            <CategoryHeader>
                                <h2><Tag size={24} /> Gerenciar Categorias</h2>
                                <AddButton onClick={() => openCategoryModal()}>
                                    <Plus size={18} /> Nova Categoria
                                </AddButton>
                            </CategoryHeader>

                            {Object.keys(groupedCategories).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <Tag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>Nenhuma categoria cadastrada</p>
                                    <p style={{ fontSize: '0.875rem' }}>Clique em "Nova Categoria" para começar</p>
                                </div>
                            ) : (
                                Object.entries(groupedCategories).map(([group, cats]) => (
                                    <CategoryGroup key={group}>
                                        <h3>{group} ({cats.length})</h3>
                                        <CategoryList>
                                            {cats.map(cat => (
                                                <CategoryItem key={cat.id}>
                                                    <div className="info">
                                                        <span className="name">{cat.name}</span>
                                                        <span className="slug">{cat.slug}</span>
                                                    </div>
                                                    <div className="actions">
                                                        <IconButton
                                                            className="edit"
                                                            onClick={() => openCategoryModal(cat)}
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </IconButton>
                                                        <IconButton
                                                            className="delete"
                                                            onClick={() => handleDeleteCategory(cat)}
                                                            disabled={deletingCategory === cat.id}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </IconButton>
                                                    </div>
                                                </CategoryItem>
                                            ))}
                                        </CategoryList>
                                    </CategoryGroup>
                                ))
                            )}

                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <strong>Total:</strong> {categories.length} categorias em {Object.keys(groupedCategories).length} grupos
                            </div>
                        </CategoryCard>

                        {/* Modal de Criar/Editar Categoria */}
                        {showCategoryModal && (
                            <Modal onClick={closeCategoryModal}>
                                <ModalContent onClick={e => e.stopPropagation()}>
                                    <h2>
                                        {editingCategory ? <Edit2 size={20} /> : <Plus size={20} />}
                                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                    </h2>

                                    <form onSubmit={handleSaveCategory}>
                                        <FormInput>
                                            <label>Nome *</label>
                                            <input
                                                type="text"
                                                value={categoryForm.name}
                                                onChange={(e) => handleCategoryNameChange(e.target.value)}
                                                placeholder="Ex: Eletricista"
                                                required
                                            />
                                        </FormInput>

                                        <FormInput>
                                            <label>Slug *</label>
                                            <input
                                                type="text"
                                                value={categoryForm.slug}
                                                onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                                                placeholder="Ex: eletricista"
                                                required
                                            />
                                            <span className="help">Identificador único usado na URL</span>
                                        </FormInput>

                                        <FormInput>
                                            <label>Grupo *</label>
                                            {!isNewGroup ? (
                                                <>
                                                    <select
                                                        value={categoryForm.group}
                                                        onChange={(e) => {
                                                            if (e.target.value === '__new__') {
                                                                setIsNewGroup(true);
                                                                setCategoryForm(prev => ({ ...prev, group: '' }));
                                                            } else {
                                                                setCategoryForm(prev => ({ ...prev, group: e.target.value }));
                                                            }
                                                        }}
                                                        required
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem 1rem',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '8px',
                                                            fontSize: '1rem',
                                                            backgroundColor: 'white',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="">Selecione um grupo</option>
                                                        {availableGroups.map(g => (
                                                            <option key={g} value={g}>{g}</option>
                                                        ))}
                                                        <option value="__new__">+ Criar novo grupo</option>
                                                    </select>
                                                    <span className="help">Selecione um grupo existente ou crie um novo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input
                                                            type="text"
                                                            value={categoryForm.group}
                                                            onChange={(e) => setCategoryForm(prev => ({ ...prev, group: e.target.value }))}
                                                            placeholder="Nome do novo grupo"
                                                            required
                                                            style={{ flex: 1 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsNewGroup(false);
                                                                setCategoryForm(prev => ({ ...prev, group: '' }));
                                                            }}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'var(--bg-secondary)',
                                                                border: '1px solid var(--border)',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                    <span className="help">Digite o nome do novo grupo</span>
                                                </>
                                            )}
                                        </FormInput>

                                        <FormInput>
                                            <label>URL da Imagem (opcional)</label>
                                            <input
                                                type="url"
                                                value={categoryForm.image_url}
                                                onChange={(e) => setCategoryForm(prev => ({ ...prev, image_url: e.target.value }))}
                                                placeholder="https://..."
                                            />
                                        </FormInput>

                                        <ModalActions>
                                            <button type="button" className="secondary" onClick={closeCategoryModal}>
                                                <X size={18} /> Cancelar
                                            </button>
                                            <button type="submit" className="primary" disabled={savingCategory}>
                                                <Save size={18} />
                                                {savingCategory ? 'Salvando...' : 'Salvar'}
                                            </button>
                                        </ModalActions>
                                    </form>
                                </ModalContent>
                            </Modal>
                        )}
                    </>
                )}

                {activeTab === 'settings' && (
                    <>
                        <SettingsCard>
                            <h2><Lock size={20} /> Alterar Senha</h2>
                            <p>Atualize sua senha de administrador. Certifique-se de usar uma senha forte.</p>

                            <form onSubmit={handleChangePassword}>
                                <FormGroup>
                                    <label>Nova Senha</label>
                                    <PasswordInput
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Digite sua nova senha"
                                        onValidChange={setIsPasswordValid}
                                        showGenerateButton={true}
                                        showTooltip={true}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <label>Confirmar Nova Senha</label>
                                    <PasswordInputWrapper>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirme sua nova senha"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </PasswordInputWrapper>
                                </FormGroup>

                                <SubmitButton type="submit" disabled={changingPassword}>
                                    {changingPassword ? (
                                        <>Alterando...</>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Alterar Senha
                                        </>
                                    )}
                                </SubmitButton>
                            </form>
                        </SettingsCard>
                    </>
                )}
            </MainContent>
        </AdminContainer>
    );
}
