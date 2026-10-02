import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Check, Circle, ChevronRight } from 'lucide-react';

/* "Complete seu perfil": checklist impresso com a régua de gráfica no alto. */

const Wrapper = styled.section`
  background: var(--papel);
  border: 1.5px solid var(--regua);
  border-top: 2px solid var(--grafica);
  padding: 1rem 1.25rem 1.1rem;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;

  h2 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.3rem;
  }

  span {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
    color: var(--grafica-escura);
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  overflow: hidden;
  height: 6px;
  background: var(--papel-2);
  border: 1px solid var(--regua);
  margin-bottom: 0.9rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: 100%;
  background: var(--grafica);
  transform: scaleX(${(props) => props.$percent / 100});
  transform-origin: left;
  transition: transform 400ms var(--ease-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Items = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Item = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 0.75rem;
  border: 1.5px solid ${(props) => (props.$done ? 'var(--regua)' : 'var(--controle)')};
  border-radius: 2px;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => (props.$done ? 'var(--sucesso)' : 'var(--nanquim)')};
  background: ${(props) => (props.$done ? 'var(--papel-2)' : 'var(--papel)')};
`;

const ItemButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 0.75rem;
  border: 1.5px solid var(--controle);
  border-radius: 2px;
  background: var(--papel);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--nanquim);
  cursor: pointer;

  &:hover {
    border-color: var(--grafica);
    color: var(--grafica);
  }
`;

function calcCompletion(user, services) {
  const checks = [
    { key: 'photo', label: 'Foto de perfil', done: !!user?.profile_picture, to: '/profile' },
    { key: 'bio', label: 'Descrição', done: !!(user?.description && user.description.trim().length > 10), to: '/profile' },
    { key: 'city', label: 'Localização', done: !!(user?.city && user.city.trim()), to: '/profile' },
    { key: 'services', label: 'Serviço cadastrado', done: (services?.length || 0) > 0, to: '/dashboard?tab=services' },
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, percent: Math.round((done / checks.length) * 100) };
}

export default function ProfileCompletionBar({ user, services }) {
  const navigate = useNavigate();
  const { checks, percent } = calcCompletion(user, services);

  if (percent === 100) return null;

  return (
    <Wrapper aria-labelledby="completar-perfil">
      <Header>
        <h2 id="completar-perfil">Complete seu perfil</h2>
        <span>{percent}% feito</span>
      </Header>
      <ProgressTrack role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Perfil completo">
        <ProgressFill $percent={percent} />
      </ProgressTrack>
      <Items>
        {checks.map((c) => (
          c.done ? (
            <Item key={c.key} $done>
              <Check size={15} aria-hidden="true" /> {c.label}
            </Item>
          ) : (
            <li key={c.key}>
              <ItemButton type="button" onClick={() => navigate(c.to)}>
                <Circle size={12} aria-hidden="true" /> {c.label} <ChevronRight size={15} aria-hidden="true" />
              </ItemButton>
            </li>
          )
        ))}
      </Items>
    </Wrapper>
  );
}
