import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: Array<'ADMIN' | 'STAFF'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
                    <h4 className="alert-heading">Accesso Negato</h4>
                    <p className="mb-0">Non hai i permessi necessari per visualizzare questa pagina.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
