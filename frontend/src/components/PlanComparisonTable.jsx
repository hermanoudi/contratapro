import styled from 'styled-components';
import { Check, Crown, Star, Zap } from 'lucide-react';

const ALL_FEATURES = [
  { key: 'profile', label: 'Perfil profissional completo' },
  { key: 'services', label: 'Serviços ilimitados' },
  { key: 'appointments', label: 'Agendamentos ilimitados', highlight: true },
  { key: 'search_priority', label: 'Destaque na busca' },
  { key: 'badge', label: 'Badge de plano' },
  { key: 'no_commission', label: 'Sem comissões' },
];

const PLAN_FEATURES = {
  free: {
    profile: true,
    services: true,
    appointments: '3/mês',
    search_priority: false,
    badge: false,
    no_commission: true,
  },
  pro: {
    profile: true,
    services: true,
    appointments: true,
    search_priority: 'Intermediário',
    badge: 'Profissional Ativo',
    no_commission: true,
  },
  premium: {
    profile: true,
    services: true,
    appointments: true,
    search_priority: 'Topo da busca',
    badge: 'Destaque',
    no_commission: true,
  },
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const PlanCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: ${props => props.$featured
    ? '0 12px 40px rgba(99, 102, 241, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
  border: 3px solid ${props =>
    props.$featured ? 'var(--primary)' :
    props.$current ? '#22c55e' :
    'transparent'};
  position: relative;
  transition: all 0.3s;
  opacity: ${props => props.$disabled ? 0.6 : 1};

  ${props => !props.$disabled && `
    &:hover {
      transform: translateY(-5px);
      box-shadow: ${props.$featured
        ? '0 20px 50px rgba(99, 102, 241, 0.25)'
        : '0 8px 30px rgba(0, 0, 0, 0.12)'};
    }
  `}
`;

const PlanBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.$type === 'current' ? '#22c55e' : 'var(--primary)'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
`;

const PlanIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  svg { color: ${props => props.$color}; }
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
`;

const PriceValue = styled.span`
  font-size: 2.25rem;
  font-weight: 800;
  color: ${props => props.$free ? '#059669' : 'var(--text-primary)'};
`;

const PricePeriod = styled.span`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
`;

const FeatureRow = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  font-weight: ${props => props.$highlight ? '700' : '500'};
  color: ${props => props.$neutral ? 'var(--text-secondary)' : 'var(--text-primary)'};
  border-bottom: 1px solid var(--border);

  &:last-child { border-bottom: none; }
`;

const FeatureIcon = styled.span`
  flex-shrink: 0;
  margin-top: 2px;
  color: ${props => props.$neutral ? 'var(--text-secondary)' : '#10b981'};
  font-size: 1rem;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$variant === 'primary' && `
    background: var(--primary);
    color: white;
    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); }
  `}
  ${props => props.$variant === 'current' && `
    background: #22c55e;
    color: white;
    cursor: default;
  `}
  ${props => props.$variant === 'downgrade' && `
    background: #f59e0b;
    color: white;
    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); }
  `}
  ${props => props.$variant === 'disabled' && `
    background: var(--bg-secondary);
    color: var(--text-secondary);
    cursor: not-allowed;
  `}

  &:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
`;

const PLANS_CONFIG = [
  {
    slug: 'free', name: 'Free', price: 0,
    icon: Zap, iconColor: '#10b981', iconBg: 'rgba(16, 185, 129, 0.1)',
    isFreePlan: true,
  },
  {
    slug: 'pro', name: 'Pro', price: 19.90,
    icon: Star, iconColor: '#6366f1', iconBg: 'rgba(99, 102, 241, 0.1)',
    featured: true,
  },
  {
    slug: 'premium', name: 'Premium', price: 39.90,
    icon: Crown, iconColor: '#8b5cf6', iconBg: 'rgba(139, 92, 246, 0.1)',
  },
];

