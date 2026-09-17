import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAdmin } from '../api/auth';
import { useAuth } from '../context/useAuth';
import { UserPlus, Lock, Mail, User, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registrationCode, setRegistrationCode] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Se già loggato, reindirizza
    React.useEffect(() => {
        if (user) {
            navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/scan');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await registerAdmin({
                name,
                surname,
                email,
                password,
                registrationCode,
            });

            setSuccessMessage('Account Amministratore creato con successo! Reindirizzamento al login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error
                ? err.message
                : 'Errore durante la registrazione. Verifica la chiave di registrazione o se l\'email esiste già.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-6">
                    <div className="cp-card text-white">
                        <div className="cp-card-header p-4 text-center">
                            <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-20 text-info mb-3">
                                <UserPlus size={36} />
                            </div>
                            <h3 className="fw-bolder mb-1">Registrazione Organizzatore</h3>
                            <p className="text-muted small mb-0">
                                Crea il tuo account Amministratore per pubblicare e gestire il tuo evento
                            </p>
                        </div>

                        <div className="p-4 p-md-5">
                            {errorMessage && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {successMessage && (
                                <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4" role="alert">
                                    <CheckCircle2 size={18} />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                            <User size={15} />
                                            <span>NOME</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control cp-input"
                                            placeholder="Mario"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                            <User size={15} />
                                            <span>COGNOME</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control cp-input"
                                            placeholder="Rossi"
                                            value={surname}
                                            onChange={(e) => setSurname(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                        <Mail size={15} />
                                        <span>EMAIL DI LAVORO</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control cp-input"
                                        placeholder="organizzatore@evento.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                        <Lock size={15} />
                                        <span>PASSWORD (MIN. 8 CARATTERI)</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control cp-input"
                                        placeholder="••••••••"
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-2">
                                        <KeyRound size={15} />
                                        <span>CHIAVE DI REGISTRAZIONE AMMINISTRATORE</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control cp-input"
                                        placeholder="Codice segreto di sistema (REGISTRATION_KEY)"
                                        value={registrationCode}
                                        onChange={(e) => setRegistrationCode(e.target.value)}
                                        required
                                    />
                                    <small className="text-muted" style={{ fontSize: '11px' }}>
                                        Codice di sicurezza per abilitare i privilegi di gestione dell'evento.
                                    </small>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-3d btn-3d-primary w-100 py-3 fs-5 d-flex align-items-center justify-content-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    <UserPlus size={20} />
                                    <span>{isSubmitting ? 'Creazione in corso...' : 'Crea Account Organizzatore'}</span>
                                </button>
                            </form>

                            <div className="mt-4 pt-3 border-top border-dark text-center">
                                <span className="text-secondary small">Hai già un account? </span>
                                <Link to="/login" className="text-info fw-bold small text-decoration-none ms-1">
                                    Accedi qui
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
