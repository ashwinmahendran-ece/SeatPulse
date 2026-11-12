package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.EventCancellationDto;

@Service
public class CancellationConsumer {

    private final JavaMailSender mailSender;

    public CancellationConsumer(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @RabbitListener(queues = project.Seat_Pulse.config.RabbitMQConfig.CANCEL_EMAIL_QUEUE)
    public void handleEventCancellation(EventCancellationDto message) {
        System.out.println("Urgent: Processing cancellation emails for event: " + message.getEventName());

        for (String email : message.getAffectedEmails()) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(email);
                mailMessage.setSubject("URGENT: Event Cancellation - " + message.getEventName());
                mailMessage.setText("Dear Customer,\n\n" +
                        "We regret to inform you that the event '" + message.getEventName() + "' has been cancelled by the organizer.\n\n" +
                        "A full refund for your booked seats has been initiated via Razorpay and will be credited to your original payment method shortly.\n\n" +
                        "We sincerely apologize for the inconvenience.\n\n" +
                        "Best Regards,\n" +
                        "The SeatPulse Team");

                mailSender.send(mailMessage);
                System.out.println("Cancellation email & refund receipt sent to: " + email);

            } catch (Exception e) {
                System.err.println("Failed to send cancellation email to: " + email + " - " + e.getMessage());
            }
        }
    }
}