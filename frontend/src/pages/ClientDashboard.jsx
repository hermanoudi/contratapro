import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, User, Briefcase, Settings, Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Container = styled.div`
  width: 100%;
`;

const TabNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border);
  overflow-x: auto;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }

  @media (max-width: 360px) {
    gap: 0.25rem;
    margin-bottom: 1.5rem;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '700' : '500'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  white-space: nowrap;

  &:hover {
    color: var(--primary);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.75rem;
    font-size: 0.85rem;
    gap: 0.375rem;
  }

  @media (max-width: 360px) {
    padding: 0.65rem 0.5rem;
    font-size: 0.8rem;
    gap: 0.25rem;
  }
`;

const AppointmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 360px) {
    gap: 0.5rem;
    margin-top: 1rem;
  }
`;

const AppointmentCard = styled.div`
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 14px;
  }

  @media (max-width: 360px) {
    padding: 0.875rem;
    border-radius: 12px;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;

  ${props => {
        switch (props.$status) {
            case 'scheduled': return 'background: #e0f2fe; color: #0369a1;';
            case 'completed': return 'background: #dcfce7; color: #15803d;';
            case 'cancelled': return 'background: #fee2e2; color: #b91c1c;';
            case 'suspended': return 'background: #fef3c7; color: #92400e;';
            default: return 'background: #f1f5f9; color: #475569;';
        }
    }}
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--border);
  max-width: 600px;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 0.65rem 0.85rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr 1fr'};
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }

  @media (max-width: 360px) {
    gap: 0.875rem;
  }
`;

export default function ClientDashboard() {
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleWhatsAppChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        let displayValue = value;
        if (value.length === 11) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length === 10) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 6) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 2) {
            displayValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }

        setUserData({ ...userData, whatsapp: displayValue });
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch Appointments
                const apptsRes = await fetch('/api/appointments/client/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (apptsRes.ok) setAppointments(await apptsRes.json());

                // Fetch User Data
                const userRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) setUserData(await userRes.json());

            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                toast.success('Perfil atualizado com sucesso!');
            } else {
                toast.error('Erro ao atualizar perfil.');
            }
        } catch (e) { toast.error('Erro de conexão.'); }
    };

    if (loading) return <Container>Carregando...</Container>;

    return (
        <Container>
            <TabNav>
                <TabButton $active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
                    <Calendar size={20} /> Meus Agendamentos
                </TabButton>
                <TabButton $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                    <Settings size={20} /> Minha Conta
                </TabButton>
            </TabNav>
                {activeTab === 'appointments' ? (
                    <>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Meus Agendamentos</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Acompanhe o status dos seus serviços contratados.</p>

                        {appointments.length > 0 ? (
                            <AppointmentGrid>
                                {appointments.map(appt => (
                                    <AppointmentCard key={appt.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <StatusBadge $status={appt.status}>
                                                {appt.status === 'scheduled' && <Clock size={14} />}
                                                {appt.status === 'completed' && <CheckCircle size={14} />}
                                                {appt.status === 'cancelled' && <XCircle size={14} />}
                                                {appt.status === 'suspended' && <AlertCircle size={14} />}
                                                {appt.status === 'scheduled' ? 'Agendado' :
                                                    appt.status === 'completed' ? 'Executado' :
                                                        appt.status === 'cancelled' ? 'Cancelado' : 'Suspenso'}
                                            </StatusBadge>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                ID: #{appt.id}
                                            </span>
                                        </div>

                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                <Briefcase size={14} />
                                                {appt.professional_category || 'Serviço'}
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{appt.service_title}</h3>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                                <User size={18} style={{ color: 'var(--text-secondary)' }} />
                                                {appt.professional_name}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <Calendar size={18} />
                                                {(() => {
                                                    const [y, m, d] = appt.date.split('-').map(Number);
                                                    return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
                                                })()} às {appt.start_time.slice(0, 5)}
                                            </div>
                                        </div>

                                        <button
                                            className="btn-primary"
                                            style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', fontSize: '0.9rem' }}
                                            onClick={() => navigate(`/appointment/${appt.id}`)}
                                        >
                                            Ver Detalhes
                                        </button>
                                    </AppointmentCard>
                                ))}
                            </AppointmentGrid>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '32px', border: '1px solid var(--border)', marginTop: '2rem' }}>
                                <AlertCircle size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Nenhum agendamento</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Você ainda não realizou nenhum agendamento.</p>
                                <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
                                    Buscar Profissionais
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Minha Conta</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Mantenha seus dados sempre atualizados.</p>

                        <div style={{ marginTop: '2rem' }}>
                            <Form onSubmit={handleUpdateProfile}>
                                <FormGrid>
                                    <InputGroup>
                                        <Label>Nome Completo</Label>
                                        <Input
                                            value={userData?.name || ''}
                                            onChange={e => setUserData({ ...userData, name: e.target.value })}
                                        />
                                    </InputGroup>
                                    <InputGroup>
                                        <Label>E-mail</Label>
                                        <Input
                                            type="email"
                                            value={userData?.email || ''}
                                            onChange={e => setUserData({ ...userData, email: e.target.value })}
                                        />
                                    </InputGroup>
                                </FormGrid>

                                <FormGrid>
                                    <InputGroup>
                                        <Label>WhatsApp</Label>
                                        <Input
                                            value={userData?.whatsapp || ''}
                                            onChange={handleWhatsAppChange}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </InputGroup>
                                    <InputGroup>
                                        <Label>CEP</Label>
                                        <Input
                                            value={userData?.cep || ''}
                                            onChange={e => setUserData({ ...userData, cep: e.target.value })}
                                        />
                                    </InputGroup>
                                </FormGrid>

                                <InputGroup>
                                    <Label>Rua / Logradouro</Label>
                                    <Input
                                        value={userData?.street || ''}
                                        onChange={e => setUserData({ ...userData, street: e.target.value })}
                                    />
                                </InputGroup>

                                <FormGrid>
                                    <InputGroup>
                                        <Label>Número</Label>
                                        <Input
                                            value={userData?.number || ''}
                                            onChange={e => setUserData({ ...userData, number: e.target.value })}
                                        />
                                    </InputGroup>
                                    <InputGroup>
                                        <Label>Bairro</Label>
                                        <Input
                                            value={userData?.neighborhood || ''}
                                            onChange={e => setUserData({ ...userData, neighborhood: e.target.value })}
                                        />
                                    </InputGroup>
                                </FormGrid>

                                <FormGrid $columns="2fr 1fr">
                                    <InputGroup>
                                        <Label>Cidade</Label>
                                        <Input value={userData?.city || ''} readOnly />
                                    </InputGroup>
                                    <InputGroup>
                                        <Label>UF</Label>
                                        <Input value={userData?.state || ''} readOnly />
                                    </InputGroup>
                                </FormGrid>

                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Save size={20} /> Salvar Alterações
                                </button>
                            </Form>
                        </div>
                    </>
                )}
        </Container>
    );
}
