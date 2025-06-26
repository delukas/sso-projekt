import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import JsonView from "@uiw/react-json-view";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";


const App = () => {
    const { keycloak } = useKeycloak();

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{fontFamily: "Calibri"}}>React Keycloak SSO</h1>
            {keycloak.authenticated ? (
                <div>
                    <h2 style={{fontFamily: "Calibri"}}>Willkommen, { keycloak.tokenParsed?.name }</h2>
                    {keycloak.tokenParsed?.realm_access?.roles?.find(value => value === "admin") && (
                        <>
                            <p style={{color: "red", fontFamily: "Calibri"}}>Diesen Text können nur Admins sehen.</p>
                            <br/>
                        </>
                    )}
                    <button style={{fontFamily: "Calibri"}} onClick={ () => keycloak.logout() }>Abmelden</button>
                    {keycloak.tokenParsed?.resource_access?.[import.meta.env.VITE_SSO_CLIENTID]?.roles?.find(value => value === "access") ?
                        <>
                            <br/>
                            <p style={{fontFamily: "Calibri"}}>Das ist dein Token:</p>
                            <br/>
                            <JsonView value={keycloak.tokenParsed} style={githubLightTheme}/>
                        </>
                        :
                        <p>Du hast keinen Zugriff.</p>
                    }
                </div>
          ) : (
                <button style={{fontFamily: "Calibri"}} onClick={ () => keycloak.login() }>Anmelden</button>
          )}
        </div>
    );
};

export default App;
