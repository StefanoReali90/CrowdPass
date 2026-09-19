import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { RefreshCw, Search, ShieldCheck, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { deleteUser, getUserByEmail, getUserById, getUsers, registerStaff } from '../api/auth';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { User } from '../types';

interface LookupResult {
    user: User;
    source: string;
    internalId?: number;
}

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [lookup, setLookup] = useState<LookupResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searching, setSearching] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setUsers(await getUsers());
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Impossibile caricare gli utenti.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        getUsers()
            .then((allUsers) => {
                if (active) setUsers(allUsers);
            })
            .catch((requestError) => {
                if (active) setError(requestError instanceof Error ? requestError.message : 'Impossibile caricare gli utenti.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const createStaff = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setCreating(true);
        setError('');
        setMessage('');
        try {
            const created = await registerStaff({
                name: String(data.get('name')).trim(),
                surname: String(data.get('surname')).trim(),
                email: String(data.get('email')).trim(),
                password: String(data.get('password')),
            });
            form.reset();
            setMessage(`Account STAFF creato per ${created.name} ${created.surname}.`);
            await loadUsers();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Creazione account non riuscita.');
        } finally {
            setCreating(false);
        }
    };

    const searchByEmail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = String(data.get('email')).trim();
        setSearching(true);
        setError('');
        setMessage('');
        try {
            setLookup({ user: await getUserByEmail(email), source: `Email: ${email}` });
        } catch (requestError) {
            setLookup(null);
            setError(requestError instanceof Error ? requestError.message : 'Utente non trovato.');
        } finally {
            setSearching(false);
        }
    };

    const searchById = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const userId = Number(data.get('userId'));
        setSearching(true);
        setError('');
        setMessage('');
        try {
            setLookup({ user: await getUserById(userId), source: `ID interno: ${userId}`, internalId: userId });
            setDeleteId(String(userId));
        } catch (requestError) {
            setLookup(null);
            setError(requestError instanceof Error ? requestError.message : 'Utente non trovato.');
        } finally {
            setSearching(false);
        }
    };

    const removeUser = async (userId: number) => {
        setDeleting(true);
        setError('');
        setMessage('');
        try {
            await deleteUser(userId);
            setLookup(null);
            setDeleteId('');
            await loadUsers();
            setMessage(`Utente #${userId} eliminato.`);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Eliminazione non riuscita.');
        } finally {
            setDeleting(false);
            setPendingDeleteId(null);
        }
    };

    const submitDelete = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userId = Number(deleteId);
        if (!Number.isInteger(userId) || userId <= 0) {
            setError('Inserisci un ID utente valido.');
            return;
        }
        setPendingDeleteId(userId);
    };

    return (
        <section className="workspace-page">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">Amministrazione / Utenti</span>
                    <h1>La squadra al completo<span className="accent-text">.</span></h1>
                    <p>Crea gli account STAFF e gestisci le utenze interne.</p>
                </div>
                <button className="button" onClick={() => void loadUsers()} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Aggiorna
                </button>
            </div>

            {error && <div className="notice error" role="alert">{error}</div>}
            {message && <div className="notice success" role="status">{message}</div>}

            <div className="management-grid users-grid">
                <article className="panel editor-panel">
                    <div className="panel-heading"><div><span className="eyebrow">Nuovo operatore</span><h2>Crea account STAFF</h2></div><UserPlus size={21} /></div>
                    <p>Lo staff potrà accedere esclusivamente al controllo ingressi.</p>
                    <form className="management-form" onSubmit={createStaff}>
                        <div className="field-row">
                            <label>Nome<input name="name" autoComplete="given-name" required /></label>
                            <label>Cognome<input name="surname" autoComplete="family-name" required /></label>
                        </div>
                        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                        <label>Password iniziale<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={100} required /></label>
                        <button className="button primary full" disabled={creating}><UserPlus size={16} />{creating ? 'Creazione…' : 'Crea account STAFF'}</button>
                    </form>
                </article>

                <div>
                    <article className="panel lookup-panel">
                        <div className="panel-heading"><div><span className="eyebrow">Ricerca puntuale</span><h2>Trova un utente</h2></div><Search size={20} /></div>
                        <div className="lookup-forms">
                            <form onSubmit={searchByEmail}><label>Email<input name="email" type="email" placeholder="staff@evento.it" required /></label><button className="button" disabled={searching}><Search size={15} /> Cerca per email</button></form>
                            <form onSubmit={searchById}><label>ID interno<input name="userId" type="number" min="1" step="1" required /></label><button className="button" disabled={searching}><Search size={15} /> Cerca per ID</button></form>
                        </div>

                        {lookup && (
                            <div className="lookup-result">
                                <span className="avatar large">{lookup.user.name[0]}{lookup.user.surname[0]}</span>
                                <div><strong>{lookup.user.name} {lookup.user.surname}</strong><small>{lookup.user.email} · {lookup.user.role}</small><small>{lookup.source}</small></div>
                                {lookup.internalId && <button className="icon-button danger" onClick={() => setPendingDeleteId(lookup.internalId!)} disabled={deleting} aria-label="Elimina utente"><Trash2 size={17} /></button>}
                            </div>
                        )}
                    </article>

                    <article className="panel destructive-panel">
                        <div><span className="eyebrow">Zona riservata</span><h2>Elimina per ID</h2><p>La risposta dell’API non include gli ID nella lista utenti: usa l’ID interno per la cancellazione.</p></div>
                        <form className="inline-danger-form" onSubmit={submitDelete}>
                            <input aria-label="ID utente da eliminare" placeholder="ID utente" inputMode="numeric" value={deleteId} onChange={(event) => setDeleteId(event.target.value)} />
                            <button className="button danger" disabled={deleting || !deleteId.trim()}><Trash2 size={15} />{deleting ? 'Eliminazione…' : 'Elimina'}</button>
                        </form>
                    </article>
                </div>
            </div>

            <div className="result-heading">
                <div><span className="eyebrow">Directory</span><h2>{loading ? 'Caricamento…' : `${users.length} utenti interni`}</h2></div>
            </div>

            {!loading && users.length === 0 ? (
                <div className="panel empty-state"><UsersRound size={28} /><h2>Nessun utente trovato</h2></div>
            ) : (
                <div className="user-cards" aria-busy={loading}>
                    {users.map((user) => (
                        <article className="panel user-card" key={user.email}>
                            <span className="avatar large">{user.name[0]}{user.surname[0]}</span>
                            <div><strong>{user.name} {user.surname}</strong><span>{user.email}</span></div>
                            <span className={`role-badge role-${user.role.toLowerCase()}`}><ShieldCheck size={13} />{user.role}</span>
                        </article>
                    ))}
                </div>
            )}
            <ConfirmDialog
                open={pendingDeleteId !== null}
                title={`Eliminare l’utente #${pendingDeleteId ?? ''}?`}
                description="L’account perderà immediatamente l’accesso a PassHalo. Questa azione non può essere annullata."
                confirmLabel="Elimina utente"
                busy={deleting}
                onCancel={() => setPendingDeleteId(null)}
                onConfirm={() => pendingDeleteId ? removeUser(pendingDeleteId) : undefined}
            />
        </section>
    );
}
