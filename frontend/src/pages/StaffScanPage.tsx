import { useState, type FormEvent } from 'react';
import { CheckCircle2, QrCode, XCircle } from 'lucide-react';
import { checkInBooking } from '../api/booking';

export function StaffScanPage() {
    const [token, setToken] = useState('');
    const [busy, setBusy] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const check = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const uuid = token.trim();
        if (!uuid || busy) return;

        setBusy(true);
        setSuccess(null);
        setError(null);

        try {
            const result = await checkInBooking(uuid);
            setSuccess(`${result.name} ${result.surname} · ${result.eventName}`);
            setToken('');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Codice non valido o già utilizzato.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="form-page">
            <div className="form-intro">
                <span className="eyebrow"><QrCode size={15} /> Controllo ingressi</span>
                <h1>Un pass. Un ingresso.</h1>
                <p>Inserisci il codice del pass o usa un lettore QR collegato alla tastiera.</p>
            </div>

            <div className="panel form-panel">
                {success && (
                    <div className="notice success" role="status">
                        <CheckCircle2 size={17} />
                        <span><strong>OK</strong> · Ingresso convalidato per {success}.</span>
                    </div>
                )}
                {error && (
                    <div className="notice error" role="alert">
                        <XCircle size={17} />
                        <span><strong>KO</strong> · {error}</span>
                    </div>
                )}

                <form onSubmit={check}>
                    <label htmlFor="pass-code">Codice del pass</label>
                    <input
                        id="pass-code"
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        placeholder="UUID del biglietto"
                        autoComplete="off"
                        autoFocus
                        required
                    />
                    <button className="button primary full" disabled={busy || !token.trim()}>
                        {busy ? 'Verifica in corso…' : 'Convalida ingresso'}
                    </button>
                </form>

                <p className="form-note scan-help">Il personale STAFF può solo verificare i pass. Le statistiche dell’evento restano riservate all’amministratore.</p>
            </div>
        </section>
    );
}
