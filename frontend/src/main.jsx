import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fontes e ícones empacotados junto com o site: sem depender de CDN externo.
// Fontes do guia (docs/DESIGN.md): Plus Jakarta Sans na interface, Lora nos títulos públicos.
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/lora';
import '@fontsource-variable/lora/wght-italic.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '@fortawesome/fontawesome-free/css/regular.min.css';
import '@fortawesome/fontawesome-free/css/brands.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/tema.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
