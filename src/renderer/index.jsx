import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Seleccionamos el contenedor raíz
const container = document.getElementById('app');

// Usamos la nueva API de React 18 para renderizar
const root = createRoot(container);
root.render(<App />);
