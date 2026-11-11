import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/geist/index.css';
import 'lenis/dist/lenis.css';
import './styles.css';
import App from './App';
import { armIntro } from './lib/intro-l7';
// Antes do primeiro render, para a navbar não piscar antes da abertura.
armIntro();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
