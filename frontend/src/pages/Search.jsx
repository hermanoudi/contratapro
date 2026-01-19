import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Search as SearchIcon,
  MapPin,
  Star,
  ChevronLeft,
  Briefcase,
  Shield,
  X,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
  }
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 360px) {
    margin-bottom: 1rem;
    gap: 0.5rem;
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--primary);
  }
`;

const SearchBar = styled.div`
  flex: 1;
  display: flex;
  gap: 0.5rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem;
  transition: all 0.3s ease;
  max-width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  @media (max-width: 360px) {
    padding: 0.4rem;
    gap: 0.2rem;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const CEPInput = styled.input`
  width: 180px;
  border: none;
  border-left: 1px solid var(--border);
  background: transparent;
  padding: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
  min-width: 0;
  flex-shrink: 1;

  &::placeholder {
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    width: 140px;
  }

  @media (max-width: 480px) {
    width: 100px;
    font-size: 0.85rem;
    padding: 0.3rem 0.4rem;
  }

  @media (max-width: 360px) {
    width: 80px;
    font-size: 0.8rem;
    padding: 0.2rem 0.3rem;
  }
`;

const CityLabel = styled.span`
  font-size: 0.85rem;
  color: var(--primary);
  font-weight: 700;
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none;
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  @media (max-width: 360px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
`;

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ResultsCount = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--primary);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const ProCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
  }

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.15);
    transform: translateY(-4px);
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    gap: 1rem;
  }

  @media (max-width: 360px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const ProAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const VerifiedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid rgba(34, 197, 94, 0.2);
`;

const ProHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }

  @media (max-width: 360px) {
    gap: 0.5rem;
  }
`;

const ProInfo = styled.div`
  flex: 1;
`;

const ProNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  @media (max-width: 480px) {
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  @media (max-width: 360px) {
    gap: 0.25rem;
  }
`;

const ProName = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }

  @media (max-width: 360px) {
    font-size: 1rem;
  }
`;

const ProCategory = styled.p`
  color: var(--primary);
  font-weight: 700;
  font-size: 0.9rem;
  margin: 0;

  @media (max-width: 360px) {
    font-size: 0.85rem;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.5rem 0.875rem;
  border-radius: 10px;
  width: fit-content;

  @media (max-width: 480px) {
    padding: 0.375rem 0.625rem;
  }

  @media (max-width: 360px) {
    padding: 0.25rem 0.5rem;
  }
`;

const RatingScore = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #f59e0b;

  @media (max-width: 360px) {
    font-size: 0.85rem;
  }
`;

const RatingCount = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;

  @media (max-width: 480px) {
    display: none;
  }
`;

const ProDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 360px) {
    font-size: 0.9rem;
  }
`;

const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;

  @media (max-width: 480px) {
    gap: 0.375rem;
  }

  @media (max-width: 360px) {
    font-size: 0.85rem;
    gap: 0.25rem;
  }
`;

const ServicesSection = styled.div`
  margin-top: 0.5rem;

  @media (max-width: 360px) {
    margin-top: 0.25rem;
  }
`;

const ServicesTitle = styled.p`
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 0.75rem;
    margin-bottom: 0.375rem;
  }
`;

const ServicesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  @media (max-width: 480px) {
    gap: 0.375rem;
  }

  @media (max-width: 360px) {
    gap: 0.25rem;
  }
`;

const ServiceTag = styled.span`
  font-size: 0.75rem;
  background: var(--bg-secondary);
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid var(--border);

  @media (max-width: 480px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }

  @media (max-width: 360px) {
    padding: 0.25rem 0.4rem;
    font-size: 0.65rem;
  }
`;

const MoreServices = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 360px) {
    font-size: 0.75rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const BookButton = styled.button`
  flex: 1;
  padding: 1rem;

  @media (max-width: 480px) {
    width: 100%;
    padding: 0.875rem;
    font-size: 0.95rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const WhatsAppButton = styled.a`
  flex: 1;
  padding: 1rem;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;

  &:hover {
    background: #20BA5A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 0.875rem;
    font-size: 0.95rem;
  }

  @media (max-width: 360px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  background: var(--bg-secondary);
  border-radius: 32px;
  border: 1px solid var(--border);
`;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [service, setService] = useState(searchParams.get('service') || '');
  const [cep, setCep] = useState(() => {
    const cepFromUrl = searchParams.get('cep');
    if (cepFromUrl) return cepFromUrl;

    // Tentar pegar do localStorage
    const savedCep = localStorage.getItem('userCep');
    return savedCep || '';
  });

  const [city, setCity] = useState(() => {
    const cityFromUrl = searchParams.get('city');
    if (cityFromUrl) return cityFromUrl;

    // Tentar pegar do localStorage
    const savedCity = localStorage.getItem('userCity');
    return savedCity || '';
  });

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Função helper para gerar link WhatsApp
  const generateWhatsAppLink = (whatsapp, profName, serviceName = '') => {
    if (!whatsapp) return '#';

    const cleanPhone = whatsapp.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let message = `Olá ${profName}! 👋\n\n`;
    message += `Encontrei seu perfil na plataforma *ContrataPro* e `;
    if (serviceName) {
      message += `tenho interesse no serviço: *${serviceName}*\n\n`;
    } else {
      message += `gostaria de saber mais sobre seus serviços.\n\n`;
    }
    message += `Podemos conversar?\n\nObrigado!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    // Se há parâmetros na URL, fazer busca automática
    const serviceParam = searchParams.get('service');
    const cityParam = searchParams.get('city') || localStorage.getItem('userCity');
    const cepParam = searchParams.get('cep') || localStorage.getItem('userCep');

    if (serviceParam || cityParam || cepParam) {
      performSearch(serviceParam, cityParam, cepParam);
    }
  }, []); // Executar apenas uma vez ao montar

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(value);
    if (value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCity(data.localidade);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setCity('');
    }
  };

  const performSearch = async (searchService, searchCity, searchCep) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchService) params.append('service', searchService);
      if (searchCity) params.append('city', searchCity);
      if (searchCep) params.append('cep', searchCep);

      const res = await fetch(`/api/users/search-by-service?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProfessionals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setHasSearched(true);  // Só marca como "buscou" DEPOIS de terminar
    }
  };

  const handleSearch = () => {
    performSearch(service, city, cep);
    // Atualizar URL
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (city) params.set('city', city);
    if (cep) params.set('cep', cep);
    setSearchParams(params);
  };

  const clearSearch = () => {
    setService('');
    setCep('');
    setCity('');
    setProfessionals([]);
    setHasSearched(false);
    setSearchParams({});
  };

  return (
    <Container>
      <Header>
        <BackButton to="/">
          <ChevronLeft size={20} />
          Voltar
        </BackButton>
      </Header>

      {loading && (
        <ResultsContainer>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <SearchIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Buscando profissionais...</p>
          </div>
        </ResultsContainer>
      )}

      {!loading && hasSearched && (
        <ResultsContainer>
          <ResultsHeader>
            <ResultsCount>
              {professionals.length}{' '}
              {professionals.length === 1 ? 'Profissional encontrado' : 'Profissionais encontrados'}
            </ResultsCount>
          </ResultsHeader>

          {professionals.length > 0 ? (
            <Grid>
              {professionals.map((pro) => (
                <ProCard key={pro.id}>
                  <ProHeader>
                    <ProAvatar $hasImage={!!pro.profile_picture}>
                      {pro.profile_picture ? (
                        <img src={pro.profile_picture} alt={pro.name} />
                      ) : (
                        pro.name.charAt(0).toUpperCase()
                      )}
                    </ProAvatar>
                    <ProInfo>
                      <ProNameContainer>
                        <ProName>{pro.name}</ProName>
                        <VerifiedBadge>
                          <Shield size={12} />
                          Verificado
                        </VerifiedBadge>
                      </ProNameContainer>
                      <ProCategory>
                        {pro.category}
                      </ProCategory>
                    </ProInfo>
                  </ProHeader>

                  <RatingContainer>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <RatingScore>4.9</RatingScore>
                    <RatingCount>
                      (128 avaliações)
                    </RatingCount>
                  </RatingContainer>

                  <ProDescription>
                    {pro.description || 'Sem descrição disponível.'}
                  </ProDescription>

                  <LocationContainer>
                    <MapPin size={16} color="var(--primary)" />
                    {pro.city}, {pro.state}
                  </LocationContainer>

                  {pro.services && pro.services.length > 0 && (
                    <ServicesSection>
                      <ServicesTitle>
                        Serviços:
                      </ServicesTitle>
                      <ServicesContainer>
                        {pro.services.slice(0, 2).map((s) => (
                          <ServiceTag key={s.id}>
                            {s.title}
                          </ServiceTag>
                        ))}
                        {pro.services.length > 2 && (
                          <MoreServices>
                            +{pro.services.length - 2} mais
                          </MoreServices>
                        )}
                      </ServicesContainer>
                    </ServicesSection>
                  )}

                  <ButtonsContainer>
                    {/* Só mostra botão de agendar se o profissional aceita agendamentos online */}
                    {pro.subscription_plan?.can_receive_bookings && (
                      <BookButton
                        className="btn-primary"
                        onClick={() => navigate(`/book/${pro.id}`, { state: { pro, clientCep: cep } })}
                      >
                        Ver Agenda e Reservar
                      </BookButton>
                    )}
                    {pro.whatsapp && (
                      <WhatsAppButton
                        href={generateWhatsAppLink(pro.whatsapp, pro.name, pro.services?.[0]?.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </WhatsAppButton>
                    )}
                  </ButtonsContainer>
                </ProCard>
              ))}
            </Grid>
          ) : (
            <EmptyState>
              <Briefcase size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Nenhum profissional encontrado
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Tente buscar por outro serviço ou em uma região diferente.
              </p>
            </EmptyState>
          )}
        </ResultsContainer>
      )}
    </Container>
  );
}
