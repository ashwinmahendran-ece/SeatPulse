package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.config.RabbitMQConfig;
import project.Seat_Pulse.DTOs.BookingMessageDto;

@Service
public class BookingConsumer {

    private final SeatService seatService;

    public BookingConsumer(SeatService seatService) {
        this.seatService = seatService;
    }

    @RabbitListener(queues = RabbitMQConfig.BOOKING_QUEUE)
    public void processBooking(BookingMessageDto message) {
        System.out.println("[Consumer] Picked up message from queue. Processing Seat ID: " + message.seatId());

        try {
            seatService.bookSeat(message.seatId(), message.userId());
            System.out.println("[Consumer] Successfully booked Seat ID: " + message.seatId());

        } catch (Exception e) {
            System.err.println("[Consumer] Booking failed for Seat ID: " + message.seatId() + " | Reason: " + e.getMessage());
        }
    }
}