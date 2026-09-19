# PassHalo Mobile

App React Native/Expo per Android con:

- prenotazione pubblica e visualizzazione QR;
- registrazione autonoma ADMIN senza codice condiviso;
- login ADMIN/STAFF con JWT conservato in SecureStore;
- scanner QR nativo e check-in;
- creazione e modifica dei propri eventi;
- dashboard limitata agli eventi dell'ADMIN autenticato;
- elenco e annullamento delle prenotazioni dei propri eventi;
- URL del server modificabile direttamente dall'app.

## Avvio locale

È richiesta una versione Node compatibile con Expo SDK 57/React Native 0.86 (ad esempio Node 24.3 o più recente).

```powershell
cd mobile
Copy-Item .env.example .env
npm install
npm run start
```

Installa Expo Go sul telefono e scansiona il QR mostrato dal terminale. In alternativa configura il server dalla scheda **Server** dell'app. Se Cloudflare punta al frontend Vite, l'URL deve terminare con `/api`.

## Generare un APK

La prima volta:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Poi:

```powershell
npm run build:apk
```

Il profilo `preview` in `eas.json` genera un APK installabile direttamente. EAS mostrerà il link per scaricarlo al termine della build.

## Verifiche

```powershell
npm run typecheck
npm run doctor
```
