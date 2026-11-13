package project.Seat_Pulse.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import project.Seat_Pulse.DTOs.*;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.service.CancellationProducer;
import project.Seat_Pulse.service.EventService;
import project.Seat_Pulse.service.SeatService;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final CancellationProducer cancellationProducer;
    private final SeatService seatService;

    public EventController(EventService eventService, CancellationProducer cancellationProducer, SeatService seatService){
        this.eventService = eventService;
        this.cancellationProducer = cancellationProducer;
        this.seatService = seatService;
    }

    @PostMapping("/addEvent")
    public EventResponseDto addEvent(@Valid @RequestBody EventRequestDto eventRequestDto, Authentication authentication){
        return eventService.addEvent(eventRequestDto, authentication.getName());
    }

    @GetMapping("/admin/my-events")
    public ResponseEntity<List<Event>> getMyEvents(Authentication authentication) {
        List<Event> myEvents = eventService.getEventsByOrganizer(authentication.getName());
        return ResponseEntity.ok(myEvents);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Event>> searchUpcomingEvents(
            @RequestParam(required = false, defaultValue = "") String category,
            @RequestParam(required = false, defaultValue = "0") Integer pageNo,
            @RequestParam(required = false, defaultValue = "50") Integer pageSize,
            @RequestParam(required = false, defaultValue = "eventStartTime") String sortBy) {

        String safeCategory = (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("All"))
                ? ""
                : category;

        Page<Event> events = eventService.searchUpcomingEvents(safeCategory, pageNo, pageSize, sortBy);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/{eventId}/cancel")
    public ResponseEntity<String> cancelEvent(@PathVariable("eventId") Long eventId) {
        eventService.cancelEntireEvent(eventId);
        return ResponseEntity.ok("Event cancelled. Refunds processed and emails dispatched.");
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SeatResponseDto>> getAvailableSeatsForEvent(@PathVariable("eventId") Long eventId) {
        List<SeatResponseDto> seats = seatService.getSeats(eventId);
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/{eventId}/seats")
    public ResponseEntity<String> saveEventSeats(
            @PathVariable("eventId") Long eventId,
            @RequestBody SeatCreationRequestDto request
    ) {
        seatService.saveSeatsForEvent(eventId, request.getSeats());
        return ResponseEntity.ok("Seating map saved successfully.");
    }
}