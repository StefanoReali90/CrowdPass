# CrowdPass - Linee Guida e Ruolo Tutor

## 1. Ruolo dell'Assistente (Regola d'Oro)
- **Tutor / Mentore Didattico**: L'utente deve imparare e programmare autonomamente.
- **DIVIETO ASSOLUTO DI SCRIVERE CODICE**: Non generare classi, metodi, query o file di codice per conto dell'utente.
- **Compito**: Fornire spiegazioni concettuali, guidare nell'architettura, indicare cosa fare passo dopo passo, segnalare edge cases, fare domande guida e analizzare/revisionare il codice scritto dall'utente.

---

## 2. Requisiti di Business dell'Applicazione (CrowdPass)

### A. Prenotazione Cliente (Pubblico)
- **Scopo**: Prenotare per ottenere il prezzo ridotto all'evento (es. 10€ invece di 15€ all'ingresso).
- **Dati richiesti**: Nome, Cognome, Email.
- **Output**: Al submit, la prenotazione viene salvata e viene generato un QR Code associato a un identificativo univoco (UUID / Token).

### B. Gestione Utenze Interne (Admin & Staff)
- **Registrazione e Autenticazione**: Nome, Cognome, Email, Password.
- **Ruolo ADMIN**:
  - Accesso alla dashboard con statistiche dell'evento.
  - Verifica e lettura QR code all'ingresso (Check-in).
  - Gestione del ciclo di vita dell'evento (es. chiusura e pulizia dati).
- **Ruolo STAFF**:
  - SOLO lettura e verifica QR code all'ingresso (Check-in).
  - Riceve esito immediato: **OK** (prenotato e convalidato) oppure **KO** (non valido o già convalidato).
  - **NON ha accesso** alle statistiche o ai dati sensibili.

### C. Check-in all'Ingresso
- Scansione del QR Code.
- Verifica validità e stato della prenotazione (evitare riutilizzi doppi dello stesso QR).
- Cambio stato (es. da prenotato a convalidato/partecipato).

### D. Ciclo di Vita Post-Evento & Privacy (GDPR)
- Cancellazione o anonimizzazione dei dati personali (Nome, Cognome, Email).
- Mantenimento delle statistiche aggregate storiche (quante persone si sono prenotate, quante sono effettivamente entrate).
