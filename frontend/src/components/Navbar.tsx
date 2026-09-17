import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import { Brand } from './Brand';
import { useAuth } from '../context/useAuth';
export function Navbar() {
 const { user, logout } = useAuth(); const navigate = useNavigate();
 const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
 const [theme, setTheme] = useState(() => localStorage.getItem('cp-theme') === 'light' ? 'light' : 'dark');
 const [accent, setAccent] = useState(() => localStorage.getItem('cp-accent') || 'lime');
 const menu = useRef<HTMLDivElement>(null);
 useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.accent = accent; localStorage.setItem('cp-theme', theme); localStorage.setItem('cp-accent', accent); }, [theme, accent]);
 useEffect(() => {
 const close = (e: PointerEvent) => { if (!menu.current?.contains(e.target as Node)) setOpen(false); };
 const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); menu.current?.querySelector('button')?.focus(); } };
 document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
 return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); }; }, []);
 const exit = async () => { setBusy(true); setError(''); try { await logout(); setOpen(false); navigate('/login'); } catch { setError('Uscita non riuscita. Riprova.'); } finally { setBusy(false); } };
 return <header className="topbar"><Brand />
 {user && <nav aria-label="Navigazione area riservata" className="nav-links">{user.role === 'ADMIN' && <NavLink to="/admin/dashboard"><LayoutDashboard size={16} />Dashboard</NavLink>}<NavLink to="/staff/scan">Controllo ingressi</NavLink></nav>}
 <div className="topbar-end"><button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
 {user && <div className="profile" ref={menu}><button className="profile-trigger" aria-expanded={open} aria-controls="profile-panel" onClick={() => setOpen(!open)}><span className="avatar">{user.name.slice(0,1)}{user.surname.slice(0,1)}</span><span className="profile-name">{user.name} {user.surname}<small>{user.role === 'ADMIN' ? 'Amministratore' : 'Staff'}</small></span><ChevronDown size={15} /></button>
 {open && <div id="profile-panel" className="profile-panel"><strong>{user.name} {user.surname}</strong><p>{user.email}</p><hr /><span className="eyebrow">Aspetto</span><div className="theme-options">{['dark','light'].map(t => <button key={t} className="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>{t === 'dark' ? 'Scuro' : 'Chiaro'}</button>)}</div><span className="eyebrow">Colore accento</span><div className="swatches">{['lime','blue','rose','orange'].map(c => <button key={c} className={`swatch ${c}`} aria-label={`Colore ${c}`} aria-pressed={accent === c} onClick={() => setAccent(c)} />)}</div><hr />{error && <p role="alert">{error}</p>}<button className="logout-button" disabled={busy} onClick={exit}><LogOut size={16} />{busy ? 'Uscita…' : 'Esci'}</button></div>}</div>}</div></header>;
}
