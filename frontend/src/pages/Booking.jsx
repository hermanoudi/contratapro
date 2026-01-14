import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar as CalendarIcon, Clock, MapPin, Star, ChevronLeft, CheckCircle, Briefcase, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const BookingContainer = styled.div`
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
  }
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;

  .back-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    margin-bottom: 2rem;
    font-size: 1rem;

    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
  }
`;

const ProHeader = styled.div`
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid var(--border);
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 12px;
  }

  @media (max-width: 360px) {
    gap: 0.75rem;
    padding: 1rem;
  }

  .pro-avatar {
    width: 100px;
    height: 100px;
    border-radius: 24px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    overflow: hidden;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 80px;
      height: 80px;
      font-size: 2rem;
      border-radius: 16px;
    }

    @media (max-width: 360px) {
      width: 70px;
      height: 70px;
      font-size: 1.75rem;
      border-radius: 12px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h1 {
    font-size: 2rem;
    font-weight: 800;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }

    @media (max-width: 480px) {
      font-size: 1.3rem;
    }

    @media (max-width: 380px) {
      font-size: 1.2rem;
    }
  }

  .pro-category {
    color: var(--primary);
    font-weight: 600;
    font-size: 1.1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }

    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }

  .pro-description {
    color: var(--text-secondary);
    margin-top: 1rem;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const Section = styled.div`
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid var(--border);
  margin-bottom: 2rem;
  box-sizing: border-box;
  max-width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 360px) {
    padding: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    line-height: 1.4;
    word-break: break-word;

    svg {
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      font-size: 1.05rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 480px) {
      font-size: 0.88rem;
      gap: 0.4rem;
      line-height: 1.3;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    @media (max-width: 380px) {
      font-size: 0.82rem;
      gap: 0.35rem;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    @media (max-width: 360px) {
      font-size: 0.62rem;
      gap: 0.15rem;
      line-height: 1.1;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }

  h3 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-secondary);

    @media (max-width: 768px) {
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      font-size: 0.85rem;
      line-height: 1.3;
    }

    @media (max-width: 380px) {
      font-size: 0.8rem;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(120px, 100%), 1fr));
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.65rem;
    margin-top: 1rem;
  }

  @media (max-width: 400px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  @media (max-width: 360px) {
    gap: 0.4rem;
  }
`;

const SlotButton = styled.button`
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$selected ? 'var(--primary)' : 'var(--border)'};
  background: ${props => props.$selected ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)'};
  color: ${props => props.$selected ? 'var(--primary)' : 'var(--text-primary)'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.3 : 1};
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1rem;
  min-height: 48px;

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
    min-height: 44px;
  }

  @media (max-width: 480px) {
    padding: 0.65rem 0.4rem;
    font-size: 0.85rem;
    min-height: 42px;
    border-radius: 10px;
  }

  @media (max-width: 360px) {
    padding: 0.5rem 0.3rem;
    font-size: 0.8rem;
    min-height: 40px;
    border-radius: 8px;
  }

  &:hover:not(:disabled) {
    border-color: var(--primary);
  }
`;

const ServiceCard = styled.div`
  border-radius: 16px;
  border: 1px solid ${props => props.$selected ? 'var(--primary)' : 'var(--border)'};
  background: ${props => props.$selected ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-primary)'};
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ServiceCardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 480px) {
    padding: 0.85rem;
  }
`;

const ServiceTitle = styled.p`
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ServicePrice = styled.p`
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  font-size: 1.1rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const ServiceDuration = styled.p`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const BookingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  > * {
    max-width: 100%;
    min-width: 0;
  }
`;

const LoginSection = styled.div`
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border: 2px solid #ef4444;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
  text-align: center;

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 12px;
  }

  @media (max-width: 360px) {
    padding: 1rem;
  }
`;

const LoginButton = styled.button`
  padding: 0.875rem 2rem;
  min-width: 200px;

  @media (max-width: 480px) {
    padding: 0.75rem 1.5rem;
    min-width: 160px;
  }

  @media (max-width: 360px) {
    padding: 0.65rem 1rem;
    min-width: 0;
    width: 100%;
  }
`;

const RegisterButton = styled.button`
  padding: 0.875rem 2rem;
  min-width: 200px;
  border-radius: 10px;
  border: 2px solid var(--primary);
  background: transparent;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 480px) {
    padding: 0.75rem 1.5rem;
    min-width: 160px;
  }

  @media (max-width: 360px) {
    padding: 0.65rem 1rem;
    min-width: 0;
    width: 100%;
  }

  &:hover {
    background: var(--primary);
    color: white;
  }
