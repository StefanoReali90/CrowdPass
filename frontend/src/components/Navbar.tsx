import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LayoutDashboard, QrCode, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg border-bottom border-dark py-3" style={{ background: '#0a1222' }}>
            <div className="container">
                {/* Brand Logo */}
                <Link className="navbar-brand d-flex align-items-center gap-2 text-white fw-bolder fs-4 text-decoration-none" to="/">
                    <div className="p-2 rounded-3" style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}>
                        <Ticket size={24} color="#ffffff" />
                    </div>
                    <span>CROWD<span style={{ color: '#38bdf8' }}>PASS</span></span>
                </Link>

                {/* Navigazione a Pulsanti Grandi Tridimensionali */}
                <div className="d-flex align-items-center gap-3 ms-auto flex-wrap">
                    {/* Pulsante Eventi / Prenota (Pubblico) */}
                    <Link className="btn-3d btn-3d-nav d-flex align-items-center gap-2" to="/">
                        <Ticket size={18} />
                        <span>Prenota Ingresso</span>
                    </Link>

                    {/* Pulsante Dashboard (Solo ADMIN) */}
                    {user?.role === 'ADMIN' && (
                        <Link className="btn-3d btn-3d-nav d-flex align-items-center gap-2" to="/admin/dashboard" style={{ borderColor: '#38bdf8' }}>
                            <LayoutDashboard size={18} color="#38bdf8" />
                            <span style={{ color: '#38bdf8' }}>Dashboard Evento</span>
                        </Link>
                    )}

                    {/* Pulsante Scanner Ingressi (STAFF e ADMIN) */}
                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                        <Link className="btn-3d btn-3d-nav d-flex align-items-center gap-2" to="/staff/scan" style={{ borderColor: '#34d399' }}>
                            <QrCode size={18} color="#34d399" />
                            <span style={{ color: '#34d399' }}>Scanner Ingressi</span>
                        </Link>
                    )}

                    {/* Sezione Autenticazione (Pulsanti 3D) */}
                    {user ? (
                        <div className="d-flex align-items-center gap-2 ps-2 border-start border-secondary">
                            <span className="badge py-2 px-3 d-flex align-items-center gap-1 rounded-pill" style={{ background: '#1c2d4a', color: '#94a3b8', border: '1px solid #27375a' }}>
                                <UserIcon size={14} />
                                <strong className="text-white">{user.name}</strong>
                                <span className="text-info ms-1">({user.role})</span>
                            </span>
                            <button
                                className="btn-3d btn-3d-secondary py-2 px-3 d-flex align-items-center gap-1"
                                onClick={handleLogout}
                                title="Disconnettiti"
                            >
                                <LogOut size={16} />
                                <span>Esci</span>
                            </button>
                        </div>
                    ) : (
                        <Link className="btn-3d btn-3d-primary py-2 px-4 d-flex align-items-center gap-2" to="/login">
                            <LogIn size={18} />
                            <span>Accedi</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};