import './index.css';

import { StrictMode } from 'react';

// Polyfills
import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

globalThis.Buffer = Buffer;

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Buffer = Buffer;
}

// Ensure TextEncoder is available
if (typeof window !== 'undefined' && !window.TextEncoder) {
  window.TextEncoder = TextEncoder;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
