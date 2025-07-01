# Single Sign On (SSO) in Action - Beispielimplementation einer SSO-Umgebung

## Vorwort
Folgend stehen `<EXAMPLE_ENV>` für Variablen aus der `.env`-Datei. Bei der Konfiguration wird davon ausgegangen, dass die Standardwerte beibehalten werden, daher sind URLs statisch hinterlegt.


## Voraussetzungen
- `Docker`

## Beschreibung 

Es wird ein einfaches Szenario für eine Authentifizierung mittels Single Sign On (SSO) simuliert. Zentrale Rolle spielen hier der Identity-Provider Keycloak sowie die Service-Provider Rocket.Chat (SAML) und die SSO-App (OIDC). Diese werden für den lokalen Betrieb konfiguriert, daher wird hier kein HTTPS verwendet.
Jedoch wird bei der Konfiguration darauf geachtet, mögliche Risiken zu minimieren, um eine mögliche Anwendung in der Produktion zu beschleunigen.

Die SSO-App ist lediglich eine Beispielanwendung, zur Veranschaulichung der Unterstützung von OIDC durch Keycloak. In der bereitgestellten Benutzeroberfläche (http://localhost:5173) lässt sich der ID-Token des Nutzers anzeigen.

Rocket.Chat dient als weitere Beispielanwendung und kommuniziert durch das SAML-Protokoll mit dem Identity Provider Keycloak.

## Starten
Ändere den Dateinamen von `.env.example` zu `.env` und konfiguriere diese bei Bedarf. Starte die Container mit `docker compose up -d`. Danach sind KeyCloak, Rocket.Chat und die SSO-App erreichbar:

| Anwendung   | DEFAULT_URL           | URL                                   |
|-------------|-----------------------|---------------------------------------|
| Keycloak    | http://localhost:8080 | `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>`     |
| Rocket.Chat | http://localhost:3000 | `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>` |
| SSO-App     | http://localhost:5173 | `<SSO_APP_HOST>:<SSO_APP_PORT>`       |

## QuickStart mit Realm-Import

> Für die Erstellung der Passwörter muss auf die konfigurierten Anforderungen geachtet werden:
> - **Nicht** die **Email**
> - Enthält **nicht** den **Nutzernamen**
> - Mindestens **8 Zeichen** lang
> - Mindestens **1 Großbuchstaben**
> - Mindestens **1 Kleinbuchstabe**
> - Mindestens **1 Zahl**
> - Mindestens **1 Sonderzeichen**
> 
> Ein mögliches Beispiel für ein einfaches Passwort ist: **AAaa1111#**

#### 1. Anmeldung in Keycloak
- Open http://localhost:8080 - `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>`
- Login as `<KEYCLOAK_ADMIN>` and `<KEYCLOAK_ADMIN_PASSWORD>`

#### 2. Vorkonfiguriertes Realm importieren
- Navigate to `Manage realms`
- Click `Create realm`
- Click `Browse...` and select the `realm-export.json`-File provided by this repository at `./example-realm`
- Click `Create`
- Wait one moment
- Check if `<KEYCLOAK_REALM>` is displayed at the top left next to `Current realm`

#### 3. Nutzer anlegen und Rollen zuteilen
- Navigate to `Users`
  - Create two users `test-user` and `test-admin` through repeating the following steps
  - Click `Create new user` | `Add user`
    - Set `Username`
    - Click `Create`
    - Navigate to `Credentials`
      - Click `Set password`
        - Set `Password`: Anything you want (it is temporary)
        - Set `Password confirmation`
        - Set `Temporary`: On
        - Click `Save`
        - Click `Save password`
    - Navigate to `Role mapping`
      - Click `Assign role`
        - Click `Filter by clients` and set it to `Filter by realm roles`
        - ✅ `user` or  ✅ `admin`
        - Click `Assign`
#### 4. Einrichtung Rocket.Chat

- Open http://localhost:3000 - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>`
> **Bitte unbedingt eine korrekte Cloud-Konto-E-Mail angeben**, da diese bestätigt werden muss.
> 
> Der einzurichtende Account ist der lokale Admin für Rocket.Chat.
> 
> Für die Testzwecke die Größe der Organisation auf `1-10 people` setzen, die anderen Felder können beliebig gewählt werden.
- Follow the setup until you are logged in
- Open http://localhost:3000/admin/settings/SAML
  - Click `Aktivieren`
  - Set `Benutzerdefinierter-Anbieter`: keycloak
  - Set `Einstiegspunkt`: `http://localhost:8080/realms/sso-test/protocol/saml`
  - Set `IDP SLO Redirect URL`: `http://localhost:8080/realms/sso-test/protocol/saml`
  - Set `Benutzerdefinierter Aussteller`: `http://localhost:3000/_saml/metadata/keycloak`
  - Click `Änderungen speichern`
  - Confirm this with your initial created password, if prompted
- Open in new tab http://localhost:8080
  - Login as `admin` and `admin`
    - Navigate to `Realm settings` > `Keys`
      - Click `Certificate` where `Algorithm` is `RS256` and `Use` is `SIG`
      - Copy the content of this popup
- Go back to Rocket.Chat - http://localhost:3000/admin/settings/SAML
    - Expand `Zertifikat` by clicking on it
    - Paste the copied content into the textfield below `Benutzerdefiniertes Zertifikat`
    - Paste the content of `./example-keys/saml.crt` into the textfield below `Öffentliches Zertifikat`
    - Paste the content of `./example-keys/saml.pem` into the textfield below `Privater Schlüssel`
    - Click `Änderungen speichern`
    - Confirm this with your initial created password, if prompted
> Da es sich hierbei um eine Testumgebung handelt und aktuell kein Mail-Server vorhanden ist, über den Rocket.Chat Mails für Zwei-Faktor-Authentifizierung-Codes senden kann, muss diese Funktion für die Testumgebung ausgeschaltet werden.
- Open http://localhost:3000/admin/settings/Accounts
  - Expand `Zwei-Faktor-Authentifizierung` by clicking on it
  - Set `Zwei-Faktor-Authentifizierung per E-Mail aktivieren`: Off
  - Click `Änderungen speichern`

Nun 

## Erste Anmeldung
>Nach der ersten Anmeldung mit Nutzernamen und temporärem Passwort wird zunächst die Einrichtung eines Authenticators gefordert. Anschließend muss das Passwort geändert und dann die Nutzerinformationen vervollständigt werden. Bei der Anmeldung bei Rocket.Chat wird man nun nach einem Nutzernamen gefragt. Mit dieser Konfiguration sind die Zugriffe auf die Clients wie folgt beschränkt:

| Realm-Rolle | Zugriff              |
|-------------|----------------------|
| admin       | SSO-App, Rocket.Chat |
| user        | Rocket.Chat          |
| keine Rolle | keinen Zugriff       |

## Stoppen
Um die Container zu stoppen nutze `docker compose down` *(! ohne `-v`)*

## Zurücksetzen
>Entweder die Volumes von MongoDB und Keycloak über Docker Desktop/CLI löschen oder `docker compose down -v` benutzen beim Stoppen der Container. Damit werden alle dazugehörigen Volumes gelöscht und das Setup muss erneut ausgeführt werden.

---

## Manuelle Konfiguration
>Die manuelle Konfiguration ist als JSON verfügbar und kann als Realm in Keycloak importiert werden.

### Konfiguration Keycloak

#### 1. Anmeldung in Keycloak
- Open http://localhost:8080 - `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>`
- Login as `<KEYCLOAK_ADMIN>` and `<KEYCLOAK_ADMIN_PASSWORD>`
#### 2. Neues Realm erstellen 
>Ein Realm ist ein isolierter Bereich innerhalb von Keycloak, in welchem Nutzer, Clients und Rollen verwaltet werden können.
In diesem besteht nun die Möglichkeit neue Clients (Service-Provider), User, Roles und weiteres anzulegen. Wichtig für die Konfiguration, dass die Variable `<KEYCLOAK_REALM>` mit dem Realm-Namen übereinstimmt.

- Navigate to `Manage realms`
  - Click `Create realm`
     - Set `Realm name`:`<KEYCLOAK_REALM>`
     - Click `Create`
  - Check if `<KEYCLOAK_REALM>` is displayed at the top left next to `Current realm`


#### 3. Realm Einstellungen (Optional)
- **Brute-Force-Detection:**
  - Navigate to `Realm settings` > `Security defenses` > `Brute force Detection`
    - Set `Brute Force Mode`: Lockout permanently after temporary lockout
    - Set `Max login failures`: 3
    - Set `Maximum temporary lockouts`: 3
    - Set `Strategy to increase wait time`: Linear
    - Set `Wait increment`: 5
    - Set `Max wait`: 30
    - Click `Save`
- **Refresh-Token-Rotation:**
  - Navigate to `Realm settings` > `Tokens`
    - Set `Revoke Refresh Token`: Enabled
    - Set `Refresh Token Max Reuse`: 0
    - Click `Save`
- **Require Setup OTP and Update Password on initial login:**
  - Navigate to `Authentication` > `Required actions`
    - Set `Configure OTP` > `Set as default action`: On
    - Set `Update Password` > `Set as default action`: On
    - Set `Update Profile` > `Set as default action`: On
- **Password Policies:**
  - Navigate to `Authentication` > `Policies` > `Password Policies`
    - Add `Minimum Length`
    - Add `Not Contains Username`
    - Add `Not email`
    - Add `Uppercase Characters`
    - Add `Lowercase Characters`
    - Add `Digits`
    - Add `Special Characters`
    - Click `Save`
#### 4. Rollen anlegen
- Navigate to `Realm roles`
  - Click `Create role`
      - Set `Role name`: user
      - Click `Save`
  - Click `Create role`
      - Set `Role name`: admin
      - Click `Save`
#### 5. Nutzer anlegen und Rollen zuteilen
- Navigate to `Users`
  - Click `Create new user`
    - Set `Username`: test-admin
    - Click `Create`
    - Navigate to `Credentials`
      - Click `Set password`
        - Set `Password`: Anything you want, but remember the rules you set earlier.
        - Set `Password confirmation`
        - Set `Temporary`: On
        - Click `Save`
        - Click `Save password`
    - Navigate to `Role mapping`
      - Click `Assign role`
        - Click `Filter by clients` and set it to `Filter by realm roles`
        - ✅ `admin`
        - Click `Assign`
  - Click `Add user`
    - Set `Username`: test-user
    - Click `Create`
    - Navigate to `Credentials`
      - Click `Set password`
        - Set `Password`: Anything you want, but remember the rules you set earlier.
        - Set `Password confirmation`
        - Set `Temporary`: On
        - Click `Save`
        - Click `Save password`
    - Navigate to `Role mapping`
      - Click `Assign role`
        - Click `Filter by clients` and set it to `Filter by realm roles`
        - ✅ `user`
        - Click `Assign`


### Konfiguration SSO-App (OIDC)
>Die App selber muss nicht weiter konfiguriert werden, aber als Client unter Keycloak eingerichtet werden. Wichtig dabei ist, dass die Variable `<SSO_APP_CLIENTID>` mit der vergebenen ClientID übereinstimmt.

#### 1. Client anlegen
- Navigate to `Clients` > `Create Client`
  - Set `Client type`: OpenID Connect
  - Set `Client ID`: `<SSO_APP_CLIENTID>`
  - Set `Name`: SSO-App
  - Click `Next`
  - Click `Next`
  - Set `Root URL`: http://localhost:5173 - `<SSO_APP_HOST>:<SSO_APP_PORT>`
  - Set `Home URL`: http://localhost:5173 - `<SSO_APP_HOST>:<SSO_APP_PORT>`
  - Set `Valid redirect URIs`: http://localhost:5173/ - `<SSO_APP_HOST>:<SSO_APP_PORT>/`
  - Set `Web Origins`: http://localhost:5173 - `<SSO_APP_HOST>:<SSO_APP_PORT>`
  - Click `Save`
- Navigate to `Clients` > `<SSO_APP_CLIENTID>` > `Roles`
  - Click `Create role`
    - Set `Role name`: access
    - Click `Save`
#### 2. Admin Rolle Berechtigen
- Navigate to `Realm roles`
  - Click `admin`
    - Navigate to `Associated roles`
    - Click `Assign role`
    - Search for `access`
    - ✅ `<SSO_APP_CLIENTID> access`
    - Click `Assign`
#### 3. Anmeldeprozess prüft Berechtigung
- Navigate to `Authentication` > `Flows`
  - At `browser`
    - Click `⋮`
    - Click `Duplicate`
      - `Name`: SSO-App Browserflow
      - Click `Duplicate`
        - Scroll to `SSO-App Browserflow forms`
        - Click `+`
        - Click `Add sub-flow`
          - `Name`: No Access-Role
          - `Flow type`: Generic
          - Click `Add`
        - Scroll to `No Access-Role`-Flow
        - Move `No Access-Role` that it is the first children below `SSO-App Browserflow forms`
          - Click `Disabled` and set it to `Conditional`
          - Click `+`
            - Click `Add Condition`
              - ✅ `Condition - user role`
              - Click `Add`
          - Click `+`
            - Click `Add execution`
              - ✅ `Deny access`
              - Click `Add`
        - Scroll to `Condition - user role` below `No Access-Role`
          - Click `Disabled` and set it to `Required`
          - Click `⚙`
            - Set `Alias`: Has no Access-Role
            - Set `Negate Output`: On
            - Click `Select Role`
              - Search for `access`
                - ✅ `<SSO_APP_CLIENTID> access`
                - Click `Assign`
            - Click `Save`
        - Scroll to `Deny access` below `No Access-Role`
          - Click `Disabled` and set it to `Required`
          - Click `⚙`
            - Set `Alias`: No Access-Role
            - Set `Error message`: You cannot access this client.
            - Click `Save`
- Navigate to `Clients` > `<SSO_APP_CLIENTID>` > `Advanced`
  - Scroll to `Authentication flow overrides`
  - Set `Browser Flow` to `SSO-App Browserflow`
  - Click `Save`

### Konfiguration Rocket.Chat (SAML)
> Rocket.Chat ist eine Open-Source-Plattform für Teamkommunikation, die es Teams ermöglicht, in Echtzeit zu chatten und zusammenzuarbeiten. Dieses muss noch korrekt konfiguriert werden und ebenfalls als Client unter Keycloak eingerichtet werden. Die Einrichtung basiert auf der offiziellen Dokumentation von Rocket.Chat: https://docs.rocket.chat/docs/keycloak
> Zunächst muss ein initialer Admin-Benutzer unter Rocket.Chat angelegt werden, mit welchem SAML eingerichtet werden kann.
#### 1. Erste Konfiguration

- Open http://localhost:3000 - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>`
> **Bitte unbedingt eine korrekte Cloud-Konto-E-Mail angeben**, da diese bestätigt werden muss.

> Für die Testzwecke die Größe der Organisation auf `1-10 people` setzen, die anderen Felder können beliebig gewählt werden.
- Follow the setup until you are logged in 
- Click on `⋮` at the top left 
- Click `⚙ Arbeitsbereich`
  - Click `Einstellungen`
  - Search for `SAML`
  - Click `Öffnen`
  - Click `Aktivieren`
> Die folgenden Einstellungen können zusätzlich auch über Keycloak unter `Realm Settings` (Runterscrollen), dann `Endpoints` abgerufen werden (SAML).
- Set `Benutzerdefinierter-Anbieter`: keycloak
- Set `Einstiegspunkt`: `http://localhost:8080/realms/sso-test/protocol/saml` - `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>/realms/<KEYCLOAK_REALM>/protocol/saml`
- Set `IDP SLO Redirect URL`: `http://localhost:8080/realms/sso-test/protocol/saml` - `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>/realms/<KEYCLOAK_REALM>/protocol/saml`
- Set `Benutzerdefinierter Aussteller`: `http://localhost:3000/_saml/metadata/keycloak` - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak`
- Click `Änderungen speichern`
- Confirm this with your initial created password, if prompted
> Da es sich hierbei um eine Testumgebung handelt und aktuell kein Mail-Server vorhanden ist, über den Rocket.Chat Mails für Zwei-Faktor-Authentifizierung-Codes senden kann, muss diese Funktion für die Testumgebung ausgeschaltet werden.
- Click `Einstellungen`
  - Search for `Konten`
  - Click `Öffnen`
  - Expand `Zwei-Faktor-Authentifizierung` by clicking on it
  - Set `Zwei-Faktor-Authentifizierung per E-Mail aktivieren`: Off
  - Click `Änderungen speichern`
#### 2. Einrichtung Zertifikate
- Open http://localhost:8080 - `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>`
- Login as `<KEYCLOAK_ADMIN>` and `<KEYCLOAK_ADMIN_PASSWORD>`
- Navigate to `Realm settings` > `Keys`
  - Click `Certificate` where `Algorithm` is `RS256` and `Use` is `SIG`
  - Copy the content of this popup
- Open http://localhost:3000 - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>`
  - Login with your admin credentials
  - Click on `⋮` at the top left
  - Click `⚙ Arbeitsbereich`
    - Click `Einstellungen`
    - Search for `SAML`
    - Click `Öffnen`
    - Expand `Zertifikat` by clicking on it
    - Paste the content into the textfield below `Benutzerdefiniertes Zertifikat`
> Für den nächsten Schritt kann das Beispiel Schlüsselpaar aus `./example-keys` verwendet werden (Diese sind für jeden öffentlich Zugänglich, daher nicht sicher. Für diese Testumgebung reicht dies jedoch aus.) oder ein eigenes Schlüsselpaar erzeugt werden, durch den folgenden Befehl. Unter Windows muss zum Ausführen zunächst OpenSSL installiert werden oder über eine bereits installierte WSL ausgeführt werden (Bsp. Ubuntu).
```bash
openssl req -newkey rsa:3072 -new -x509 -days 3652 -nodes -out saml.crt -keyout saml.pem
```
- Paste the content of `saml.crt` into the textfield below `Öffentliches Zertifikat`
- Paste the content of `saml.pem` into the textfield below `Privater Schlüssel`
- Click `Änderungen speichern`
- Confirm this with your initial created password, if prompted
- Open http://localhost:3000/_saml/metadata/keycloak - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak` and save the content to a `.xml` file (Rechtsklick und "[Seite] speichern unter...").
- Open http://localhost:8080 - `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>`
- Login as `<KEYCLOAK_ADMIN>` and `<KEYCLOAK_ADMIN_PASSWORD>`
- Navigate to `Clients`
  - Click `Import client`
  - Click `Browse...` and select the xml file saved before
  - Set `Name`: Rocket.Chat
  - Set `Client signature required`: On
  - Click `Save`
  - Set `Root URL`: `http://localhost:3000` - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>`
  - Set `Home URL`: `http://localhost:3000` - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>`
  - Set `Name ID Format`: email
  - Set `Sign assertions`: On
  - Set `SAML signature key name`: KEY_ID
  - Click `Save`
  - Navigate to `Keys`
    - Click `Import key`
    - Set `Archive format`: Certificate PEM
    - Click `Browse` and select the `.crt`-File of the keypair for rocketchat
    - Click `Import`
    - Refresh the page
    - The key should now be the same as set in rocketchat
  - Navigate to `Roles`
    - Click `Create role`
    - Set `Role name`: access
    - Click `Save`
    - Navigate back to `Client details` by clicking on the link on the top
    - Navigate to `Client Scopes`
      - Click on entry `http://localhost:3000/_saml/metadata/keycloak-dedicated` - `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak-dedicated`
      - Click `Configure a new mapper`
      - Click `User Property`
        - Set `Name`: firstName
        - Select `firstName` for `Property`
        - Set `SAML Attribute Name`: cn
        - Set `SAML Attribute NameFormat`: Basic
        - Click `Save`
- Navigate to `Realm roles`
  - Click `admin`
    - Navigate to `Associated roles`
      - Click `Assign role`
      - Search for `access`
      - ✅ `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak access`
      - Click `Assign`
    - Navigate back to `Realm roles` by clicking on the link on the top
  - Click `user`
    - Navigate to `Associated roles`
      - Click `Assign role`
      - Search for `access`
      - ✅ `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak access`
      - Click `Assign`
#### 3. Anmeldeprozess prüft Berechtigung
- Navigate to `Authentication` > `Flows`
  - At `SSO-App Browserflow`
    - Click `⋮`
    - Click `Duplicate`
      - Set `Name`: Rocket.Chat Browserflow
      - Click `Duplicate`
        - Scroll to `Condition - user role` below `Rocket.Chat Browserflow No Access-Role`
        - Click `⚙`
        - Remove `<SSO_APP_CLIENTID> access` by clicking on the x
        - Click `Select Role`
          - Search for `access`
          - ✅ `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak access`
          - Click `Assign`
        - Click `Save`
- Navigate to `Clients` > `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>/_saml/metadata/keycloak` > `Advanced`
  - Scroll to `Authentication flow overrides`
  - Set `Browser Flow` to `Rocket.Chat Browserflow`
  - Click `Save`

## Ablaufdatum Beispielschlüssel
Für die Veranschaulichung wurde in das Repository ein Schlüsselpaar hinzugefügt `./example-keys`. Der Gebrauch dieser Schlüssel ist nicht mehr sicher, da der private Schlüssel von jedem öffentlich abrufbar ist. Für die Umsetzung in der Testumgebung genügen diese Schlüssel jedoch, da es sich um eine lokale Beispielumgebung handelt und kein Zugriff durch externe möglich ist. Bei Anwendung in der Produktion dürfen diese Schlüssel nicht verwendet werden.
>Das Ablaufdatum der Beispielschlüssel ist der **10.05.2035 um 10:31**.