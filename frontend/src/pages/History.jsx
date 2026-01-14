import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    ChevronLeft, ChevronRight, Calendar, Clock, User, Briefcase,
    CheckCircle, XCircle, AlertCircle, History as HistoryIcon, Filter, X
} from 'lucide-react';
import { toast } from 'sonner';

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h1 {
    background: linear-gradient(135deg, var(--text-primary), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    h1 {
      font-size: 1.5rem !important;
    }

    > div {
      width: 100%;
      flex-direction: column;
      align-items: flex-start !important;
      gap: 1rem !important;
    }
  }
`;

const FiltersContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid var(--border);
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const DateInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    right: 0.75rem;
    color: var(--text-secondary);
    pointer-events: none;
  }

  input {
    padding-right: 2.5rem;
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  @media (max-width: 480px) {
    font-size: 0.875rem;
    padding: 0.65rem;
  }
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-secondary);
  border: 2px solid ${props => props.$invalid ? '#ef4444' : 'var(--border)'};
  border-radius: 12px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$invalid ? '#ef4444' : 'var(--primary)'};
    background: white;
    box-shadow: 0 0 0 3px ${props => props.$invalid ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  }

  &[type="text"] {
    font-family: inherit;
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  @media (max-width: 480px) {
    font-size: 0.875rem;
    padding: 0.65rem;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  color: var(--text-primary);

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }
`;

const PeriodButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PeriodButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'var(--primary)' : 'var(--bg-secondary)'};
  border: 2px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};

  &:hover {
    border-color: var(--primary);
    color: ${props => props.$active ? 'white' : 'var(--primary)'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HistoryCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: var(--primary);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.15);
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;

    &:active {
      transform: scale(0.98);
    }
  }
`;


const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;
  border: 2px solid;

  ${props => {
        switch (props.$status) {
            case 'scheduled': return 'background: rgba(14, 165, 233, 0.1); color: #0369a1; border-color: rgba(14, 165, 233, 0.2);';
            case 'completed': return 'background: rgba(34, 197, 94, 0.1); color: #15803d; border-color: rgba(34, 197, 94, 0.2);';
            case 'cancelled': return 'background: rgba(239, 68, 68, 0.1); color: #b91c1c; border-color: rgba(239, 68, 68, 0.2);';
            case 'suspended': return 'background: rgba(245, 158, 11, 0.1); color: #92400e; border-color: rgba(245, 158, 11, 0.2);';
            default: return 'background: rgba(148, 163, 184, 0.1); color: #475569; border-color: rgba(148, 163, 184, 0.2);';
        }
    }}
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  border: 2px solid var(--border);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    gap: 0.5rem;
    margin-top: 2rem;
  }
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 0.75rem;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: ${props => props.$active ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: var(--primary);
    color: ${props => props.$active ? 'white' : 'var(--primary)'};
    transform: ${props => props.$active ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.$active ? '0 8px 20px rgba(99, 102, 241, 0.35)' : 'none'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-width: 40px;
    height: 40px;
    padding: 0 0.5rem;
    font-size: 0.875rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 32px;
  border: 2px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  h3 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 1.5rem 0 0.75rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    border-radius: 20px;

    h3 {
      font-size: 1.25rem;
    }

    p {
      font-size: 0.95rem;
    }
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 5rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
  font-weight: 600;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  border: 2px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;

    span {
      color: var(--primary);
      font-weight: 800;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: white;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }

  &:active {
    transform: translateX(-2px);
  }
`;

