package project.Seat_Pulse.DTOs;

import java.util.List;

public record BulkNotificationMessageDto(
        String userEmail,
        String userName,
        String eventName,
        List<String> seatNumbers,
        String orderId
) {
}