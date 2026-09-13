const API_BASE_URL = "http://localhost:8080";


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
        const message = errorData?.detail || errorData?.title || 'Error fetching data';
        throw new Error(message);
    }
    if (response.status === 204){
        return null as T;
    }

    return await response.json();
}