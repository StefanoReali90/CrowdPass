# CrowdPass frontend

Frontend React + TypeScript per prenotazioni pubbliche, amministrazione eventi e check-in.

## Avvio locale

```bash
npm install
npm run dev
```

Il backend viene cercato su `http://localhost:8080`. Per usare un altro indirizzo, copia `.env.example` in `.env.local` e modifica `VITE_API_BASE_URL`. Prima della pubblicazione configura anche `VITE_PRIVACY_CONTROLLER_NAME` e `VITE_PRIVACY_CONTACT_EMAIL` con i dati reali del titolare del trattamento.

## Rotte

- `/prenota?eventId=1`: prenotazione pubblica e generazione pass QR.
- `/privacy`: informativa sul trattamento dei dati della prenotazione.
- `/login`, `/register`, `/forgot-password`, `/reset-password?token=...`: autenticazione e recupero credenziali.
- `/staff/scan`: check-in, disponibile a STAFF e ADMIN.
- `/admin/dashboard`: statistiche, walk-in e chiusura evento.
- `/admin/events`: creazione, lettura, modifica ed eliminazione eventi.
- `/admin/bookings`: elenco, ricerche e annullamento prenotazioni.
- `/admin/users`: creazione STAFF, elenco, ricerca ed eliminazione utenti.
- `/account`: cambio password.

Tutte le richieste autenticate usano il cookie HttpOnly `jwt` tramite `credentials: 'include'`.

## Verifiche

```bash
npm run lint
npm run build
```

Per eseguire lo smoke test completo contro un backend locale isolato (consigliato: porta `8081` con database temporaneo):

```powershell
$env:CROWDPASS_ALLOW_SMOKE_WRITE='true'
$env:CROWDPASS_API_BASE_URL='http://127.0.0.1:8081'
$env:CROWDPASS_REGISTRATION_CODE='e2e-registration-key'
npm run test:api
```

Lo script rifiuta host non locali e richiede l’abilitazione esplicita perché crea dati di collaudo.

## Note sul contratto backend

- La landing pubblica usa i campi evento già esistenti `imageUrl` e `description` e accetta due campi opzionali aggiuntivi:

  ```json
  {
    "videoUrl": "https://cdn.example.it/evento/hero.mp4",
    "faqs": [
      {
        "question": "Devo pagare subito?",
        "answer": "No, pagherai all'ingresso."
      }
    ]
  }
  ```

  `videoUrl` può contenere un MP4/WebM diretto, YouTube o Vimeo. Se `videoUrl` manca, il frontend usa `imageUrl`; se `faqs` manca o è vuoto, genera FAQ standard dai dati dell'evento. Il backend deve restituire questi campi nelle risposte evento e accettarli nei DTO di creazione/modifica perché siano condivisi tra dispositivi.
- `UserResponse` non contiene l'ID, ma eliminazione e cambio password richiedono un ID numerico. Le schermate espongono quindi un campo ID manuale.
- `BookingResponse` non contiene l'ID, ma l'annullamento richiede l'ID numerico. La schermata prenotazioni consente la ricerca e l'annullamento per ID manuale.
- Il recupero password accetta il token nella rotta `/reset-password`, ma il backend deve consegnare tale token all'utente (per esempio via email).
