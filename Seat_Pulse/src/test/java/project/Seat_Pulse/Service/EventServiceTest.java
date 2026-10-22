package project.Seat_Pulse.Service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import project.Seat_Pulse.DTOs.EventRequestDto;
import project.Seat_Pulse.DTOs.EventResponseDto;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.repository.EventRepository;
import project.Seat_Pulse.service.EventService;
import project.Seat_Pulse.service.SeatService;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepo;

    @Mock
    private SeatService seatService;

    @InjectMocks
    private EventService eventService;

    @Test
    void testAddEvent_SavesEventAndGeneratesSeats() {
        EventRequestDto requestDto = new EventRequestDto();
        requestDto.setEventName("UI/UX Masterclass");
        requestDto.setEventCategory("Design");
        requestDto.setTotalSeats(100);

        Event savedEvent = new Event();
        savedEvent.setEventId(1L);
        savedEvent.setEventName("UI/UX Masterclass");

        when(eventRepo.save(any(Event.class))).thenReturn(savedEvent);
        EventResponseDto response = eventService.addEvent(requestDto);

        assertNotNull(response);
        assertEquals(1L, response.getEventId());
        assertEquals("UI/UX Masterclass", response.getEventName());
        assertEquals(100, response.getTotalSeats());

        verify(eventRepo, Mockito.times(1)).save(any(Event.class));
        verify(seatService, Mockito.times(1)).generateSeatsForEvent(savedEvent, 100);
    }

    @Test
    void testSearchUpcomingEvents_ReturnsPaginatedData() {

        Event mockEvent = new Event();
        mockEvent.setEventName("React Workshop");
        Page<Event> fakePage = new PageImpl<>(List.of(mockEvent));

        when(eventRepo.findByEventCategoryAndEventStartTimeAfter(
                eq("Technology"),
                any(LocalDateTime.class),
                any(Pageable.class)
        )).thenReturn(fakePage);

        Page<Event> result = eventService.searchUpcomingEvents("Technology", 0, 10, "eventName");

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("React Workshop", result.getContent().get(0).getEventName());

        verify(eventRepo, Mockito.times(1)).findByEventCategoryAndEventStartTimeAfter(
                eq("Technology"),
                any(LocalDateTime.class),
                any(Pageable.class)
        );
    }
}