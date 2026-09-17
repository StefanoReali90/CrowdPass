import type { Event, EventDashboardResponse } from '../types';

interface EventResultsChartsProps {
    data: EventDashboardResponse;
    event: Event;
}

const number = (value: number) => value.toLocaleString('it-IT');
const money = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const percent = (value: number) => `${Math.max(0, Math.min(100, value)).toFixed(1).replace('.0', '')}%`;

export function EventResultsCharts({ data, event }: EventResultsChartsProps) {
    const attendanceRate = data.totalBookings > 0 ? data.checkedInCount / data.totalBookings * 100 : 0;
    const noShowRate = data.totalBookings > 0 ? data.noShowCount / data.totalBookings * 100 : 0;
    const occupancy = data.totalTickets > 0 ? data.totalAttendees / data.totalTickets * 100 : 0;
    const remainingCapacity = Math.max(0, data.totalTickets - data.totalAttendees);
    const bookedRevenue = data.checkedInCount * event.bookingPrice;
    const walkInRevenue = data.walkInCount * event.normalPrice;
    const revenueScale = Math.max(1, bookedRevenue + walkInRevenue);

    const participation = [
        { label: 'Prenotazioni attive', value: data.totalBookings, ratio: 100, tone: 'primary' },
        { label: 'Check-in con QR', value: data.checkedInCount, ratio: attendanceRate, tone: 'success' },
        { label: 'Non presentati', value: data.noShowCount, ratio: noShowRate, tone: 'muted' },
    ];

    return (
        <section className="results-section" aria-labelledby="results-heading">
            <div className="section-heading">
                <div>
                    <span className="eyebrow">Analisi evento</span>
                    <h2 id="results-heading">Risultati e conversione</h2>
                </div>
                <span className="subtle-tag">Dati aggiornati</span>
            </div>

            <div className="results-grid">
                <article className="panel result-chart participation-chart">
                    <div className="chart-title">
                        <div><span className="eyebrow">Funnel presenze</span><h3>Dalla prenotazione all’ingresso</h3></div>
                        <strong>{percent(attendanceRate)}</strong>
                    </div>
                    <div className="funnel-chart" role="img" aria-label={`Prenotazioni ${data.totalBookings}, check-in ${data.checkedInCount}, non presentati ${data.noShowCount}, tasso di partecipazione ${percent(attendanceRate)}`}>
                        {participation.map((stage) => (
                            <div className="funnel-row" key={stage.label}>
                                <div><span>{stage.label}</span><strong>{number(stage.value)}</strong></div>
                                <div className="horizontal-track">
                                    <span className={`horizontal-fill ${stage.tone}`} style={{ width: `${stage.value > 0 ? Math.max(3, Math.min(100, stage.ratio)) : 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="chart-insight"><strong>{number(data.checkedInCount)}</strong> persone su <strong>{number(data.totalBookings)}</strong> prenotazioni hanno convalidato il pass.</p>
                </article>

                <article className="panel result-chart capacity-chart">
                    <div className="chart-title"><div><span className="eyebrow">Capienza</span><h3>Occupazione reale</h3></div></div>
                    <div className="donut-wrap result-donut">
                        <svg viewBox="0 0 160 160" role="img" aria-label={`Capienza occupata ${percent(occupancy)}, ${data.totalAttendees} presenti su ${data.totalTickets} posti`}>
                            <circle className="donut-track" cx="80" cy="80" r="64" />
                            <circle className="donut-fill" cx="80" cy="80" r="64" pathLength="100" strokeDasharray={`${Math.min(100, occupancy)} 100`} />
                        </svg>
                        <div><strong>{Math.round(occupancy)}<small>%</small></strong><span>occupazione</span></div>
                    </div>
                    <div className="capacity-summary">
                        <div><span>Presenti</span><strong>{number(data.totalAttendees)}</strong></div>
                        <div><span>Posti liberi</span><strong>{number(remainingCapacity)}</strong></div>
                    </div>
                </article>

                <article className="panel result-chart revenue-chart">
                    <div className="chart-title">
                        <div><span className="eyebrow">Ricavi effettivi</span><h3>Prenotati e cassa</h3></div>
                        <strong>{money(data.totalRevenue)}</strong>
                    </div>
                    <div className="revenue-stack" role="img" aria-label={`Ricavi da ingressi prenotati ${money(bookedRevenue)}, ricavi da ingressi in cassa ${money(walkInRevenue)}`}>
                        <span className="revenue-booked" style={{ width: `${bookedRevenue / revenueScale * 100}%` }} />
                        <span className="revenue-walkin" style={{ width: `${walkInRevenue / revenueScale * 100}%` }} />
                    </div>
                    <div className="revenue-legend">
                        <div><span><i className="booked" />Con prenotazione</span><strong>{money(bookedRevenue)}</strong><small>{number(data.checkedInCount)} ingressi × {money(event.bookingPrice)}</small></div>
                        <div><span><i className="walkin" />In cassa</span><strong>{money(walkInRevenue)}</strong><small>{number(data.walkInCount)} ingressi × {money(event.normalPrice)}</small></div>
                    </div>
                    <p className="chart-insight">Ricavo potenziale delle prenotazioni: <strong>{money(data.estimatedBookingRevenue)}</strong>.</p>
                </article>
            </div>

            <details className="panel accessible-data">
                <summary>Visualizza i dati dei grafici in formato tabellare</summary>
                <div className="table-shell">
                    <table className="data-table">
                        <thead><tr><th>Indicatore</th><th>Valore</th><th>Percentuale</th></tr></thead>
                        <tbody>
                            <tr><td>Prenotazioni attive</td><td>{number(data.totalBookings)}</td><td>100%</td></tr>
                            <tr><td>Check-in QR</td><td>{number(data.checkedInCount)}</td><td>{percent(attendanceRate)}</td></tr>
                            <tr><td>Non presentati</td><td>{number(data.noShowCount)}</td><td>{percent(noShowRate)}</td></tr>
                            <tr><td>Ingressi in cassa</td><td>{number(data.walkInCount)}</td><td>—</td></tr>
                            <tr><td>Capienza occupata</td><td>{number(data.totalAttendees)} / {number(data.totalTickets)}</td><td>{percent(occupancy)}</td></tr>
                            <tr><td>Ricavo effettivo</td><td>{money(data.totalRevenue)}</td><td>—</td></tr>
                        </tbody>
                    </table>
                </div>
            </details>
        </section>
    );
}
