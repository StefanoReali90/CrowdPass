import { apiFetch } from './client';
import type { Event, EventDashboardResponse } from '../types';


export async function getEvents(): Promise<Event[]> {
    return await apiFetch<Event[]>('/events');
}

export async function getMyEvents(): Promise<Event[]> {
    return await apiFetch<Event[]>('/events/my-events');
}

export async function getEventById(eventId: number): Promise<Event> {
    return await apiFetch<Event>(`/events/${eventId}`);
}

export async function getEventDashboard(eventId: number): Promise<EventDashboardResponse> {
    return await apiFetch<EventDashboardResponse>(`/events/${eventId}/dashboard`);
}
export async function incrementWalkInCount(eventId: number): Promise<void> {
    await apiFetch<void>(`/events/${eventId}/walk-in`, {
        method: 'PATCH',
    });
}
export async function decrementWalkInCount(eventId: number): Promise<void> {
    await apiFetch<void>(`/events/${eventId}/walk-in/decrement`, {
        method: 'PATCH',
    });
}

export async function closeEvent(eventId: number): Promise<void> {
    await apiFetch<void>(`/events/${eventId}/close`, {
        method: 'PATCH',
    });
}

export async function createEvent(data: import('../types').CreateEventRequest): Promise<Event> {
    return await apiFetch<Event>('/events/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
