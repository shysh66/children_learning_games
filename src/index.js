import React from 'react';
import ReactDOM from 'react-dom/client';
import posthog from 'posthog-js';
import './index.css';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

// Initialize PostHog analytics before rendering
if (process.env.REACT_APP_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only',
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
