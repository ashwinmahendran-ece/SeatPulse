package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.EventCancellationDto;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class CancellationProducer {

    private final RabbitTemplate rabbitTemplate;

    public CancellationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void broadcastCancellation(EventCancellationDto dto) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.CANCEL_FANOUT_EXCHANGE,
                "",
                dto
        );
        System.out.println("[Broadcaster] Event Cancelled! Fired message to Fanout Exchange for Event: " + dto.eventName());
    }
}