import { useState, useId } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import {
  TalaoPage,
  Wrap,
  paperSurface,
  Hand,
  PrimaryButton,
  StampLink,
  Field,
  FieldNote,
  Seam,
  SiteHeader,
  SiteFooter,
  TalaoSheet,
  Canhoto,
  TalaoBody,
  TalaoHead,
  TalaoBrand,
  SubmitRow,
  Perforation,
} from '../components/talao';

/* Avaliação (/avaliar/:token), o link que o cliente recebe por e-mail depois do serviço:
   um talão de "Avaliação do serviço" preenchido à mão, na via amarela. */

const Via = styled.section`
  ${paperSurface('amarela')}
  padding: clamp(1.5rem, 5vw, 3.5rem) 0 clamp(2.5rem, 6vw, 4.5rem);
  min-height: 70vh;
`;

const Intro = styled.div`
  max-width: 40rem;
  margin: 0 auto clamp(1.25rem, 3vw, 2rem);

  h1 {
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(2.2rem, 6vw, 3.25rem);
    line-height: 1;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  p {
    margin-top: 0.75rem;
    font-size: clamp(1.05rem, 1.4vw, 1.2rem);
    line-height: 1.55;
    color: var(--texto-2);
  }
`;

const Sheet = styled(TalaoSheet)`
  max-width: 40rem;
  margin: 0 auto;
`;

// Nota: cinco estrelas impressas que são rádios de verdade (setas do teclado funcionam)
const Rating = styled.fieldset`
  border: none;
  padding: 1rem 0 0.5rem;

  legend {
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
    margin-bottom: 0.35rem;
  }
`;

const StarsRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
`;

const Stars = styled.div`
  display: flex;
  gap: 0.15rem;
`;

const StarOption = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  color: var(--grafica);

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  svg {
    transition: transform 140ms var(--ease-out);
  }

  &:hover svg {
    transform: scale(1.1);
  }

  &:focus-within {
    outline: 2px solid var(--carbono);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
`;

const RatingWord = styled(Hand)`
  font-size: 1.75rem;
  line-height: 1;
  min-height: 1.75rem;
`;

// Comentário em folha pautada: as linhas acompanham a altura da letra à mão
const Comment = styled.label`
  display: block;
  padding-top: 1rem;

  > span {
    display: block;
    font-family: var(--f-impresso);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--grafica);
  }

  textarea {
    display: block;
    width: 100%;
    min-height: calc(2.2rem * 4);
    margin-top: 0.25rem;
    padding: 0 0.25rem;
    border: none;
    resize: vertical;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(2.2rem - 1.5px),
      var(--pauta) calc(2.2rem - 1.5px),
      var(--pauta) 2.2rem
    );
    font-family: var(--f-mao);
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 2.2rem;
    color: var(--carbono);
    caret-color: var(--carbono);

    &::placeholder {
      font-family: var(--f-texto);
      font-weight: 400;
      font-size: 1.05rem;
      color: var(--texto-2-papel);
      opacity: 1;
    }

    &:focus {
      outline: none;
      background-color: rgba(207, 224, 245, 0.35);
      box-shadow: inset 0 -2.5px 0 var(--carbono);
    }
  }
`;

const Count = styled.p`
  margin-top: 0.25rem;
  text-align: right;
  font-size: 0.95rem;
  color: var(--texto-2-papel);
  font-variant-numeric: tabular-nums;
`;

const Status = styled.div`
  padding: 1.25rem 0 0.5rem;

  h1 {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--f-impresso);
    font-weight: 800;
    font-size: clamp(1.9rem, 5vw, 2.4rem);
    line-height: 1.05;
  }

  svg {
    flex: none;
    color: ${({ $tone }) => ($tone === 'ok' ? 'var(--sucesso)' : 'var(--grafica)')};
  }

  p {
    margin-top: 0.75rem;
    line-height: 1.55;
  }
`;

const StatusActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const ratingLabels = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito bom',
  5: 'Excelente',
};

