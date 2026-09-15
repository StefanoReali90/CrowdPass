export interface User {
    name: string;
    surname: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
}

export interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    startDateTime: string;
    endDateTime: string;
    bookingPrice: number;
    normalPrice: number;
    totalTickets: number;
    eventState: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
    imageUrl: string;
}

export interface BookingRequest {
    name: string;
    surname: string;
    email: string;
    phone: string;
    eventId: number;
    marketingConsent: boolean;
}

export interface BookingResponse {
    uuid: string;
    name: string;
    surname: string;
    email: string;
    phone: string | null;
    eventId: number;
    eventName: string;
    bookingStatus: 'CREATED' | 'VALIDATED' | 'CANCELLED';
    createdAt: string;
    qrCodeBase64: string;
    marketingConsent: boolean;
}

export interface CheckInResponse {
    eventName: string;
    name: string;
    surname: string;
}

export interface EventDashboardResponse {
    eventId: number;
    eventName: string;
    totalTickets: number;
    totalBookings: number;
    checkedInCount: number;
    noShowCount: number;
    attendanceRate: number;
    estimatedBookingRevenue: number;
    walkInCount: number;
    totalAttendees: number;
    totalRevenue: number;
}

export interface AdminRegisterRequest {
    name: string;
    surname: string;
    email: string;
    password: string;
    registrationCode: string;
}

export interface CreateEventRequest {
    name: string;
    description: string;
    location: string;
    start: string;
    end: string;
    imageUrl: string;
    totalTickets: number;
    normalPrice: number;
    bookingPrice: number;
}
