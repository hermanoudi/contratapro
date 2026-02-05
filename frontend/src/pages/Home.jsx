import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, MapPin, Star, Menu, LogOut, User, LayoutDashboard, Check, Calendar, DollarSign, Briefcase, X, ChevronRight, Shield, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryMenu from '../components/CategoryMenu';
import { API_URL } from '../config';
import StructuredData from '../components/SEO/StructuredData';
import SEOHead, { SEO_CONFIGS } from '../components/SEO/SEOHead';
import logoImage from '../assets/contratapro-logo.png';

const HomeContainer = styled.div`
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

const SecondaryNav = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  border-top: 1px solid var(--border);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 2rem;
  }
`;

const CEPDisplay = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 600;
  width: 100%;

  &:hover {
    border-color: var(--primary);
    background: var(--bg-secondary);
  }

  @media (min-width: 768px) {
    width: auto;
    font-size: 0.9rem;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  flex: 1;

  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.25rem;
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-secondary);
  }

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    padding: 2.5rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    color: var(--primary);
  }
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  margin-bottom: 1rem;
  outline: none;
  transition: all 0.2s;
  text-align: center;
  font-weight: 600;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }

  &::placeholder {
    color: var(--text-secondary);
    font-weight: 400;
  }
`;

const CityDisplay = styled.div`
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: var(--text-secondary);

  strong {
    color: var(--primary);
    font-size: 1.1rem;
    display: block;
    margin-top: 0.5rem;
  }
`;

const ModalButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }

  @media (min-width: 768px) {
    gap: 0.75rem;
  }
`;

const LogoIcon = styled.img`
  height: 38px;
  width: auto;
  object-fit: contain;

  @media (min-width: 768px) {
    height: 48px;
  }
`;

const LogoText = styled.h2`
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.02em;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NavLinks = styled.div`
  display: none;

  @media (min-width: 968px) {
    display: flex;
    gap: 2rem;
    align-items: center;
  }
`;

const NavLink = styled(Link)`
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: var(--primary);
  }
`;

const NavButton = styled(Link)`
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: var(--primary);
  }
`;

const MobileMenuButton = styled.button`
  display: block;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;

  @media (min-width: 968px) {
    display: none;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 73px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1rem 1rem 8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 50;

  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
  }
`;

const Hero = styled.section`
  padding: 20rem 1rem 3rem;
  text-align: center;
  background:
    linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.95), var(--bg-primary));
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 11rem 2rem 6rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(1.75rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  margin-bottom: 1rem;
  line-height: 1.1;
  color: var(--text-primary);
`;

const HeroGradientText = styled.span`
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled(motion.p)`
  color: var(--text-secondary);
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto 1rem;
  line-height: 1.5;
  padding: 0 1rem;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    padding: 0;
  }
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;

  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--text-primary);

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  padding: 0 1rem;

  @media (min-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 4rem;
    padding: 0;
  }
`;

const HowItWorksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    margin-bottom: 4rem;
  }
`;

const HowItWorksCard = styled(motion.div)`
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 20px;
  border: 2px solid var(--border);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
    border-color: var(--primary);
  }

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const IconWrapper = styled.div`
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  @media (min-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-primary);

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const PricingSection = styled.div`
  position: relative;
  overflow: hidden;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    align-items: stretch;
    padding-top: 1.5rem;
  }
`;

const PriceBox = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  border: 2px solid ${props => props.$featured ? 'var(--primary)' : 'var(--border)'};
  box-shadow: ${props => props.$featured
    ? '0 20px 60px rgba(99, 102, 241, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.06)'};
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  ${props => props.$featured && `
    @media (min-width: 768px) {
      transform: scale(1.05);
    }
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
  }

  @media (min-width: 768px) {
    border-radius: 24px;
    padding: 2.5rem 2rem;

    &:hover {
      transform: ${props => props.$featured ? 'scale(1.05) translateY(-4px)' : 'translateY(-4px)'};
    }
  }
`;

const PlanBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.$color || 'linear-gradient(135deg, var(--primary), var(--accent))'};
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (min-width: 768px) {
    font-size: 0.75rem;
    padding: 0.5rem 1.25rem;
  }
`;

const PlanName = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
  margin-top: ${props => props.$hasBadge ? '1rem' : '0'};

  @media (min-width: 768px) {
    font-size: 1.5rem;
    margin-top: ${props => props.$hasBadge ? '0.75rem' : '0'};
  }
