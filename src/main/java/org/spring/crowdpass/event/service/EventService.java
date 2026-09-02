package org.spring.crowdpass.event.service;

import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.event.EventRepository;
import org.spring.crowdpass.event.dto.EventRequest;
import org.spring.crowdpass.event.dto.EventResponse;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.exception.EventNotFoundException;
import org.spring.crowdpass.event.exception.InvalidDateException;
import org.spring.crowdpass.event.exception.InvalidPriceException;
import org.spring.crowdpass.event.mapper.EventMapper;
import org.spring.crowdpass.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    private final EventMapper eventMapper;

    private void validateEventDates(EventRequest event) {
        if (event.start().isAfter(event.end())) {
            throw new InvalidDateException("Start date must be before end date");
        }
        if (!(event.bookingPrice() < event.normalPrice())) {
            throw new InvalidPriceException("Booking price must be less than normal price");
        }
    }

    @Transactional
    public EventResponse createEvent(EventRequest event, User admin) {
        validateEventDates(event);
        Event newEvent = eventMapper.toEntity(event);
        newEvent.setUser(admin);
        Event savedEvent = eventRepository.save(newEvent);
        return eventMapper.toResponse(savedEvent);
    }
    @Transactional
    public EventResponse updateEvent(EventRequest event, Long Id) {
        Event existingEvent = eventRepository.findById(Id).orElseThrow(() -> new EventNotFoundException("Event not found with id: " + Id));
        validateEventDates(event);
        existingEvent.setName(event.name());
        existingEvent.setDescription(event.description());
        existingEvent.setLocation(event.location());
        existingEvent.setStartDateTime(event.start());
        existingEvent.setEndDateTime(event.end());
        existingEvent.setImageUrl(event.imageUrl());
        existingEvent.setTotalTickets(event.totalTickets());
        existingEvent.setNormalPrice(event.normalPrice());
        existingEvent.setBookingPrice(event.bookingPrice());
        Event updatedEvent = eventRepository.save(existingEvent);
        return eventMapper.toResponse(updatedEvent);

    }
    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
        return eventMapper.toResponse(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream().map(eventMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByUser(Long userId) {
        return eventRepository.findByUserId(userId).stream()
                .map(eventMapper::toResponse)
                .toList();
    }

    @Transactional
    public void deleteEventById(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }


}
