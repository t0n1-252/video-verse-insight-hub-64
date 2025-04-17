
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

// Create a root
const root = createRoot(rootElement);

// Render your app
root.render(<App />);
