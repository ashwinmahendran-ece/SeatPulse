package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void sendTicketConfirmation(NotificationMessageDto payload) throws MailException {

        System.out.println("\n[Email Worker] Connecting to Google SMTP to email " + payload.userEmail() + "...");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(payload.userEmail());
        message.setSubject("🎟️ SeatPulse Ticket Confirmation: " + payload.eventName());
        message.setText(
                "Hello!\n\n" +
                        "Your ticket for " + payload.eventName() + " has been successfully booked.\n" +
                        "Your Seat Number is: " + payload.seatNo() + "\n\n" +
                        "Thank you for using SeatPulse!\n" +
                        "- The Admin Team"
        );

        mailSender.send(message);

        System.out.println("[Email Worker] SUCCESS! Real email delivered to " + payload.userEmail() + "\n");
    }
}