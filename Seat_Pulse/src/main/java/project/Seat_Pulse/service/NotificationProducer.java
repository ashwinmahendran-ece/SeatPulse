package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public NotificationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendEmailTask(NotificationMessageDto notificationMessageDto){
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                notificationMessageDto
        );
        System.out.println("[Notification Producer] Queued email for: " + notificationMessageDto.userEmail());
    }
}