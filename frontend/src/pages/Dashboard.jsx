import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Briefcase, Clock, Power, Menu, X,
    Plus, Trash2, PauseCircle, PlayCircle, History as HistoryIcon, Upload as UploadIcon, Ban,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ImageUpload from '../components/ImageUpload';
import { API_URL } from '../config';

// --- Styled Components ---
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const Sidebar = styled.div`
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 10;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  width: calc(100% - 280px);

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
  }
`;

const MenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  border-radius: 12px;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  text-align: left;

  &:hover {
    background: var(--bg-primary);
    color: var(--primary);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    font-size: 1.25rem !important;
    margin-bottom: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }
`;

const Card = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;

const WeekNavigationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 0.5rem;
  }

  @media (max-width: 360px) {
    gap: 0.25rem;
  }

  .btn-text {
    @media (max-width: 480px) {
      display: none;
    }
  }

  button.btn-primary {
    @media (max-width: 480px) {
      padding: 0.75rem;
    }
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$color === 'red' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.$color === 'red' ? '#ef4444' : '#10b981'};
  border: 1px solid ${props => props.$color === 'red' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
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

// --- Calendar Components ---
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 60px repeat(7, 1fr);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileCalendar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const CalendarHeader = styled.div`
  padding: 1rem;
  background: var(--bg-secondary);
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);

  .day-name-full,
  .day-date-full {
    display: none;
  }

  @media (max-width: 1024px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }

  @media (max-width: 768px) {
    display: block;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    border: none;
    text-align: left;

    .desktop-day-name,
    .desktop-day-date {
      display: none;
    }

    .day-name-full {
      display: block;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .day-date-full {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      opacity: 0.95;
    }
  }
`;

const TimeSlotLabel = styled.div`
  height: 60px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    font-size: 0.7rem;
    height: 50px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const DayCell = styled.div`
  height: 60px;
  background: ${props => {
        if (props.$status === 'occupied') return '#ef4444';
        if (props.$status === 'blocked') return '#64748b';
        if (props.$status === 'available') return '#10b981';
        return 'var(--bg-primary)';
    }};
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-align: center;
  padding: 4px;
  transition: all 0.2s;
  position: relative;

  @media (max-width: 1024px) {
    height: 50px;
    font-size: 0.65rem;
    padding: 2px;
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 50px;
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    padding: 0.75rem;
    font-size: 0.85rem;
    display: flex;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;

    .mobile-hour {
      display: block !important;
      font-size: 1rem;
      font-weight: 700;
      min-width: 60px;
    }
  }

  @media (max-width: 360px) {
    .mobile-hour {
      min-width: 50px;
      font-size: 0.9rem;
    }
  }
`;

const MobileDaySection = styled.div`
  margin-bottom: 2rem;
`;

const MobileDayHeader = styled.div`
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;

  .day-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .day-date {
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.95;
  }
`;

const MobileTimeSlot = styled.div`
  background: ${props => {
    if (props.$status === 'occupied') return '#ef4444';
    if (props.$status === 'blocked') return '#64748b';
    if (props.$status === 'available') return '#10b981';
    return 'var(--bg-primary)';
  }};
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border);
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  font-size: 0.875rem;

  @media (max-width: 360px) {
    padding: 0.5rem;
  }

  .time {
    font-weight: 700;
    font-size: 1rem;
    min-width: 60px;

    @media (max-width: 360px) {
      min-width: 50px;
      font-size: 0.9rem;
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .phone {
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const ModalContent = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  border: 1px solid var(--border);
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 16px;
    width: 95%;
  }

  @media (max-width: 360px) {
    padding: 1rem;
    border-radius: 12px;
    width: 95%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;

    @media (max-width: 480px) {
      font-size: 1.25rem;
    }

    @media (max-width: 360px) {
      font-size: 1.1rem;
    }
  }

  button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
  }
`;

const SubscriptionAlert = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 1rem 2rem;
  text-align: center;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    gap: 0.25rem;
  }

  span {
    @media (max-width: 360px) {
      flex: 1 1 100%;
      margin-bottom: 0.25rem;
    }
  }

  button {
    background: white;
    color: #d97706;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;

    @media (max-width: 480px) {
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
    }

    @media (max-width: 360px) {
      padding: 0.35rem 0.7rem;
      font-size: 0.8rem;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.95);
    }
  }
