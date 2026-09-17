import { createContext } from 'react';
import type { LoginCredentials } from '../api/auth';
import type { User } from '../types';

export interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    authError: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    retrySession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
