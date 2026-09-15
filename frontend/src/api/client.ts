const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');


export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.detail
            || errorData?.message
            || errorData?.title
            || `Richiesta non riuscita (HTTP ${response.status}).`;
        throw new Error(message);
    }
    if (response.status === 204){
        return null as T;
    }

    const body = await response.text();
    return body.trim() ? JSON.parse(body) as T : null as T;
}
