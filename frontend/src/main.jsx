import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/* 1) Tema Zephyr + icons + overrides */
import 'bootswatch/dist/zephyr/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/overrides.css';

/* 2) JS de Bootstrap (para Toast, etc.) */
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap; // lo exponemos para util/toast

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
