import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw, ScanLine, Ticket, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { closeEvent, getEventDashboard, getMyEvents } from '../api/events';
import type { Event, EventDashboardResponse } from '../types';
import { BookingShare } from '../components/BookingShare';

const number = (value: number) => value.toLocaleString('it-IT');
const money = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

export function AdminDashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [data, setData] = useState<EventDashboardResponse | null>(null);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [closing, setClosing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        const initialize = async () => {
            setBusy(true);
            setError('');
            try {
                const ownedEvents = await getMyEvents();
                if (!active) return;

                setEvents(ownedEvents);
                const firstEventId = ownedEvents[0]?.id ?? null;
                setSelectedEventId(firstEventId);

                if (firstEventId === null) {
                    setError('Non hai ancora creato un evento.');
                    return;
                }

                setData(await getEventDashboard(firstEventId));
            } catch (requestError) {
                if (active) setError(requestError instanceof Error ? requestError.message : 'Statistiche non disponibili.');
            } finally {
                if (active) setBusy(false);
            }
        };

        void initialize();
        return () => {
            active = false;
        };
    }, []);

    const loadDashboard = async (eventId: number) => {
        setBusy(true);
        setError('');
        try {
            setData(await getEventDashboard(eventId));
        } catch (requestError) {
            setData(null);
            setError(requestError instanceof Error ? requestError.message : 'Statistiche non disponibili.');
        } finally {
            setBusy(false);
        }
    };

    const refresh = async () => {
        if (selectedEventId !== null) await loadDashboard(selectedEventId);
    };

    const selectEvent = (eventId: number) => {
        setSelectedEventId(eventId);
        setData(null);
        setMessage('');
        void loadDashboard(eventId);
    };

    const close = async () => {
        if (selectedEventId === null) return;
        if (!window.confirm('Chiudere definitivamente l’evento e anonimizzare i dati personali? Le statistiche aggregate saranno conservate.')) return;

        setClosing(true);
        setError('');
        try {
            await closeEvent(selectedEventId);
            setMessage('Evento chiuso. Dati personali anonimizzati.');
            await loadDashboard(selectedEventId);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Chiusura non riuscita.');
        } finally {
            setClosing(false);
        }
    };

    const rate = data && data.totalBookings > 0
        ? Math.min(100, Math.round(data.checkedInCount / data.totalBookings * 100))
        : 0;
    const occupancy = data && data.totalTickets > 0
        ? Math.min(100, Math.round(data.totalAttendees / data.totalTickets * 100))
        : 0;
    const eventName = events.find((event) => event.id === selectedEventId)?.name ?? data?.eventName ?? 'Evento principale';

    return (
        <section className="dashboard">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Workspace / Panoramica</span>
                    <h1>Il tuo evento, a colpo d’occhio<span className="accent-text">.</span></h1>
                    <p>Presenze, prenotazioni e risultati. Tutto nello stesso posto.</p>
                </div>
                <button className="button" onClick={refresh} disabled={busy || selectedEventId === null}>
                    <RefreshCw size={16} className={busy ? 'spinning' : ''} /> Aggiorna
                </button>
            </div>

            <div className="event-strip">
                <div>
                    <span className="event-icon"><Ticket size={22} /></span>
                    <div>
                        <span className="eyebrow">Evento selezionato</span>
                        {events.length > 1 ? (
                            <select className="event-selector" value={selectedEventId ?? ''} onChange={(event) => selectEvent(Number(event.target.value))}>
                                {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
                            </select>
                        ) : <strong>{eventName}</strong>}
                    </div>
                </div>
                <a className="button" href="#prenotazioni">Form prenotazioni <ArrowUpRight size={16} /></a>
            </div>

            <BookingShare eventId={selectedEventId} />
            {error && <div className="notice error" role="alert">{error}</div>}
            {message && <div className="notice" role="status">{message}</div>}

            {!data ? (
                <div className="panel empty-state" role="status">
                    <h2>{busy ? 'Caricamento delle statistiche…' : 'Le statistiche non sono disponibili'}</h2>
                    <p>{busy ? 'Stiamo recuperando i dati del tuo evento.' : 'Verifica la connessione e premi Aggiorna per riprovare.'}</p>
                </div>
            ) : (
                <>
                    <div className="metrics">
                        {[
                            { label: 'Prenotazioni', value: number(data.totalBookings), note: 'Pass richiesti online', icon: Ticket },
                            { label: 'Ingressi totali', value: number(data.totalAttendees), note: 'Prenotati e ingressi in cassa', icon: Users },
                            { label: 'Check-in effettuati', value: number(data.checkedInCount), note: `${rate}% delle prenotazioni`, icon: ScanLine },
                            { label: 'Incasso totale', value: money(data.totalRevenue), note: 'Valore registrato per l’evento', icon: Wallet },
                        ].map(({ label, value, note, icon: Icon }) => (
                            <article className="panel metric" key={label}>
                                <div>{label}<Icon size={17} /></div>
                                <strong>{value}</strong>
                                <small>{note}</small>
                            </article>
                        ))}
                    </div>

                    <div className="chart-grid">
                        <article className="panel chart-panel">
                            <div className="panel-heading">
                                <div><span className="eyebrow">Partecipazione</span><h2>Dalla prenotazione all’ingresso</h2></div>
                                <span className="subtle-tag">Totali evento</span>
                            </div>
                            <div className="bar-chart" role="img" aria-label={`Prenotazioni ${data.totalBookings}, check-in ${data.checkedInCount}, ingressi in cassa ${data.walkInCount}, non entrati ${data.noShowCount}`}>
                                {[
                                    { label: 'Prenotazioni', value: data.totalBookings },
                                    { label: 'Check-in', value: data.checkedInCount },
                                    { label: 'In cassa', value: data.walkInCount },
                                    { label: 'Non entrati', value: data.noShowCount },
                                ].map((bar, index, bars) => (
                                    <div className="bar-column" key={bar.label}>
                                        <strong>{number(bar.value)}</strong>
                                        <div className="bar-track"><div className={`chart-bar bar-${index}`} style={{ height: `${Math.max(0, bar.value) / Math.max(1, ...bars.map((item) => item.value)) * 100}%` }} /></div>
                                        <span>{bar.label}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="chart-caption">I non entrati possono ancora presentarsi finché l’evento è aperto.</p>
                        </article>

                        <article className="panel chart-panel">
                            <div className="panel-heading"><div><span className="eyebrow">Capienza</span><h2>Presenze sull’obiettivo</h2></div></div>
                            <div className="donut-wrap">
                                <svg viewBox="0 0 160 160" role="img" aria-label={`Capienza occupata: ${occupancy}%`}>
                                    <circle className="donut-track" cx="80" cy="80" r="64" />
                                    <circle className="donut-fill" cx="80" cy="80" r="64" pathLength="100" strokeDasharray={`${occupancy} 100`} />
                                </svg>
                                <div><strong>{occupancy}<small>%</small></strong><span>capienza occupata</span></div>
                            </div>
                            <div className="legend-row"><span><i />Persone entrate</span><strong>{number(data.totalAttendees)}</strong></div>
                            <div className="legend-row"><span>Capienza evento</span><strong>{number(data.totalTickets)}</strong></div>
                            {!data.totalTickets && <p className="form-note">Capienza non impostata.</p>}
                        </article>
                    </div>

                    <div className="bottom-grid">
                        <article className="panel operations">
                            <span className="eyebrow">Operatività</span>
                            <h2>Pronto ad aprire le porte?</h2>
                            <p>Apri il controllo ingressi per convalidare i pass e registrare gli accessi.</p>
                            <Link className="button primary" to="/staff/scan">Controllo ingressi <ArrowUpRight size={17} /></Link>
                        </article>
                        <article className="panel operations">
                            <span className="eyebrow">Fine evento</span>
                            <h2>Chiudi l’evento</h2>
                            <p>Anonimizza i dati personali e conserva le statistiche aggregate. L’operazione è definitiva.</p>
                            <button className="button danger" disabled={closing || !!message} onClick={close}>{closing ? 'Chiusura…' : message ? 'Evento chiuso' : 'Chiudi evento'}</button>
                        </article>
                    </div>
                </>
            )}
        </section>
    );
}
