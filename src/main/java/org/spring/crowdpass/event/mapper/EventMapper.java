package org.spring.crowdpass.event.mapper;

import org.spring.crowdpass.event.dto.EventRequest;
import org.spring.crowdpass.event.dto.EventResponse;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.enums.EventState;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toEntity(EventRequest eventRequest) {
        Event event = new Event();
        event.setName(eventRequest.name());
        event.setDescription(eventRequest.description());
        event.setLocation(eventRequest.location());
        event.setStartDateTime(eventRequest.start());
        event.setEndDateTime(eventRequest.end());
        event.setImageUrl(eventRequest.imageUrl());
        event.setTotalTickets(eventRequest.totalTickets());
        event.setNormalPrice(eventRequest.normalPrice());
        event.setBookingPrice(eventRequest.bookingPrice());
        event.setEventState(EventState.WAITING);
        return event;
    }

    public EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
               event.getStartDateTime(),
                event.getEndDateTime(),
                event.getNormalPrice(),
                event.getBookingPrice(),
                event.getTotalTickets(),
                event.getDescription(),
                event.getImageUrl(),
                event.getLocation(),
                event.getEventState()
        );
    }
}
