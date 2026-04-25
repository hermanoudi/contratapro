import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

function usePublicStats() {
  const [stats, setStats] = useState({ professionals_count: 100, appointments_count: 500 });

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    fetch(`${API_URL}/users/stats/public`, { signal: controller.signal })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data) setStats(data); })
      .catch(() => {})
      .finally(() => clearTimeout(timer));

    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  return stats;
}

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);
    const el = ref.current;
    if (!el || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress >= 1) clearInterval(tick);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString('pt-BR')}</span>;
}

const HeroWrapper = styled.section`
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

const GradientText = styled.span`
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled(motion.p)`
  color: var(--text-secondary);
  font-size: 1rem;
  max-width: 560px;
  margin: 0 auto 2rem;
  line-height: 1.6;
  padding: 0 1rem;

  @media (min-width: 768px) {
    font-size: 1.2rem;
    padding: 0;
  }
`;

const CTAGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;

  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

const PrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
  }
`;

const OutlineBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: white;
  color: var(--primary);
  border: 2px solid var(--primary);
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    transform: translateY(-2px);
  }
`;

const StatsRow = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  svg {
    color: var(--primary);
    margin-bottom: 0.125rem;
  }
`;

const StatNum = styled.div`
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 40px;
  background: var(--border);
`;

export default function HeroSection() {
  const stats = usePublicStats();

  return (
    <HeroWrapper>
      <HeroTitle
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Conecte-se com profissionais<br />
        <GradientText>da sua região</GradientText>
      </HeroTitle>

      <HeroSubtitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Contrate, agende e avalie os melhores profissionais perto de você. Grátis para começar.
      </HeroSubtitle>

      <CTAGroup
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
      >
        <PrimaryBtn to="/search">
          Encontrar profissional
          <ArrowRight size={18} />
        </PrimaryBtn>
        <OutlineBtn to="/register-pro">
          Quero oferecer serviços
        </OutlineBtn>
      </CTAGroup>

      <StatsRow
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <StatItem>
          <Users size={18} />
          <StatNum>
            <AnimatedCounter target={stats.professionals_count} />+
          </StatNum>
          <StatLabel>profissionais</StatLabel>
        </StatItem>
        <StatDivider />
        <StatItem>
          <Calendar size={18} />
          <StatNum>
            <AnimatedCounter target={stats.appointments_count} />+
          </StatNum>
          <StatLabel>agendamentos</StatLabel>
        </StatItem>
      </StatsRow>
    </HeroWrapper>
  );
}
