package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import project.Seat_Pulse.DTOs.BulkNotificationMessageDto;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.config.RabbitMQConfig;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final RestClient restClient;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${mail.from}")
    private String senderEmail;

    @Value("${app.frontend.url:https://seat-pulse.vercel.app}")
    private String frontendUrl;

    public NotificationService() {
        this.restClient = RestClient.create();
    }

    private void sendViaBrevo(String toEmail, String subject, String content, boolean isHtml) {
        Map<String, Object> body = new HashMap<>();
        body.put("sender", Map.of("name", "SeatPulse", "email", senderEmail));
        body.put("to", List.of(Map.of("email", toEmail)));
        body.put("subject", subject);
        body.put(isHtml ? "htmlContent" : "textContent", content);

        restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .header("api-key", brevoApiKey)
                .header("accept", MediaType.APPLICATION_JSON_VALUE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void sendTicketConfirmation(NotificationMessageDto payload) throws MailException {
        System.out.println("\n[Email Worker] Connecting to Google SMTP to email " + payload.userEmail() + "...");

        if (payload.userEmail() == null || !payload.userEmail().contains("@")) {
            System.err.println("[Email Worker] SKIPPING: Invalid email address detected -> '" + payload.userEmail() + "'");
            return;
        }

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

        sendViaBrevo(payload.userEmail(), message.getSubject(), message.getText(), false);
        System.out.println("[Email Worker] SUCCESS! Real email delivered to " + payload.userEmail() + "\n");
    }

    @RabbitListener(queues = RabbitMQConfig.BULK_NOTIFICATION_QUEUE)
    public void sendBulkTicketConfirmationHtml(BulkNotificationMessageDto payload) {
        System.out.println("\n[RabbitMQ Email Worker] Consumed grouped HTML ticket for " + payload.userEmail() + "...");

        if (payload.userEmail() == null || !payload.userEmail().contains("@")) {
            System.err.println("[RabbitMQ Email Worker] SKIPPING: Invalid email address detected -> '" + payload.userEmail() + "'");
            return;
        }

        try {
            String subject = "Your SeatPulse Tickets are Confirmed: " + payload.eventName();

            String seatList = String.join(", ", payload.seatNumbers());
            int qty = payload.seatNumbers().size();

            String qrData = payload.seatIds() != null && !payload.seatIds().isEmpty()
                    ? String.valueOf(payload.seatIds().get(0))
                    : payload.orderId();

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; background-color: #1A1C1E; padding: 40px; color: #FFFFFF; text-align: center;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #1F2124; border: 1px solid #333; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <div style="background-color: #6735E8; padding: 30px 20px;">
                            <h1 style="margin: 0; font-size: 24px; color: #FFFFFF; letter-spacing: -0.5px;">SeatPulse*</h1>
                            <p style="margin: 10px 0 0 0; color: #E0D4FF; font-size: 14px;">You're in, %s!</p>
                        </div>
                        <div style="padding: 30px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #FFFFFF;">%s</h2>
                            
                            <!-- THE QR CODE IMAGE TAG -->
                            <div style="background-color: #FFFFFF; padding: 15px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=%s&color=000000&bgcolor=ffffff" alt="Ticket QR Code" width="160" height="160" style="display: block;" />
                            </div>
                            
                            <div style="background-color: #1A1C1E; padding: 20px; border-radius: 12px; border: 1px solid #333; margin-bottom: 20px;">
                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #A09CA3; text-transform: uppercase; letter-spacing: 1px;">Seats (%d)</p>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #6735E8;">%s</p>
                            </div>
                            <p style="margin: 0; font-size: 14px; color: #726E75;">Order ID: <strong style="color: #FFFFFF;">%s</strong></p>
                            <br/>
                           <a href="%s/my-tickets" style="display: inline-block; background-color: #6735E8; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">View Digital Tickets</a>
                        </div>
                    </div>
                </div>
                """.formatted(payload.userName(), payload.eventName(), qrData, qty, seatList, payload.orderId(), frontendUrl);

            sendViaBrevo(payload.userEmail(), subject, htmlContent, true);
            System.out.println("[RabbitMQ Email Worker] SUCCESS! Grouped HTML email delivered to " + payload.userEmail() + "\n");

        } catch (Exception e) {
            System.err.println("[RabbitMQ Email Worker] Failed to send HTML email: " + e.getMessage());
            throw new RuntimeException("Email delivery failed. RabbitMQ will handle retry or DLQ.", e);
        }
    }
}