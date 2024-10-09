// frontend/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Create a root.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Initial render.
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