export default function History() {
    const navigate = useNavigate();
    const [data, setData] = useState({ items: [], total: 0, page: 1, size: 10, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [isProfessional, setIsProfessional] = useState(false);
    const [people, setPeople] = useState([]);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState(''); // Formato ISO para backend
    const [endDate, setEndDate] = useState(''); // Formato ISO para backend
    const [startDateBr, setStartDateBr] = useState(''); // Formato BR para exibição
    const [endDateBr, setEndDateBr] = useState(''); // Formato BR para exibição
    const [personFilter, setPersonFilter] = useState('');
    const [activePeriod, setActivePeriod] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsProfessional(payload.is_professional);
        }
        fetchPeople();
        fetchHistory(1);
    }, []);

    const fetchPeople = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/appointments/history/filters/people', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPeople(await res.json());
            }
        } catch (e) {
            console.error('Erro ao carregar lista de pessoas');
        }
    };

    const fetchHistory = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: '9'
            });

            if (statusFilter) params.append('status_filter', statusFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (personFilter) {
                if (isProfessional) {
                    params.append('client_id', personFilter);
                } else {
                    params.append('professional_id', personFilter);
                }
            }

            const res = await fetch(`/api/appointments/history?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setData(await res.json());
            }
        } catch (e) {
            toast.error('Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
    };

    const toSaoPauloDate = (date) => {
        // Converte para timezone de São Paulo
        return new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    };

    const formatDateInput = (date) => {
        // Formata data para input type="date" (YYYY-MM-DD)
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Converte dd/MM/yyyy para yyyy-MM-dd (formato ISO para backend)
    const brDateToIso = (brDate) => {
        if (!brDate || brDate.length !== 10) return '';
        const [d, m, y] = brDate.split('/');
        return `${y}-${m}-${d}`;
    };

    // Converte yyyy-MM-dd (formato ISO) para dd/MM/yyyy
    const isoToBrDate = (isoDate) => {
        if (!isoDate) return '';
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y}`;
    };

    // Formata data durante digitação (adiciona barras automaticamente)
    const formatBrDateInput = (value) => {
        // Remove tudo que não for número
        const numbers = value.replace(/\D/g, '');

        // Adiciona as barras conforme digita
        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 4) {
            return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        } else {
            return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
        }
    };

    // Valida se a data está no formato correto dd/MM/yyyy
    const isValidBrDate = (brDate) => {
        if (!brDate || brDate.length !== 10) return false;
        const [d, m, y] = brDate.split('/').map(Number);
        if (!d || !m || !y) return false;
        if (d < 1 || d > 31) return false;
        if (m < 1 || m > 12) return false;
        if (y < 1900 || y > 2100) return false;
        return true;
    };

    const setPeriod = (period) => {
        const today = toSaoPauloDate(new Date());
        let start, end;

        setActivePeriod(period);

        switch (period) {
            case 'today':
                start = end = today;
                break;
            case 'week':
                start = new Date(today);
                start.setDate(today.getDate() - 7);
                end = today;
                break;
            case 'month':
                start = new Date(today);
                start.setDate(today.getDate() - 30);
                end = today;
                break;
            case 'quarter':
                start = new Date(today);
                start.setDate(today.getDate() - 90);
                end = today;
                break;
            case 'year':
                start = new Date(today);
                start.setFullYear(today.getFullYear() - 1);
                end = today;
                break;
            default:
                return;
        }

        const startIso = formatDateInput(start);
        const endIso = formatDateInput(end);

        setStartDate(startIso);
        setEndDate(endIso);
        setStartDateBr(isoToBrDate(startIso));
        setEndDateBr(isoToBrDate(endIso));
    };

    const clearFilters = () => {
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setStartDateBr('');
        setEndDateBr('');
        setPersonFilter('');
        setActivePeriod('');
        fetchHistory(1);
    };

    const applyFilters = () => {
        fetchHistory(1);
    };

    const handleStartDateChange = (e) => {
        const formatted = formatBrDateInput(e.target.value);
        setStartDateBr(formatted);
        setActivePeriod('');

        // Só converte para ISO se a data estiver completa e válida
        if (formatted.length === 10 && isValidBrDate(formatted)) {
            setStartDate(brDateToIso(formatted));
        } else if (formatted.length === 0) {
            setStartDate('');
        }
    };

    const handleEndDateChange = (e) => {
        const formatted = formatBrDateInput(e.target.value);
        setEndDateBr(formatted);
        setActivePeriod('');

        // Só converte para ISO se a data estiver completa e válida
        if (formatted.length === 10 && isValidBrDate(formatted)) {
            setEndDate(brDateToIso(formatted));
        } else if (formatted.length === 0) {
            setEndDate('');
        }
    };

    return (
        <Container>
            <Content>
                <Header>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <BackButton onClick={() => navigate(isProfessional ? '/dashboard' : '/my-appointments')}>
                            <ChevronLeft size={20} />
                            Voltar
                        </BackButton>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HistoryIcon size={32} color="var(--primary)" /> Histórico de Serviços
                        </h1>
                    </div>
                </Header>

                <FiltersContainer>
                    <FiltersHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Filter size={24} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Filtros</h2>
                        </div>
                    </FiltersHeader>

                    <FiltersGrid>
                        <FilterGroup>
                            <Label>Status</Label>
                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="scheduled">Agendado</option>
                                <option value="completed">Concluído</option>
                                <option value="cancelled">Cancelado</option>
                                <option value="suspended">Suspenso</option>
                            </Select>
                        </FilterGroup>

                        <FilterGroup>
                            <Label>{isProfessional ? 'Cliente' : 'Profissional'}</Label>
                            <Select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
                                <option value="">Todos</option>
                                {people.map(person => (
                                    <option key={person.id} value={person.id}>{person.name}</option>
                                ))}
                            </Select>
                        </FilterGroup>

                        <FilterGroup>
                            <Label>Data Inicial</Label>
                            <DateInputWrapper>
                                <Input
                                    type="text"
                                    placeholder="dd/mm/aaaa"
                                    value={startDateBr}
                                    onChange={handleStartDateChange}
                                    maxLength="10"
                                    $invalid={startDateBr.length > 0 && startDateBr.length < 10}
                                />
                                <Calendar size={18} />
                            </DateInputWrapper>
                        </FilterGroup>

                        <FilterGroup>
                            <Label>Data Final</Label>
                            <DateInputWrapper>
                                <Input
                                    type="text"
                                    placeholder="dd/mm/aaaa"
                                    value={endDateBr}
                                    onChange={handleEndDateChange}
                                    maxLength="10"
                                    $invalid={endDateBr.length > 0 && endDateBr.length < 10}
                                />
                                <Calendar size={18} />
                            </DateInputWrapper>
                        </FilterGroup>
                    </FiltersGrid>

                    <FilterGroup style={{ marginBottom: '1rem' }}>
                        <Label>Períodos Rápidos</Label>
                        <PeriodButtons>
                            <PeriodButton $active={activePeriod === 'today'} onClick={() => setPeriod('today')}>
                                Hoje
                            </PeriodButton>
                            <PeriodButton $active={activePeriod === 'week'} onClick={() => setPeriod('week')}>
                                Últimos 7 dias
                            </PeriodButton>
                            <PeriodButton $active={activePeriod === 'month'} onClick={() => setPeriod('month')}>
                                Últimos 30 dias
                            </PeriodButton>
                            <PeriodButton $active={activePeriod === 'quarter'} onClick={() => setPeriod('quarter')}>
                                Últimos 90 dias
                            </PeriodButton>
                            <PeriodButton $active={activePeriod === 'year'} onClick={() => setPeriod('year')}>
                                Último ano
                            </PeriodButton>
                        </PeriodButtons>
                    </FilterGroup>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <ClearButton onClick={clearFilters}>
                            <X size={18} />
                            Limpar
                        </ClearButton>
                        <FilterButton onClick={applyFilters}>
                            <Filter size={18} />
                            Aplicar
                        </FilterButton>
                    </div>
                </FiltersContainer>

                {loading ? (
                    <LoadingState>Carregando histórico...</LoadingState>
                ) : data.items.length > 0 ? (
                    <>
                        <ResultsHeader>
                            <h3>
                                Encontrados <span>{data.total}</span> {data.total === 1 ? 'registro' : 'registros'}
                            </h3>
                        </ResultsHeader>
                        <Grid>
                            {data.items.map(appt => (
                                <HistoryCard key={appt.id} onClick={() => navigate(`/appointment/${appt.id}`)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                        <StatusBadge $status={appt.status}>
                                            {appt.status === 'scheduled' && <Clock size={16} />}
                                            {appt.status === 'completed' && <CheckCircle size={16} />}
                                            {appt.status === 'cancelled' && <XCircle size={16} />}
                                            {appt.status === 'suspended' && <AlertCircle size={16} />}
                                            {appt.status === 'scheduled' ? 'Agendado' :
                                                appt.status === 'completed' ? 'Concluído' :
                                                    appt.status === 'cancelled' ? 'Cancelado' : 'Suspenso'}
                                        </StatusBadge>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 700, background: 'var(--bg-secondary)', padding: '0.375rem 0.75rem', borderRadius: '8px' }}>
                                            #{appt.id}
                                        </span>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            <Briefcase size={16} />
                                            {appt.professional_category || 'Serviço'}
                                        </div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: '1.3', color: 'var(--text-primary)' }}>
                                            {appt.service_title}
                                        </h3>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                            <User size={20} style={{ color: 'var(--text-secondary)' }} />
                                            {isProfessional ? appt.client_name : appt.professional_name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                            <Calendar size={20} />
                                            {formatDate(appt.date)} às {appt.start_time.slice(0, 5)}
                                        </div>
                                    </div>
                                </HistoryCard>
                            ))}
                        </Grid>

                        {data.pages > 1 && (
                            <Pagination>
                                <PageButton
                                    disabled={data.page === 1}
                                    onClick={() => fetchHistory(data.page - 1)}
                                >
                                    <ChevronLeft size={20} />
                                </PageButton>

                                {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                                    <PageButton
                                        key={p}
                                        $active={p === data.page}
                                        onClick={() => fetchHistory(p)}
                                    >
                                        {p}
                                    </PageButton>
                                ))}

                                <PageButton
                                    disabled={data.page === data.pages}
                                    onClick={() => fetchHistory(data.page + 1)}
                                >
                                    <ChevronRight size={20} />
                                </PageButton>
                            </Pagination>
                        )}
                    </>
                ) : (
                    <EmptyState>
                        <HistoryIcon size={64} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
                        <h3>Nenhum registro encontrado</h3>
                        <p>Você ainda não possui histórico de serviços ou nenhum resultado corresponde aos filtros aplicados.</p>
                    </EmptyState>
                )}
            </Content>
        </Container>
    );
}
