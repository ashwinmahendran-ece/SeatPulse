package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.OtpEmailEvent;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class OtpEmailListener {

    private final JavaMailSender mailSender;

    public OtpEmailListener(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @RabbitListener(queues = RabbitMQConfig.OTP_QUEUE)
    public void consumeOtpEmailEvent(OtpEmailEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getEmail());
            message.setSubject("SeatPulse - Password Reset OTP");
            message.setText("Your One-Time Password (OTP) for resetting your SeatPulse password is: "
                    + event.getOtp()
                    + "\n\nThis code will expire in exactly 2 minutes. Do not share this code with anyone.");

            mailSender.send(message);
            System.out.println("OTP Email successfully sent asynchronously to: " + event.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + event.getEmail() + ": " + e.getMessage());
        }
    }
}