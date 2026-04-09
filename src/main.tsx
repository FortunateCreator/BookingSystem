import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import SmoothScroll from './components/SmoothScroll';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SmoothScroll>
          <App />
        </SmoothScroll>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
