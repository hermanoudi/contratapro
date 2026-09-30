import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import { formatPrice, pickHighlight } from './pricing';

/* Cartão de profissional: folha branca com uma linha de talão (serviço e preço)
   e o rodapé com a nota real. Pensado para ficar sobre a via rosa. */

export const CardsGrid = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1040px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

// Folha branca sobre a via: volta o texto secundário para o tom do papel
export const cardSheet = `
  background: var(--papel);
  --texto-2: var(--texto-2-papel);
  border-bottom: 5px solid var(--grafica);
  box-shadow: 0 16px 28px -18px rgba(107, 38, 56, 0.55), 0 1px 3px rgba(107, 38, 56, 0.18);
`;

/* O cartão é um article com o link no nome esticado por cima de tudo (::after):
   assim cabem ações próprias, como o WhatsApp, sem link dentro de link. */
const Cartao = styled.article`
  ${cardSheet}
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
  gap: 0.9rem 1rem;
  min-height: 11rem;
  padding: 1.25rem;
  color: var(--nanquim);
  text-decoration: none;
  transition: transform 200ms var(--ease-out);

  &:hover {
    transform: translateY(-3px) rotate(-0.4deg);
  }

  &:hover [data-ver] {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
  }

  /* O foco do link do nome contorna o cartão inteiro */
  &:has(h3 a:focus-visible) {
    outline: 2px solid var(--carbono);
    outline-offset: 3px;
  }

  h3 a {
    color: inherit;
    text-decoration: none;

    &:focus-visible {
      outline: none;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const Foto = styled.div`
  width: 64px;
  height: 64px;
  border: 2px solid var(--nanquim);
  background: var(--amarela);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--f-impresso);
  font-weight: 800;
  font-size: 1.9rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CartaoInfo = styled.div`
  min-width: 0;

  h3 {
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.45rem;
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  p {
    margin-top: 0.25rem;
    font-size: 0.95rem;
    color: var(--texto-2);
  }

  [data-cat] {
    color: var(--grafica);
    font-weight: 600;
  }
`;

// Uma linha de talão no cartão: o serviço e o preço que o profissional cadastrou
const CartaoItem = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1.5px solid var(--pauta);

  > span {
    min-width: 0;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  strong {
    flex: none;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.2rem;
    font-variant-numeric: tabular-nums;
    color: var(--grafica-escura);
  }

  small {
    font-family: var(--f-texto);
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--texto-2);
  }
`;

const CartaoFoot = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1.5px solid var(--pauta);
  font-size: 0.95rem;

  [data-nota] {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--texto-2);
  }

  [data-ver] {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-family: var(--f-impresso);
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--grafica);
    white-space: nowrap;
  }
`;

// Selo do plano, carimbado no canto da folha como o carimbo da via
const Selo = styled.span`
  position: absolute;
  top: -0.7rem;
  right: 0.9rem;
  padding: 0.15rem 0.5rem;
  background: var(--papel);
  border: 2px solid var(--grafica-escura);
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--grafica-escura);
  transform: rotate(-4deg);
  pointer-events: none;
`;

// Ação própria do cartão: fica acima do link esticado
const CartaoAcao = styled.a`
  grid-column: 1 / -1;
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 1rem;
  border: 2px solid var(--grafica);
  border-radius: 2px;
  font-family: var(--f-impresso);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--grafica);
  transition: background-color 160ms var(--ease-out), color 160ms var(--ease-out);

  &:hover {
    background: var(--grafica);
    color: var(--papel);
  }
`;

// Cartão em branco com pautas enquanto a API responde (tons da via rosa)
export const BlankCard = styled.div`
  min-height: 11rem;
  background: repeating-linear-gradient(
    to bottom,
    #fbe3e9 0,
    #fbe3e9 2.2rem,
    #efb3c3 2.2rem,
    #efb3c3 calc(2.2rem + 1.5px)
  );
  border-bottom: 5px solid #efb3c3;

  /* Ao lado do aviso, só quando a grade tem três colunas */
  &[data-extra] {
    display: none;

    @media (min-width: 1040px) {
      display: block;
    }
  }
`;

/* badge: selo do plano (só onde a página pede). contactHref: link externo de contato. */
export default function ProCard({ pro, cep, badge, contactHref, contactLabel = 'Chamar no WhatsApp' }) {
  const name = pro.name?.trim() || 'Profissional';
  const rating = Number(pro.average_rating);
  const hasReviews = pro.total_reviews > 0 && Number.isFinite(rating) && rating > 0;
  const highlight = pickHighlight(pro.services);
  const target = pro.slug ? `/p/${pro.slug}` : `/book/${pro.id}`;
  const joined = pro.created_at ? new Date(pro.created_at) : null;
  const since = joined && !Number.isNaN(joined.getTime())
    ? joined.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <Cartao>
      {badge && <Selo>{badge}</Selo>}
      <Foto aria-hidden="true">
        {pro.profile_picture ? (
          <img src={pro.profile_picture} alt="" loading="lazy" width="64" height="64" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </Foto>
      <CartaoInfo>
        <h3>
          <Link to={target} state={{ pro, clientCep: cep }}>{name}</Link>
        </h3>
        {pro.category && <p data-cat>{pro.category}</p>}
        {pro.city && (
          <p>
            <MapPin size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
            {pro.city}{pro.state ? `, ${pro.state}` : ''}
          </p>
        )}
        {since && <p>No ContrataPro desde {since}</p>}
      </CartaoInfo>
      {highlight && (
        <CartaoItem>
          <span>{highlight.title}</span>
          {highlight.price !== null && (
            <strong>
              {highlight.fromPrice && <small>a partir de </small>}
              {formatPrice(highlight.price)}
              <small>/{highlight.unit}</small>
            </strong>
          )}
        </CartaoItem>
      )}
      <CartaoFoot>
        {hasReviews ? (
          <span data-nota>
            <Star size={16} fill="var(--grafica)" color="var(--grafica)" aria-hidden="true" />
            <strong>{rating.toFixed(1).replace('.', ',')}</strong>
            · {pro.total_reviews} {pro.total_reviews === 1 ? 'avaliação' : 'avaliações'}
          </span>
        ) : (
          <span data-nota>Ainda sem avaliações</span>
        )}
        <span data-ver aria-hidden="true">
          Ver perfil e avaliações <ArrowRight size={16} aria-hidden="true" />
        </span>
      </CartaoFoot>
      {contactHref && (
        <CartaoAcao href={contactHref} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" /> {contactLabel}
        </CartaoAcao>
      )}
    </Cartao>
  );
}
