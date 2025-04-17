
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Define window types for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Get the root element
const rootElement = document.getElementById('root');

// Ensure the root element exists
if (!rootElement) {
  throw new Error('Root element not found');
}

// Error boundary for React 18
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Create a root
const root = createRoot(rootElement);

// Render your app
root.render(
  <App />
);

// Log startup for debugging
console.log('App initialized at:', new Date().toISOString());
