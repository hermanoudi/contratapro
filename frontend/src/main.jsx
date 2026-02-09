import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

// Validacao de formularios em pt-BR
document.addEventListener('invalid', (e) => {
  const el = e.target;
  if (el.validity.valueMissing) {
    el.setCustomValidity('Preencha este campo.');
  } else if (el.validity.typeMismatch && el.type === 'email') {
    el.setCustomValidity('Informe um e-mail válido.');
  } else if (el.validity.typeMismatch && el.type === 'url') {
    el.setCustomValidity('Informe uma URL válida.');
  } else if (el.validity.tooShort) {
    el.setCustomValidity(`Mínimo de ${el.minLength} caracteres.`);
  } else if (el.validity.patternMismatch) {
    el.setCustomValidity(el.title || 'Formato inválido.');
  }
}, true);

document.addEventListener('input', (e) => {
  e.target.setCustomValidity('');
}, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