`;

const SuccessContainer = styled(motion.div)`
  text-align: center;
  background: var(--bg-secondary);
  padding: 3rem;
  border-radius: 32px;
  border: 1px solid var(--primary);
  max-width: 600px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 2.5rem;
    border-radius: 24px;
  }

  @media (max-width: 480px) {
    padding: 2rem;
    border-radius: 16px;
  }

  @media (max-width: 360px) {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .success-icon {
    margin-bottom: 1.5rem;
    width: 80px;
    height: 80px;

    @media (max-width: 768px) {
      width: 64px;
      height: 64px;
      margin-bottom: 1.25rem;
    }

    @media (max-width: 480px) {
      width: 56px;
      height: 56px;
      margin-bottom: 1rem;
    }
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);

    @media (max-width: 768px) {
      font-size: 2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.75rem;
    }

    @media (max-width: 360px) {
      font-size: 1.5rem;
    }
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 1.25rem;
    }

    @media (max-width: 480px) {
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }
  }

  .price-warning {
    background: #FFF4E6;
    border: 1px solid #FFB74D;
    border-radius: 12px;
    padding: 1rem;
    margin: 1.5rem 0;
    text-align: left;

    @media (max-width: 480px) {
      padding: 0.875rem;
      margin: 1.25rem 0;
      border-radius: 8px;
    }

    p {
      color: #E65100;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.5;

      @media (max-width: 480px) {
        font-size: 0.85rem;
      }
    }
  }

  .whatsapp-button {
    background: #25D366;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    margin-bottom: 1rem;
    width: 100%;
    max-width: 300px;

    @media (max-width: 480px) {
      padding: 0.875rem 1.5rem;
      font-size: 0.95rem;
      max-width: 100%;
    }

    &:hover {
      background: #20BA5A;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    svg {
      width: 20px;
      height: 20px;
      margin: 0;
    }
  }

  .home-button {
    background: transparent;
    color: var(--primary);
    border: 2px solid var(--primary);
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    max-width: 300px;

    @media (max-width: 480px) {
      padding: 0.875rem 1.5rem;
      font-size: 0.95rem;
      max-width: 100%;
    }

    &:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
    }
  }
`;

const CalendarWrapper = styled.div`
  max-width: 100%;
  overflow-x: hidden;

  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 16px;
    background: var(--bg-primary);
    font-family: inherit;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    max-width: 100%;
    box-sizing: border-box;

    @media (max-width: 768px) {
      padding: 1rem;
    }

    @media (max-width: 480px) {
      padding: 0.75rem;
    }

    @media (max-width: 380px) {
      padding: 0.5rem;
    }

    @media (max-width: 360px) {
      padding: 0.4rem;
    }
  }

  .react-calendar__navigation {
    display: flex;
    margin-bottom: 1.5rem;
    height: auto;
    gap: 0.5rem;
  }

  .react-calendar__navigation button {
    color: var(--text-primary);
    min-width: 44px;
    background: var(--bg-secondary);
    font-size: 1rem;
    font-weight: 700;
    border: 1px solid var(--border);
    padding: 0.75rem;
    border-radius: 12px;
    transition: all 0.2s;

    &:enabled:hover,
    &:enabled:focus {
      background-color: rgba(37, 99, 235, 0.1);
      color: var(--primary);
      border-color: var(--primary);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .react-calendar__navigation__label {
    flex-grow: 1 !important;
    font-size: 1.1rem;

    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;

    @media (max-width: 480px) {
      font-size: 0.6rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 380px) {
      font-size: 0.55rem;
    }
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 0.75rem 0.5rem;

    @media (max-width: 480px) {
      padding: 0.5rem 0.25rem;
    }

    @media (max-width: 380px) {
      padding: 0.4rem 0.15rem;
    }

    abbr {
      text-decoration: none;
    }
  }

  .react-calendar__tile {
    max-width: 100%;
    aspect-ratio: 1;
    padding: 0.5rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-primary);
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;

    @media (max-width: 768px) {
      padding: 0.45rem;
      font-size: 0.9rem;
      border-radius: 8px;
    }

    @media (max-width: 480px) {
      padding: 0.4rem;
      font-size: 0.85rem;
      min-height: 38px;
    }

    @media (max-width: 380px) {
      padding: 0.35rem;
      font-size: 0.8rem;
      min-height: 36px;
    }

    &:enabled:hover,
    &:enabled:focus {
      background-color: rgba(37, 99, 235, 0.1);
      border-color: var(--primary);
      color: var(--primary);
      transform: scale(1.05);
    }

    &.react-calendar__tile--now {
      background: rgba(37, 99, 235, 0.05);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 800;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: var(--primary);
        border-radius: 50%;
      }
    }

    &.react-calendar__tile--active {
      background: var(--primary) !important;
      color: white !important;
      border-color: var(--primary) !important;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transform: scale(1.05);
    }

    &.react-calendar__tile--hasActive {
      background: var(--primary);
      color: white;
    }

    &:disabled {
      background: var(--bg-secondary);
      opacity: 0.3;
      cursor: not-allowed;

      &:hover {
        transform: none;
      }
    }

    &.react-calendar__month-view__days__day--neighboringMonth {
      opacity: 0.4;
      color: var(--text-secondary);
    }

    &.react-calendar__month-view__days__day--weekend:not(.react-calendar__tile--active) {
      color: #ef4444;
    }
  }

  .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    max-width: 100%;
    box-sizing: border-box;

    @media (max-width: 480px) {
      gap: 4px;
    }

    @media (max-width: 360px) {
      gap: 3px;
    }
  }

  .react-calendar__year-view .react-calendar__tile,
  .react-calendar__decade-view .react-calendar__tile,
  .react-calendar__century-view .react-calendar__tile {
    padding: 1.5rem 1rem;
    aspect-ratio: auto;
    border-radius: 12px;
    font-weight: 600;

    &:enabled:hover,
    &:enabled:focus {
      background-color: rgba(37, 99, 235, 0.1);
      color: var(--primary);
      border-color: var(--primary);
    }
  }
