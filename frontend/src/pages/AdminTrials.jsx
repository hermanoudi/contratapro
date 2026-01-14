import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle, Clock, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';
const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const BackButton = styled.button`
    background: var(--bg-secondary);
    border: none;
    border-radius: 8px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--border);
    }
`;

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
`;

const Card = styled.div`
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    text-align: left;
    padding: 1rem;
    border-bottom: 2px solid var(--border);
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Td = styled.td`
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    color: var(--text-secondary);
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    background: ${props => {
        if (props.$status === 'expired') return '#fee2e2';
        if (props.$status === 'warning') return '#fef3c7';
        return '#dcfce7';
    }};
    color: ${props => {
        if (props.$status === 'expired') return '#991b1b';
        if (props.$status === 'warning') return '#92400e';
        return '#166534';
    }};
`;

const Button = styled.button`
    background: ${props => props.$variant === 'primary' ? 'var(--primary)' : 'var(--bg-secondary)'};
    color: ${props => props.$variant === 'primary' ? 'white' : 'var(--text-primary)'};
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    font-size: 0.875rem;

    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: var(--primary);
    }
`;

const UserInfo = styled.div`
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.875rem;

    &:last-child {
        margin-bottom: 0;
    }

    strong {
        color: var(--text-primary);
    }
`;

const ModalActions = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
`;

const LoadingSpinner = styled.div`
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
`;

export default function AdminTrials() {
    const [trials, setTrials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newEndDate, setNewEndDate] = useState('');
    const [extending, setExtending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrials();
    }, []);

    const fetchTrials = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/trial-users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setTrials(data.users || []);
            } else if (res.status === 403) {
                toast.error('Acesso negado. Apenas administradores.');
                navigate('/dashboard');
            } else {
                toast.error('Erro ao carregar usuários trial');
            }
        } catch (error) {
            console.error('Erro ao buscar trials:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        // Set default to 30 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        setNewEndDate(defaultDate.toISOString().slice(0, 16));
        setShowModal(true);
    };

    const handleExtendTrial = async () => {
        if (!newEndDate) {
            toast.error('Por favor, informe a nova data de expiração');
            return;
        }

        setExtending(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/extend-trial`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    new_trial_end_date: newEndDate
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                setShowModal(false);
                fetchTrials(); // Refresh list
            } else {
                const error = await res.json();
                toast.error(error.detail || 'Erro ao estender trial');
            }
        } catch (error) {
            console.error('Erro ao estender trial:', error);
            toast.error('Erro ao processar requisição');
        } finally {
            setExtending(false);
        }
    };

    const getTrialStatus = (trialEndsAt) => {
        const now = new Date();
        const endDate = new Date(trialEndsAt);
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            return { status: 'expired', label: 'Expirado', icon: AlertCircle };
        } else if (daysLeft <= 7) {
            return { status: 'warning', label: `${daysLeft} dias restantes`, icon: Clock };
        } else {
            return { status: 'active', label: `${daysLeft} dias restantes`, icon: CheckCircle };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingSpinner>Carregando usuários trial...</LoadingSpinner>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <BackButton onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={24} />
                </BackButton>
                <Title>Gerenciar Trials</Title>
            </Header>

            <Card>
                {trials.length === 0 ? (
                    <EmptyState>
                        <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Nenhum usuário com plano trial encontrado</p>
                    </EmptyState>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Usuário</Th>
                                <Th>Email</Th>
                                <Th>Cadastrado em</Th>
                                <Th>Expira em</Th>
                                <Th>Status</Th>
                                <Th>Ações</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {trials.map(user => {
                                const trialStatus = getTrialStatus(user.trial_ends_at);
                                const StatusIcon = trialStatus.icon;

                                return (
                                    <tr key={user.id}>
                                        <Td>
                                            <strong style={{ color: 'var(--text-primary)' }}>
                                                {user.name}
                                            </strong>
                                        </Td>
                                        <Td>{user.email}</Td>
                                        <Td>{formatDate(user.created_at)}</Td>
                                        <Td>{formatDate(user.trial_ends_at)}</Td>
                                        <Td>
                                            <Badge $status={trialStatus.status}>
                                                <StatusIcon size={16} />
                                                {trialStatus.label}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Button
                                                $variant="primary"
                                                onClick={() => handleOpenModal(user)}
                                            >
                                                Estender Trial
                                            </Button>
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </Card>

            {showModal && selectedUser && (
                <Modal onClick={() => setShowModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalTitle>Estender Trial</ModalTitle>

                        <UserInfo>
                            <InfoRow>
                                <User size={16} />
                                <strong>Nome:</strong> {selectedUser.name}
                            </InfoRow>
                            <InfoRow>
                                <Mail size={16} />
                                <strong>Email:</strong> {selectedUser.email}
                            </InfoRow>
                            <InfoRow>
                                <Calendar size={16} />
                                <strong>Expira atualmente em:</strong> {formatDate(selectedUser.trial_ends_at)}
                            </InfoRow>
                        </UserInfo>

                        <FormGroup>
                            <Label htmlFor="newEndDate">Nova Data de Expiração</Label>
                            <Input
                                id="newEndDate"
                                type="datetime-local"
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                            />
                        </FormGroup>

                        <ModalActions>
                            <Button onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                $variant="primary"
                                onClick={handleExtendTrial}
                                disabled={extending}
                            >
                                {extending ? 'Atualizando...' : 'Confirmar'}
                            </Button>
                        </ModalActions>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
}
