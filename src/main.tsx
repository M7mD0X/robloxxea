import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// `import.meta.env.BASE_URL` is `/` in dev and `/robloxxea/` when built for
// GitHub Pages (driven by the `base` option in vite.config.ts). Setting it as
// the router basename keeps route resolution correct on both hosts.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