`;

export default function Booking() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [pro, setPro] = useState(location.state?.pro || null);
    const [services, setServices] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');

    const [clientCep, setClientCep] = useState('');
    const [clientCity, setClientCity] = useState('');
    const [matching, setMatching] = useState(null); // null, true, false
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Buscar dados do cliente logado (incluindo CEP)
    useEffect(() => {
        const fetchClientData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                return;
            }

            setIsLoggedIn(true);

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const userData = await res.json();
                    if (userData.cep) {
                        const cepDigits = userData.cep.replace(/\D/g, '');
                        setClientCep(cepDigits);
                        setClientCity(userData.city || '');
                    }
                }
            } catch (e) {
                console.error('Erro ao buscar dados do cliente:', e);
            }
        };

        fetchClientData();
    }, []);

    useEffect(() => {
        const fetchProData = async () => {
            try {
                const res = await fetch(`/api/users/${id}/public`);
                if (res.ok) {
                    const data = await res.json();
                    setPro(data);
                    setServices(data.services);
                    setWorkingHours(data.working_hours);
                }

                const apptRes = await fetch(`/api/appointments/professional/${id}/week?start_date=${new Date().toISOString().split('T')[0]}`);
                if (apptRes.ok) {
                    setAppointments(await apptRes.json());
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchProData();
    }, [id]);

    useEffect(() => {
        if (pro && clientCity) {
            // Verificar se cliente e profissional estão na mesma cidade
            if (clientCity.toLowerCase() === pro.city.toLowerCase()) {
                setMatching(true);
            } else {
                setMatching(false);
            }
        }
    }, [pro, clientCity]);

    const formatDateToISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isDayAvailable = () => {
        const now = new Date();
        const todayStr = formatDateToISO(now);
        const selectedDateStr = formatDateToISO(selectedDate);

        // Não permite agendar dias passados
        if (selectedDateStr < todayStr) return false;

        const dayOfWeek = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
        const wh = workingHours.find(w => w.day_of_week === dayOfWeek);

        // Se não tem horário de trabalho, o dia não está disponível
        if (!wh) return false;

        // Verifica se há QUALQUER agendamento neste dia
        const hasAnyAppointment = appointments.some(a => a.date === selectedDateStr);

        return !hasAnyAppointment;
    };

    const getAvailableSlots = () => {
        const now = new Date();
        const todayStr = formatDateToISO(now);
        const currentHour = now.getHours();
        const selectedDateStr = formatDateToISO(selectedDate);

        const dayOfWeek = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1; // 0=Mon, 6=Sun

        const wh = workingHours.find(w => w.day_of_week === dayOfWeek);
        if (!wh) return [];

        const start = parseInt(wh.start_time.split(':')[0]);
        const end = parseInt(wh.end_time.split(':')[0]);
        const slots = [];

        for (let h = start; h < end; h++) {
            const time = `${String(h).padStart(2, '0')}:00`;
            const isOccupied = appointments.some(a => a.date === selectedDateStr && a.start_time.startsWith(time));

            let isPast = false;
            if (selectedDateStr === todayStr && h <= currentHour) {
                isPast = true;
            }

            slots.push({ time, isOccupied: isOccupied || isPast });
        }
        return slots;
    };

    const handleBook = async () => {
        if (!selectedService) {
            toast.error('Por favor, selecione um serviço primeiro.');
            return;
        }
        if (!selectedSlot) {
            toast.error(selectedService.duration_type === 'daily' ? 'Por favor, selecione o dia.' : 'Por favor, escolha um horário disponível.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Você precisa estar logado para agendar.');
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (!clientCity) {
            toast.error('Complete seu cadastro com CEP e endereço antes de agendar.');
            return;
        }

        if (matching === false) {
            toast.error(`Desculpe, este profissional atende apenas em ${pro.city}, ${pro.state}.`);
            return;
        }

        setBooking(true);
        try {
            let requestBody;

            if (selectedService.duration_type === 'daily') {
                // Para serviços diários, enviar apenas a data
                // O backend irá buscar o horário de trabalho completo do dia
                requestBody = {
                    professional_id: parseInt(id),
                    service_id: selectedService.id,
                    date: formatDateToISO(selectedDate)
                    // Não envia start_time e end_time - backend preenche automaticamente
                };
            } else {
                // Para serviços por hora, usar o slot selecionado
                requestBody = {
                    professional_id: parseInt(id),
                    service_id: selectedService.id,
                    date: formatDateToISO(selectedDate),
                    start_time: selectedSlot + ':00',
                    end_time: (parseInt(selectedSlot.split(':')[0]) + 1).toString().padStart(2, '0') + ':00:00'
                };
            }

            const res = await fetch('/api/appointments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (res.ok) {
                const appointmentData = await res.json();
                // Armazenar o link do WhatsApp retornado pelo backend
                if (appointmentData.whatsapp_link) {
                    setWhatsappLink(appointmentData.whatsapp_link);
                }
                setSuccess(true);
            } else {
                const data = await res.json();
                toast.error(data.detail || 'Erro ao agendar.');
            }
        } catch (e) { console.error(e); }
        finally { setBooking(false); }
    };

    if (loading) return <BookingContainer>Carregando...</BookingContainer>;
    if (!pro) return <BookingContainer>Profissional não encontrado.</BookingContainer>;

    if (success) {
        return (
            <BookingContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                <SuccessContainer
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <CheckCircle className="success-icon" color="var(--primary)" />
                    <h1>Agendamento Confirmado!</h1>
                    <p>
                        Seu horário com <strong>{pro.name}</strong> foi reservado com sucesso.
                    </p>

                    <div className="price-warning">
                        <p>
                            <strong>⚠️ Atenção:</strong> Os valores dos serviços podem sofrer alterações devido à execução, pois muitos serviços não são por tempo e sim por execução. Confirme com o prestador de serviços os valores e obtenha o orçamento diretamente com o mesmo.
                        </p>
                    </div>

                    {whatsappLink && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-button"
                        >
                            <MessageCircle size={20} />
                            Confirmar no WhatsApp
                        </a>
                    )}
                    <button className="home-button" onClick={() => navigate('/')}>
                        Voltar para o Início
                    </button>
                </SuccessContainer>
            </BookingContainer>
        );
    }

    return (
        <BookingContainer>
            <Content>
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} /> Voltar para busca
                </button>

                <ProHeader>
                    <div className="pro-avatar">
                        {pro.profile_picture ? (
                            <img src={pro.profile_picture} alt={pro.name} />
                        ) : (
                            pro.name[0]
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                <h1>{pro.name}</h1>
                                <p className="pro-category">{pro.category}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border)', flexShrink: 0 }}>
                                <Star size={16} fill="var(--accent)" color="var(--accent)" />
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>4.9</span>
                            </div>
                        </div>
                        <p className="pro-description">{pro.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>
                            <MapPin size={14} />
                            {pro.city}, {pro.state}
                        </div>
                    </div>
                </ProHeader>

                <BookingGrid>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Section>
                            <h2>
                                <Briefcase size={20} color="var(--primary)" /> Selecione o Serviço
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {services.map(s => (
                                    <ServiceCard
                                        key={s.id}
                                        $selected={selectedService?.id === s.id}
                                        onClick={() => {
                                            setSelectedService(s);
                                            setSelectedSlot(null); // Reset slot when service changes
                                        }}
                                    >
                                        {s.image_url && (
                                            <img
                                                src={s.image_url}
                                                alt={s.title}
                                                style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        )}
                                        <ServiceCardContent>
                                            <ServiceTitle>{s.title}</ServiceTitle>
                                            <ServicePrice>
                                                {s.price ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob consulta'}
                                            </ServicePrice>
                                            <ServiceDuration>
                                                {s.duration_type === 'daily' ? 'Diária' : 'Por hora'}
                                            </ServiceDuration>
                                        </ServiceCardContent>
                                    </ServiceCard>
                                ))}
                            </div>
                        </Section>

                        {matching === false && (
                            <Section style={{ border: '2px solid #dc2626', background: 'rgba(220, 38, 38, 0.03)', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#dc2626' }}>
                                    <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                                            Este profissional atende apenas em {pro.city}, {pro.state}.
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0, lineHeight: 1.4 }}>
                                            Seu cadastro indica que você está em {clientCity}. Você não poderá agendar com este profissional.
                                        </p>
                                    </div>
                                </div>
                            </Section>
                        )}

                        {matching === true && (
                            <Section style={{ border: '2px solid #059669', background: 'rgba(5, 150, 105, 0.03)', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#059669' }}>
                                    <CheckCircle size={18} style={{ flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                                        ✓ Este profissional atende sua região!
                                    </p>
                                </div>
                            </Section>
                        )}
                    </div>

                    <Section>
                        <h2>
                            <CalendarIcon size={20} color="var(--primary)" /> Escolha a Data e o Horário
                        </h2>

                        <CalendarWrapper style={{ marginBottom: '2rem' }}>
                            <Calendar
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    setSelectedSlot(null); // Reset slot when date changes
                                }}
                                value={selectedDate}
                                minDate={new Date()}
                                locale="pt-BR"
                                formatShortWeekday={(locale, date) => {
                                    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                                    return days[date.getDay()];
                                }}
                                formatMonthYear={(locale, date) => {
                                    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                                    return `${months[date.getMonth()]} ${date.getFullYear()}`;
                                }}
                            />
                        </CalendarWrapper>

                        {selectedService?.duration_type === 'daily' ? (
                            <>
                                <h3>
                                    Agendamento de diária para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </h3>
                                <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '16px', border: '2px solid var(--border)', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                        Este serviço ocupa o dia completo de trabalho do profissional.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '1.25rem', fontSize: '1.05rem' }}
                                        onClick={() => setSelectedSlot('daily')}
                                        disabled={!isDayAvailable()}
                                    >
                                        {selectedSlot === 'daily' ? '✓ Dia selecionado' : 'Agendar este dia'}
                                    </button>
                                    {!isDayAvailable() && (
                                        <p style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.9rem' }}>
                                            Este dia já está ocupado ou não está disponível.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>
                                    Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </h3>
                                <Grid>
                                    {getAvailableSlots().map(slot => (
                                        <SlotButton
                                            key={slot.time}
                                            $selected={selectedSlot === slot.time}
                                            $disabled={slot.isOccupied}
                                            disabled={slot.isOccupied}
                                            onClick={() => setSelectedSlot(slot.time)}
                                        >
                                            {slot.time}
                                        </SlotButton>
                                    ))}
                                    {getAvailableSlots().length === 0 && (
                                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                            Nenhum horário disponível para este dia.
                                        </p>
                                    )}
                                </Grid>
                            </>
                        )}

                        {!isLoggedIn && (
                            <LoginSection>
                                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.75rem' }}>
                                    🔒 Login Necessário
                                </p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Você precisa estar logado para realizar um agendamento.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                                    <LoginButton
                                        className="btn-primary"
                                        onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                    >
                                        Fazer Login
                                    </LoginButton>
                                    <RegisterButton
                                        onClick={() => navigate('/register-client', { state: { from: location.pathname } })}
                                    >
                                        Criar Conta
                                    </RegisterButton>
                                </div>
                            </LoginSection>
                        )}

                        <button
                            className="btn-primary"
                            style={{
                                width: '100%',
                                marginTop: '3rem',
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                opacity: isLoggedIn ? 1 : 0.5,
                                cursor: isLoggedIn ? 'pointer' : 'not-allowed'
                            }}
                            disabled={booking || !isLoggedIn}
                            onClick={handleBook}
                        >
                            {booking ? 'Processando...' : 'Confirmar Agendamento'}
                        </button>
                        {!selectedService && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ef4444', marginTop: '1rem' }}>Selecione um serviço primeiro</p>}
                        {selectedService && !selectedSlot && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ef4444', marginTop: '1rem' }}>Escolha um horário disponível</p>}
                        {selectedSlot && matching === false && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ef4444', marginTop: '1rem' }}>Profissional não atende sua região</p>}
                    </Section>
                </BookingGrid>
            </Content>
        </BookingContainer >
    );
}
