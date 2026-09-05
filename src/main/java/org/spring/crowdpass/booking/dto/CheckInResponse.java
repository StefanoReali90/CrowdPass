package org.spring.crowdpass.booking.dto;

public record CheckInResponse(
        String eventName,
        String name,
        String surname
) {
}
