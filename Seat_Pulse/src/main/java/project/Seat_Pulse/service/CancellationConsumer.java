package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import project.Seat_Pulse.DTOs.EventCancellationDto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CancellationConsumer {

    private final RestClient restClient;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${mail.from}")
    private String senderEmail;

    public CancellationConsumer() {
        this.restClient = RestClient.create();
    }

    private void sendViaBrevo(String toEmail, String subject, String content) {
        Map<String, Object> body = new HashMap<>();
        body.put("sender", Map.of("name", "SeatPulse", "email", senderEmail));
        body.put("to", List.of(Map.of("email", toEmail)));
        body.put("subject", subject);
        body.put("textContent", content);

        restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .header("api-key", brevoApiKey)
                .header("accept", MediaType.APPLICATION_JSON_VALUE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    @RabbitListener(queues = "event_cancellation_queue")
    public void handleEventCancellation(EventCancellationDto message) {
        System.out.println("Urgent: Processing cancellation emails for event: " + message.getEventName());

        if (message.getAffectedEmails() == null || message.getAffectedEmails().isEmpty()) {
            return;
        }

        String subject = "URGENT: Event Cancellation - " + message.getEventName();
        String textBody = "Dear Customer,\n\n" +
                "We regret to inform you that the event '" + message.getEventName() + "' has been cancelled by the organizer.\n\n" +
                "A full refund for your booked seats has been initiated via Razorpay and will be credited to your original payment method shortly.\n\n" +
                "We sincerely apologize for the inconvenience.\n\n" +
                "Best Regards,\n" +
                "The SeatPulse Team";

        for (String email : message.getAffectedEmails()) {
            if (email == null || !email.contains("@")) {
                System.err.println("[Cancellation Worker] SKIPPING: Invalid email address -> '" + email + "'");
                continue;
            }

            try {
                sendViaBrevo(email, subject, textBody);
                System.out.println("Cancellation email & refund receipt sent to: " + email);
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email to: " + email + " - " + e.getMessage());
            }
        }
    }
}