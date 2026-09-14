import React, { useState } from 'react';
import { checkInBooking } from '../api/booking';
import { incrementWalkInCount, decrementWalkInCount } from '../api/events';
import type { CheckInResponse } from '../types';
import { QrCode, CheckCircle, XCircle, Users, Plus, Minus, UserCheck } from 'lucide-react';

export const StaffScanPage: React.FC = () => {
    const [uuidInput, setUuidInput] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
    const [checkInError, setCheckInError] = useState<string | null>(null);
    const [walkInFeedback, setWalkInFeedback] = useState<string | null>(null);
    const [recentCheckIns, setRecentCheckIns] = useState<Array<{ name: string; time: string }>>([]);

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = uuidInput.trim();
        if (!trimmed) return;

        setIsChecking(true);
        setCheckInResult(null);
        setCheckInError(null);

        try {
            const result = await checkInBooking(trimmed);
            setCheckInResult(result);
            setUuidInput('');
            // Aggiungi alla cronologia rapida della sessione
            setRecentCheckIns((prev) => [
                { name: `${result.name} ${result.surname}`, time: new Date().toLocaleTimeString() },
                ...prev.slice(0, 4),
            ]);
        } catch (err: any) {
            setCheckInError(err.message || 'Accesso non autorizzato o già convalidato');
        } finally {
            setIsChecking(false);
        }
    };

    const handleWalkInPlus = async () => {
        try {
            await incrementWalkInCount(1);
            setWalkInFeedback('+1 Ingresso Intero (Cassa) aggiunto!');
            setTimeout(() => setWalkInFeedback(null), 2500);
        } catch (err: any) {
            alert('Errore: ' + err.message);
        }
    };

    const handleWalkInMinus = async () => {
        try {
            await decrementWalkInCount(1);
            setWalkInFeedback('-1 Ingresso Intero rimosso');
            setTimeout(() => setWalkInFeedback(null), 2500);
        } catch (err: any) {
            alert('Errore: ' + err.message);
        }
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    {/* Titolo Sezione */}
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-dark">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 bg-success bg-opacity-25 text-success">
                                <QrCode size={30} />
                            </div>
                            <div>
                                <h2 className="fw-bolder text-white mb-0">Postazione Check-In Ingressi</h2>
                                <small className="text-secondary">Scansione QR Code & Controllo Biglietti</small>
                            </div>
                        </div>
                        <span className="badge py-2 px-3 fs-6 rounded-pill" style={{ background: '#1c2d4a', border: '1px solid #233554' }}>
                            🟢 PORTA ATTIVA
                        </span>
                    </div>

                    {/* BANNER ESITO: CHECK-IN OK (VERDE SMERALDO VIVACE) */}
                    {checkInResult && (
                        <div className="card mb-4 border-0 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', borderRadius: '18px' }}>
                            <div className="card-body p-4 text-center">
                                <CheckCircle size={60} className="mb-2 text-white" />
                                <h1 className="display-5 fw-black mb-1">CONVALIDATO - OK</h1>
                                <p className="fs-4 mb-2 text-white-50">Ingresso a Prezzo Ridotto Autorizzato</p>
                                <div className="bg-black bg-opacity-25 p-3 rounded-3 d-inline-block px-5 my-2">
                                    <h3 className="fw-bold mb-0 text-white">{checkInResult.name} {checkInResult.surname}</h3>
                                    <small className="text-white-50">{checkInResult.eventName}</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BANNER ESITO: CHECK-IN KO (ROSSO RUBINO VIVACE) */}
                    {checkInError && (
                        <div className="card mb-4 border-0 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)', borderRadius: '18px' }}>
                            <div className="card-body p-4 text-center">
                                <XCircle size={60} className="mb-2 text-white" />
                                <h1 className="display-5 fw-black mb-1">ACCESSO NEGATO - KO</h1>
                                <div className="bg-black bg-opacity-25 p-3 rounded-3 d-inline-block px-4 my-2">
                                    <h4 className="fw-bold mb-0 text-white">{checkInError}</h4>
                                </div>
                                <p className="small mb-0 text-white-50">Biglietto non valido, già utilizzato in precedenza o evento chiuso.</p>
                            </div>
                        </div>
                    )}

                    {/* BOX SCANSIONE / INPUT TOKEN */}
                    <div className="cp-card p-4 p-md-5 mb-4 text-white">
                        <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <QrCode size={22} className="text-info" />
                            <span>Scansiona o Inserisci Codice QR</span>
                        </h4>

                        <form onSubmit={handleCheckIn}>
                            <div className="mb-3">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg cp-input font-monospace fs-5"
                                        placeholder="Incolla o spara UUID con lettore..."
                                        value={uuidInput}
                                        onChange={(e) => setUuidInput(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="btn-3d btn-3d-primary px-4 fs-5"
                                        disabled={isChecking || !uuidInput.trim()}
                                    >
                                        {isChecking ? 'Verifica...' : 'Convalida'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <small className="text-muted d-block">
                            💡 Suggerimento: Se usi una pistola ottica / lettore QR USB o bluetooth, basta inquadrare il codice e premere invio.
                        </small>
                    </div>

                    {/* BOX GESTIONE INGRESSI INTERI ALLA CASSA (WALK-IN) */}
                    <div className="cp-card p-4 text-white mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <Users size={20} className="text-warning" />
                                    <span>Ingressi Interi alla Porta (Walk-in)</span>
                                </h5>
                                <small className="text-secondary">Persone senza prenotazione online che pagano prezzo intero</small>
                            </div>
                            {walkInFeedback && (
                                <span className="badge bg-info text-dark px-3 py-2 animate__animated animate__fadeIn">
                                    {walkInFeedback}
                                </span>
                            )}
                        </div>

                        <div className="row g-3">
                            <div className="col-6">
                                <button
                                    className="btn-3d btn-3d-success w-100 py-3 d-flex align-items-center justify-content-center gap-2 fs-5"
                                    onClick={handleWalkInPlus}
                                >
                                    <Plus size={24} />
                                    <span>+1 Ingresso Cassa</span>
                                </button>
                            </div>
                            <div className="col-6">
                                <button
                                    className="btn-3d btn-3d-danger w-100 py-3 d-flex align-items-center justify-content-center gap-2 fs-5"
                                    onClick={handleWalkInMinus}
                                >
                                    <Minus size={24} />
                                    <span>-1 Storna Cassa</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cronologia Ultimi Ingressi Convalidati della Sessione */}
                    {recentCheckIns.length > 0 && (
                        <div className="cp-card p-3 text-white">
                            <h6 className="text-muted fw-bold mb-3 d-flex align-items-center gap-2">
                                <UserCheck size={16} />
                                <span>Ultimi Ingressi Registrati in questa postazione:</span>
                            </h6>
                            <ul className="list-group list-group-flush rounded-3">
                                {recentCheckIns.map((item, index) => (
                                    <li
                                        key={index}
                                        className="list-group-item d-flex justify-content-between align-items-center py-2 px-3"
                                        style={{ background: '#0b1424', color: '#e2e8f0', borderBottom: '1px solid #1c2d4a' }}
                                    >
                                        <span>🟢 {item.name}</span>
                                        <span className="font-monospace text-secondary small">{item.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
