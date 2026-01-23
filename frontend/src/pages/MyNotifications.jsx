import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    ChevronLeft, ChevronRight, Calendar, Bell, Filter, X,
    CheckCircle, XCircle, AlertCircle, Clock, Mail, Search,
    User, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';

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
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    h1 {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.75rem;

        @media (max-width: 768px) {
            font-size: 1.5rem;
        }
    }
`;

const FilterButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: var(--primary);
        color: var(--primary);
    }
`;

const FiltersPanel = styled.div`
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border);
    display: ${props => props.$show ? 'block' : 'none'};
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const FilterGroup = styled.div`
    label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    input, select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 0.875rem;

        &:focus {
            outline: none;
            border-color: var(--primary);
        }
    }
`;

const FilterActions = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    justify-content: flex-end;
`;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    ${props => props.$primary ? `
        background: var(--primary);
        color: white;
        border: none;

        &:hover {
            background: var(--primary-dark);
        }
    ` : `
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border);

        &:hover {
            border-color: var(--text-secondary);
        }
    `}
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--border);
    transition: all 0.2s;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
`;

const TypeBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;

    ${props => {
        switch (props.$type) {
            case 'new_appointment':
                return 'background: #e0f2fe; color: #0369a1;';
            case 'appointment_updated':
                return 'background: #fef3c7; color: #b45309;';
            case 'appointment_cancelled':
                return 'background: #fee2e2; color: #b91c1c;';
            default:
                return 'background: #f1f5f9; color: #475569;';
        }
    }}
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;

    ${props => {
        switch (props.$status) {
            case 'sent':
                return 'color: #10b981;';
            case 'error':
                return 'color: #ef4444;';
            default:
                return 'color: #f59e0b;';
        }
    }}
`;

const CardTitle = styled.h3`
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    line-height: 1.4;
`;

const CardInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);

    svg {
        flex-shrink: 0;
    }
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.75rem;
    color: var(--text-secondary);
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border);

    svg {
        color: var(--text-secondary);
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    p {
        color: var(--text-secondary);
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
`;

const PageButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        border-color: var(--primary);
        color: var(--primary);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PageInfo = styled.span`
    font-size: 0.875rem;
    color: var(--text-secondary);
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    font-size: 1rem;
    color: var(--text-secondary);
`;

export default function MyNotifications() {
    const navigate = useNavigate();
    const [data, setData] = useState({ items: [], total: 0, page: 1, size: 10, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [isProfessional, setIsProfessional] = useState(false);

    // Filtros
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsProfessional(payload.is_professional);
        } catch (e) {
            navigate('/login');
            return;
        }

        fetchNotifications(1);
    }, [navigate]);

    const fetchNotifications = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const params = new URLSearchParams({ page: page.toString(), size: '10' });

            if (typeFilter) params.append('type_filter', typeFilter);
            if (statusFilter) params.append('status_filter', statusFilter);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (search) params.append('search', search);

            const res = await fetch(`${API_URL}/notifications/me?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setData(await res.json());
            } else {
                toast.error('Erro ao carregar notificações');
            }
        } catch (e) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        fetchNotifications(1);
    };

    const handleClearFilters = () => {
        setTypeFilter('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setSearch('');
        setTimeout(() => fetchNotifications(1), 0);
    };

    const getTypeLabel = (type) => {
        const labels = {
            'new_appointment': 'Novo Agendamento',
            'appointment_updated': 'Atualizado',
            'appointment_cancelled': 'Cancelado'
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'new_appointment':
                return <Calendar size={14} />;
            case 'appointment_updated':
                return <AlertCircle size={14} />;
            case 'appointment_cancelled':
                return <XCircle size={14} />;
            default:
                return <Bell size={14} />;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle size={14} />;
            case 'error':
                return <XCircle size={14} />;
            default:
                return <Clock size={14} />;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'sent': 'Enviado',
            'error': 'Erro',
            'pending': 'Pendente'
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAppointmentDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading && data.items.length === 0) {
        return (
            <Container>
                <Content>
                    <LoadingContainer>Carregando notificações...</LoadingContainer>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <Content>
                <Header>
                    <h1>
                        <Bell size={28} />
                        Minhas Notificações
                    </h1>
                    <FilterButton onClick={() => setShowFilters(!showFilters)}>
                        {showFilters ? <X size={18} /> : <Filter size={18} />}
                        {showFilters ? 'Fechar' : 'Filtros'}
                    </FilterButton>
                </Header>

                <FiltersPanel $show={showFilters}>
                    <FiltersGrid>
                        <FilterGroup>
                            <label>Buscar</label>
                            <input
                                type="text"
                                placeholder="Serviço, nome..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </FilterGroup>
                        <FilterGroup>
                            <label>Tipo</label>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="new_appointment">Novo Agendamento</option>
                                <option value="appointment_updated">Atualizado</option>
                                <option value="appointment_cancelled">Cancelado</option>
                            </select>
                        </FilterGroup>
                        <FilterGroup>
                            <label>Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="sent">Enviado</option>
                                <option value="pending">Pendente</option>
                                <option value="error">Erro</option>
                            </select>
                        </FilterGroup>
                        <FilterGroup>
                            <label>Data Inicial</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </FilterGroup>
                        <FilterGroup>
                            <label>Data Final</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </FilterGroup>
                    </FiltersGrid>
                    <FilterActions>
                        <Button onClick={handleClearFilters}>Limpar</Button>
                        <Button $primary onClick={handleFilter}>Aplicar Filtros</Button>
                    </FilterActions>
                </FiltersPanel>

                {data.items.length === 0 ? (
                    <EmptyState>
                        <Bell size={48} />
                        <h3>Nenhuma notificação</h3>
                        <p>Você ainda não recebeu nenhuma notificação.</p>
                    </EmptyState>
                ) : (
                    <>
                        <Grid>
                            {data.items.map((notif) => (
                                <Card key={notif.id}>
                                    <CardHeader>
                                        <TypeBadge $type={notif.type}>
                                            {getTypeIcon(notif.type)}
                                            {getTypeLabel(notif.type)}
                                        </TypeBadge>
                                        <StatusBadge $status={notif.status}>
                                            {getStatusIcon(notif.status)}
                                            {getStatusLabel(notif.status)}
                                        </StatusBadge>
                                    </CardHeader>

                                    <CardTitle>{notif.title}</CardTitle>

                                    <CardInfo>
                                        {notif.service_title && (
                                            <InfoItem>
                                                <Briefcase size={16} />
                                                {notif.service_title}
                                            </InfoItem>
                                        )}
                                        {notif.appointment_date && (
                                            <InfoItem>
                                                <Calendar size={16} />
                                                {formatAppointmentDate(notif.appointment_date)}
                                                {notif.appointment_start_time && ` às ${notif.appointment_start_time.slice(0, 5)}`}
                                            </InfoItem>
                                        )}
                                        {isProfessional && notif.client_name && (
                                            <InfoItem>
                                                <User size={16} />
                                                Cliente: {notif.client_name}
                                            </InfoItem>
                                        )}
                                        {!isProfessional && notif.professional_name && (
                                            <InfoItem>
                                                <User size={16} />
                                                Profissional: {notif.professional_name}
                                            </InfoItem>
                                        )}
                                    </CardInfo>

                                    <CardFooter>
                                        <span>
                                            <Mail size={12} style={{ marginRight: '4px' }} />
                                            {notif.channel}
                                        </span>
                                        <span>{formatDate(notif.created_at)}</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </Grid>

                        {data.pages > 1 && (
                            <Pagination>
                                <PageButton
                                    onClick={() => fetchNotifications(data.page - 1)}
                                    disabled={data.page <= 1}
                                >
                                    <ChevronLeft size={20} />
                                </PageButton>
                                <PageInfo>
                                    Página {data.page} de {data.pages}
                                </PageInfo>
                                <PageButton
                                    onClick={() => fetchNotifications(data.page + 1)}
                                    disabled={data.page >= data.pages}
                                >
                                    <ChevronRight size={20} />
                                </PageButton>
                            </Pagination>
                        )}
                    </>
                )}
            </Content>
        </Container>
    );
}
