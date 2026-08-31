package org.spring.crowdpass.event.service;

import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.event.EventRepository;
import org.spring.crowdpass.event.dto.EventRequest;
import org.spring.crowdpass.event.dto.EventResponse;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.exception.InvalidDateException;
import org.spring.crowdpass.event.exception.InvalidPriceException;
import org.spring.crowdpass.event.mapper.EventMapper;
import org.spring.crowdpass.user.entity.User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    private final EventMapper eventMapper;


    public EventResponse createEvent(EventRequest event, User admin) {
        if (event.start().isAfter(event.end())) {
            throw new InvalidDateException("Start date must be before end date");
        }
        if (!(event.bookingPrice() < event.normalPrice())) {
            throw new InvalidPriceException("Booking price must be less than normal price");
        }
        Event newEvent = eventMapper.toEntity(event);
        newEvent.setUser(admin);
        Event savedEvent = eventRepository.save(newEvent);
        return eventMapper.toResponse(savedEvent);
    }

}
