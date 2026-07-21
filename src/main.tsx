import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/themes.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/responsive.css';

// Initialize theme from localStorage or system preference
const initTheme = () => {
  const stored = localStorage.getItem('bob-theme');
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Made with Bob
