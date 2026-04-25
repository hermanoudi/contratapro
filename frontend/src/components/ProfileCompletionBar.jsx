import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

const Wrapper = styled.div`
  background: white;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const Title = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const Percent = styled.span`
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--primary);
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 99px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 99px;
  transition: width 0.6s ease;
`;

const Items = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Item = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$done ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'};
  background: ${props => props.$done ? 'rgba(16, 185, 129, 0.07)' : 'var(--bg-secondary)'};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.$done ? '#059669' : 'var(--text-secondary)'};
  cursor: ${props => props.$done ? 'default' : 'pointer'};
  transition: all 0.2s;

  &:hover:not([disabled]) {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(99, 102, 241, 0.06);
  }
`;

function calcCompletion(user, services) {
  const checks = [
    { key: 'photo', label: 'Foto de perfil', done: !!user?.profile_picture, tab: null },
    { key: 'bio', label: 'Descrição', done: !!(user?.description && user.description.trim().length > 10), tab: null },
    { key: 'city', label: 'Localização', done: !!(user?.city && user.city.trim()), tab: null },
    { key: 'services', label: 'Serviço cadastrado', done: (services?.length || 0) > 0, tab: 'services' },
  ];
  const done = checks.filter(c => c.done).length;
  return { checks, percent: Math.round((done / checks.length) * 100) };
}

export default function ProfileCompletionBar({ user, services }) {
  const navigate = useNavigate();
  const { checks, percent } = calcCompletion(user, services);

  if (percent === 100) return null;

  const handleClick = (tab) => {
    if (tab) navigate(`/dashboard?tab=${tab}`);
  };

  return (
    <Wrapper>
      <Header>
        <Title>Complete seu perfil</Title>
        <Percent>{percent}% concluído</Percent>
      </Header>
      <ProgressTrack>
        <ProgressFill $percent={percent} />
      </ProgressTrack>
      <Items>
        {checks.map(c => (
          <Item
            key={c.key}
            $done={c.done}
            disabled={c.done}
            onClick={() => !c.done && handleClick(c.tab)}
          >
            {c.done
              ? <CheckCircle size={13} />
              : <Circle size={13} />
            }
            {c.label}
            {!c.done && c.tab && <ChevronRight size={13} />}
          </Item>
        ))}
      </Items>
    </Wrapper>
  );
}