function renderFeatureValue(value, highlight) {
  if (value === false) {
    return (
      <FeatureRow $neutral>
        <FeatureIcon $neutral>—</FeatureIcon>
        {highlight ? <strong style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{/* from parent */}</strong> : null}
      </FeatureRow>
    );
  }
  return null;
}

export default function PlanComparisonTable({ currentPlan, onChangePlan, changingPlan }) {
  const getButtonConfig = (plan) => {
    const isCurrentPlan = plan.slug === currentPlan;
    const currentConfig = PLANS_CONFIG.find(p => p.slug === currentPlan);
    const isUpgrade = currentConfig && plan.price > currentConfig.price;
    const isDowngrade = currentConfig && plan.price < currentConfig.price;
    const isPaidToFree = plan.slug === 'free' && currentConfig && currentConfig.price > 0;

    if (isCurrentPlan) return { variant: 'current', text: 'Plano Atual', disabled: true };
    if (isPaidToFree) return { variant: 'disabled', text: 'Indisponível', disabled: true };
    if (isUpgrade) return { variant: 'primary', text: 'Fazer Upgrade', disabled: false };
    if (isDowngrade) return { variant: 'downgrade', text: 'Fazer Downgrade', disabled: false };
    return { variant: 'primary', text: 'Selecionar', disabled: false };
  };

  return (
    <Grid>
      {PLANS_CONFIG.map((plan) => {
        const IconComp = plan.icon;
        const isCurrentPlan = plan.slug === currentPlan;
        const buttonConfig = getButtonConfig(plan);
        const planFeatures = PLAN_FEATURES[plan.slug];

        return (
          <PlanCard
            key={plan.slug}
            $featured={plan.featured && !isCurrentPlan}
            $current={isCurrentPlan}
            $disabled={buttonConfig.disabled && !isCurrentPlan}
          >
            {plan.featured && !isCurrentPlan && (
              <PlanBadge><Crown size={12} /> Mais Popular</PlanBadge>
            )}
            {isCurrentPlan && (
              <PlanBadge $type="current"><Check size={12} /> Atual</PlanBadge>
            )}

            <PlanIcon $bg={plan.iconBg} $color={plan.iconColor}>
              <IconComp size={26} />
            </PlanIcon>

            <PlanName>{plan.name}</PlanName>

            <PlanPrice>
              {plan.price === 0 ? (
                <PriceValue $free>Grátis</PriceValue>
              ) : (
                <>
                  <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>R$</span>
                  <PriceValue>{plan.price.toFixed(2).replace('.', ',')}</PriceValue>
                  <PricePeriod>/mês</PricePeriod>
                </>
              )}
            </PlanPrice>

            <FeatureList>
              {ALL_FEATURES.map(feature => {
                const value = planFeatures[feature.key];
                const isNeutral = value === false;
                const displayText = value === true
                  ? feature.label
                  : value === false
                    ? feature.label
                    : `${feature.label}: ${value}`;

                return (
                  <FeatureRow key={feature.key} $highlight={feature.highlight && !isNeutral} $neutral={isNeutral}>
                    <FeatureIcon $neutral={isNeutral}>
                      {isNeutral ? '—' : <Check size={14} />}
                    </FeatureIcon>
                    <span style={feature.highlight && !isNeutral ? { fontWeight: 700, color: 'var(--primary)' } : {}}>
                      {displayText}
                    </span>
                  </FeatureRow>
                );
              })}
            </FeatureList>

            <ActionButton
              $variant={buttonConfig.variant}
              disabled={buttonConfig.disabled || changingPlan}
              onClick={() => !buttonConfig.disabled && onChangePlan(plan.slug)}
            >
              {changingPlan ? 'Processando...' : buttonConfig.text}
            </ActionButton>

            {plan.slug === 'free' && PLANS_CONFIG.find(p => p.slug === currentPlan)?.price > 0 && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Downgrade para Free não disponível
              </div>
            )}
          </PlanCard>
        );
      })}
    </Grid>
  );
}
