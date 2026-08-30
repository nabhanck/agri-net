import 'regenerator-runtime/runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FarmProvider } from './context/FarmContext';
import { VoiceScopeProvider } from './context/VoiceScopeContext';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FarmProvider>
        <VoiceScopeProvider>
          <App />
        </VoiceScopeProvider>
      </FarmProvider>
    </BrowserRouter>
  </StrictMode>
);
