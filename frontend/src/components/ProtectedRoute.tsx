import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const { user, isLoading, authError, retrySession } = useAuth();

    if (isLoading) {
        return <div className="route-loader" role="status"><span className="spinner" />Caricamento sessione…</div>;
    }
    if (authError) {
        return (
            <div className="service-unavailable" role="alert">
                <WifiOff size={30} />
                <h1>Server non disponibile</h1>
                <p>{authError}</p>
                <button className="button primary" onClick={() => void retrySession()}><RefreshCw size={16} /> Riprova</button>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/scan'} replace />;
    }
    return <>{children}</>;
}
