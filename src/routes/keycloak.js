// src/routes/keycloak.js
import Keycloak from 'keycloak-js';

import config from '../config';

const keycloakConfig = {
    url: config.KEYCLOAK_PORTAL_URL,
    realm: config.KEYCLOAK_REALM,
    clientId: config.KEYCLOAK_CLIENT_ID,
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
