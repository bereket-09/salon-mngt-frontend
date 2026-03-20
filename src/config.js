const config = {
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:4000',
  PORTAL_URL: import.meta.env.VITE_PORTAL_URL || 'http://localhost:3003',
  KEYCLOAK_PORTAL_URL: import.meta.env.VITE_KEYCLOAK_PORTAL_URL || 'http://keycloak.vas.safaricomet.net',
  KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM || 'default-realm',
  KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'default-client',
};

export default config;
