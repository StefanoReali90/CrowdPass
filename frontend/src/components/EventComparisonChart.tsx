import { useState } from 'react';
import type { Event, EventDashboardResponse } from '../types';

export interface EventComparisonItem {
    event: Event;
    dashboard: EventDashboardResponse;
}

interface EventComparisonChartProps {
    items: EventComparisonItem[];
}

type ComparisonMetric = 'attendance' | 'attendees' | 'revenue';

const metricLabels: Record<ComparisonMetric, string> = {
    attendance: 'Partecipazione',
    attendees: 'Presenze',
    revenue: 'Ricavi',
};

const formatters: Record<ComparisonMetric, (value: number) => string> = {
    attendance: (value) => `${value.toFixed(1).replace('.0', '')}%`,
    attendees: (value) => value.toLocaleString('it-IT'),
    revenue: (value) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
};

const metricValue = (item: EventComparisonItem, metric: ComparisonMetric) => {
    if (metric === 'attendance') return item.dashboard.attendanceRate;
    if (metric === 'attendees') return item.dashboard.totalAttendees;
    return item.dashboard.totalRevenue;
};

export function EventComparisonChart({ items }: EventComparisonChartProps) {
    const [metric, setMetric] = useState<ComparisonMetric>('attendance');
    const maximum = Math.max(1, ...items.map((item) => metricValue(item, metric)));

    return (
        <section className="panel comparison-panel" aria-labelledby="comparison-heading">
            <div className="section-heading comparison-heading">
                <div><span className="eyebrow">Storico</span><h2 id="comparison-heading">Confronto tra eventi</h2></div>
                <div className="metric-switch" aria-label="Indicatore da confrontare">
                    {(Object.keys(metricLabels) as ComparisonMetric[]).map((value) => (
                        <button type="button" key={value} aria-pressed={metric === value} onClick={() => setMetric(value)}>{metricLabels[value]}</button>
                    ))}
                </div>
            </div>

            <div className="comparison-chart" role="img" aria-label={`Confronto eventi per ${metricLabels[metric].toLowerCase()}`}>
                {items.map((item) => {
                    const value = metricValue(item, metric);
                    return (
                        <div className="comparison-row" key={item.event.id}>
                            <div><strong>{item.event.name}</strong><span>{new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(new Date(item.event.startDateTime))}</span></div>
                            <div className="comparison-track"><span style={{ width: `${value / maximum * 100}%` }} /></div>
                            <strong>{formatters[metric](value)}</strong>
                        </div>
                    );
                })}
            </div>

            <details className="accessible-data compact">
                <summary>Visualizza confronto tabellare</summary>
                <div className="table-shell">
                    <table className="data-table">
                        <thead><tr><th>Evento</th><th>Partecipazione</th><th>Presenze</th><th>Ricavi</th></tr></thead>
                        <tbody>{items.map((item) => <tr key={item.event.id}><td>{item.event.name}</td><td>{formatters.attendance(item.dashboard.attendanceRate)}</td><td>{formatters.attendees(item.dashboard.totalAttendees)}</td><td>{formatters.revenue(item.dashboard.totalRevenue)}</td></tr>)}</tbody>
                    </table>
                </div>
            </details>
        </section>
    );
}
