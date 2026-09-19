import { useState, type FormEvent } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recoverPassword } from '../api/auth';

export function ForgotPasswordPage() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setError('');
        try {
            await recoverPassword({ email: String(data.get('email')).trim() });
            setSent(true);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Richiesta non riuscita.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="form-page login-page">
            <div className="form-intro">
                <span className="eyebrow"><Mail size={14} /> Recupero credenziali</span>
                <h1>Ripartiamo<span className="accent-text">.</span></h1>
                <p>Inserisci l’email collegata al tuo account PassHalo.</p>
            </div>
            <div className="panel form-panel">
                {error && <div className="notice error" role="alert">{error}</div>}
                {sent ? (
                    <div>
                        <div className="notice success" role="status">Richiesta acquisita. Se l’account esiste, la procedura di recupero è stata avviata.</div>
                        <Link className="button primary full" to="/reset-password">Ho già un token di recupero</Link>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <label>Email<input name="email" type="email" autoComplete="email" placeholder="nome@organizzazione.it" required /></label>
                        <button className="button primary full" disabled={busy}><Mail size={16} />{busy ? 'Invio…' : 'Avvia recupero'}</button>
                    </form>
                )}
                <Link className="text-link form-back-link" to="/login"><ArrowLeft size={14} /> Torna al login</Link>
            </div>
        </section>
    );
}
