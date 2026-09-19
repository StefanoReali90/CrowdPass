import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../api/auth';
import { AUTH_EXPIRED_EVENT, isApiError } from '../api/client';
import { AuthContext } from './auth-context';

const unavailableMessage = 'Il server PassHalo non è raggiungibile. Controlla che il backend sia avviato e riprova.';

function isMissingSession(error: unknown) {
    return isApiError(error) && (error.status === 401 || error.status === 403);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Awaited<ReturnType<typeof getCurrentUser>> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const expireSession = () => {
            setUser(null);
            setAuthError(null);
        };

        window.addEventListener(AUTH_EXPIRED_EVENT, expireSession);
        getCurrentUser()
            .then((currentUser) => {
                if (active) setUser(currentUser);
            })
            .catch((error: unknown) => {
                if (!active) return;
                if (isMissingSession(error)) setUser(null);
                else setAuthError(unavailableMessage);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
            window.removeEventListener(AUTH_EXPIRED_EVENT, expireSession);
        };
    }, []);

    const retrySession = useCallback(async () => {
        setIsLoading(true);
        setAuthError(null);
        try {
            setUser(await getCurrentUser());
        } catch (error) {
            if (isMissingSession(error)) setUser(null);
            else setAuthError(unavailableMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (credentials: Parameters<typeof apiLogin>[0]) => {
        setAuthError(null);
        await apiLogin(credentials);
        setUser(await getCurrentUser());
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
        setAuthError(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, authError, login, logout, retrySession }}>
            {children}
        </AuthContext.Provider>
    );
}
