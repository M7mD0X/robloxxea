import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToolStorageProvider } from './hooks/useToolStorage';
import { ThemeProvider } from './hooks/useTheme';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ToolStorageProvider>
          <App />
        </ToolStorageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
