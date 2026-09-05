package org.spring.crowdpass.event.dto;

public record EventDashboardResponse(
    Long eventId,
    String eventName,
    int totalTickets,
    long totalBookings,
    long checkedInCount,
    long noShowCount,
    double attendanceRate,
    double estimatedBookingRevenue,
    int walkInCount,
    long totalAttendees,
    double totalRevenue
) {
}
