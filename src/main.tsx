// Patch for environments where window.fetch is a getter-only property
(function() {
  try {
    let storedFetch = window.fetch;
    const targets = [Window.prototype, window];
    for (const target of targets) {
      if (!target) continue;
      try {
        const desc = Object.getOwnPropertyDescriptor(target, 'fetch');
        if (!desc || desc.configurable) {
          Object.defineProperty(target, 'fetch', {
            get() {
              return storedFetch;
            },
            set(val) {
              storedFetch = val;
            },
            configurable: true,
            enumerable: true
          });
        }
      } catch (e) {}
    }
  } catch (err) {}
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
