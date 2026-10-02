/**
 * TourContext - Gerencia o estado do tour guiado
 *
 * Uso:
 * - Wrap App com <TourProvider>
 * - Use useTour() hook nos componentes
 */

import { useState, useCallback, lazy, Suspense } from 'react';
import { TourContext } from './tour';
import { tourStepsProfessional, tourStepsClient } from '../config/tourConfig';

// O react-joyride só baixa quando um tour vai rodar (fora do pacote inicial)
const GuidedTour = lazy(() => import('../components/GuidedTour'));

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

  // Fim do tour (concluído ou pulado)
  const handleTourEnd = useCallback(() => {
    if (currentTourName) {
      markTourCompleted(currentTourName);
    }
    stopTour();
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
      {tourSteps.length > 0 && (
        <Suspense fallback={null}>
          <GuidedTour
            steps={tourSteps}
            run={runTour}
            stepIndex={stepIndex}
            onStep={setStepIndex}
            onEnd={handleTourEnd}
          />
        </Suspense>
      )}
    </TourContext.Provider>
  );
}
