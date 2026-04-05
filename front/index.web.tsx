/**
 * Точка входа только для webpack/web.
 * AppRegistry.runApplication на web с RN 0.84 + React 19 часто оставляет пустой #root.
 */
import 'react-native-gesture-handler';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
