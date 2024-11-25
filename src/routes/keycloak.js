// src/routes/keycloak.js
import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.KEYCLOAK_PORTAL_URL || 'http://keycloak.vas.safaricomet.net',
    realm: import.meta.env.KEYCLOAK_REALM || 'vas-trivia-realm',
    clientId: import.meta.env.KEYCLOAK_CLIENT_ID || 'trivia-client',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
