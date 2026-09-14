import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { getCurrentUser ,login as apilogin, logout as apilogout, type LoginCredentials } from '../api/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        getCurrentUser()
            .then((user) => setUser(user))
            .catch(()=> setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (credentials: LoginCredentials) => {
        await apilogin(credentials);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    }
    const logout = async () => {
    await apilogout();
    setUser(null);
    };
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
