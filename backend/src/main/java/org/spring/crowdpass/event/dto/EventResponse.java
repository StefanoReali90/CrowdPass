package org.spring.crowdpass.event.dto;

import org.spring.crowdpass.event.enums.EventState;

import java.time.LocalDateTime;
import java.util.List;

public record EventResponse(
        Long id,
        String name,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        Double normalPrice,
        Double bookingPrice,
        int totalTickets,
        String description,
        String imageUrl,
        String location,
        EventState eventState,
        String videoUrl,
        List<EventFaqDTO> faqs
) {
}
