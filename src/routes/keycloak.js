// src/routes/keycloak.js
import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: 'http://keycloak.vas.safaricomet.net',
    realm: 'vas-trivia-realm',
    clientId: 'trivia-client',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
