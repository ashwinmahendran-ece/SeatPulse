package project.Seat_Pulse.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
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
        this.eventService=eventService;
        this.cancellationProducer = cancellationProducer;
        this.seatService = seatService;
    }

    @PostMapping("/addEvent")
    public EventResponseDto addEvent(@Valid @RequestBody EventRequestDto eventRequestDto){
        return eventService.addEvent(eventRequestDto);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Event>> searchEvents(
            @RequestParam("category") String category,
            @RequestParam(value = "pageNo", defaultValue = "0") int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "100") int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "eventStartTime") String sortBy
    ) {
        Page<Event> paginatedEvents = eventService.searchUpcomingEvents(category, pageNo, pageSize, sortBy);
        return ResponseEntity.ok(paginatedEvents);
    }

    @PostMapping("/{eventId}/cancel")
    public ResponseEntity<String> cancelEvent(@PathVariable("eventId") Long eventId) {
        EventCancellationDto payload = new EventCancellationDto(eventId, "Test Concert");

        cancellationProducer.broadcastCancellation(payload);

        return ResponseEntity.accepted().body("Event cancellation process initiated successfully.");
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