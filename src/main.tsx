import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './design-system/styles/index.css';
import { App } from './app/App';

const container = document.getElementById('root');
if (!container) throw new Error('index.html must contain <div id="root">.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
