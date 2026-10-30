package project.Seat_Pulse.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.BulkNotificationMessageDto;
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
        message.setSubject("SeatPulse Ticket Confirmation: " + payload.eventName());
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

    @RabbitListener(queues = RabbitMQConfig.BULK_NOTIFICATION_QUEUE)
    public void sendBulkTicketConfirmationHtml(BulkNotificationMessageDto payload) {
        System.out.println("\n[RabbitMQ Email Worker] Consumed grouped HTML ticket for " + payload.userEmail() + "...");
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(payload.userEmail());
            helper.setSubject("Your SeatPulse Tickets are Confirmed: " + payload.eventName());

            String seatList = String.join(", ", payload.seatNumbers());
            int qty = payload.seatNumbers().size();

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; background-color: #1A1C1E; padding: 40px; color: #FFFFFF; text-align: center;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #1F2124; border: 1px solid #333; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <div style="background-color: #6735E8; padding: 30px 20px;">
                            <h1 style="margin: 0; font-size: 24px; color: #FFFFFF; letter-spacing: -0.5px;">SeatPulse*</h1>
                            <p style="margin: 10px 0 0 0; color: #E0D4FF; font-size: 14px;">You're in, %s!</p>
                        </div>
                        <div style="padding: 30px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #FFFFFF;">%s</h2>
                            <div style="background-color: #1A1C1E; padding: 20px; border-radius: 12px; border: 1px solid #333; margin-bottom: 20px;">
                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #A09CA3; text-transform: uppercase; letter-spacing: 1px;">Seats (%d)</p>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #6735E8;">%s</p>
                            </div>
                            <p style="margin: 0; font-size: 14px; color: #726E75;">Order ID: <strong style="color: #FFFFFF;">%s</strong></p>
                            <br/>
                            <a href="http://localhost:5173/profile" style="display: inline-block; background-color: #6735E8; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">View Digital Tickets</a>
                        </div>
                    </div>
                </div>
                """.formatted(payload.userName(), payload.eventName(), qty, seatList, payload.orderId());

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[RabbitMQ Email Worker] SUCCESS! Grouped HTML email delivered to " + payload.userEmail() + "\n");

        } catch (Exception e) {
            System.err.println("[RabbitMQ Email Worker] Failed to send HTML email: " + e.getMessage());
        }
    }
}