`;

// --- Dashboard Component ---
export default function Dashboard() {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';
    const [user, setUser] = useState(null);
    const [services, setServices] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockForm, setBlockForm] = useState({ date: '', start_time: '08:00', end_time: '09:00', reason: '' });
    const [blockDateDisplay, setBlockDateDisplay] = useState(''); // Data formatada para exibição (dd/mm/yyyy)
    const [weekOffset, setWeekOffset] = useState(0); // 0 = semana atual, 1 = próxima semana, etc
    const navigate = useNavigate();

    const getWeekStartDate = (offset = 0) => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - currentDay + (offset * 7));
        return sunday.toISOString().split('T')[0];
    };

    const fetchAppointments = async (offset = 0) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };
        const startDate = getWeekStartDate(offset);

        try {
            const apptRes = await fetch(`/api/appointments/me/week?start_date=${startDate}`, { headers });
            if (apptRes.ok) setAppointments(await apptRes.json());
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // Adiciona timestamp para evitar cache
            const userRes = await fetch(`/api/auth/me?t=${Date.now()}`, {
                headers,
                cache: 'no-cache'
            });
            if (userRes.ok) setUser(await userRes.json());

            const [servicesRes, scheduleRes] = await Promise.all([
                fetch(`${API_URL}/services/me`, { headers }),
                fetch(`${API_URL}/schedule/me`, { headers })
            ]);

            if (servicesRes.ok) setServices(await servicesRes.json());
            if (scheduleRes.ok) setWorkingHours(await scheduleRes.json());

            // Buscar agendamentos da semana atual
            await fetchAppointments(0);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    useEffect(() => {
        if (!loading) {
            fetchAppointments(weekOffset);
        }
    }, [weekOffset]);

    const toggleSuspension = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/users/toggle-suspension`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUser(prev => ({ ...prev, is_suspended: data.is_suspended }));
        }
    };

    // Funções auxiliares para manipular data brasileira
    const formatDateToBR = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatDateToISO = (brDate) => {
        if (!brDate || brDate.length !== 10) return '';
        const [day, month, year] = brDate.split('/');
        if (!day || !month || !year) return '';
        return `${year}-${month}-${day}`;
    };

    const handleDateInput = (value) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');

        let formatted = '';
        if (numbers.length > 0) {
            formatted = numbers.substring(0, 2); // DD
            if (numbers.length > 2) {
                formatted += '/' + numbers.substring(2, 4); // MM
            }
            if (numbers.length > 4) {
                formatted += '/' + numbers.substring(4, 8); // YYYY
            }
        }

        setBlockDateDisplay(formatted);

        // Se a data está completa, converter para ISO
        if (formatted.length === 10) {
            const isoDate = formatDateToISO(formatted);
            // Validar data
            const [year, month, day] = isoDate.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                setBlockForm({ ...blockForm, date: isoDate });
            }
        } else {
            setBlockForm({ ...blockForm, date: '' });
        }
    };

    const handleCreateBlock = async (e) => {
        e.preventDefault();

        if (!blockForm.date || !blockForm.start_time || !blockForm.end_time) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        // Validar se a data não é passada
        const selectedDate = new Date(blockForm.date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast.error('Não é possível bloquear datas passadas');
            return;
        }

        // Validar se horário final é maior que inicial
        const [startHour, startMin] = blockForm.start_time.split(':').map(Number);
        const [endHour, endMin] = blockForm.end_time.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            toast.error('O horário final deve ser maior que o horário inicial');
            return;
        }

        const token = localStorage.getItem('token');
        const payload = {
            date: blockForm.date,
            start_time: blockForm.start_time + ':00',
            end_time: blockForm.end_time + ':00',
            reason: blockForm.reason || 'Bloqueio manual'
        };

        const res = await fetch(`${API_URL}/appointments/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success('Horário bloqueado com sucesso!');
            setShowBlockModal(false);
            setBlockForm({ date: '', start_time: '08:00', end_time: '09:00', reason: '' });
            setBlockDateDisplay('');
            fetchAppointments(weekOffset); // Atualizar os agendamentos da semana atual
        } else {
            const data = await res.json();
            toast.error(data.detail || 'Erro ao bloquear horário');
        }
    };

    const handleRemoveBlock = async (blockId) => {
        if (!confirm('Deseja remover este bloqueio?')) return;

        const token = localStorage.getItem('token');
        const res = await fetch(`/api/appointments/block/${blockId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success('Bloqueio removido!');
            fetchData(); // Atualizar os agendamentos
        } else {
            toast.error('Erro ao remover bloqueio');
        }
    };

    // --- Views ---

    const DashboardView = () => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const daysFullName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h

        // Get dates for the selected week
        const getWeekDates = () => {
            const now = new Date();
            const currentDay = now.getDay();
            const sunday = new Date(now);
            sunday.setDate(now.getDate() - currentDay + (weekOffset * 7));

            return days.map((_, i) => {
                const date = new Date(sunday);
                date.setDate(sunday.getDate() + i);
                return date;
            });
        };

        const weekDates = getWeekDates();

        // Get working hours for a specific day
        const getWorkingHoursForDay = (dayIndex) => {
            // Convert from Sunday-based (0-6) to Monday-based (0-6 where 0=Monday, 6=Sunday)
            const backendDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            return workingHours.filter(wh => wh.day_of_week === backendDayIndex);
        };

        // Get all hours for a specific day based on working hours configuration
        const getHoursForDay = (dayIndex) => {
            const dayWorkingHours = getWorkingHoursForDay(dayIndex);

            if (dayWorkingHours.length === 0) {
                return []; // No working hours configured for this day
            }

            // Get all unique hours from all working hour periods for this day
            const allHours = new Set();
            dayWorkingHours.forEach(wh => {
                const start = parseInt(wh.start_time.split(':')[0]);
                const end = parseInt(wh.end_time.split(':')[0]);
                for (let hour = start; hour < end; hour++) {
                    allHours.add(hour);
                }
            });

            return Array.from(allHours).sort((a, b) => a - b);
        };

        // Check if a day has any working hours configured
        const hasDayWorkingHours = (dayIndex) => {
            return getWorkingHoursForDay(dayIndex).length > 0;
        };

        const formatDateToCompare = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const getStatus = (dayIndex, hour) => {
            const dayDate = formatDateToCompare(weekDates[dayIndex]);

            // Buscar agendamento que cubra este horário
            const appt = appointments.find(a => {
                if (a.date !== dayDate) return false;

                // Verificar se a hora está dentro do intervalo do agendamento
                const startHour = parseInt(a.start_time.split(':')[0]);
                const endHour = parseInt(a.end_time.split(':')[0]);

                // Para serviços diários ou qualquer agendamento, verificar se a hora está no intervalo
                return hour >= startHour && hour < endHour;
            });

            if (appt) {
                // Bloqueio manual
                if (appt.is_manual_block || appt.status === 'blocked') {
                    return {
                        status: 'blocked',
                        label: 'Bloqueado',
                        phone: null,
                        id: appt.id,
                        isBlock: true
                    };
                }
                // Agendamento normal
                if (appt.status === 'scheduled') {
                    return {
                        status: 'occupied',
                        label: appt.client_name || 'Ocupado',
                        phone: appt.client_whatsapp || null,
                        id: appt.id,
                        isBlock: false
                    };
                }
            }

            const backendDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            const wh = workingHours.find(w => w.day_of_week === backendDayIndex);
            if (wh) {
                const start = parseInt(wh.start_time.split(':')[0]);
                const end = parseInt(wh.end_time.split(':')[0]);
                if (hour >= start && hour < end) {
                    return { status: 'available', label: 'Disponível', phone: null, isBlock: false };
                }
            }
            return { status: 'empty', label: '', phone: null, isBlock: false };
        };

        const getWeekLabel = () => {
            const startDate = weekDates[0];
            const endDate = weekDates[6];
            const startStr = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const endStr = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

            if (weekOffset === 0) {
                return `Semana Atual (${startStr} - ${endStr})`;
            } else if (weekOffset === 1) {
                return `Próxima Semana (${startStr} - ${endStr})`;
            } else {
                return `${startStr} - ${endStr}`;
            }
        };

        return (
            <div>
                <SectionTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>Agenda Semanal</span>
                        {user?.is_suspended && <Badge $color="red">Atendimentos Suspensos</Badge>}
                    </div>
                </SectionTitle>

                <WeekNavigationWrapper>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', minWidth: '0' }}>
                        <button
                            onClick={() => setWeekOffset(prev => prev - 1)}
                            disabled={weekOffset === 0}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: weekOffset === 0 ? 'not-allowed' : 'pointer',
                                opacity: weekOffset === 0 ? 0.5 : 1,
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0
                            }}
                            title="Semana anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1, textAlign: 'center', fontWeight: 600, minWidth: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getWeekLabel()}
                        </span>
                        <button
                            onClick={() => setWeekOffset(prev => prev + 1)}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0
                            }}
                            title="Próxima semana"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowBlockModal(true)}
                        style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        <Ban size={18} /> <span className="btn-text">Bloquear Horário</span>
                    </button>
                </WeekNavigationWrapper>

                <CalendarGrid>
                    <CalendarHeader></CalendarHeader>
                    {days.map((d, i) => {
                        const hasHours = hasDayWorkingHours(i);
                        return (
                            <CalendarHeader key={d} style={{ opacity: hasHours ? 1 : 0.4 }}>
                                <span className="desktop-day-name">{d}</span>
                                <div className="desktop-day-date" style={{ fontSize: '0.7rem', fontWeight: 400, marginTop: '2px' }}>
                                    {weekDates[i].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </div>
                                <div className="day-name-full">
                                    {daysFullName[weekDates[i].getDay()]}
                                </div>
                                <div className="day-date-full">
                                    {weekDates[i].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </div>
                            </CalendarHeader>
                        );
                    })}

                    {/* Coletar todos os horários únicos de todos os dias */}
                    {(() => {
                        const allUniqueHours = new Set();
                        days.forEach((_, dayIndex) => {
                            getHoursForDay(dayIndex).forEach(hour => allUniqueHours.add(hour));
                        });
                        const sortedHours = Array.from(allUniqueHours).sort((a, b) => a - b);

                        return sortedHours.map(hour => (
                            <div key={hour} style={{ display: 'contents' }}>
                                <TimeSlotLabel>{String(hour).padStart(2, '0')}:00</TimeSlotLabel>
                                {days.map((_, dayIndex) => {
                                    const dayHours = getHoursForDay(dayIndex);

                                    // Se este horário não está configurado para este dia, renderizar célula vazia
                                    if (!dayHours.includes(hour)) {
                                        return (
                                            <DayCell
                                                key={`${dayIndex}-${hour}`}
                                                $status="empty"
                                                style={{
                                                    cursor: 'default',
                                                    background: 'var(--bg-primary)',
                                                    opacity: 0.3
                                                }}
                                            />
                                        );
                                    }

                                    const { status, label, phone, id, isBlock } = getStatus(dayIndex, hour);
                                    return (
                                        <DayCell
                                            key={`${dayIndex}-${hour}`}
                                            $status={status}
                                            onClick={() => !isBlock && id && navigate(`/appointment/${id}`)}
                                            style={{
                                                cursor: id && !isBlock ? 'pointer' : 'default',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                justifyContent: 'center'
                                            }}
                                            data-day={days[dayIndex]}
                                            data-date={weekDates[dayIndex].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                            data-hour={`${String(hour).padStart(2, '0')}:00`}
                                        >
                                            {/* Hora no mobile */}
                                            <div className="mobile-hour" style={{ display: 'none' }}>
                                                {String(hour).padStart(2, '0')}:00
                                            </div>

                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{label}</span>
                                                {isBlock && id && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveBlock(id);
                                                        }}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.2)',
                                                            border: 'none',
                                                            color: 'white',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 600
                                                        }}
                                                        title="Remover bloqueio"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            {phone && (
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    marginTop: '4px',
                                                    opacity: 0.9,
                                                    fontWeight: 400,
                                                    width: '100%'
                                                }}>
                                                    {formatPhoneNumber(phone)}
                                                </div>
                                            )}
                                        </DayCell>
                                    );
                                })}
                            </div>
                        ));
                    })()}
                </CalendarGrid>

                {/* Versão Mobile - Agrupado por dia */}
                <MobileCalendar>
                    {weekDates.map((date, dayIndex) => {
                        const dayName = daysFullName[date.getDay()];
                        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const dayHours = getHoursForDay(dayIndex);

                        // Se o dia não tem horários configurados, não mostrar
                        if (dayHours.length === 0) {
                            return null;
                        }

                        return (
                            <MobileDaySection key={dayIndex}>
                                <MobileDayHeader>
                                    <div className="day-name">{dayName}</div>
                                    <div className="day-date">{dateStr}</div>
                                </MobileDayHeader>

                                {dayHours.map(hour => {
                                    const { status, label, phone, id, isBlock } = getStatus(dayIndex, hour);
                                    const timeStr = `${String(hour).padStart(2, '0')}:00`;

                                    return (
                                        <MobileTimeSlot
                                            key={hour}
                                            $status={status}
                                            $clickable={!isBlock && id}
                                            onClick={() => !isBlock && id && navigate(`/appointment/${id}`)}
                                        >
                                            <div className="time">{timeStr}</div>
                                            <div className="content">
                                                <div>{label}</div>
                                                {phone && <div className="phone">{formatPhoneNumber(phone)}</div>}
                                            </div>
                                            {isBlock && id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveBlock(id);
                                                    }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.2)',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600
                                                    }}
                                                    title="Remover bloqueio"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </MobileTimeSlot>
                                    );
                                })}
                            </MobileDaySection>
                        );
                    })}
                </MobileCalendar>
            </div>
        );
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        // Remove tudo que não é número
        const cleaned = phone.replace(/\D/g, '');
        // Aplica a máscara (34) 99971-5592
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return phone; // Retorna original se não for 10 ou 11 dígitos
    };

    const formatCurrency = (value) => {
        if (!value) return 'Preço sob consulta';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    const ServiceCard = ({ service, onDelete, onUpdate }) => {
        const [uploading, setUploading] = useState(false);
        const [showUpload, setShowUpload] = useState(false);

        // Atualiza showUpload quando service.image_url mudar
        useEffect(() => {
            setShowUpload(false);
        }, [service.image_url]);

        const handleUpload = async (file) => {
            setUploading(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch(`/api/services/${service.id}/upload-image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    toast.success('Imagem enviada com sucesso!');
                    setShowUpload(false);
                    onUpdate();
                } else {
                    const error = await res.json();
                    toast.error(error.detail || 'Erro ao enviar imagem');
                }
            } catch (error) {
                toast.error('Erro ao enviar imagem');
            } finally {
                setUploading(false);
            }
        };

        const handleRemoveImage = async () => {
            if (!confirm('Tem certeza que deseja remover esta imagem?')) return;

            setUploading(true);
            const token = localStorage.getItem('token');

            try {
                const res = await fetch(`/api/services/${service.id}/image`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    toast.success('Imagem removida!');
                    setShowUpload(false);
                    onUpdate();
                } else {
                    toast.error('Erro ao remover imagem');
                }
            } catch (error) {
                toast.error('Erro ao remover imagem');
            } finally {
                setUploading(false);
            }
        };

        return (
            <Card style={{ marginBottom: 0, overflow: 'hidden', padding: 0 }}>
                {service.image_url ? (
                    <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                        <img
                            src={service.image_url}
                            alt={service.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                            onClick={handleRemoveImage}
                            disabled={uploading}
                            style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.9)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                            }}
                            title="Remover imagem"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : showUpload ? (
                    <div style={{ padding: '1rem' }}>
                        <ImageUpload
                            onImageSelect={handleUpload}
                            small
                            disabled={uploading}
                        />
                    </div>
                ) : null}

                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>{service.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
                            {formatCurrency(service.price)}
                        </p>
                        {!service.image_url && !showUpload && (
                            <button
                                onClick={() => setShowUpload(true)}
                                style={{
                                    marginTop: '0.5rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <UploadIcon size={14} /> Adicionar foto
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => onDelete(service.id)}
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            marginLeft: '1rem',
                            transition: 'all 0.2s'
                        }}
                        title="Excluir serviço"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </Card>
        );
    };

    const ServicesView = () => {
        const [newService, setNewService] = useState({ title: '', price: '', duration_type: 'hourly' });

        const handlePriceChange = (e) => {
            let value = e.target.value;
            // Allow only numbers and one comma
            value = value.replace(/[^\d,]/g, '');
            // Ensure only one comma
            const parts = value.split(',');
            if (parts.length > 2) value = parts[0] + ',' + parts.slice(1).join('');

            setNewService({ ...newService, price: value });
        };

        const handleAddService = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');

            // Convert Brazilian format (comma) to standard float (dot)
            const numericPrice = newService.price
                ? parseFloat(newService.price.replace(',', '.'))
                : null;

            const res = await fetch(`${API_URL}/services/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newService,
                    price: numericPrice
                })
            });

            if (res.ok) {
                const saved = await res.json();
                setServices([...services, saved]);
                setNewService({ title: '', price: '', duration_type: 'hourly' });
            }
        };

        const handleDeleteService = async (id) => {
            if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

            const token = localStorage.getItem('token');
            const res = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setServices(services.filter(s => s.id !== id));
            }
        };

        return (
            <div>
                <SectionTitle>Meus Serviços</SectionTitle>
                <Card>
                    <form onSubmit={handleAddService} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <input
                            placeholder="Nome do serviço (ex: Pintura de Paredes)"
                            value={newService.title}
                            onChange={e => setNewService({ ...newService, title: e.target.value })}
                            style={{ flex: '2 1 100%', minWidth: '0', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            required
                        />
                        <div style={{ position: 'relative', flex: '1 1 100%', minWidth: '0' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>R$</span>
                            <input
                                placeholder="0,00"
                                type="text"
                                value={newService.price}
                                onChange={handlePriceChange}
                                style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 100%', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Tipo de cobrança:</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input
                                        type="radio"
                                        name="duration_type"
                                        value="hourly"
                                        checked={newService.duration_type === 'hourly'}
                                        onChange={e => setNewService({ ...newService, duration_type: e.target.value })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    Por Hora
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input
                                        type="radio"
                                        name="duration_type"
                                        value="daily"
                                        checked={newService.duration_type === 'daily'}
                                        onChange={e => setNewService({ ...newService, duration_type: e.target.value })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    Diária
                                </label>
                            </div>
                        </div>
                        <button className="btn-primary" type="submit" style={{ padding: '0.875rem 1.5rem' }}>
                            <Plus size={18} /> Adicionar
                        </button>
                    </form>
                </Card>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '1rem' }}>
                    {services.map(s => (
                        <ServiceCard key={s.id} service={s} onDelete={handleDeleteService} onUpdate={fetchData} />
                    ))}
                </div>
            </div>
        );
    };

    const ScheduleView = () => {
        const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const [newWH, setNewWH] = useState({ day_of_week: 0, start_time: '08:00', end_time: '18:00' });

        const handleTimeChange = (field, value) => {
            // Remove non-digits
            let cleaned = value.replace(/\D/g, '');
            if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);

            // Apply mask HH:mm
            let formatted = cleaned;
            if (cleaned.length >= 3) {
                formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
            }

            setNewWH({ ...newWH, [field]: formatted });
        };

        const isValidTime = (timeStr) => {
            const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            return regex.test(timeStr);
        };

        const handleAddWH = async (e) => {
            e.preventDefault();

            if (!isValidTime(newWH.start_time) || !isValidTime(newWH.end_time)) {
                toast.error('Por favor, insira horários válidos no formato 24h (ex: 08:00, 23:59).');
                return;
            }

            if (newWH.start_time >= newWH.end_time) {
                toast.error('O horário de término deve ser posterior ao horário de início.');
                return;
            }

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/schedule/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newWH,
                    start_time: newWH.start_time + ':00',
                    end_time: newWH.end_time + ':00'
                })
            });
            if (res.ok) {
                const saved = await res.json();
                setWorkingHours([...workingHours, saved]);
            }
        };

        const handleDeleteWH = async (id) => {
            if (!confirm('Deseja remover este horário?')) return;
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/schedule/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setWorkingHours(workingHours.filter(wh => wh.id !== id));
            }
        };

        // Sort working hours by day and then by start time
        const sortedWorkingHours = [...workingHours].sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) {
                return a.day_of_week - b.day_of_week;
            }
            return a.start_time.localeCompare(b.start_time);
        });

        return (
            <div>
                <SectionTitle>Horários de Atendimento</SectionTitle>
                <Card>
                    <form onSubmit={handleAddWH} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 100%', minWidth: '0' }}>
                            <Label>Dia da Semana</Label>
                            <select
                                value={newWH.day_of_week}
                                onChange={e => setNewWH({ ...newWH, day_of_week: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            >
                                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                            </select>
                        </div>

                        <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '0' }}>
                            <Label>Início (HH:mm)</Label>
                            <input
                                type="text"
                                placeholder="08:00"
                                maxLength={5}
                                value={newWH.start_time}
                                onChange={e => handleTimeChange('start_time', e.target.value)}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '0' }}>
                            <Label>Término (HH:mm)</Label>
                            <input
                                type="text"
                                placeholder="18:00"
                                maxLength={5}
                                value={newWH.end_time}
                                onChange={e => handleTimeChange('end_time', e.target.value)}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div style={{ alignSelf: 'flex-end', flex: '1 1 100%', minWidth: '0' }}>
                            <button className="btn-primary" type="submit" style={{ padding: '0.875rem 1.5rem', height: '52px', width: '100%' }}>
                                <Plus size={18} /> Adicionar
                            </button>
                        </div>
                    </form>
                </Card>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1rem', marginTop: '2rem' }}>
                    {sortedWorkingHours.map(wh => (
                        <Card key={wh.id} style={{ padding: '1.25rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--primary)' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{days[wh.day_of_week]}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <Clock size={14} />
                                        <span>Início: <strong style={{ color: 'var(--primary)' }}>{wh.start_time.slice(0, 5)}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <Clock size={14} style={{ opacity: 0 }} />
                                        <span>Término: <strong style={{ color: 'var(--primary)' }}>{wh.end_time.slice(0, 5)}</strong></span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteWH(wh.id)}
                                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.6rem', borderRadius: '10px', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                                <Trash2 size={18} />
                            </button>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Carregando dashboard...</div>;

    return (
        <>
            {/* Alerta de Assinatura Inativa */}
            {user && user.subscription_status !== 'active' && (
                <SubscriptionAlert>
                    <span>⚠️ Sua assinatura não está ativa. Você não aparece nas buscas de clientes.</span>
                    <button onClick={() => navigate('/subscription/setup')}>
                        Ativar Agora
                    </button>
                </SubscriptionAlert>
            )}


            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'services' && <ServicesView />}
            {activeTab === 'schedule' && <ScheduleView />}

            {/* Modal de Bloqueio de Horário */}
            {showBlockModal && (
                <div
                    onClick={() => setShowBlockModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <ModalContent
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalHeader>
                            <h2>Bloquear Horário</h2>
                            <button onClick={() => setShowBlockModal(false)}>
                                <X size={24} />
                            </button>
                        </ModalHeader>

                        <form onSubmit={handleCreateBlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Data
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={blockDateDisplay}
                                        onChange={(e) => handleDateInput(e.target.value)}
                                        placeholder="dd/mm/aaaa"
                                        maxLength={10}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            paddingRight: '3rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit'
                                        }}
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={blockForm.date}
                                        onChange={(e) => {
                                            setBlockForm({ ...blockForm, date: e.target.value });
                                            setBlockDateDisplay(formatDateToBR(e.target.value));
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            position: 'absolute',
                                            right: '0.5rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '2rem',
                                            height: '2rem',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <CalendarIcon
                                        size={20}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-secondary)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Horário Inicial
                                    </label>
                                    <select
                                        value={blockForm.start_time}
                                        onChange={(e) => setBlockForm({ ...blockForm, start_time: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer'
                                        }}
                                        required
                                    >
                                        {Array.from({ length: 24 }, (_, i) => {
                                            const hour = i.toString().padStart(2, '0');
                                            return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Horário Final
                                    </label>
                                    <select
                                        value={blockForm.end_time}
                                        onChange={(e) => setBlockForm({ ...blockForm, end_time: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer'
                                        }}
                                        required
                                    >
                                        {Array.from({ length: 24 }, (_, i) => {
                                            const hour = i.toString().padStart(2, '0');
                                            return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Motivo (opcional)
                                </label>
                                <textarea
                                    value={blockForm.reason}
                                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                                    placeholder="Ex: Serviço vai durar mais tempo que o planejado"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowBlockModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        borderRadius: '12px',
                                        fontWeight: 600
                                    }}
                                >
                                    Bloquear
                                </button>
                            </div>
                        </form>
                    </ModalContent>
                </div>
            )}
        </>
    );
}
