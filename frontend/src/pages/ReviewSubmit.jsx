import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Star, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../config';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(168, 85, 247, 0.05) 100%);
  padding: 2rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.2);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RatingLabel = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  min-height: 1.25rem;
`;

const SuccessContainer = styled(motion.div)`
  text-align: center;
  padding: 1rem 0;
`;

const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
`;

const ErrorContainer = styled(motion.div)`
  text-align: center;
  padding: 1rem 0;
`;

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
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
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const activeRating = hoveredRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Informe seu nome');
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
        setError('Este link de avaliacao e invalido ou ja foi utilizado.');
      } else if (response.status === 409) {
        setError('Este servico ja foi avaliado. Obrigado!');
      } else {
        toast.error('Erro ao enviar avaliacao. Tente novamente.');
      }
    } catch (err) {
      toast.error('Erro de conexao. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  // Tela de erro (token invalido ou ja avaliado)
  if (error) {
    return (
      <PageContainer>
        <Card
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <ErrorContainer>
            <ErrorIcon>
              <AlertCircle size={32} color="white" />
            </ErrorIcon>
            <Title style={{ fontSize: '1.5rem' }}>Ops!</Title>
            <Subtitle>{error}</Subtitle>
          </ErrorContainer>
        </Card>
      </PageContainer>
    );
  }

  // Tela de sucesso
  if (submitted) {
    return (
      <PageContainer>
        <Card
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle size={32} color="white" />
            </SuccessIcon>
            <Title style={{ fontSize: '1.5rem' }}>Obrigado!</Title>
            <Subtitle>
              Sua avaliacao foi enviada com sucesso. Ela ajuda outros clientes
              a encontrar bons profissionais.
            </Subtitle>
          </SuccessContainer>
        </Card>
      </PageContainer>
    );
  }

  // Formulario de avaliacao
  return (
    <PageContainer>
      <Card
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <MessageSquare size={32} color="var(--primary)" />
        </div>
        <Title>Avalie o servico</Title>
        <Subtitle>Sua opiniao ajuda outros clientes e o profissional a melhorar.</Subtitle>

        <form onSubmit={handleSubmit}>
          <StarsContainer>
            {[1, 2, 3, 4, 5].map((value) => (
              <StarButton
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`${value} estrela${value > 1 ? 's' : ''}`}
              >
                <Star
                  size={36}
                  color={value <= activeRating ? '#f59e0b' : '#d1d5db'}
                  fill={value <= activeRating ? '#f59e0b' : 'none'}
                />
              </StarButton>
            ))}
          </StarsContainer>

          <RatingLabel>
            {activeRating > 0 ? ratingLabels[activeRating] : 'Toque nas estrelas para avaliar'}
          </RatingLabel>

          <FormGroup>
            <label>Seu nome *</label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como voce gostaria de ser identificado"
              required
            />
          </FormGroup>

          <FormGroup>
            <label>Comentario (opcional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiencia..."
              maxLength={500}
            />
          </FormGroup>

          <SubmitButton
            type="submit"
            disabled={loading || rating === 0 || !customerName.trim()}
          >
            {loading ? 'Enviando...' : 'Enviar Avaliacao'}
          </SubmitButton>
        </form>
      </Card>
    </PageContainer>
  );
}
