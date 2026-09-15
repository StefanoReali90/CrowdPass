import { useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../api/auth';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Awaited<ReturnType<typeof getCurrentUser>> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((currentUser) => setUser(currentUser))
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (credentials: Parameters<typeof apiLogin>[0]) => {
        await apiLogin(credentials);
        setUser(await getCurrentUser());
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
