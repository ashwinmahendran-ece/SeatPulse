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
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.repository.EventRepository;
import project.Seat_Pulse.repository.UserRepository;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepo;
    private final SeatService seatService;
    private final UserRepository userRepo;

    public EventService(EventRepository eventRepo, SeatService seatService,UserRepository userRepo){
        this.eventRepo = eventRepo;
        this.seatService = seatService;
        this.userRepo = userRepo;
    }

    @Transactional
    @CacheEvict(value = "eventsCache", allEntries = true)
    public EventResponseDto addEvent(EventRequestDto eventRequestDto, String username) {

        User organizer = userRepo.findByEmailId(username);
        if (organizer == null) {
            throw new RuntimeException("Organizer not found");
        }

        Event event = new Event();
        event.setEventName(eventRequestDto.getEventName());
        event.setEventCategory(eventRequestDto.getEventCategory());
        event.setLocation(eventRequestDto.getLocation());
        event.setVenue(eventRequestDto.getVenue());
        event.setEventStartTime(eventRequestDto.getEventStartTime());
        event.setEventEndTime(eventRequestDto.getEventEndTime());
        event.setTotalSeats(eventRequestDto.getTotalSeats());

        event.setOrganizer(organizer);

        Event savedEvent = eventRepo.save(event);

        seatService.generateSeatsForEvent(savedEvent, savedEvent.getTotalSeats());

        EventResponseDto responseDto = new EventResponseDto();
        responseDto.setEventId(savedEvent.getEventId());
        responseDto.setEventName(savedEvent.getEventName());
        responseDto.setEventCategory(savedEvent.getEventCategory());
        responseDto.setLocation(savedEvent.getLocation());
        responseDto.setVenue(savedEvent.getVenue());
        responseDto.setEventStartTime(savedEvent.getEventStartTime());
        responseDto.setTotalSeats(savedEvent.getTotalSeats());

        return responseDto;
    }

    @Cacheable(value="eventsCache")
    public Page<Event> searchUpcomingEvents(String category, int pageNo, int pageSize, String sortBy) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortBy).descending());
        System.out.println("[DB HIT] Executing SQL to fetch events from the database...");

        return eventRepo.searchUpcomingEvents(category, pageable);
    }

    public List<Event> getEventsByOrganizer(String username) {
        User organizer = userRepo.findByEmailId(username);
        if (organizer == null) {
            throw new RuntimeException("Organizer not found");
        }

        return eventRepo.findByOrganizer_UserIdOrderByEventStartTimeDesc(organizer.getUserId());
    }
}