import { useEffect, useState, type FormEvent } from 'react';
import { Download, Filter, RefreshCw, Search, TicketX } from 'lucide-react';
import {
    cancelBooking,
    getBookingById,
    getBookingByUUID,
    getBookings,
    getBookingsByEmail,
    getBookingsByEventAndEmail,
    getBookingsByEventId,
} from '../api/booking';
import { getMyEvents } from '../api/events';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { BookingResponse, Event } from '../types';

type SearchMode = 'all' | 'event' | 'email' | 'event-email' | 'uuid' | 'id';

const modeLabels: Record<SearchMode, string> = {
    all: 'Tutte',
    event: 'Per evento',
    email: 'Per email',
    'event-email': 'Evento + email',
    uuid: 'Per UUID',
    id: 'Per ID interno',
};

const statusLabels = {
    CREATED: 'Prenotato',
    VALIDATED: 'Convalidato',
    CANCELLED: 'Annullato',
};

function qrSource(value: string) {
    return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('it-IT', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function BookingsPage() {
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [mode, setMode] = useState<SearchMode>('all');
    const [eventId, setEventId] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [knownIds, setKnownIds] = useState<Record<string, number>>({});
    const [cancelId, setCancelId] = useState('');
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [pendingCancellationId, setPendingCancellationId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;
        Promise.all([getMyEvents(), getBookings()])
            .then(([ownedEvents, allBookings]) => {
                if (!active) return;
                setEvents(ownedEvents);
                setEventId(ownedEvents[0]?.id ?? null);
                setBookings(allBookings);
            })
            .catch((requestError) => {
                if (active) setError(requestError instanceof Error ? requestError.message : 'Prenotazioni non disponibili.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const runSearch = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        setKnownIds({});

        try {
            let result: BookingResponse[];
            switch (mode) {
                case 'all':
                    result = await getBookings();
                    break;
                case 'event':
                    if (eventId === null) throw new Error('Seleziona un evento.');
                    result = await getBookingsByEventId(eventId);
                    break;
                case 'email':
                    if (!email.trim()) throw new Error('Inserisci un indirizzo email.');
                    result = await getBookingsByEmail(email);
                    break;
                case 'event-email':
                    if (eventId === null || !email.trim()) throw new Error('Seleziona un evento e inserisci un’email.');
                    result = await getBookingsByEventAndEmail(eventId, email);
                    break;
                case 'uuid':
                    if (!identifier.trim()) throw new Error('Inserisci l’UUID della prenotazione.');
                    result = [await getBookingByUUID(identifier)];
                    break;
                case 'id': {
                    const numericId = Number(identifier);
                    if (!Number.isInteger(numericId) || numericId <= 0) throw new Error('Inserisci un ID numerico valido.');
                    const booking = await getBookingById(numericId);
                    result = [booking];
                    setKnownIds({ [booking.uuid]: numericId });
                    setCancelId(String(numericId));
                    break;
                }
            }
            setBookings(result);
        } catch (requestError) {
            setBookings([]);
            setError(requestError instanceof Error ? requestError.message : 'Ricerca non riuscita.');
        } finally {
            setLoading(false);
        }
    };

    const search = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void runSearch();
    };

    const cancel = async (bookingId: number) => {
        setCancelling(true);
        setError('');
        setMessage('');
        try {
            await cancelBooking(bookingId);
            await runSearch();
            setMessage(`Prenotazione #${bookingId} annullata.`);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Annullamento non riuscito.');
        } finally {
            setCancelling(false);
            setPendingCancellationId(null);
        }
    };

    const submitCancellation = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const numericId = Number(cancelId);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            setError('Inserisci un ID numerico valido per annullare la prenotazione.');
            return;
        }
        setPendingCancellationId(numericId);
    };

    return (
        <section className="workspace-page">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Amministrazione / Prenotazioni</span>
                    <h1>Trova ogni pass<span className="accent-text">.</span></h1>
                    <p>Consulta, filtra e annulla le prenotazioni dei tuoi eventi.</p>
                </div>
                <button className="button" onClick={() => void runSearch()} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Aggiorna
                </button>
            </div>

            <form className="panel filter-panel" onSubmit={search}>
                <label>
                    <span><Filter size={14} /> Vista</span>
                    <select value={mode} onChange={(event) => setMode(event.target.value as SearchMode)}>
                        {(Object.keys(modeLabels) as SearchMode[]).map((value) => <option value={value} key={value}>{modeLabels[value]}</option>)}
                    </select>
                </label>

                {(mode === 'event' || mode === 'event-email') && (
                    <label>
                        <span>Evento</span>
                        <select value={eventId ?? ''} onChange={(event) => setEventId(Number(event.target.value))} required>
                            {events.map((availableEvent) => <option key={availableEvent.id} value={availableEvent.id}>{availableEvent.name}</option>)}
                        </select>
                    </label>
                )}

                {(mode === 'email' || mode === 'event-email') && (
                    <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                )}

                {(mode === 'uuid' || mode === 'id') && (
                    <label>
                        <span>{mode === 'uuid' ? 'UUID' : 'ID interno'}</span>
                        <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} inputMode={mode === 'id' ? 'numeric' : 'text'} required />
                    </label>
                )}

                <button className="button primary" disabled={loading}><Search size={16} /> Cerca</button>
            </form>

            {error && <div className="notice error" role="alert">{error}</div>}
            {message && <div className="notice success" role="status">{message}</div>}

            <div className="result-heading">
                <div><span className="eyebrow">Risultati</span><h2>{loading ? 'Caricamento…' : `${bookings.length} prenotazioni`}</h2></div>
                <form className="inline-danger-form" onSubmit={submitCancellation}>
                    <input aria-label="ID prenotazione da annullare" placeholder="ID interno" inputMode="numeric" value={cancelId} onChange={(event) => setCancelId(event.target.value)} />
                    <button className="button danger" disabled={cancelling || !cancelId.trim()}><TicketX size={15} /> {cancelling ? 'Annullamento…' : 'Annulla per ID'}</button>
                </form>
            </div>

            <p className="contract-note">L’API restituisce UUID e dati del pass, ma non l’ID numerico richiesto dall’endpoint di annullamento. Per annullare, inserisci l’ID interno oppure cerca prima “Per ID interno”.</p>

            {!loading && bookings.length === 0 ? (
                <div className="panel empty-state"><h2>Nessuna prenotazione trovata</h2><p>Modifica i filtri e riprova.</p></div>
            ) : (
                <div className="panel table-shell" aria-busy={loading}>
                    <table className="data-table">
                        <thead><tr><th>Cliente</th><th>Evento</th><th>Creata</th><th>Stato</th><th>UUID</th><th>Azioni</th></tr></thead>
                        <tbody>
                            {bookings.map((booking) => {
                                const internalId = knownIds[booking.uuid];
                                return (
                                    <tr key={booking.uuid}>
                                        <td><strong>{booking.name} {booking.surname}</strong><small>{booking.email}{booking.phone ? ` · ${booking.phone}` : ''}</small></td>
                                        <td>{booking.eventName}<small>Evento #{booking.eventId}</small></td>
                                        <td>{formatDate(booking.createdAt)}</td>
                                        <td><span className={`state-badge booking-${booking.bookingStatus.toLowerCase()}`}>{statusLabels[booking.bookingStatus]}</span></td>
                                        <td><code>{booking.uuid}</code></td>
                                        <td>
                                            <div className="table-actions">
                                                <a className="icon-button" href={qrSource(booking.qrCodeBase64)} download={`CrowdPass-${booking.uuid}.png`} aria-label="Scarica QR"><Download size={16} /></a>
                                                {internalId && booking.bookingStatus !== 'CANCELLED' && (
                                                    <button className="icon-button danger" onClick={() => setPendingCancellationId(internalId)} disabled={cancelling} aria-label={`Annulla prenotazione ${internalId}`}><TicketX size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <ConfirmDialog
                open={pendingCancellationId !== null}
                title={`Annullare la prenotazione #${pendingCancellationId ?? ''}?`}
                description="Il pass non potrà più essere convalidato all’ingresso. L’operazione non può essere annullata."
                confirmLabel="Annulla prenotazione"
                busy={cancelling}
                onCancel={() => setPendingCancellationId(null)}
                onConfirm={() => pendingCancellationId ? cancel(pendingCancellationId) : undefined}
            />
        </section>
    );
}
