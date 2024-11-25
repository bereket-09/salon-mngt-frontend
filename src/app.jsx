// src/app.jsx
/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
import { jwtDecode } from 'jwt-decode';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';
import keycloak from './routes/keycloak';

export default function App() {
  const handleEvent = (event, error) => {
    console.log('Keycloak Event:', event, error);
  };

  const handleTokens = (tokens) => {
    if (tokens.token) {
      localStorage.setItem('authToken', tokens.token);
      console.log('Auth Token Saved:', tokens.token);

      // Decode the token manually
      const decodedToken = jwtDecode(tokens.token);
      console.log('Decoded Token:', decodedToken);

      // Create userData from the decoded token
      const userData = {
        id: decodedToken.sub,
        username: decodedToken.preferred_username,
        email: decodedToken.email,
        roles: decodedToken.resource_access?.['trivia-client']?.roles || [],
        status: 'active',
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('User Data Saved:', userData);
    } else {
      console.warn('Token is missing');
    }
  };

  useScrollToTop();

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      }}
      onEvent={handleEvent}
      onTokens={handleTokens}
    >
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </ReactKeycloakProvider>
  );
}
