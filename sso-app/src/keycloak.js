import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'sso-lab',
  clientId: 'react-client'
});

export default keycloak;
