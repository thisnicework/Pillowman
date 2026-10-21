import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';
import './index.css';

const createRoot = ReactDOMClient.createRoot || (ReactDOMClient.default && ReactDOMClient.default.createRoot);
const rootElement = document.getElementById('root');

if (rootElement && createRoot) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element or createRoot not found', { rootElement, createRoot, ReactDOMClient });
}
