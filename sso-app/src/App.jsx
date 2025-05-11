import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

const App = () => {
  const { keycloak } = useKeycloak();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>React Keycloak SSO</h1>
      {keycloak.authenticated ? (
        <div>
          <p>Willkommen, {keycloak.tokenParsed?.preferred_username}</p>
          <button onClick={() => keycloak.logout()}>Abmelden</button>
        </div>
      ) : (
        <button onClick={() => keycloak.login()}>Anmelden</button>
      )}
    </div>
  );
};

export default App;
