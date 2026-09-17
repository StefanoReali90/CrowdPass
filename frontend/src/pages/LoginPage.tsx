import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/useAuth';
export function LoginPage() {
 const { login, user, isLoading } = useAuth(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
 if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/scan'} replace />;
 const submit = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const data = new FormData(e.currentTarget); setBusy(true); setError(''); try { await login({ email: String(data.get('email')), password: String(data.get('password')) }); } catch (err) { setError(err instanceof Error ? err.message : 'Accesso non riuscito. Riprova.'); } finally { setBusy(false); } };
 return <section className="form-page login-page"><div className="form-intro"><span className="eyebrow"><LockKeyhole size={14} /> Area riservata</span><h1>Bentornato<span className="accent-text">.</span></h1><p>Accedi per gestire l’evento o controllare gli ingressi.</p></div><div className="panel form-panel"><form onSubmit={submit}>{error && <div className="notice error" role="alert">{error}</div>}<label>Email<input name="email" type="email" autoComplete="username" placeholder="nome@organizzazione.it" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="La tua password" required /></label><button className="button primary full" disabled={busy || isLoading}>{busy ? 'Accesso in corso…' : 'Accedi'}<ArrowRight size={17} /></button></form><p className="form-note">Gli amministratori accedono alla dashboard; lo staff al solo controllo ingressi.</p></div></section>;
}
