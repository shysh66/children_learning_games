import React from 'react';
import ReactDOM from 'react-dom/client';
import posthog from 'posthog-js';
import './index.css';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

// PostHog initialization with debug logging
const PH_KEY = process.env.REACT_APP_PUBLIC_POSTHOG_KEY;
const PH_HOST = process.env.REACT_APP_PUBLIC_POSTHOG_HOST;
console.log('PostHog Debug:', {
  keyExists: !!PH_KEY,
  host: PH_HOST,
  keyStart: PH_KEY ? PH_KEY.substring(0, 4) + '...' : 'MISSING',
});

if (PH_KEY) {
  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    person_profiles: 'identified_only',
  });
  window.posthog = posthog;
} else {
  console.warn('PostHog: No API key found. Set REACT_APP_PUBLIC_POSTHOG_KEY in your .env file.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
