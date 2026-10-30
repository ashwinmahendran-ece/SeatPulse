package project.Seat_Pulse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import project.Seat_Pulse.DTOs.BookingMessageDto;
import project.Seat_Pulse.DTOs.BookingResponseDto;
import project.Seat_Pulse.DTOs.BulkNotificationMessageDto;
import project.Seat_Pulse.DTOs.SeatResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.service.*;

import java.util.List;

@RestController
@RequestMapping("/api/seat")
public class SeatController {

    private final SeatService seatService;
    private final UserService userService;
    private final BookingProducer bookingProducer;
    private final NotificationProducer notificationProducer;

    public SeatController(SeatService seatService, UserService userService, BookingProducer bookingProducer,NotificationProducer notificationProducer){
        this.seatService = seatService;
        this.userService = userService;
        this.bookingProducer = bookingProducer;
        this.notificationProducer = notificationProducer;
    }

    @PostMapping("/lock")
    public SeatResponseDto lockSeat(@RequestParam long seatId, Authentication authentication){
        long userId = currentUserId(authentication);
        return seatService.lockedSeat(seatId, userId);
    }

//    @PostMapping("/book")
//    public ResponseEntity<String> bookSeat(Authentication authentication, @RequestParam long seatId){
//        long userId = currentUserId(authentication);
//
//        BookingMessageDto message = new BookingMessageDto(seatId, userId);
//
//        bookingProducer.sendBookingRequest(message);
//
//        return ResponseEntity.accepted().body("Booking request queued! You will receive a confirmation shortly.");
//    }

    @GetMapping("/available")
    public List<SeatResponseDto> getAvailableSeats(@RequestParam long eventId){
        return seatService.getSeats(eventId);
    }

    private long currentUserId(Authentication authentication){
        User user = userService.getUserByUserName(authentication.getName());
        return user.getUserId();
    }

    @GetMapping("/me")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        String username = authentication.getName();
        List<BookingResponseDto> myBookings = seatService.getUserBookings(username);
        return ResponseEntity.ok(myBookings);
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> cancelTicket(@RequestParam Long seatId, Authentication  authentication){
        String username = authentication.getName();
        String response = seatService.cancelBooking(seatId,username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/book-bulk")
    public ResponseEntity<String> bookMultipleSeats(
            Authentication authentication,
            @RequestParam List<Long> seatIds,
            @RequestParam(required = false, defaultValue = "SPX-BULK-ORDER") String orderId) {

        long userId = currentUserId(authentication);
        User user = userService.getUserByUserName(authentication.getName());

        List<String> seatNumbers = new java.util.ArrayList<>();
        String eventName = "SeatPulse Event";

        for (Long seatId : seatIds) {
            bookingProducer.sendBookingRequest(new BookingMessageDto(seatId, userId,orderId));

            try {
                SeatResponseDto seat = seatService.getSeatById(seatId);
                seatNumbers.add(String.valueOf(seat.getSeatNo()));
                eventName = seat.getEventName();
            } catch (Exception e) {
                seatNumbers.add("ID:" + seatId);
            }
        }

        BulkNotificationMessageDto bulkEmailMsg = new BulkNotificationMessageDto(
                user.getEmailId(),
                user.getUserName(),
                eventName,
                seatNumbers,
                orderId
        );
        notificationProducer.sendBulkEmailTask(bulkEmailMsg);
        return ResponseEntity.accepted().body("Bulk booking requests and grouped email queued successfully!");
    }
}