import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/global.css';
import App from './App.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '559060434835-12pj699886ohgkn2ips1o1lmkkelk8gk.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
