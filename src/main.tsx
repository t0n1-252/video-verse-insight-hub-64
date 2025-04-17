
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');

// Ensure the root element exists
if (!rootElement) {
  throw new Error('Root element not found');
}

// Global error boundary for all promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

// Error boundary for React 18
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Create a root
const root = createRoot(rootElement);

// Render your app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log startup for debugging
console.log('App initialized at:', new Date().toISOString());
console.log('Running in environment:', import.meta.env.MODE);

