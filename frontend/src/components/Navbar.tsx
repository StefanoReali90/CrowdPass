import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronDown, KeyRound, LayoutDashboard, LogOut, Menu, Moon, ScanLine, Sun, TicketCheck, UsersRound, X } from 'lucide-react';
import { Brand } from './Brand';
import { useAuth } from '../context/useAuth';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('cp-theme') === 'light' ? 'light' : 'dark');
    const [accent, setAccent] = useState(() => localStorage.getItem('cp-accent') || 'lime');
    const menu = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.accent = accent;
        localStorage.setItem('cp-theme', theme);
        localStorage.setItem('cp-accent', accent);
    }, [theme, accent]);

    useEffect(() => {
        const close = (event: PointerEvent) => {
            if (!menu.current?.contains(event.target as Node)) setOpen(false);
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                setNavOpen(false);
                menu.current?.querySelector('button')?.focus();
            }
        };
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('pointerdown', close);
            document.removeEventListener('keydown', escape);
        };
    }, []);

    const exit = async () => {
        setBusy(true);
        setError('');
        try {
            await logout();
            setOpen(false);
            navigate('/login');
        } catch {
            setError('Uscita non riuscita. Riprova.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <header className="topbar">
            <Brand />
            {user && (
                <nav id="primary-navigation" aria-label="Navigazione area riservata" className={`nav-links ${navOpen ? 'is-open' : ''}`}>
                    {user.role === 'ADMIN' && <NavLink to="/admin/dashboard" onClick={() => setNavOpen(false)}><LayoutDashboard size={16} />Dashboard</NavLink>}
                    {user.role === 'ADMIN' && <NavLink to="/admin/events" onClick={() => setNavOpen(false)}><CalendarDays size={16} />Eventi</NavLink>}
                    {user.role === 'ADMIN' && <NavLink to="/admin/bookings" onClick={() => setNavOpen(false)}><TicketCheck size={16} />Prenotazioni</NavLink>}
                    {user.role === 'ADMIN' && <NavLink to="/admin/users" onClick={() => setNavOpen(false)}><UsersRound size={16} />Staff</NavLink>}
                    <NavLink to="/staff/scan" onClick={() => setNavOpen(false)}><ScanLine size={16} />Ingressi</NavLink>
                </nav>
            )}

            <div className="topbar-end">
                {user && (
                    <button
                        className="icon-button mobile-nav-toggle"
                        type="button"
                        aria-label={navOpen ? 'Chiudi navigazione' : 'Apri navigazione'}
                        aria-expanded={navOpen}
                        aria-controls="primary-navigation"
                        onClick={() => setNavOpen((current) => !current)}
                    >
                        {navOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                )}
                <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro'}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {user && (
                    <div className="profile" ref={menu}>
                        <button className="profile-trigger" aria-expanded={open} aria-controls="profile-panel" onClick={() => setOpen(!open)}>
                            <span className="avatar">{user.name.slice(0, 1)}{user.surname.slice(0, 1)}</span>
                            <span className="profile-name">{user.name} {user.surname}<small>{user.role === 'ADMIN' ? 'Amministratore' : 'Staff'}</small></span>
                            <ChevronDown size={15} />
                        </button>
                        {open && (
                            <div id="profile-panel" className="profile-panel">
                                <strong>{user.name} {user.surname}</strong>
                                <p>{user.email}</p>
                                <NavLink className="profile-link" to="/account" onClick={() => setOpen(false)}><KeyRound size={15} /> Sicurezza account</NavLink>
                                <hr />
                                <span className="eyebrow">Aspetto</span>
                                <div className="theme-options">
                                    {['dark', 'light'].map((value) => <button key={value} className="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value === 'dark' ? 'Scuro' : 'Chiaro'}</button>)}
                                </div>
                                <span className="eyebrow">Colore accento</span>
                                <div className="swatches">
                                    {['lime', 'blue', 'rose', 'orange'].map((value) => <button key={value} className={`swatch ${value}`} aria-label={`Colore ${value}`} aria-pressed={accent === value} onClick={() => setAccent(value)} />)}
                                </div>
                                <hr />
                                {error && <p role="alert" className="menu-error">{error}</p>}
                                <button className="logout-button" disabled={busy} onClick={() => void exit()}><LogOut size={16} />{busy ? 'Uscita…' : 'Esci'}</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
