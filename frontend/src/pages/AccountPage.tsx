import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { changePassword } from '../api/auth';
import { useAuth } from '../context/useAuth';

export function AccountPage() {
    const { user } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const userId = Number(data.get('userId'));
        const newPassword = String(data.get('newPassword'));
        const confirmationPassword = String(data.get('confirmationPassword'));

        if (newPassword !== confirmationPassword) {
            setError('La nuova password e la conferma non coincidono.');
            return;
        }

        setBusy(true);
        setError('');
        setMessage('');
        try {
            await changePassword(userId, {
                oldPassword: String(data.get('oldPassword')),
                newPassword,
                confirmationPassword,
            });
            form.reset();
            setMessage('Password aggiornata con successo.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Cambio password non riuscito.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="workspace-page account-page">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Profilo / Sicurezza</span>
                    <h1>Il tuo account<span className="accent-text">.</span></h1>
                    <p>Controlla i dati della sessione e aggiorna la password.</p>
                </div>
            </div>

            <div className="account-grid">
                <article className="panel profile-summary">
                    <span className="avatar account-avatar">{user?.name[0]}{user?.surname[0]}</span>
                    <span className={`role-badge role-${user?.role.toLowerCase()}`}><ShieldCheck size={14} />{user?.role}</span>
                    <h2>{user?.name} {user?.surname}</h2>
                    <p>{user?.email}</p>
                </article>

                <article className="panel editor-panel">
                    <div className="panel-heading"><div><span className="eyebrow">Credenziali</span><h2>Cambia password</h2></div><KeyRound size={21} /></div>
                    <p className="contract-note">Il contratto API richiede l’ID numerico dell’account, ma il profilo corrente non lo restituisce. Inserisci qui il tuo ID interno.</p>
                    {error && <div className="notice error" role="alert">{error}</div>}
                    {message && <div className="notice success" role="status">{message}</div>}
                    <form className="management-form" onSubmit={submit}>
                        <label>ID account<input name="userId" type="number" inputMode="numeric" min="1" step="1" required /></label>
                        <label>Password attuale<input name="oldPassword" type="password" autoComplete="current-password" required /></label>
                        <label>Nuova password<input name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={100} required /></label>
                        <label>Conferma nuova password<input name="confirmationPassword" type="password" autoComplete="new-password" minLength={8} maxLength={100} required /></label>
                        <button className="button primary full" disabled={busy}><KeyRound size={16} />{busy ? 'Aggiornamento…' : 'Aggiorna password'}</button>
                    </form>
                </article>
            </div>
        </section>
    );
}
