/**
 * TourContext - Gerencia o estado do tour guiado
 *
 * Uso:
 * - Wrap App com <TourProvider>
 * - Use useTour() hook nos componentes
 */

import { createContext, useContext, useState, useCallback } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { tourStepsProfessional, tourStepsClient, tourOptions } from '../config/tourConfig';

const TourContext = createContext(null);

// Estilos personalizados do tooltip
const customStyles = {
  options: {
    primaryColor: '#6366f1',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    arrowColor: '#ffffff',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '16px',
    padding: '20px',
    maxWidth: '340px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  },
  tooltipContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#4b5563',
  },
  buttonNext: {
    backgroundColor: '#6366f1',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  buttonBack: {
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '500',
  },
  buttonClose: {
    color: '#9ca3af',
    top: '12px',
    right: '12px',
  },
  buttonSkip: {
    color: '#9ca3af',
    fontSize: '13px',
  },
  spotlight: {
    borderRadius: '12px',
  },
  beacon: {
    display: 'none', // Desabilita o beacon pulsante
  },
};

export function TourProvider({ children }) {
  const [runTour, setRunTour] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [currentTourName, setCurrentTourName] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Verificar se um tour foi completado
  const hasCompletedTour = useCallback((tourName) => {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
    return completedTours.includes(tourName);
  }, []);

  // Marcar tour como completado
  const markTourCompleted = useCallback((tourName) => {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
    if (!completedTours.includes(tourName)) {
      completedTours.push(tourName);
      localStorage.setItem('completedTours', JSON.stringify(completedTours));
    }
  }, []);

  // Verificar se e primeiro login
  const isFirstLogin = useCallback((userType) => {
    const key = `hasLoggedInBefore_${userType}`;
    return !localStorage.getItem(key);
  }, []);

  // Marcar primeiro login como feito
  const markFirstLoginComplete = useCallback((userType) => {
    const key = `hasLoggedInBefore_${userType}`;
    localStorage.setItem(key, 'true');
  }, []);

  // Iniciar um tour especifico
  const startTour = useCallback((tourName, userType = 'professional') => {
    let steps = [];

    if (userType === 'professional') {
      steps = tourStepsProfessional[tourName] || [];
    } else {
      steps = tourStepsClient[tourName] || [];
    }

    if (steps.length > 0) {
      setTourSteps(steps);
      setCurrentTourName(`${userType}-${tourName}`);
      setStepIndex(0);
      // Pequeno delay para garantir que os elementos estao renderizados
      setTimeout(() => setRunTour(true), 500);
    }
  }, []);

  // Iniciar tour de boas-vindas automaticamente
  const startWelcomeTour = useCallback((userType) => {
    const tourName = `${userType}-welcome`;

    if (isFirstLogin(userType) && !hasCompletedTour(tourName)) {
      startTour('welcome', userType);
      markFirstLoginComplete(userType);
    }
  }, [isFirstLogin, hasCompletedTour, startTour, markFirstLoginComplete]);

  // Parar tour
  const stopTour = useCallback(() => {
    setRunTour(false);
    setTourSteps([]);
    setCurrentTourName(null);
    setStepIndex(0);
  }, []);

  // Resetar todos os tours (para testes)
  const resetAllTours = useCallback(() => {
    localStorage.removeItem('completedTours');
    localStorage.removeItem('hasLoggedInBefore_professional');
    localStorage.removeItem('hasLoggedInBefore_client');
  }, []);

  // Callback do Joyride
  const handleJoyrideCallback = useCallback((data) => {
    const { status, action, index, type } = data;

    // Atualizar indice do step
    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    // Tour finalizado ou pulado
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      if (currentTourName) {
        markTourCompleted(currentTourName);
      }
      stopTour();
    }
  }, [currentTourName, markTourCompleted, stopTour]);

  const value = {
    runTour,
    tourSteps,
    stepIndex,
    currentTourName,
    startTour,
    startWelcomeTour,
    stopTour,
    hasCompletedTour,
    markTourCompleted,
    isFirstLogin,
    resetAllTours,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose={false}
        spotlightClicks
        scrollToFirstStep
        scrollOffset={100}
        styles={customStyles}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Proximo',
          skip: 'Pular tour',
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour deve ser usado dentro de TourProvider');
  }
  return context;
}

export default TourContext;
