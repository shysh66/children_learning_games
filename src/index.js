import React from 'react';
import ReactDOM from 'react-dom/client';
import posthog from 'posthog-js';
import './index.css';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

// Initialize PostHog before the app renders
posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  person_profiles: 'identified_only',
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
