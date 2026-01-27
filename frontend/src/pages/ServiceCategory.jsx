import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Search,
  MapPin,
  Star,
  ChevronLeft,
  Shield,
  MessageCircle,
  Users,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead, { POPULAR_CATEGORIES } from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';
import { API_URL } from '../config';

const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, var(--primary), var(--accent));
  padding: 3rem 2rem;
  color: white;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;

  a {
    color: white;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  svg {
    opacity: 0.9;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const ProHeader = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProInfo = styled.div`
  flex: 1;
`;

const ProName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const ProLocation = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const RatingScore = styled.span`
  font-weight: 700;
  color: var(--text-primary);
`;

const RatingCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButton = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;

  &.primary {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  }

  &.whatsapp {
    background: #25d366;
    color: white;
    &:hover {
      background: #20bd5a;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
`;

const RelatedCategories = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

const CategoryTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const CategoryTag = styled(Link)`
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }
`;

export default function ServiceCategory() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  // Encontrar categoria nos dados pre-definidos
  const categoryData = POPULAR_CATEGORIES.find(c => c.slug === categoria);
  const categoryName = categoryData?.name || categoria?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Pegar cidade do localStorage
  useEffect(() => {
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) setCity(savedCity);
  }, []);

  // Buscar profissionais da categoria
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('service', categoryName);
        if (city) params.append('city', city);

        const res = await fetch(`${API_URL}/users/search-by-service?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProfessionals(data);
        }
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchProfessionals();
    }
  }, [categoryName, city]);

  const generateWhatsAppLink = (whatsapp, profName) => {
    if (!whatsapp) return '#';
    const cleanPhone = whatsapp.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = `Ola ${profName}! Encontrei seu perfil no ContrataPro e gostaria de saber mais sobre seus servicos de ${categoryName}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Categorias relacionadas (excluindo a atual)
  const relatedCategories = POPULAR_CATEGORIES.filter(c => c.slug !== categoria).slice(0, 6);

  return (
    <Container>
      <SEOHead
        category={categoryName}
        city={city}
        url={`https://contratapro.com.br/servicos/${categoria}`}
      />
      <StructuredData type="service" />

      <HeroSection>
        <HeroContent>
          <Breadcrumb>
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/search">Servicos</Link>
            <span>/</span>
            <span>{categoryName}</span>
          </Breadcrumb>

          <HeroTitle>
            {categoryName}{city ? ` em ${city}` : ''}
          </HeroTitle>
          <HeroSubtitle>
            Encontre os melhores profissionais de {categoryName} na sua regiao.
            Profissionais verificados, avaliacoes reais e agendamento online.
          </HeroSubtitle>

          <StatsRow>
            <StatItem>
              <Users size={18} />
              <span>{professionals.length} profissionais disponiveis</span>
            </StatItem>
            <StatItem>
              <CheckCircle size={18} />
              <span>Profissionais verificados</span>
            </StatItem>
            <StatItem>
              <Star size={18} />
              <span>Avaliacoes reais</span>
            </StatItem>
          </StatsRow>
        </HeroContent>
      </HeroSection>

      <MainContent>
        <SectionTitle>
          Profissionais de {categoryName}
        </SectionTitle>

        {loading ? (
          <LoadingState>
            <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Buscando profissionais...</p>
          </LoadingState>
        ) : professionals.length > 0 ? (
          <Grid>
            {professionals.map((pro) => (
              <ProCard
                key={pro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProHeader>
                  <ProAvatar $hasImage={!!pro.profile_picture}>
                    {pro.profile_picture ? (
                      <img src={pro.profile_picture} alt={pro.name} />
                    ) : (
                      pro.name.charAt(0).toUpperCase()
                    )}
                  </ProAvatar>
                  <ProInfo>
                    <ProName>{pro.name}</ProName>
                    {pro.city && (
                      <ProLocation>
                        <MapPin size={14} />
                        {pro.city}
                      </ProLocation>
                    )}
                  </ProInfo>
                </ProHeader>

                <RatingContainer>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <RatingScore>4.9</RatingScore>
                  <RatingCount>(128 avaliacoes)</RatingCount>
                  <VerifiedBadge>
                    <Shield size={12} />
                    Verificado
                  </VerifiedBadge>
                </RatingContainer>

                <ButtonsContainer>
                  <ActionButton
                    className="primary"
                    onClick={() => navigate(`/book/${pro.id}`)}
                  >
                    Agendar
                  </ActionButton>
                  {pro.whatsapp && (
                    <ActionButton
                      className="whatsapp"
                      href={generateWhatsAppLink(pro.whatsapp, pro.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </ActionButton>
                  )}
                </ButtonsContainer>
              </ProCard>
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>Nenhum profissional encontrado</h3>
            <p>Ainda nao temos profissionais de {categoryName}{city ? ` em ${city}` : ''} cadastrados.</p>
          </EmptyState>
        )}

        <RelatedCategories>
          <SectionTitle>Outras categorias</SectionTitle>
          <CategoryTags>
            {relatedCategories.map((cat) => (
              <CategoryTag key={cat.slug} to={`/servicos/${cat.slug}`}>
                {cat.name}
              </CategoryTag>
            ))}
          </CategoryTags>
        </RelatedCategories>
      </MainContent>
    </Container>
  );
}
