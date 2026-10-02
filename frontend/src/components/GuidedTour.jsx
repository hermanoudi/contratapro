import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';

/* Tour guiado (react-joyride) no registro contido: folha de papel com a régua
   de gráfica no alto, cantos retos, título impresso. Carregado só quando um
   tour vai rodar (React.lazy no TourContext), fora do pacote inicial. */

const FONT_P = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const FONT_T = "'Barlow', system-ui, sans-serif";

const styles = {
  options: {
    primaryColor: '#c4201a',
    textColor: '#17171b',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(23, 23, 27, 0.45)',
    arrowColor: '#ffffff',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 0,
    borderTop: '4px solid #c4201a',
    padding: '20px 20px 18px',
    maxWidth: '340px',
    fontFamily: FONT_T,
    boxShadow: '0 24px 48px -20px rgba(23, 23, 27, 0.55), 0 2px 6px rgba(23, 23, 27, 0.15)',
  },
  tooltipTitle: {
    fontFamily: FONT_P,
    fontSize: '1.4rem',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#17171b',
    textAlign: 'left',
    marginBottom: '6px',
  },
  tooltipContent: {
    fontSize: '15px',
    lineHeight: 1.55,
    color: '#4a4550',
    textAlign: 'left',
    padding: '6px 0 4px',
  },
  buttonNext: {
    backgroundColor: '#c4201a',
    borderRadius: '2px',
    minHeight: '44px',
    padding: '0 18px',
    fontFamily: FONT_P,
    fontSize: '1.05rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  buttonBack: {
    color: '#c4201a',
    minHeight: '44px',
    fontFamily: FONT_P,
    fontSize: '1.05rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  buttonClose: {
    color: '#17171b',
    width: '20px',
    height: '20px',
    padding: '12px',
    top: '6px',
    right: '6px',
  },
  buttonSkip: {
    color: '#4a4550',
    fontSize: '15px',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  spotlight: {
    borderRadius: '2px',
  },
  beacon: {
    display: 'none',
  },
};

export default function GuidedTour({ steps, run, stepIndex, onStep, onEnd }) {
  const handle = (data) => {
    const { status, action, index, type } = data;
    if (type === EVENTS.STEP_AFTER) onStep(index + (action === ACTIONS.PREV ? -1 : 1));
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) onEnd();
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handle}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose={false}
      spotlightClicks
      scrollToFirstStep
      scrollOffset={100}
      styles={styles}
      locale={{ back: 'Voltar', close: 'Fechar', last: 'Finalizar', next: 'Próximo', nextLabelWithProgress: 'Próximo ({step} de {steps})', skip: 'Pular o tour' }}
      floaterProps={{ disableAnimation: true }}
    />
  );
}
