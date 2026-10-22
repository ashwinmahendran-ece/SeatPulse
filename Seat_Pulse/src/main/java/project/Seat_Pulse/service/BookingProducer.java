package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.BookingMessageDto;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class BookingProducer {

    private final RabbitTemplate rabbitTemplate;


    public BookingProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendBookingRequest(BookingMessageDto message){
        rabbitTemplate.convertAndSend(RabbitMQConfig.BOOKING_EXCHANGE,
                RabbitMQConfig.BOOKING_ROUTING_KEY,
                message);
        System.out.println("[Producer] Dropped booking request into queue for Seat ID: "+ message.seatId());
    }
}
