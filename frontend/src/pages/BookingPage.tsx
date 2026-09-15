import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Download, Ticket } from 'lucide-react';
import { createBooking } from '../api/booking';
import { getEvents } from '../api/events';
import type { BookingResponse, Event } from '../types';

function formatEventDate(value: string) {
    return new Intl.DateTimeFormat('it-IT', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function qrSource(value: string) {
    return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
}

export function BookingPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [result, setResult] = useState<BookingResponse | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const requestedEventId = Number(new URLSearchParams(window.location.search).get('eventId'));

        getEvents()
            .then((availableEvents) => {
                if (!active) return;
                const bookableEvents = availableEvents.filter((event) => event.eventState !== 'FINISHED');
                setEvents(bookableEvents);
                const requestedIsAvailable = Number.isInteger(requestedEventId)
                    && bookableEvents.some((event) => event.id === requestedEventId);
                setSelectedEventId(requestedIsAvailable ? requestedEventId : bookableEvents[0]?.id ?? null);
            })
            .catch((requestError) => {
                if (active) setError(requestError instanceof Error ? requestError.message : 'Impossibile caricare gli eventi.');
            })
            .finally(() => {
                if (active) setEventsLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const selectedEvent = events.find((event) => event.id === selectedEventId);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedEventId === null) {
            setError('Seleziona un evento prima di prenotare.');
            return;
        }

        const form = new FormData(event.currentTarget);
        setBusy(true);
        setError('');

        try {
            setResult(await createBooking({
                name: String(form.get('name')).trim(),
                surname: String(form.get('surname')).trim(),
                email: String(form.get('email')).trim(),
                phone: '',
                marketingConsent: false,
                eventId: selectedEventId,
            }));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Prenotazione non riuscita. Riprova.');
        } finally {
            setBusy(false);
        }
    };

    if (result) {
        const qr = qrSource(result.qrCodeBase64);
        return (
            <section className="form-page">
                <div className="form-intro">
                    <span className="eyebrow"><Ticket size={15} /> Il tuo pass digitale</span>
                    <h1>Ci sei<span className="accent-text">.</span></h1>
                    <p>Prenotazione confermata. Conserva il tuo QR code.</p>
                </div>
                <div className="panel form-panel ticket-result">
                    <span className="status"><Check size={14} /> Prenotazione confermata</span>
                    <h2>{result.name} {result.surname}</h2>
                    <p>{result.eventName}<br />{result.email}</p>
                    <img className="qr-image" src={qr} alt="QR code da mostrare all’ingresso" />
                    <p className="form-note">Mostra questo codice al personale all’ingresso.</p>
                    <a className="button primary full" href={qr} download={`CrowdPass-${result.uuid}.png`}>
                        <Download size={17} /> Scarica il QR code
                    </a>
                    <button className="button full" onClick={() => setResult(null)}>Un’altra prenotazione</button>
                </div>
            </section>
        );
    }

    return (
        <section className="form-page">
            <div className="form-intro">
                <span className="eyebrow"><Ticket size={15} /> Il tuo pass digitale</span>
                <h1>Entra nella serata<span className="accent-text">.</span></h1>
                <p>Prenota il tuo ingresso. Il QR code è pronto in pochi istanti.</p>
            </div>

            <div className="panel form-panel">
                {error && <div className="notice error" role="alert">{error}</div>}

                {events.length > 0 && (
                    <div className="event-choice">
                        <label htmlFor="event">Evento</label>
                        <select
                            id="event"
                            value={selectedEventId ?? ''}
                            onChange={(event) => setSelectedEventId(Number(event.target.value))}
                            disabled={eventsLoading || busy}
                        >
                            {events.map((availableEvent) => (
                                <option key={availableEvent.id} value={availableEvent.id}>{availableEvent.name}</option>
                            ))}
                        </select>
                        {selectedEvent && (
                            <p className="event-meta">
                                {formatEventDate(selectedEvent.startDateTime)} · {selectedEvent.location}<br />
                                Ingresso ridotto: {selectedEvent.bookingPrice.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                            </p>
                        )}
                    </div>
                )}

                {eventsLoading && <div className="notice" role="status">Caricamento eventi…</div>}
                {!eventsLoading && events.length === 0 && <div className="notice error" role="alert">Non ci sono eventi disponibili per la prenotazione.</div>}

                <div className="form-section-title"><span>01 / I tuoi dati</span><span>Tutti i campi sono obbligatori</span></div>
                <form onSubmit={submit}>
                    <div className="field-row">
                        <label>Nome<input name="name" autoComplete="given-name" placeholder="Il tuo nome" required maxLength={100} pattern=".*\S.*" /></label>
                        <label>Cognome<input name="surname" autoComplete="family-name" placeholder="Il tuo cognome" required maxLength={100} pattern=".*\S.*" /></label>
                    </div>
                    <label>Email<input name="email" type="email" autoComplete="email" placeholder="nome@esempio.it" required /></label>
                    <p className="form-note">I tuoi dati servono a gestire la prenotazione e il tuo ingresso all’evento.</p>
                    <button className="button primary full" disabled={busy || eventsLoading || selectedEventId === null}>
                        {busy ? 'Creazione del pass…' : 'Ottieni il tuo pass'} <ArrowRight size={18} />
                    </button>
                </form>
                <div className="form-bottom"><Ticket size={16} /><span>Un pass personale. Un ingresso più semplice.</span></div>
            </div>
            <p className="below-form">Non serve un account. Solo la voglia di esserci.</p>
        </section>
    );
}
