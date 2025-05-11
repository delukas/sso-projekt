import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import JsonView from "@uiw/react-json-view";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";

const App = () => {
    const { keycloak } = useKeycloak();

    return (
        <div style={{ padding: '2rem' }}>
            <h1>React Keycloak SSO</h1>
            {keycloak.authenticated ? (
                <div>
                    <h2>Willkommen, { keycloak.tokenParsed?.name }</h2>
                    {keycloak.tokenParsed?.resource_access?.["realm-management"]?.roles.find(value => value === "realm-admin") && (
                        <>
                            <p style={{color: "red"}}>Diesen Text können nur Admins sehen.</p>
                            <br/>
                        </>
                    )}
                    <button onClick={ () => keycloak.logout() }>Abmelden</button>
                    <br/>
                    <p>Das ist dein Token:</p>
                    <br/>
                    <JsonView value={keycloak.tokenParsed} style={githubLightTheme}/>
                </div>
          ) : (
                <button onClick={ () => keycloak.login() }>Anmelden</button>
          )}
        </div>
    );
};

export default App;
