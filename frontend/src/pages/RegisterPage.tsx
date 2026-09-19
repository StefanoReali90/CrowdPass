import { useState, type FormEvent } from 'react';
import { ArrowRight, UserPlus } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { registerAdmin } from '../api/auth';
import { useAuth } from '../context/useAuth';

export function RegisterPage() {
    const { user } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [complete, setComplete] = useState(false);

    if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/scan'} replace />;

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setError('');
        try {
            await registerAdmin({
                name: String(data.get('name')).trim(),
                surname: String(data.get('surname')).trim(),
                email: String(data.get('email')).trim(),
                password: String(data.get('password')),
            });
            setComplete(true);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Registrazione non riuscita.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="form-page register-page">
            <div className="form-intro">
                <span className="eyebrow"><UserPlus size={14} /> Nuovo organizzatore</span>
                <h1>Crea il tuo spazio<span className="accent-text">.</span></h1>
                <p>Registra un account amministratore per pubblicare e gestire gli eventi.</p>
            </div>
            <div className="panel form-panel">
                {error && <div className="notice error" role="alert">{error}</div>}
                {complete ? (
                    <div>
                        <div className="notice success" role="status">Account ADMIN creato. Ora puoi effettuare l’accesso.</div>
                        <Link className="button primary full" to="/login">Vai al login <ArrowRight size={16} /></Link>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <div className="field-row">
                            <label>Nome<input name="name" autoComplete="given-name" required /></label>
                            <label>Cognome<input name="surname" autoComplete="family-name" required /></label>
                        </div>
                        <label>Email di lavoro<input name="email" type="email" autoComplete="email" required /></label>
                        <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={100} required /></label>
                        <button className="button primary full" disabled={busy}><UserPlus size={17} />{busy ? 'Creazione…' : 'Crea account'}</button>
                    </form>
                )}
                <p className="form-note auth-switch">Hai già un account? <Link className="text-link" to="/login">Accedi</Link></p>
            </div>
        </section>
    );
}
