import React, { useState } from 'react';
import type { BookingResponse } from '../types';
import { createBooking } from '../api/booking';
import { Sparkles, CheckCircle2, Download, AlertCircle } from 'lucide-react';

export const BookingPage: React.FC = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [marketingConsent, setMarketingConsent] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await createBooking({
                name,
                surname,
                email,
                phone,
                eventId: 1, // ID evento principale
                marketingConsent,
            });
            setBookingResult(response);
        } catch (err: any) {
            setErrorMessage(err.message || 'Impossibile completare la prenotazione');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Funzione per scaricare il QR Code come file PNG
    const handleDownloadQr = () => {
        if (!bookingResult) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${bookingResult.qrCode}`;
        link.download = `CrowdPass_${bookingResult.name}_${bookingResult.surname}.png`;
        link.click();
    };

    // SCHERMATA DI SUCCESSO: BIGLIETTO CON QR CODE
    if (bookingResult) {
        return (
            <div className="container py-5 text-center">
                <div className="cp-card mx-auto p-4 p-md-5 text-white" style={{ maxWidth: '520px', border: '1.5px solid #0ea5e9' }}>
                    <div className="d-flex justify-content-center mb-3">
                        <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success">
                            <CheckCircle2 size={48} />
                        </div>
                    </div>
                    <h2 className="fw-bolder text-white mb-1">Prenotazione Confermata!</h2>
                    <p className="text-muted small mb-4">
                        Il tuo posto con ingresso ridotto è riservato. Mostra questo QR Code alla cassa.
                    </p>

                    {/* QR Code Container in rilievo */}
                    <div className="p-3 rounded-4 bg-white d-inline-block shadow-lg my-2">
                        <img
                            src={`data:image/png;base64,${bookingResult.qrCode}`}
                            alt="QR Code Biglietto"
                            className="img-fluid"
                            style={{ width: '220px', height: '220px' }}
                        />
                    </div>

                    {/* Dettagli Biglietto */}
                    <div className="rounded-3 p-3 my-4 text-start" style={{ background: '#0a1424', border: '1px solid #233554' }}>
                        <div className="d-flex justify-content-between py-1 border-bottom border-dark small">
                            <span className="text-muted">Intestatario:</span>
                            <span className="fw-bold text-white">{bookingResult.name} {bookingResult.surname}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom border-dark small">
                            <span className="text-muted">Email:</span>
                            <span className="fw-bold text-white">{bookingResult.email}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 small">
                            <span className="text-muted">Codice Ticket:</span>
                            <span className="font-monospace text-info small">{bookingResult.uuid.substring(0, 18)}...</span>
                        </div>
                    </div>

                    <div className="d-grid gap-2">
                        <button
                            className="btn-3d btn-3d-success py-3 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleDownloadQr}
                        >
                            <Download size={20} />
                            <span>Scarica Biglietto QR Code</span>
                        </button>
                        <button
                            className="btn-3d btn-3d-secondary py-2 mt-2"
                            onClick={() => {
                                setBookingResult(null);
                                setName('');
                                setSurname('');
                                setEmail('');
                                setPhone('');
                            }}
                        >
                            Effettua un'altra prenotazione
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // FORM DI PRENOTAZIONE INTEGRATO NEL LAYOUT BLU NOTTE
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-5">
                    <div className="cp-card text-white">
                        {/* Header Form */}
                        <div className="cp-card-header p-4 text-center">
                            <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill mb-2 small fw-bold" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', border: '1px solid #0ea5e9' }}>
                                <Sparkles size={14} />
                                <span>SALTA LA FILA & PREZZO RIDOTTO</span>
                            </div>
                            <h3 className="fw-bolder mb-1">🎟️ Prenota il tuo Pass</h3>
                            <p className="text-muted small mb-0">
                                Riserva subito il prezzo ridotto di <strong>10€</strong> invece di <strong>15€</strong> all'ingresso!
                            </p>
                        </div>

                        {/* Corpo Form */}
                        <div className="p-4">
                            {errorMessage && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary">NOME</label>
                                    <input
                                        type="text"
                                        className="form-control cp-input"
                                        placeholder="Mario"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary">COGNOME</label>
                                    <input
                                        type="text"
                                        className="form-control cp-input"
                                        placeholder="Rossi"
                                        value={surname}
                                        onChange={(e) => setSurname(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary">EMAIL</label>
                                    <input
                                        type="email"
                                        className="form-control cp-input"
                                        placeholder="mario.rossi@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary">TELEFONO (OPZIONALE)</label>
                                    <input
                                        type="tel"
                                        className="form-control cp-input"
                                        placeholder="+39 340 1234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div className="form-check mb-4">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="marketingCheck"
                                        checked={marketingConsent}
                                        onChange={(e) => setMarketingConsent(e.target.checked)}
                                    />
                                    <label className="form-check-label text-muted small user-select-none" htmlFor="marketingCheck">
                                        Voglio ricevere inviti e riduzioni sui prossimi eventi CrowdPass (GDPR)
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-3d btn-3d-primary w-100 py-3 fs-5"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Generazione QR Code...' : 'Conferma e Ricevi QR Code'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};