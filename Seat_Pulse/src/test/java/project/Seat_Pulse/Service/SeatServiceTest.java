package project.Seat_Pulse.Service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.DTOs.SeatResponseDto;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.repository.UserRepository;
import project.Seat_Pulse.service.NotificationService;
import project.Seat_Pulse.service.SeatService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private SeatRepository seatRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SeatService seatService;

    @Test
    void testGenerateSeatsForEvent_AssignsVipAndRegularCorrectly() {
        Event event = new Event();
        event.setEventId(1L);

        seatService.generateSeatsForEvent(event, 15);

        ArgumentCaptor<List<Seat>> seatListCaptor = ArgumentCaptor.forClass(List.class);
        verify(seatRepo, Mockito.times(1)).saveAll(seatListCaptor.capture());

        List<Seat> savedSeats = seatListCaptor.getValue();
        assertEquals(15, savedSeats.size());
        assertEquals("VIP", savedSeats.get(0).getSeatCategory()); // Seat 1
        assertEquals("VIP", savedSeats.get(9).getSeatCategory()); // Seat 10
        assertEquals("REGULAR", savedSeats.get(10).getSeatCategory()); // Seat 11
    }

    @Test
    void testBookSeat_Success() {

        User user = new User();
        user.setUserId(99L);
        user.setEmailId("test@test.com");

        Event event = new Event();
        event.setEventName("Tech Meetup");
        event.setEventId(1L);

        NotificationMessageDto payload = new NotificationMessageDto("ash@gmail.com","DummyEvent", 52L);

        Seat lockedSeat = new Seat();
        lockedSeat.setSeatId(5L);
        lockedSeat.setSeatNo(5L);
        lockedSeat.setStatus(SeatStatus.LOCKED);
        lockedSeat.setLockedBy(user);
        lockedSeat.setEvent(event);

        when(seatRepo.findById(5L)).thenReturn(Optional.of(lockedSeat));

        SeatResponseDto response = seatService.bookSeat(5L, 99L);

        assertNotNull(response);
        assertEquals(SeatStatus.BOOKED, response.getSeatStatus());

        verify(seatRepo, Mockito.times(1)).save(lockedSeat);
        verify(notificationService, Mockito.times(1))
                .sendTicketConfirmation(payload);
    }
}