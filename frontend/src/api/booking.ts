import { apiFetch } from './client';
import type { BookingRequest, BookingResponse, CheckInResponse } from '../types';

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
    return await apiFetch<BookingResponse>('/bookings/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getBookingByUUID(uuid: string): Promise<BookingResponse> {
    return await apiFetch<BookingResponse>(`/bookings/${uuid}`);
}

export async function checkInBooking(uuid: string): Promise<CheckInResponse> {
    return await apiFetch<CheckInResponse>(`/bookings/check-in/${uuid}`, {
        method: 'PATCH',
    });
}