`;

const Price = styled.div`
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1;
  text-align: center;

  &.free {
    background: linear-gradient(135deg, #10b981, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
    -webkit-text-fill-color: var(--text-secondary);
  }

  @media (min-width: 768px) {
    font-size: 2.75rem;

    span {
      font-size: 1.125rem;
    }
  }
`;

const PlanDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.25rem;
  line-height: 1.4;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  text-align: left;
  flex: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  svg {
    color: #10b981;
    flex-shrink: 0;
    margin-top: 2px;
  }

  @media (min-width: 768px) {
    font-size: 0.9rem;
    padding: 0.625rem 0;
  }
`;

const PlanButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: auto;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    }
  ` : props.$green ? `
    background: #10b981;
    color: white;
    border: none;

    &:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }
  ` : props.$orange ? `
    background: #f59e0b;
    color: white;
    border: none;

    &:hover {
      background: #d97706;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
    }
  ` : `
    background: white;
    color: var(--text-primary);
    border: 2px solid var(--border);

    &:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
  `}

  @media (min-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
  }
`;

const Footer = styled.footer`
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  padding: 2rem 1rem 1.5rem;
  margin-top: 4rem;
  text-align: center;

  @media (min-width: 768px) {
    padding: 3rem 2rem 2rem;
    margin-top: 6rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    gap: 2rem;
    margin-bottom: 2rem;
  }
`;

const FooterLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const ProCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 2rem;
    gap: 1.25rem;
  }
`;

const ProAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 800;
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
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

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
  }

  @media (min-width: 768px) {
    flex-wrap: nowrap;

    h2 {
      font-size: 2rem;
    }
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
  font-size: 0.9rem;
  padding: 0.5rem;

  &:hover {
    color: var(--primary);
  }

  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 0;
  }
`;

const ProfessionalsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  @media (min-width: 768px) {
    gap: 2rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: var(--bg-secondary);
  border-radius: 24px;
  border: 1px solid var(--border);

  h3 {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
  }

  @media (min-width: 768px) {
    padding: 5rem 2rem;
    border-radius: 32px;

    h3 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1.1rem;
    }
  }
