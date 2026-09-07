import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register Service Worker for PWA support (web mode only, skipped in desktop Tauri mode)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !('__TAURI__' in window)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
    }).catch((err) => {
      console.warn('[PWA] ServiceWorker registration failed:', err);
    });
  });
}
