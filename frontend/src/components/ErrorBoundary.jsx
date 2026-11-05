import { Component } from 'react';
import { RotateCw } from 'lucide-react';
import { TalaoPage, Wrap, PrimaryButton, StampButton, StateSection, StateSheet, StateActions } from './talao';

/* Se uma página quebra ao desenhar (ou um pedaço dela não baixa depois de um deploy),
   a pessoa vê uma folha que diz o que houve e como sair, não uma tela em branco.
   Navegar para outro endereço (resetKey) tira o aviso e tenta a página nova. */

// Pedaço da página que não baixou: quase sempre é versão nova no ar
const isChunkError = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i
    .test(String(error?.message || error));

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    console.error('Página quebrou:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunk = isChunkError(error);

    return (
      <TalaoPage>
        <main>
          <StateSection>
            <Wrap>
              <StateSheet role="alert">
                <h1 data-display>
                  {chunk ? 'O ContrataPro foi atualizado' : 'Esta página travou'}
                </h1>
                <p>
                  {chunk
                    ? 'Uma versão nova entrou no ar enquanto a página estava aberta. Recarregue para continuar de onde parou.'
                    : 'Algo deu errado ao montar a página. Recarregar costuma resolver; se continuar, volte para o início e tente por lá.'}
                </p>
                <StateActions>
                  <PrimaryButton type="button" onClick={() => window.location.reload()}>
                    <RotateCw size={18} aria-hidden="true" /> Recarregar a página
                  </PrimaryButton>
                  {/* Link comum, não do roteador: recomeça o app do zero */}
                  <StampButton as="a" href="/">Ir para o início</StampButton>
                </StateActions>
              </StateSheet>
            </Wrap>
          </StateSection>
        </main>
      </TalaoPage>
    );
  }
}
