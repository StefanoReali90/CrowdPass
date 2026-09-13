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
    walkInCount: number;
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
    id: number;
    uuid: string;
    name: string;
    surname: string;
    email: string;
    qrCode: string;
    bookingStatus: string;
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