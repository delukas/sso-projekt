import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import JsonView from "@uiw/react-json-view";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";


const App = () => {
    const { keycloak } = useKeycloak();


    if(keycloak.authenticated && !keycloak.tokenParsed?.resource_access?.["sso-app"]?.roles?.find(value => value === "access")){
        keycloak.logout().then(() => {
            window.location.reload();
        })
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>React Keycloak SSO</h1>
            {keycloak.authenticated ? (
                <div>
                    <h2>Willkommen, { keycloak.tokenParsed?.name }</h2>
                    {keycloak.tokenParsed?.realm_access?.roles?.find(value => value === "admin") && (
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
