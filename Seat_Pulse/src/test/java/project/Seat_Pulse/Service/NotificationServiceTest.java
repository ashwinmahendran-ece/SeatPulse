package project.Seat_Pulse.Service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.service.NotificationService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NotificationService notificationService;

    NotificationMessageDto payload = new NotificationMessageDto("ash@gmail.com","DummyEvent", 52L);

    @Test
    void testSendTicketConfirmation() {
        notificationService.sendTicketConfirmation(payload);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, Mockito.times(1)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();
        assertEquals("ash@gmail.com", sentMessage.getTo()[0]);
        assertEquals("🎟️ SeatPulse Ticket Confirmation: Rock Concert", sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains("Your Seat Number is: 42"));
    }
}