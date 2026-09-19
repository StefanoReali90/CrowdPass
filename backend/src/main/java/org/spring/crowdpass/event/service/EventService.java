package org.spring.crowdpass.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.spring.crowdpass.booking.enums.BookingStatus;
import org.spring.crowdpass.booking.exception.EventFinishedException;
import org.spring.crowdpass.booking.repository.BookingRepository;
import org.spring.crowdpass.booking.service.BookingService;
import org.spring.crowdpass.event.dto.EventDashboardResponse;
import org.spring.crowdpass.event.entity.EventFaq;
import org.spring.crowdpass.event.enums.EventState;
import org.spring.crowdpass.event.exception.AccessDeniedException;
import org.spring.crowdpass.event.repository.EventRepository;
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
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    private final EventMapper eventMapper;
    private final BookingService bookingService;

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
        log.info("Event created successfully - ID: {}, Name: '{}', Created by Admin ID: {}", savedEvent.getId(), savedEvent.getName(), admin.getId());
        return eventMapper.toResponse(savedEvent);
    }
    @Transactional
    public EventResponse updateEvent(EventRequest event, Long Id, User admin) {
        Event existingEvent = eventRepository.findById(Id).orElseThrow(() -> new EventNotFoundException("Event not found with id: " + Id));
        if(!existingEvent.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to update this event");
        }
        if(existingEvent.getEventState().equals(EventState.FINISHED)) {
            throw new EventFinishedException("Cannot update a finished event");
        }
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
        existingEvent.setVideoUrl(event.videoUrl());
        if (event.faqs() != null) {
            List<EventFaq> eventFaqList = existingEvent.getFaqs();
            eventFaqList.clear();
            for (var faqDTO : event.faqs()) {
                EventFaq faq = new EventFaq();
                faq.setQuestion(faqDTO.question());
                faq.setAnswer(faqDTO.answer());
                eventFaqList.add(faq);
            }
        }
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
    public void deleteEventById(Long id, User admin) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
        if(!event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to delete this event");
        }
        if(event.getEventState().equals(EventState.FINISHED)) {
            throw new EventFinishedException("Cannot delete a finished event");
        }
        eventRepository.deleteById(id);
    }
    @Transactional
    public void incrementWalkInCount(Long eventId, User admin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
        if(!event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to register walk-in attendee for this event");
        }
        if(event.getEventState().equals(EventState.FINISHED)) {
            throw new EventFinishedException("Cannot register walk-in attendee for a finished event");
        }
        event.setWalkInCount(event.getWalkInCount() + 1);
        log.info("Walk-in attendee registered for Event ID: {} - New count: {}", eventId, event.getWalkInCount());
        eventRepository.save(event);
    }

    @Transactional
    public void decrementWalkInCount(Long eventId, User admin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
        if(!event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to decrement walk-in attendee count for this event");
        }
        if(event.getEventState().equals(EventState.FINISHED)) {
            throw new EventFinishedException("Cannot register walk-in attendee for a finished event");
        }
        if (event.getWalkInCount() > 0) {
            event.setWalkInCount(event.getWalkInCount() - 1);
            eventRepository.save(event);
        }
    }

    @Transactional(readOnly = true)
    public EventDashboardResponse getEventDashboardData(Long eventId, User admin) {
        double attendanceRate;
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
        if (event.getUser().getId().equals(admin.getId())) {
            long totalBookings = bookingRepository.countByEventIdAndBookingStatusNot(eventId, BookingStatus.CANCELLED);
            long checkedInCount = bookingRepository.countByEventIdAndBookingStatus(eventId, BookingStatus.VALIDATED);
            long noShowCount = totalBookings - checkedInCount;
            if (totalBookings > 0) {
                attendanceRate = (checkedInCount * 100.0) / totalBookings;
            } else {
                attendanceRate = 0;
            }
            double estimatedBookingRenueve = totalBookings * event.getBookingPrice();
            long totalAttendees = checkedInCount + event.getWalkInCount();
            double normalPrice = event.getNormalPrice() != null ? event.getNormalPrice() : 0.0;
            double totalRevenue = (checkedInCount * event.getBookingPrice()) + (event.getWalkInCount() * normalPrice);
            return new EventDashboardResponse(eventId , event.getName(), event.getTotalTickets(), totalBookings, checkedInCount, noShowCount, attendanceRate, estimatedBookingRenueve, event.getWalkInCount(), totalAttendees, totalRevenue);

        } else {
            throw new AccessDeniedException("You are not the owner of this event");
        }

    }

    @Transactional
    public void closeEvent(Long eventId, User admin) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
        if (!event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to close this event");
        }
        if (event.getEventState().equals(EventState.FINISHED)) {
            throw new EventFinishedException("Event is already closed with id: " + eventId);
        }
        event.setEventState(EventState.FINISHED);
        eventRepository.save(event);
        log.info("Event ID: {} closed by Admin ID: {} - Transitioned to FINISHED", eventId, admin.getId());
        bookingService.anonymizeBookingsByEventId(eventId);
    }

}
