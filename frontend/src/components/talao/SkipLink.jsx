import styled from 'styled-components';

/* Primeiro item do Tab em toda página: pula o topo e o menu e cai no conteúdo.
   Fica fora da tela até receber foco; aí aparece como etiqueta impressa no canto. */

const Tag = styled.a`
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  background: var(--grafica);
  color: var(--papel);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  transform: translateY(calc(-100% - 1rem));

  &:focus-visible {
    transform: none;
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }
`;

// Alvo: #conteudo quando a moldura marca onde o conteúdo começa; senão, o <main> da página
const focusContent = (event) => {
  const target = document.getElementById('conteudo') || document.querySelector('main');
  if (!target) return;
  event.preventDefault();
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus();
  target.scrollIntoView({ block: 'start' });
};

export default function SkipLink() {
  return (
    <Tag href="#conteudo" onClick={focusContent}>
      Pular para o conteúdo
    </Tag>
  );
}
