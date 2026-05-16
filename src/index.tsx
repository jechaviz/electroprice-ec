
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import ErrorBoundary from './components/common/ErrorBoundary';

import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
if (!rootElement) {
   throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
   <React.StrictMode>
      <ErrorBoundary>
         <BrowserRouter>
            <AppProvider>
               <LanguageProvider>
                  <CurrencyProvider>
                     <App />
                  </CurrencyProvider>
               </LanguageProvider>
            </AppProvider>
         </BrowserRouter>
      </ErrorBoundary>
   </React.StrictMode>
);