export default function ReviewSubmit() {
  const { token } = useParams();
  const id = useId();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [closed, setClosed] = useState(null); // link usado/inválido ou serviço já avaliado
  const [errors, setErrors] = useState({});

  const activeRating = hoveredRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (rating === 0) found.rating = 'Escolha uma nota de 1 a 5 estrelas.';
    if (!customerName.trim()) found.name = 'Escreva seu nome.';
    setErrors(found);
    if (found.rating) {
      document.querySelector(`input[name="${id}-nota"]`)?.focus();
      return;
    }
    if (found.name) {
      document.getElementById(`${id}-nome`)?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reviews/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          customer_name: customerName.trim(),
        }),
      });

      if (response.status === 201) {
        setSubmitted(true);
      } else if (response.status === 404) {
        setClosed('invalid');
      } else if (response.status === 409) {
        setClosed('done');
      } else {
        setErrors({ form: 'Não deu para enviar a avaliação. Tente de novo.' });
      }
    } catch {
      setErrors({ form: 'Não deu para falar com o servidor. Confira sua conexão e tente de novo.' });
    } finally {
      setLoading(false);
    }
  };

  let body;
  if (submitted) {
    body = (
      <Status $tone="ok" role="status">
        <h1 data-display><CheckCircle size={30} aria-hidden="true" /> Obrigado!</h1>
        <p>
          Sua avaliação foi enviada e aparece no perfil do profissional com o seu nome. Ela ajuda outros clientes a
          escolher quem chamar.
        </p>
        <StatusActions>
          <StampLink to="/">Voltar ao início</StampLink>
        </StatusActions>
      </Status>
    );
  } else if (closed) {
    body = (
      <Status role="status">
        <h1 data-display>
          {closed === 'done' ? <CheckCircle size={30} aria-hidden="true" /> : <AlertCircle size={30} aria-hidden="true" />}
          {closed === 'done' ? 'Este serviço já foi avaliado' : 'Este link não vale mais'}
        </h1>
        <p>
          {closed === 'done'
            ? 'Cada serviço recebe uma avaliação só, e esta já foi enviada. Obrigado!'
            : 'O link de avaliação pode ser usado uma vez só, e este já foi usado ou não existe. Confira se abriu o link do e-mail mais recente.'}
        </p>
        <StatusActions>
          <StampLink to="/">Voltar ao início</StampLink>
        </StatusActions>
      </Status>
    );
  } else {
    body = (
      <form onSubmit={handleSubmit} noValidate>
        <Rating aria-describedby={errors.rating ? `${id}-nota-erro` : undefined}>
          <legend>Nota:</legend>
          <StarsRow>
            <Stars onMouseLeave={() => setHoveredRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => {
                const filled = value <= activeRating;
                return (
                  <StarOption key={value} onMouseEnter={() => setHoveredRating(value)}>
                    <input
                      type="radio"
                      name={`${id}-nota`}
                      value={value}
                      checked={rating === value}
                      onChange={() => { setRating(value); setErrors((p) => ({ ...p, rating: undefined })); }}
                      aria-label={`${value} ${value > 1 ? 'estrelas' : 'estrela'}, ${ratingLabels[value]}`}
                    />
                    <Star size={34} strokeWidth={1.75} fill={filled ? 'currentColor' : 'transparent'} aria-hidden="true" />
                  </StarOption>
                );
              })}
            </Stars>
            <RatingWord aria-hidden="true">{activeRating > 0 ? ratingLabels[activeRating] : ''}</RatingWord>
          </StarsRow>
          {errors.rating && <FieldNote id={`${id}-nota-erro`} $tone="erro" role="alert">{errors.rating}</FieldNote>}
        </Rating>

        <Field>
          <span>Seu nome:</span>
          <input
            id={`${id}-nome`}
            type="text"
            autoComplete="given-name"
            value={customerName}
            onChange={(e) => { setCustomerName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            placeholder="como vai aparecer no perfil"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-nome-erro` : undefined}
            required
          />
        </Field>
        {errors.name && <FieldNote id={`${id}-nome-erro`} $tone="erro" role="alert">{errors.name}</FieldNote>}

        <Comment>
          <span>Como foi? (opcional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chegou no horário? O serviço ficou bom? Conte para quem vai chamar depois."
            maxLength={500}
            aria-describedby={`${id}-conta`}
          />
        </Comment>
        <Count id={`${id}-conta`}>{comment.length} de 500</Count>

        {errors.form && <FieldNote $tone="erro" role="alert">{errors.form}</FieldNote>}

        <SubmitRow>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar avaliação'}
          </PrimaryButton>
        </SubmitRow>
      </form>
    );
  }

  return (
    <TalaoPage>
      <SiteHeader />
      <main>
        <Via aria-labelledby={`${id}-titulo`}>
          <Wrap>
            {!submitted && !closed && (
              <Intro>
                <h1 id={`${id}-titulo`} data-display>Como foi o serviço?</h1>
                <p>Só quem agendou pelo ContrataPro recebe este link. Sua nota ajuda outros clientes e o próprio profissional.</p>
              </Intro>
            )}
            <Sheet>
              <Canhoto aria-hidden="true" />
              <TalaoBody>
                <TalaoHead>
                  <TalaoBrand>
                    <strong>CONTRATAPRO</strong>
                    <span>Avaliação do serviço</span>
                  </TalaoBrand>
                </TalaoHead>
                {body}
                <Perforation>
                  Cada serviço agendado recebe uma avaliação só. Sua nota aparece no perfil com o seu nome.
                </Perforation>
              </TalaoBody>
            </Sheet>
          </Wrap>
        </Via>
        <Seam $from="amarela" $to="papel" aria-hidden="true" />
      </main>
      <SiteFooter />
    </TalaoPage>
  );
}
