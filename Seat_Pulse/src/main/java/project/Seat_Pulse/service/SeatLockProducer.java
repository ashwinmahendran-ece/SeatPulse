package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.SeatLockDto;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class SeatLockProducer {
    private final RabbitTemplate rabbitTemplate;

    public SeatLockProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void startLockTimer(SeatLockDto dto) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LOCK_WAIT_EXCHANGE,
                RabbitMQConfig.LOCK_WAIT_ROUTING_KEY,
                dto
        );
        System.out.println("⏱️ [Lock Timer] 300-second countdown started for Seat ID: " + dto.seatId());
    }
}