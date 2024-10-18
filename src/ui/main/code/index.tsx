/* 
  Raymundo Paz
  September 2024
*/

/* eslint-disable no-var */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { AppContextProvider } from './data/ApplicationState';

declare global {
  var electronAPI: any;
  var windowBridge: any;
  var keyboardBridge: any;
  var fileBridge: any;
  var dataBridge: any;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AppContextProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </AppContextProvider>
);

