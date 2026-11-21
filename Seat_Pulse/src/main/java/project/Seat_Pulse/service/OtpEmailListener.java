package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import project.Seat_Pulse.DTOs.OtpEmailEvent;
import project.Seat_Pulse.config.RabbitMQConfig;

import java.util.List;
import java.util.Map;

@Service
public class OtpEmailListener {

    private final RestClient restClient;
    private final String brevoApiKey;
    private final String senderEmail;

    public OtpEmailListener(
            @Value("${brevo.api.key}") String brevoApiKey,
            @Value("${brevo.sender.email}") String senderEmail) {
        this.brevoApiKey = brevoApiKey;
        this.senderEmail = senderEmail;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .build();
    }

    @RabbitListener(queues = RabbitMQConfig.OTP_QUEUE)
    public void consumeOtpEmailEvent(OtpEmailEvent event) {
        try {
            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", "SeatPulse", "email", senderEmail),
                    "to", List.of(Map.of("email", event.getEmail())),
                    "subject", "SeatPulse - Password Reset OTP",
                    "textContent", "Your One-Time Password (OTP) for resetting your SeatPulse password is: "
                            + event.getOtp()
                            + "\n\nThis code will expire in exactly 2 minutes. Do not share this code with anyone."
            );

            restClient.post()
                    .uri("/smtp/email")
                    .header("api-key", brevoApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            System.out.println("OTP Email successfully sent asynchronously via Brevo to: " + event.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + event.getEmail() + ": " + e.getMessage());
        }
    }
}