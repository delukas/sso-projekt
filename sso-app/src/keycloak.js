import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_SSO_URL,
  realm: import.meta.env.VITE_SSO_REALM,
  clientId: import.meta.env.VITE_SSO_CLIENTID
});

export default keycloak;
