import { createContext, useContext } from 'react';

/* Contexto do tour guiado (o provider fica em TourContext.jsx). Separado num
   .js para o Fast Refresh: arquivo de componente só exporta componente. */

export const TourContext = createContext(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour deve ser usado dentro de TourProvider');
  }
  return context;
}
