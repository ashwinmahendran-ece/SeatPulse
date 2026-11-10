package project.Seat_Pulse.DTOs;

import java.util.List;

public record BulkNotificationMessageDto(
        String userName,
        String userEmail,
        String eventName,
        List<String> seatNumbers,
        List<Long> seatIds,
        String orderId
) {
}