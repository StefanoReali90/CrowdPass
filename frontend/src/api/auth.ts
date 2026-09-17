import { apiFetch } from './client';
import type { User } from '../types';

export interface LoginCredentials {
    email: string;
    password: string;
}



export async function login(credentials: LoginCredentials): Promise<void> {
    await apiFetch<void>('/user/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function getCurrentUser(): Promise<User> {
    return await apiFetch<User>('/user/me');
}

export async function logout(): Promise<void> {
    await apiFetch<void>('/user/logout', {
        method: 'POST',
    });
}

export async function registerAdmin(data: import('../types').AdminRegisterRequest): Promise<User> {
    return await apiFetch<User>('/user/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}