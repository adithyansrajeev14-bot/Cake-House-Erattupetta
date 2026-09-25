// Ensure window.fetch has both getter and setter so that library polyfills do not fail
if (typeof window !== 'undefined' && window.fetch) {
  try {
    let activeFetch = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      get() {
        return activeFetch;
      },
      set(newFetch) {
        activeFetch = newFetch;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (_) {}
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
