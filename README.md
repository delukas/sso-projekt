# SSO in Action - Beispielimplementation einer SSO-Umgebung

## First of all
Folgend stehen `<EXAMPLE_ENV>` für Variabeln aus der `.env`-Datei
und `[EXAMPLE_CONFIG]` für eigene Konfigurationseinstellungen in den Benutzeroberflächen. Beim Setup wird davon ausgegangen das die Standardwerte beibehalten werden, daher sind die Links hier statisch hinterlegt.

## Requirements
- `Docker`

## Setup
Ändere den Dateinamen von `.env.example` zu `.env` und konfiguriere diese bei Bedarf. Starte die Container mit `docker compose up -d`. Danach sind KeyCloak, Rocket.Chat und die SSO-App normalerweise erreichbar:

| Anwendung   | DEFAULT_URL           | URL                                   |
|-------------|-----------------------|---------------------------------------|
| Keycloak    | http://localhost:8080 | `<KEYCLOAK_HOST>:<KEYCLOAK_PORT>`     |
| Rocket.Chat | http://localhost:3000 | `<ROCKETCHAT_HOST>:<ROCKETCHAT_PORT>` |
| SSO-App     | http://localhost:5173 | `<SSO_APP_HOST>:<SSO_APP_PORT>`       |

### 

## Container stoppen
Um die Container zu stoppen nutze `docker compose down` *(! ohne `-v`)*

## Zurücksetzen aller Einstellungen
Entweder die Volumes von MongoDB und Keycloak über Docker Desktop/CLI löschen oder `docker compose down -v` benutzen beim Stoppen der Container. Damit werden alle dazugehörigen Volumes gelöscht und das Setup muss erneut ausgeführt werden.