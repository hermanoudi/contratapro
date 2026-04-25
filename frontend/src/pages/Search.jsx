import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { API_URL } from '../config';
import {
  Search as SearchIcon,
  MapPin,
  Star,
  ChevronLeft,
  Briefcase,
  Shield,
  X,
  MessageCircle,
  Filter,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEO/SEOHead';

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

/* Filter chips */
const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  margin-bottom: 1.5rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  border: 2px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  background: ${props => props.$active ? 'var(--primary)' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: var(--primary);
    color: ${props => props.$active ? 'white' : 'var(--primary)'};
  }
`;

/* Redesigned card */
const ProCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.15);
    transform: translateY(-4px);
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary), var(--accent));
`;

const HeroPhoto = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const PhotoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 900;
`;

const PlanBadgeOverlay = styled.div`
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.625rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
  background: ${props => props.$premium
    ? 'rgba(245, 158, 11, 0.9)'
    : 'rgba(99, 102, 241, 0.9)'};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
`;

const ProName = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
`;

const ProCategory = styled.p`
  color: var(--primary);
  font-weight: 700;
  font-size: 0.85rem;
  margin: 0;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RatingScore = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #f59e0b;
`;

const RatingCount = styled.span`
  font-size: 0.78rem;
  color: var(--text-secondary);
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const ServiceChip = styled.span`
  font-size: 0.72rem;
  background: var(--bg-secondary);
  padding: 0.3rem 0.625rem;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid var(--border);
  color: var(--text-primary);
`;

const MoreChip = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  align-self: center;
`;

const CTARow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const BookButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  font-size: 0.9rem;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const WhatsAppButton = styled.a`
  flex: 1;
  padding: 0.75rem;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.9rem;

  &:hover {
    background: #20BA5A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  }

  @media (max-width: 480px) {
    width: 100%;
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
  const [activeFilters, setActiveFilters] = useState([]);

  const FILTERS = [
    { id: 'rating', label: '⭐ 4+ estrelas' },
    { id: 'bookable', label: '📅 Aceita agendamentos' },
    { id: 'badge', label: '✨ Com badge' },
  ];

  const toggleFilter = (id) => {
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredProfessionals = professionals.filter(pro => {
    if (activeFilters.includes('rating') && (pro.average_rating || 0) < 4) return false;
    if (activeFilters.includes('bookable') && !pro.subscription_plan?.can_receive_bookings) return false;
    if (activeFilters.includes('badge') && !pro.subscription_plan?.badge_label) return false;
    return true;
  });

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

    if (serviceParam || cityParam) {
      performSearch(serviceParam, cityParam);
    }
  }, []); // Executar apenas uma vez ao montar

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(value);
    if (value.length === 8) {
      try {
        const res = await fetch(`${API_URL}/cep/${value}`);
        if (res.ok) {
          const data = await res.json();
          setCity(data.city);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setCity('');
    }
  };

  const performSearch = async (searchService, searchCity) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchService) params.append('service', searchService);
      if (searchCity) params.append('city', searchCity);

      const res = await fetch(`${API_URL}/users/search-by-service?${params.toString()}`);
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
    performSearch(service, city);
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

  // SEO dinamico baseado na busca
  const seoTitle = service
    ? `${service}${city ? ` em ${city}` : ''} - Encontre Profissionais`
    : 'Buscar Profissionais';
  const seoDescription = service
    ? `Encontre profissionais de ${service}${city ? ` em ${city}` : ''} qualificados. Compare precos, veja avaliacoes e agende online.`
    : 'Busque e encontre profissionais qualificados na sua regiao. Eletricista, encanador, manicure, diarista e muito mais.';

  return (
    <Container>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        category={service}
        city={city}
        url={`https://contratapro.com.br/search${service ? `?service=${encodeURIComponent(service)}` : ''}`}
      />
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
              {filteredProfessionals.length}{' '}
              {filteredProfessionals.length === 1 ? 'Profissional encontrado' : 'Profissionais encontrados'}
            </ResultsCount>
          </ResultsHeader>

          {professionals.length > 0 && (
            <FilterBar>
              {FILTERS.map(f => (
                <FilterChip
                  key={f.id}
                  $active={activeFilters.includes(f.id)}
                  onClick={() => toggleFilter(f.id)}
                >
                  {f.label}
                  {activeFilters.includes(f.id) && (
                    <X size={12} style={{ marginLeft: '2px' }} />
                  )}
                </FilterChip>
              ))}
            </FilterBar>
          )}

          {filteredProfessionals.length > 0 ? (
            <Grid>
              {filteredProfessionals.map((pro) => {
                const isPremium = (pro.subscription_plan?.priority_in_search || 0) >= 2;
                const isPro = (pro.subscription_plan?.priority_in_search || 0) === 1;
                const hasBadge = !!(pro.subscription_plan?.badge_label);

                return (
                  <ProCard
                    key={pro.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PhotoWrapper>
                      {pro.profile_picture ? (
                        <HeroPhoto src={pro.profile_picture} alt={pro.name} />
                      ) : (
                        <PhotoPlaceholder>{pro.name.charAt(0).toUpperCase()}</PhotoPlaceholder>
                      )}
                      {hasBadge && (
                        <PlanBadgeOverlay $premium={isPremium}>
                          {isPremium ? '✨' : '⭐'} {pro.subscription_plan.badge_label}
                        </PlanBadgeOverlay>
                      )}
                    </PhotoWrapper>

                    <CardBody>
                      <div>
                        <ProName>{pro.name}</ProName>
                        <ProCategory>{pro.category}</ProCategory>
                      </div>

                      {pro.total_reviews > 0 && (
                        <RatingRow>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <RatingScore>{(pro.average_rating || 0).toFixed(1)}</RatingScore>
                          <RatingCount>
                            ({pro.total_reviews} {pro.total_reviews === 1 ? 'avaliação' : 'avaliações'})
                          </RatingCount>
                        </RatingRow>
                      )}

                      <LocationRow>
                        <MapPin size={14} color="var(--primary)" />
                        {pro.city}, {pro.state}
                      </LocationRow>

                      {pro.services && pro.services.length > 0 && (
                        <ChipsRow>
                          {pro.services.slice(0, 3).map((s) => (
                            <ServiceChip key={s.id}>{s.title}</ServiceChip>
                          ))}
                          {pro.services.length > 3 && (
                            <MoreChip>+{pro.services.length - 3}</MoreChip>
                          )}
                        </ChipsRow>
                      )}

                      <CTARow>
                        {pro.subscription_plan?.can_receive_bookings && (
                          <BookButton
                            className="btn-primary"
                            onClick={() => navigate(pro.slug ? `/p/${pro.slug}` : `/book/${pro.id}`, { state: { pro, clientCep: cep } })}
                          >
                            Agendar
                          </BookButton>
                        )}
                        {pro.whatsapp && (
                          <WhatsAppButton
                            href={generateWhatsAppLink(pro.whatsapp, pro.name, pro.services?.[0]?.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </WhatsAppButton>
                        )}
                      </CTARow>
                    </CardBody>
                  </ProCard>
                );
              })}
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
