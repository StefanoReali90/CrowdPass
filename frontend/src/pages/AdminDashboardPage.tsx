import React, { useEffect, useState, useRef } from 'react';
import { getEventDashboard, closeEvent } from '../api/events';
import type { EventDashboardResponse } from '../types';
import { Link } from 'react-router-dom';
import { useBackground } from '../context/BackgroundContext';
import {
    BarChart3,
    PieChart,
    UploadCloud,
    Trash2,
    Image as ImageIcon,
    Users,
    Ticket,
    CheckCircle,
    UserX,
    RefreshCw,
    ShieldAlert,
    QrCode
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
    const [dashboard, setDashboard] = useState<EventDashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false);
    const [bgUploadSuccess, setBgUploadSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { backgroundImage, uploadBackgroundFile, resetBackground } = useBackground();

    const eventId = 1; // ID evento principale

    const loadDashboard = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const data = await getEventDashboard(eventId);
            setDashboard(data);
        } catch (err: any) {
            setErrorMessage(err.message || 'Errore nel caricamento delle statistiche');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleCloseEvent = async () => {
        const confirmClose = window.confirm(
            'Attenzione: Stai per chiudere definitivamente l\'evento.\n\n' +
            'In conformità al GDPR, i dati personali (nome, cognome, email) di tutti i prenotati verranno anonimizzati.\n' +
            'Le statistiche aggregate (incassi, partecipanti) rimarranno salvate per sempre.\n\n' +
            'Vuoi procedere?'
        );

        if (!confirmClose) return;

        setIsClosing(true);
        setErrorMessage(null);
        try {
            await closeEvent(eventId);
            setSuccessMessage('Evento chiuso con successo! Dati personali anonimizzati a norma GDPR.');
            await loadDashboard();
        } catch (err: any) {
            setErrorMessage(err.message || 'Impossibile chiudere l\'evento');
        } finally {
            setIsClosing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Seleziona un file immagine valido (PNG, JPG, WebP)');
            return;
        }

        setIsUploadingBg(true);
        try {
            await uploadBackgroundFile(file);
            setBgUploadSuccess('Sfondo personalizzato applicato a tutta l\'applicazione!');
            setTimeout(() => setBgUploadSuccess(null), 4000);
        } catch (err: any) {
            alert('Errore nel caricamento dell\'immagine: ' + err.message);
        } finally {
            setIsUploadingBg(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleResetBg = () => {
        resetBackground();
        setBgUploadSuccess('Sfondo ripristinato alla visuale predefinita.');
        setTimeout(() => setBgUploadSuccess(null), 4000);
    };

    if (isLoading) {
        return (
            <div className="container py-5 text-center text-white">
                <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Caricamento statistiche...</span>
                </div>
                <p className="mt-3 text-secondary">Caricamento cruscotto evento...</p>
            </div>
        );
    }

    if (errorMessage && !dashboard) {
        return (
            <div className="container py-5">
                <div className="cp-card p-4 mx-auto text-white" style={{ maxWidth: '600px', borderColor: '#ef4444' }}>
                    <div className="d-flex align-items-center gap-2 text-danger mb-2">
                        <ShieldAlert size={24} />
                        <h4 className="mb-0 fw-bold">Errore di Connessione</h4>
                    </div>
                    <p className="text-secondary">{errorMessage}</p>
                    <button className="btn-3d btn-3d-primary py-2 px-4" onClick={loadDashboard}>
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    const totalCapacity = dashboard?.totalTickets || 1;
    const capacitySaturation = Math.min(100, Math.round(((dashboard?.totalAttendees || 0) / totalCapacity) * 100));
    const attendanceRate = dashboard?.attendanceRate || 0;

    // Calcolo ripartizione incassi
    const revenueFromBookings = (dashboard?.checkedInCount || 0) * 10;
    const revenueFromWalkIns = (dashboard?.walkInCount || 0) * 15;
    const lostRevenueNoShow = (dashboard?.noShowCount || 0) * 10;

    return (
        <div className="container py-4">
            {/* Header Dashboard */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-dark">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #0284c7' }}>
                            PANNELLO AMMINISTRATORE
                        </span>
                    </div>
                    <h2 className="fw-bolder text-white mb-0 mt-1">📊 Dashboard: {dashboard?.eventName}</h2>
                    <small className="text-secondary">Statistiche in tempo reale su affluenza, ingressi, ricavi e ciclo di vita</small>
                </div>
                <div className="d-flex gap-2 mt-3 mt-md-0 flex-wrap">
                    <button className="btn-3d btn-3d-nav d-flex align-items-center gap-2" onClick={loadDashboard}>
                        <RefreshCw size={16} />
                        <span>Aggiorna Dati</span>
                    </button>
                    <Link to="/staff/scan" className="btn-3d btn-3d-primary d-flex align-items-center gap-2">
                        <QrCode size={16} />
                        <span>Postazione Check-In</span>
                    </Link>
                </div>
            </div>

            {/* Messaggi di notifica */}
            {successMessage && (
                <div className="alert alert-success d-flex align-items-center justify-content-between mb-4 py-3" style={{ background: '#064e3b', color: '#a7f3d0', border: '1px solid #059669' }}>
                    <div className="d-flex align-items-center gap-2">
                        <CheckCircle size={20} />
                        <span>{successMessage}</span>
                    </div>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessMessage(null)}></button>
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4 py-3" style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #dc2626' }}>
                    <div className="d-flex align-items-center gap-2">
                        <ShieldAlert size={20} />
                        <span>{errorMessage}</span>
                    </div>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setErrorMessage(null)}></button>
                </div>
            )}

            {/* Griglia KPI Card in Stile Blu Notte Rilievo */}
            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-lg-3">
                    <div className="cp-card p-3 h-100" style={{ borderLeft: '4px solid #38bdf8' }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="text-secondary small fw-bold">CAPIENZA TOTALE</span>
                            <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                                <Users size={18} />
                            </div>
                        </div>
                        <h2 className="fw-bolder text-white my-2">{dashboard?.totalTickets}</h2>
                        <small className="text-muted">Posti massimi consentiti</small>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                    <div className="cp-card p-3 h-100" style={{ borderLeft: '4px solid #818cf8' }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="text-secondary small fw-bold">PRENOTAZIONI ONLINE</span>
                            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                                <Ticket size={18} />
                            </div>
                        </div>
                        <h2 className="fw-bolder text-white my-2">{dashboard?.totalBookings}</h2>
                        <small className="text-muted">Con QR code a prezzo ridotto</small>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                    <div className="cp-card p-3 h-100" style={{ borderLeft: '4px solid #34d399' }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="text-secondary small fw-bold">CONVALIDATI (QR OK)</span>
                            <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                                <CheckCircle size={18} />
                            </div>
                        </div>
                        <h2 className="fw-bolder text-white my-2 text-success">{dashboard?.checkedInCount}</h2>
                        <small className="text-muted">Entrati all'evento con QR</small>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                    <div className="cp-card p-3 h-100" style={{ borderLeft: '4px solid #f87171' }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="text-secondary small fw-bold">NO-SHOW (ASSENTI)</span>
                            <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger">
                                <UserX size={18} />
                            </div>
                        </div>
                        <h2 className="fw-bolder text-white my-2 text-danger">{dashboard?.noShowCount}</h2>
                        <small className="text-muted">Prenotati ma non presentati</small>
                    </div>
                </div>
            </div>

            {/* SEZIONE GRAFICO STATISTICHE INTERATTIVO VISUALE */}
            <div className="row g-4 mb-4">
                {/* Grafico 1: Barre Comparative di Affluenza */}
                <div className="col-lg-7">
                    <div className="cp-card p-4 h-100 text-white">
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-dark">
                            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <BarChart3 size={20} className="text-info" />
                                <span>Grafico di Affluenza & Ingressi</span>
                            </h5>
                            <span className="small text-muted">Dati proporzionali</span>
                        </div>

                        <div className="mt-4 d-flex flex-column gap-3">
                            {/* Barra 1: Capienza Totale */}
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-secondary">Capienza Location:</span>
                                    <span className="fw-bold">{dashboard?.totalTickets} pax (100%)</span>
                                </div>
                                <div className="progress" style={{ height: '12px', background: '#0b1424' }}>
                                    <div className="progress-bar" style={{ width: '100%', background: '#475569' }}></div>
                                </div>
                            </div>

                            {/* Barra 2: Prenotati Online */}
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-secondary">Prenotazioni Online Ricevute:</span>
                                    <span className="fw-bold text-info">
                                        {dashboard?.totalBookings} ({Math.round(((dashboard?.totalBookings || 0) / totalCapacity) * 100)}%)
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '12px', background: '#0b1424' }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${Math.min(100, ((dashboard?.totalBookings || 0) / totalCapacity) * 100)}%`,
                                            background: 'linear-gradient(90deg, #38bdf8, #0284c7)'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Barra 3: Ingressi QR Convalidati */}
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-secondary">Ingressi Ridotti Convalidati:</span>
                                    <span className="fw-bold text-success">
                                        {dashboard?.checkedInCount} ({Math.round(((dashboard?.checkedInCount || 0) / totalCapacity) * 100)}%)
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '12px', background: '#0b1424' }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${Math.min(100, ((dashboard?.checkedInCount || 0) / totalCapacity) * 100)}%`,
                                            background: 'linear-gradient(90deg, #34d399, #059669)'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Barra 4: Walk-in alla cassa */}
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-secondary">Ingressi Cassa (Prezzo Intero Walk-in):</span>
                                    <span className="fw-bold text-warning">
                                        +{dashboard?.walkInCount} ({Math.round(((dashboard?.walkInCount || 0) / totalCapacity) * 100)}%)
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '12px', background: '#0b1424' }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${Math.min(100, ((dashboard?.walkInCount || 0) / totalCapacity) * 100)}%`,
                                            background: 'linear-gradient(90deg, #fbbf24, #d97706)'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Barra 5: No-Show */}
                            <div>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-secondary">No-Show (Assenti):</span>
                                    <span className="fw-bold text-danger">
                                        {dashboard?.noShowCount} ({Math.round(((dashboard?.noShowCount || 0) / totalCapacity) * 100)}%)
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '12px', background: '#0b1424' }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${Math.min(100, ((dashboard?.noShowCount || 0) / totalCapacity) * 100)}%`,
                                            background: 'linear-gradient(90deg, #f87171, #dc2626)'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Riepilogo presenze effettive dentro */}
                        <div className="mt-4 pt-3 border-top border-dark d-flex justify-content-between align-items-center">
                            <div>
                                <span className="text-secondary small d-block">PERSONE ATTUALMENTE DENTRO</span>
                                <h3 className="fw-bold text-success mb-0">{dashboard?.totalAttendees} partecipanti</h3>
                            </div>
                            <div className="text-end">
                                <span className="text-secondary small d-block">TASSO CONVERSIONE CHECK-IN</span>
                                <h3 className="fw-bold text-info mb-0">{attendanceRate.toFixed(1)}%</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grafico 2: Circolare SVG & Ripartizione Incassi */}
                <div className="col-lg-5">
                    <div className="cp-card p-4 h-100 text-white d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-dark">
                                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <PieChart size={20} className="text-success" />
                                    <span>Tasso di Saturazione & Ricavi</span>
                                </h5>
                            </div>

                            {/* Donut SVG Saturation Gauge */}
                            <div className="text-center my-3">
                                <div className="position-relative d-inline-block">
                                    <svg width="150" height="150" viewBox="0 0 100 100">
                                        {/* Background Circle */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            stroke="#0b1424"
                                            strokeWidth="10"
                                        />
                                        {/* Progress Circle */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            stroke="#10b981"
                                            strokeWidth="10"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - capacitySaturation / 100)}`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 50 50)"
                                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                        />
                                    </svg>
                                    <div
                                        className="position-absolute top-50 start-50 translate-middle text-center"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <div className="h3 fw-bolder mb-0 text-white">{capacitySaturation}%</div>
                                        <small className="text-secondary" style={{ fontSize: '10px' }}>OCCUPAZIONE</small>
                                    </div>
                                </div>
                            </div>

                            {/* Ripartizione Ricavi */}
                            <div className="p-3 rounded-3 mt-2" style={{ background: '#0b1424', border: '1px solid #1c2d4a' }}>
                                <div className="d-flex justify-content-between py-1 border-bottom border-dark small">
                                    <span className="text-secondary">Da Prenotati (10€):</span>
                                    <span className="fw-bold text-white">+{revenueFromBookings.toFixed(2)} €</span>
                                </div>
                                <div className="d-flex justify-content-between py-1 border-bottom border-dark small">
                                    <span className="text-secondary">Da Walk-in Cassa (15€):</span>
                                    <span className="fw-bold text-warning">+{revenueFromWalkIns.toFixed(2)} €</span>
                                </div>
                                <div className="d-flex justify-content-between py-1 small">
                                    <span className="text-muted">Potenziale perso (No-Show):</span>
                                    <span className="text-danger">-{lostRevenueNoShow.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>

                        {/* Incasso Totale Reale */}
                        <div className="mt-4 pt-3 border-top border-dark d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-secondary d-block">INCASSO REALE TOTALE</small>
                                <span className="small text-muted">Calcolato alla cassa</span>
                            </div>
                            <h2 className="fw-black text-success mb-0">{dashboard?.totalRevenue.toFixed(2)} €</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEZIONE: PERSONALIZZAZIONE SFONDO APPLICAZIONE (ADMIN) */}
            <div className="cp-card p-4 mb-4 text-white">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-dark flex-wrap gap-2">
                    <div>
                        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                            <ImageIcon size={20} className="text-info" />
                            <span>Personalizzazione Sfondo dell'Applicazione</span>
                        </h5>
                        <small className="text-secondary">
                            Come amministratore, puoi impostare un'immagine di sfondo personalizzata (es. locandina o tema dell'evento) visibile su tutta l'app.
                        </small>
                    </div>
                    {bgUploadSuccess && (
                        <span className="badge bg-success py-2 px-3">
                            {bgUploadSuccess}
                        </span>
                    )}
                </div>

                <div className="row align-items-center g-3">
                    <div className="col-md-7">
                        <p className="small text-muted mb-3">
                            L'immagine caricata verrà salvata in memoria e applicata con il filtro blu notte su tutte le pagine dell'applicazione (prenotazione, login, check-in, dashboard).
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                            <input
                                type="file"
                                accept="image/*"
                                className="d-none"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button
                                className="btn-3d btn-3d-primary py-2 px-4 d-flex align-items-center gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingBg}
                            >
                                <UploadCloud size={18} />
                                <span>{isUploadingBg ? 'Caricamento in corso...' : 'Carica Nuova Immagine'}</span>
                            </button>

                            {backgroundImage && (
                                <button
                                    className="btn-3d btn-3d-secondary py-2 px-3 d-flex align-items-center gap-2"
                                    onClick={handleResetBg}
                                >
                                    <Trash2 size={16} />
                                    <span>Ripristina Sfondo Predefinito</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="col-md-5 text-center">
                        <div
                            className="rounded-3 p-3 d-inline-block shadow-sm"
                            style={{
                                background: '#0b1424',
                                border: '1px dashed #334e7a',
                                width: '100%',
                                maxWidth: '300px'
                            }}
                        >
                            {backgroundImage ? (
                                <div>
                                    <img
                                        src={backgroundImage}
                                        alt="Anteprima sfondo personalizzato"
                                        className="img-fluid rounded-2 mb-2"
                                        style={{ maxHeight: '110px', objectFit: 'cover', width: '100%' }}
                                    />
                                    <span className="badge bg-info text-dark small">Sfondo Personalizzato Attivo</span>
                                </div>
                            ) : (
                                <div className="py-4 text-muted small">
                                    <ImageIcon size={32} className="mb-2 opacity-50 text-secondary" />
                                    <div>Nessuno sfondo personalizzato caricato</div>
                                    <div className="text-secondary" style={{ fontSize: '11px' }}>Attivo: Gradiente Blu Notte base</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SEZIONE: CICLO DI VITA POST-EVENTO & GDPR */}
            <div className="cp-card p-4 text-white" style={{ borderColor: '#ef4444' }}>
                <div className="d-flex align-items-center gap-2 text-danger mb-2">
                    <ShieldAlert size={22} />
                    <h5 className="fw-bold mb-0">Ciclo di Vita Post-Evento & Privacy (GDPR)</h5>
                </div>
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <p className="text-secondary small mb-0">
                            Quando la serata si conclude, esegui la chiusura dell'evento.
                            Tutti i dati personali dei partecipanti (Nome, Cognome, Email, Telefono) verranno
                            <strong className="text-white"> definitivamente anonimizzati</strong> secondo la normativa europea GDPR.
                            Tutte le statistiche aggregate e gli incassi storici rimarranno intatti e consultabili per sempre.
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <button
                            className="btn-3d btn-3d-danger py-3 px-4 fs-6"
                            onClick={handleCloseEvent}
                            disabled={isClosing}
                        >
                            {isClosing ? 'Chiusura in corso...' : 'Chiudi Evento & Anonimizza (GDPR)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
