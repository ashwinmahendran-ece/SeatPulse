package project.Seat_Pulse.service;

import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.EventRequestDto;
import project.Seat_Pulse.DTOs.EventResponseDto;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.repository.EventRepository;
import java.time.LocalDateTime;

@Service
public class EventService {

    private final EventRepository eventRepo;

    private final SeatService seatService;

    public EventService(EventRepository eventRepo, SeatService seatService){
        this.eventRepo=eventRepo;
        this.seatService = seatService;
    }

    @Transactional
    @CacheEvict(value = "value=eventsCache",allEntries = true)
    public EventResponseDto addEvent(EventRequestDto eventRequestDto){
        Event event = new Event();
        event.setEventName(eventRequestDto.getEventName());
        event.setEventCategory(eventRequestDto.getEventCategory());
        event.setEventStartTime(eventRequestDto.getEventStartTime());
        event.setEventEndTime(eventRequestDto.getEventEndTime());
        Event savedEvent = eventRepo.save(event);
        seatService.generateSeatsForEvent(savedEvent,eventRequestDto.getTotalSeats());
        EventResponseDto eventResponseDto=new EventResponseDto(savedEvent.getEventId(), savedEvent.getEventName(), eventRequestDto.getTotalSeats());
        return eventResponseDto;
    }

    @Cacheable("values=eventsCache")
    public Page<Event> searchUpcomingEvents(String category, int pageNo, int pageSize, String sortBy) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortBy).ascending());
        System.out.println("[DB HIT] Executing SQL to fetch events from the database...");

        return eventRepo.searchUpcomingEvents(category, pageable);
    }
}
