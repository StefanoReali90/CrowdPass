import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Se l'utente è già loggato, reindirizza alla sua pagina di competenza
    React.useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/staff/scan');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await login({ email, password });
            // Il reindirizzamento avverrà nel useEffect appena user viene popolato
        } catch (err: any) {
            setErrorMessage(err.message || 'Credenziali non valide o errore di connessione');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="cp-card text-white">
                        <div className="cp-card-header p-4 text-center">
                            <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-20 text-info mb-3">
                                <ShieldCheck size={36} />
                            </div>
                            <h3 className="fw-bolder mb-1">Area Riservata</h3>
                            <p className="text-muted small mb-0">Accesso esclusivo per Staff & Amministratori</p>
                        </div>

                        <div className="p-4 p-md-5">
                            {errorMessage && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                        <Mail size={16} />
                                        <span>EMAIL DI SERVIZIO</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control cp-input"
                                        placeholder="admin@example.com o staff@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                        <Lock size={16} />
                                        <span>PASSWORD</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control cp-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-3d btn-3d-primary w-100 py-3 fs-5 d-flex align-items-center justify-content-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    <LogIn size={20} />
                                    <span>{isSubmitting ? 'Accesso in corso...' : 'Accedi al Sistema'}</span>
                                </button>
                            </form>

                            <div className="mt-4 pt-3 border-top border-dark text-center">
                                <small className="text-muted">
                                    Credenziali predefinite: <br />
                                    <span className="text-info font-monospace">admin@example.com</span> / <span className="text-info font-monospace">admin123</span><br />
                                    <span className="text-info font-monospace">staff@example.com</span> / <span className="text-info font-monospace">staff123</span>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
