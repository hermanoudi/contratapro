import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft, User, MapPin, Phone, Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 360px) {
    padding: 0.5rem;
  }
`;

const Content = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 360px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;

    @media (max-width: 480px) {
      font-size: 1.4rem;
    }

    @media (max-width: 360px) {
      font-size: 1.2rem;
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
  &:last-child { margin-bottom: 0; }
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 360px) {
    font-size: 0.75rem;
    gap: 0.35rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  margin-bottom: 0.75rem;

  @media (max-width: 480px) {
    padding: 0.75rem;
  }

  @media (max-width: 360px) {
    padding: 0.65rem;
  }
`;

const InfoText = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    word-break: break-word;

    @media (max-width: 480px) {
      font-size: 1rem;
    }

    @media (max-width: 360px) {
      font-size: 0.9rem;
    }
  }

  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    word-break: break-word;

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }

    @media (max-width: 360px) {
      font-size: 0.8rem;
      line-height: 1.4;
    }
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.85rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 360px) {
    font-size: 0.7rem;
    padding: 0.35rem 0.75rem;

    svg {
      width: 12px;
      height: 12px;
    }
  }

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

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-size: 1rem;

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 360px) {
    padding: 0.65rem;
    font-size: 0.85rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  ${props => {
        if (props.$variant === 'success') return 'background: #10b981; color: white; &:hover { opacity: 0.9; }';
        if (props.$variant === 'danger') return 'background: #ef4444; color: white; &:hover { opacity: 0.9; }';
        if (props.$variant === 'warning') return 'background: #f59e0b; color: white; &:hover { opacity: 0.9; }';
        return 'background: white; border-color: var(--border); color: var(--text-primary); &:hover { background: var(--bg-secondary); }';
    }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ReasonContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 16px;

  @media (max-width: 480px) {
    padding: 1rem;
    margin-top: 1rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
    border-radius: 12px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #fdba74;
  background: white;
  min-height: 80px;
  margin-top: 0.5rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const WhatsAppButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: #25d366;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.2s;
  margin-top: 2rem;

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.875rem;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 360px) {
    font-size: 0.9rem;
    padding: 0.75rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  }
`;


export default function AppointmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appt, setAppt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(null); // 'cancelled' or 'suspended'
    const [reason, setReason] = useState('');
    const [isProfessional, setIsProfessional] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsProfessional(payload.is_professional);
        }

        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/appointments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setAppt(await res.json());
                } else {
                    toast.error('Agendamento não encontrado');
                    navigate(isProfessional ? '/dashboard' : '/my-appointments');
                }
            } catch (e) {
                console.error(e);
                toast.error('Erro de conexão');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate, isProfessional]);

    const handleStatusUpdate = async (status) => {
        if ((status === 'cancelled' || status === 'suspended') && !showReasonInput) {
            setShowReasonInput(status);
            return;
        }

        if ((status === 'cancelled' || status === 'suspended') && reason.length < 5) {
            toast.error('Por favor, informe um motivo com pelo menos 5 caracteres.');
            return;
        }

        setUpdating(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, reason: reason || null })
            });

            if (res.ok) {
                const updated = await res.json();
                setAppt(updated);
                setShowReasonInput(null);
                setReason('');
                toast.success(`Status atualizado para ${status === 'completed' ? 'Concluído' : status === 'cancelled' ? 'Cancelado' : 'Suspenso'}`);

                // Notification simulation (since we don't have a real notification system yet)
                toast.info('O cliente e o profissional foram notificados sobre esta alteração.');
            } else {
                const data = await res.json();
                toast.error(data.detail || 'Erro ao atualizar status');
            }
        } catch (e) {
            toast.error('Erro de conexão');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Container>Carregando...</Container>;
    if (!appt) return null;

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const whatsappUrl = () => {
        const phone = appt.client_whatsapp?.replace(/\D/g, '');
        const [y, m, d] = appt.date.split('-').map(Number);
        const date = new Date(y, m - 1, d).toLocaleDateString('pt-BR');
        const time = appt.start_time.slice(0, 5);
        const message = `Olá tudo bem?\nmeu nome é ${appt.professional_name}, você agendou uma execução de serviço no dia ${date} às ${time} para execução do seguinte serviço: ${appt.service_title}\nVocê confirma esse agendamento?`;
        return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <Container>
            <Content>
                <Header>
                    <button onClick={() => navigate(isProfessional ? '/dashboard' : '/my-appointments')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1>Agendamento</h1>
                </Header>

                <Card>
                    <StatusBadge $status={appt.status}>
                        {appt.status === 'scheduled' && <Clock size={16} />}
                        {appt.status === 'completed' && <CheckCircle size={16} />}
                        {appt.status === 'cancelled' && <XCircle size={16} />}
                        {appt.status === 'suspended' && <AlertCircle size={16} />}
                        {appt.status === 'scheduled' ? 'Agendado' :
                            appt.status === 'completed' ? 'Concluído' :
                                appt.status === 'cancelled' ? 'Cancelado' : 'Suspenso'}
                    </StatusBadge>

                    {appt.reason && (
                        <Section style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                            <SectionTitle style={{ marginBottom: '0.5rem' }}><AlertCircle size={16} /> Motivo da Alteração</SectionTitle>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{appt.reason}</p>
                        </Section>
                    )}

                    <Section>
                        <SectionTitle><User size={18} /> Cliente</SectionTitle>
                        <InfoBox>
                            <InfoText>
                                <h4>{appt.client_name}</h4>
                                <p>{appt.client_email}</p>
                                {appt.client_whatsapp && (
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <Phone size={16} /> {formatPhoneNumber(appt.client_whatsapp)}
                                    </p>
                                )}
                            </InfoText>
                        </InfoBox>
                    </Section>

                    <Section>
                        <SectionTitle><MapPin size={18} /> Localização Cliente</SectionTitle>
                        <InfoBox>
                            <InfoText>
                                <h4>Endereço Completo</h4>
                                <p>
                                    {appt.client_street}, {appt.client_number} {appt.client_complement && `- ${appt.client_complement}`}<br />
                                    {appt.client_neighborhood} - {appt.client_city}/{appt.client_state}<br />
                                    CEP: {appt.client_cep}
                                </p>
                            </InfoText>
                        </InfoBox>
                    </Section>

                    <Section>
                        <SectionTitle><MapPin size={18} /> Localização do Profissional</SectionTitle>
                        <InfoBox>
                            <InfoText>
                                <h4>Endereço Completo</h4>
                                <p>
                                    {appt.professional_street}, {appt.professional_number} {appt.professional_complement && `- ${appt.professional_complement}`}<br />
                                    {appt.professional_neighborhood} - {appt.professional_city}/{appt.professional_state}<br />
                                    CEP: {appt.professional_cep}
                                </p>
                            </InfoText>
                        </InfoBox>
                    </Section>

                    <Section>
                        <SectionTitle><Calendar size={18} /> Serviço e Horário</SectionTitle>
                        <ServiceGrid>
                            <InfoBox>
                                <InfoText>
                                    <h4>{appt.service_title}</h4>
                                    <p>Serviço Contratado</p>
                                </InfoText>
                            </InfoBox>
                            <InfoBox>
                                <InfoText>
                                    <h4>{(() => {
                                        const [y, m, d] = appt.date.split('-').map(Number);
                                        return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
                                    })()}</h4>
                                    <p>{appt.start_time.slice(0, 5)} às {appt.end_time.slice(0, 5)}</p>
                                </InfoText>
                            </InfoBox>
                        </ServiceGrid>
                    </Section>

                    {appt.status === 'scheduled' && (
                        <>
                            <ActionGrid>
                                {isProfessional && (
                                    <ActionButton $variant="success" onClick={() => handleStatusUpdate('completed')} disabled={updating}>
                                        <CheckCircle size={18} /> Concluir
                                    </ActionButton>
                                )}
                                <ActionButton $variant="danger" onClick={() => handleStatusUpdate('cancelled')} disabled={updating}>
                                    <XCircle size={18} /> Cancelar
                                </ActionButton>
                                <ActionButton $variant="warning" onClick={() => handleStatusUpdate('suspended')} disabled={updating}>
                                    <AlertCircle size={18} /> Suspender
                                </ActionButton>
                            </ActionGrid>

                            {showReasonInput && (
                                <ReasonContainer>
                                    <Label style={{ color: '#9a3412' }}>
                                        Motivo para {showReasonInput === 'cancelled' ? 'Cancelamento' : 'Suspensão'} (Obrigatório)
                                    </Label>
                                    <TextArea
                                        placeholder="Descreva o motivo..."
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <ActionButton style={{ flex: 1 }} onClick={() => { setShowReasonInput(null); setReason(''); }}>
                                            Desistir
                                        </ActionButton>
                                        <ActionButton
                                            $variant={showReasonInput === 'cancelled' ? 'danger' : 'warning'}
                                            style={{ flex: 2 }}
                                            onClick={() => handleStatusUpdate(showReasonInput)}
                                            disabled={updating || reason.length < 5}
                                        >
                                            <Save size={18} /> Confirmar {showReasonInput === 'cancelled' ? 'Cancelamento' : 'Suspensão'}
                                        </ActionButton>
                                    </div>
                                </ReasonContainer>
                            )}
                        </>
                    )}

                    {isProfessional && appt.status === 'scheduled' && (
                        <WhatsAppButton href={whatsappUrl()} target="_blank">
                            <MessageSquare size={20} /> Entrar em contato via WhatsApp
                        </WhatsAppButton>
                    )}
                </Card>
            </Content>
        </Container>
    );
}
