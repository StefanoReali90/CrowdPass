import { apiFetch } from './client';
import type {
  BookingRequest,
  BookingResponse,
  CheckInResponse,
  PassHaloEvent,
  EventDashboardResponse,
  EventRequest,
  LoginResponse,
  User,
} from '../types';

const segment = (value: string) => encodeURIComponent(value.trim());

export const api = {
  login(email: string, password: string) {
    return apiFetch<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  registerAdmin(data: { name: string; surname: string; email: string; password: string }) {
    return apiFetch<User>('/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  currentUser() {
    return apiFetch<User>('/user/me');
  },

  events() {
    return apiFetch<PassHaloEvent[]>('/events');
  },

  myEvents() {
    return apiFetch<PassHaloEvent[]>('/events/my-events');
  },

  createEvent(data: EventRequest) {
    return apiFetch<PassHaloEvent>('/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent(eventId: number, data: EventRequest) {
    return apiFetch<PassHaloEvent>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent(eventId: number) {
    return apiFetch<void>(`/events/${eventId}`, { method: 'DELETE' });
  },

  dashboard(eventId: number) {
    return apiFetch<EventDashboardResponse>(`/events/${eventId}/dashboard`);
  },

  createBooking(data: BookingRequest) {
    return apiFetch<BookingResponse>('/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  bookings() {
    return apiFetch<BookingResponse[]>('/bookings/');
  },

  cancelBooking(uuid: string) {
    return apiFetch<void>(`/bookings/${segment(uuid)}`, { method: 'DELETE' });
  },

  checkIn(uuid: string) {
    return apiFetch<CheckInResponse>(`/bookings/check-in/${segment(uuid)}`, { method: 'PATCH' });
  },

  incrementWalkIn(eventId: number) {
    return apiFetch<void>(`/events/${eventId}/walk-in`, { method: 'PATCH' });
  },

  decrementWalkIn(eventId: number) {
    return apiFetch<void>(`/events/${eventId}/walk-in/decrement`, { method: 'PATCH' });
  },

  closeEvent(eventId: number) {
    return apiFetch<void>(`/events/${eventId}/close`, { method: 'PATCH' });
  },
};