`;

export default function Home() {
    const [search, setSearch] = useState('');
    const [cep, setCep] = useState('');
    const [city, setCity] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cepModalOpen, setCepModalOpen] = useState(false);
    const [tempCep, setTempCep] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [professionals, setProfessionals] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const validateAndLoadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Validar token com o backend
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUserInfo(data);
                    } else {
                        // Token inválido ou expirado
                        localStorage.removeItem('token');
                        setUserInfo(null);
                    }
                } catch (e) {
                    console.error('Error validating token:', e);
                    localStorage.removeItem('token');
                    setUserInfo(null);
                }
            }
        };

        validateAndLoadUser();

        // Carregar CEP do localStorage
        const savedCep = localStorage.getItem('userCep');
        const savedCity = localStorage.getItem('userCity');
        if (savedCep && savedCity) {
            setCep(savedCep);
            setCity(savedCity);
        }
    }, []);


    const handleCepChange = async (value) => {
        const cleanValue = value.replace(/\D/g, '');
        setTempCep(cleanValue);

        if (cleanValue.length === 8) {
            try {
                const res = await fetch(`/api/cep/${cleanValue}`);
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

    const handleSaveCep = () => {
        if (tempCep.length === 8 && city) {
            setCep(tempCep);
            localStorage.setItem('userCep', tempCep);
            localStorage.setItem('userCity', city);
            setCepModalOpen(false);
            setTempCep('');
        }
    };

    const openCepModal = () => {
        setTempCep(cep);
        setCepModalOpen(true);
    };

    const handleSearch = async (categoryOverride) => {
        const searchTerm = categoryOverride || search;
        setSearching(true);
        setHasSearched(true);

        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('category', searchTerm);
            if (city) params.append('city', city);

            const res = await fetch(`/api/users/search?${params.toString()}`);
            if (res.ok) {
                setProfessionals(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }

        window.scrollTo({ top: 600, behavior: 'smooth' });
    };

    const clearSearch = () => {
        setSearch('');
        setProfessionals([]);
        setHasSearched(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const handleHeaderSearch = () => {
        if (search || city) {
            navigate(`/search?service=${encodeURIComponent(search)}&city=${encodeURIComponent(city)}`);
        }
    };

    return (
        <HomeContainer>
            {/* SEO: Meta tags and Structured Data */}
            <SEOHead {...SEO_CONFIGS.home} url="https://contratapro.com.br" />
            <StructuredData type="website" />
            <StructuredData type="organization" />
            <StructuredData type="service" />

            <Navbar>
                <NavContainer>
                    <Logo to="/">
                        <LogoIcon src={logoImage} alt="ContrataPro" />
                    </Logo>

                    <NavLinks>
                        {userInfo ? (
                            <>
                                {!userInfo.is_professional && !userInfo.is_admin && (
                                    <NavLink to="/my-appointments">
                                        <Calendar size={18} />
                                        Meus Agendamentos
                                    </NavLink>
                                )}
                                {!userInfo.is_professional && !userInfo.is_admin && (
                                    <NavLink to="/my-appointments">
                                        <User size={18} />
                                        Minha Conta
                                    </NavLink>
                                )}
                                {userInfo.is_professional && (
                                    <NavLink to="/dashboard">
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </NavLink>
                                )}
                                {userInfo.is_admin && (
                                    <NavLink to="/admin">Admin</NavLink>
                                )}
                                <LogoutButton onClick={handleLogout}>
                                    <LogOut size={18} />
                                    Sair
                                </LogoutButton>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login">Login</NavLink>
                                <NavLink to="/register-client">Criar Conta</NavLink>
                                <NavButton to="/register-pro">Sou Profissional</NavButton>
                            </>
                        )}
                    </NavLinks>

                    <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <Menu size={24} />
                    </MobileMenuButton>
                </NavContainer>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <MobileMenu
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {userInfo ? (
                                <>
                                    <NavLink to="/my-appointments" onClick={() => setMobileMenuOpen(false)}>
                                        Meus Agendamentos
                                    </NavLink>
                                    {userInfo.is_professional && (
                                        <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </NavLink>
                                    )}
                                    {userInfo.is_admin && (
                                        <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                                            Admin
                                        </NavLink>
                                    )}
                                    <LogoutButton onClick={handleLogout}>
                                        Sair
                                    </LogoutButton>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        Login
                                    </NavLink>
                                    <NavLink to="/register-client" onClick={() => setMobileMenuOpen(false)}>
                                        Criar Conta
                                    </NavLink>
                                    <NavButton to="/register-pro" onClick={() => setMobileMenuOpen(false)}>
                                        Sou Profissional
                                    </NavButton>
                                </>
                            )}
                        </MobileMenu>
                    )}
                </AnimatePresence>

                <SecondaryNav>
                    <CategoryMenu />
                    <CEPDisplay onClick={openCepModal}>
                        <MapPin size={18} />
                        {cep ? `${cep.slice(0, 5)}-${cep.slice(5)} - ${city}` : 'Definir CEP'}
                        <Edit2 size={16} />
                    </CEPDisplay>
                    <SearchContainer>
                        <SearchInputWrapper>
                            <Search size={20} color="var(--primary)" />
                            <SearchInput
                                placeholder="Buscar serviços"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleHeaderSearch()}
                            />
                        </SearchInputWrapper>
                        <SearchButton onClick={handleHeaderSearch}>
                            Buscar
                        </SearchButton>
                    </SearchContainer>
                </SecondaryNav>
            </Navbar>

            <AnimatePresence>
                {cepModalOpen && (
                    <ModalOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCepModalOpen(false)}
                    >
                        <ModalContent
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ModalHeader>
                                <ModalTitle>Informe seu CEP</ModalTitle>
                                <CloseButton onClick={() => setCepModalOpen(false)}>
                                    <X size={24} />
                                </CloseButton>
                            </ModalHeader>

                            <ModalInput
                                type="text"
                                placeholder="00000-000"
                                value={tempCep.length > 5 ? `${tempCep.slice(0, 5)}-${tempCep.slice(5)}` : tempCep}
                                onChange={(e) => handleCepChange(e.target.value)}
                                maxLength={9}
                            />

                            {city && (
                                <CityDisplay>
                                    Localização encontrada:
                                    <strong>{city}</strong>
                                </CityDisplay>
                            )}

                            <ModalButton
                                onClick={handleSaveCep}
                                disabled={tempCep.length !== 8 || !city}
                            >
                                Salvar CEP
                            </ModalButton>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>

            <Hero>
                <HeroTitle
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Encontre profissionais<br />
                    <HeroGradientText>na sua região</HeroGradientText>
                </HeroTitle>
                <HeroSubtitle
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Encontre o profissional certo para cada serviço
                </HeroSubtitle>
            </Hero>

            {hasSearched && (
                <Section>
                    <ResultsHeader>
                        <h2>
                            {professionals.length} {professionals.length === 1 ? 'Profissional encontrado' : 'Profissionais encontrados'}
                        </h2>
                        <ClearButton onClick={clearSearch}>
                            <X size={18} /> Limpar busca
                        </ClearButton>
                    </ResultsHeader>

                    {professionals.length > 0 ? (
                        <ProfessionalsGrid>
                            {professionals.map(pro => (
                                <ProCard key={pro.id}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <ProAvatar>
                                            {pro.name.charAt(0).toUpperCase()}
                                        </ProAvatar>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, wordBreak: 'break-word' }}>{pro.name}</h3>
                                                <VerifiedBadge>
                                                    <Shield size={12} />
                                                    Verificado
                                                </VerifiedBadge>
                                            </div>
                                            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{pro.category}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 0.875rem', borderRadius: '10px', width: 'fit-content' }}>
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>4.9</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>(128)</span>
                                    </div>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                        {pro.description || 'Sem descrição disponível.'}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                                        <MapPin size={16} color="var(--primary)" />
                                        {pro.city}, {pro.state}
                                    </div>

                                    {pro.services && pro.services.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Serviços:</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {pro.services.slice(0, 2).map(s => (
                                                    <span key={s.id} style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600, border: '1px solid var(--border)' }}>
                                                        {s.title}
                                                    </span>
                                                ))}
                                                {pro.services.length > 2 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>+{pro.services.length - 2} mais</span>}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="btn-primary"
                                        style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '0.9rem' }}
                                        onClick={() => navigate(pro.slug ? `/p/${pro.slug}` : `/book/${pro.id}`, { state: { pro, clientCep: cep } })}
                                    >
                                        Ver Agenda e Reservar
                                    </button>
                                </ProCard>
                            ))}
                        </ProfessionalsGrid>
                    ) : (
                        <EmptyState>
                            <Briefcase size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                            <h3>Nenhum profissional encontrado</h3>
                            <p>Tente buscar por outra categoria ou em uma região diferente.</p>
                        </EmptyState>
                    )}
                </Section>
            )}

            <Section>
                <SectionTitle>Como funciona para você</SectionTitle>
                <SectionSubtitle>
                    Em poucos cliques você encontra e agenda com profissionais qualificados
                </SectionSubtitle>
                <HowItWorksGrid>
                    <HowItWorksCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        viewport={{ once: true }}
                    >
                        <IconWrapper>
                            <Search size={40} />
                        </IconWrapper>
                        <CardTitle>1. Busque</CardTitle>
                        <CardText>
                            Digite o serviço que precisa e seu CEP para encontrar profissionais na sua região
                        </CardText>
                    </HowItWorksCard>

                    <HowItWorksCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <IconWrapper>
                            <Star size={40} />
                        </IconWrapper>
                        <CardTitle>2. Compare</CardTitle>
                        <CardText>
                            Veja avaliações, portfólio e valores para escolher o melhor profissional
                        </CardText>
                    </HowItWorksCard>

                    <HowItWorksCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <IconWrapper>
                            <Calendar size={40} />
                        </IconWrapper>
                        <CardTitle>3. Agende</CardTitle>
                        <CardText>
                            Escolha data e horário disponíveis e reserve diretamente na agenda do profissional
                        </CardText>
                    </HowItWorksCard>
                </HowItWorksGrid>
            </Section>

            <Section style={{ background: 'var(--bg-secondary)', margin: '0', maxWidth: '100%', padding: '3rem 1rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <SectionTitle>Para profissionais</SectionTitle>
                    <SectionSubtitle>
                        Tenha seu espaço profissional e receba agendamentos todos os dias
                    </SectionSubtitle>
                    <HowItWorksGrid>
                        <HowItWorksCard
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0 }}
                            viewport={{ once: true }}
                        >
                            <IconWrapper>
                                <Briefcase size={40} />
                            </IconWrapper>
                            <CardTitle>Exponha seus serviços</CardTitle>
                            <CardText>
                                Crie seu perfil profissional com fotos, descrições e valores dos seus serviços
                            </CardText>
                        </HowItWorksCard>

                        <HowItWorksCard
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <IconWrapper>
                                <Calendar size={40} />
                            </IconWrapper>
                            <CardTitle>Controle sua agenda</CardTitle>
                            <CardText>
                                Defina seus horários de atendimento e receba agendamentos automaticamente
                            </CardText>
                        </HowItWorksCard>

                        <HowItWorksCard
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <IconWrapper>
                                <DollarSign size={40} />
                            </IconWrapper>
                            <CardTitle>Receba mais clientes</CardTitle>
                            <CardText>
                                Seja encontrado por milhares de pessoas que buscam seus serviços na sua cidade
                            </CardText>
                        </HowItWorksCard>
                    </HowItWorksGrid>
                </div>
            </Section>

            <Section>
                <SectionTitle>Escolha seu plano</SectionTitle>
                <SectionSubtitle>
                    Comece gratis com o Trial ou escolha o plano ideal para o seu negocio
                </SectionSubtitle>
                <PricingSection>
                    <PlansGrid>
                        {/* Trial - Teste do Premium */}
                        <PriceBox
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0 }}
                            viewport={{ once: true }}
                        >
                            <PlanBadge $color="#10b981">TESTE GRATIS</PlanBadge>
                            <PlanName $hasBadge>Trial</PlanName>
                            <Price className="free">
                                GRATIS
                                <span>/30 dias</span>
                            </Price>
                            <PlanDescription>
                                Teste o plano Premium completo sem compromisso
                            </PlanDescription>
                            <FeatureList>
                                <FeatureItem>
                                    <Check size={16} />
                                    Perfil profissional completo
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Ate 5 servicos cadastrados
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Agenda online
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Receba agendamentos
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Contato via WhatsApp
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Sem cartao de credito
                                </FeatureItem>
                            </FeatureList>
                            <PlanButton to="/register-pro" $green>
                                Comecar gratis
                                <ChevronRight size={18} />
                            </PlanButton>
                        </PriceBox>

                        {/* Basic - Mais Popular */}
                        <PriceBox
                            $featured
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <PlanBadge>MAIS POPULAR</PlanBadge>
                            <PlanName $hasBadge>Basic</PlanName>
                            <Price>
                                R$ 29,90
                                <span>/mes</span>
                            </Price>
                            <PlanDescription>
                                Deixe seu cliente te encontrar
                            </PlanDescription>
                            <FeatureList>
                                <FeatureItem>
                                    <Check size={16} />
                                    Perfil profissional completo
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Ate 3 servicos cadastrados
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Cliente faz contato via WhatsApp
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Perfil listado na busca
                                </FeatureItem>
                            </FeatureList>
                            <PlanButton to="/register-pro" $primary>
                                Assinar Basic
                                <ChevronRight size={18} />
                            </PlanButton>
                        </PriceBox>

                        {/* Premium */}
                        <PriceBox
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <PlanBadge $color="#f59e0b">COMPLETO</PlanBadge>
                            <PlanName $hasBadge>Premium</PlanName>
                            <Price>
                                R$ 49,90
                                <span>/mes</span>
                            </Price>
                            <PlanDescription>
                                Máxima visibilidade nas buscas
                            </PlanDescription>
                            <FeatureList>
                                <FeatureItem>
                                    <Check size={16} />
                                    Perfil profissional completo
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Até 10 servicos cadastrados
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Agenda online completa
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Agendamentos ilimitados
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Destaque máximo na busca
                                </FeatureItem>
                                <FeatureItem>
                                    <Check size={16} />
                                    Suporte prioritario
                                </FeatureItem>
                            </FeatureList>
                            <PlanButton to="/register-pro" $orange>
                                Assinar Premium
                                <ChevronRight size={18} />
                            </PlanButton>
                        </PriceBox>
                    </PlansGrid>
                </PricingSection>
            </Section>

            <Footer>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                        ContrataPro
                    </h3>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '0.9rem' }}>
                        Encontre o profissional certo para cada serviço
                    </p>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.85rem', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                        <strong>Por que buscamos por região?</strong> Conectamos você com profissionais da sua região para garantir atendimento rápido, custos de deslocamento reduzidos e maior praticidade para ambos.
                    </p>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.7, fontSize: '0.8rem', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: '1.5', fontStyle: 'italic' }}>
                        O ContrataPro é uma plataforma de conexão entre clientes e profissionais autônomos. Não somos empregadores nem responsáveis pelos serviços prestados. A contratação e execução dos serviços ocorre diretamente entre o cliente e o profissional.
                    </p>
                    <FooterLinks>
                        <FooterLink to="/login">Login</FooterLink>
                        <FooterLink to="/register-client">Criar Conta</FooterLink>
                        <FooterLink to="/register-pro">Sou Profissional</FooterLink>
                    </FooterLinks>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} ContrataPro. Todos os direitos reservados.
                    </p>
                </div>
            </Footer>
        </HomeContainer>
    );
}
