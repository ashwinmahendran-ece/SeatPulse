package project.Seat_Pulse.service;

import jakarta.transaction.Transactional;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.EventCancellationDto;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.config.RabbitMQConfig;

import java.util.List;

@Service
public class CancellationWorkers {

    private final SeatRepository seatRepo;
    private final NotificationProducer notificationProducer;
    private final CacheManager cacheManager;

    public CancellationWorkers(SeatRepository seatRepo, NotificationProducer notificationProducer, CacheManager cacheManager) {
        this.seatRepo = seatRepo;
        this.notificationProducer = notificationProducer;
        this.cacheManager = cacheManager;
    }

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.CANCEL_DB_QUEUE)
    public void processDatabaseUpdates(EventCancellationDto payload) {
        System.out.println("🗄️ [DB Worker] Picked up cancellation for Event ID: " + payload.eventId());

        seatRepo.cancelAllSeatsForEvent(payload.eventId(), SeatStatus.CANCELLED);

        var cache = cacheManager.getCache("eventSeats");
        if (cache != null) {
            cache.evict(payload.eventId());
            System.out.println("🧹 [Redis] Cleared cache for Event ID: " + payload.eventId() + " (Event Cancelled)");
        }

        System.out.println("🗄️ [DB Worker] Successfully marked all seats as CANCELLED for: " + payload.eventName());
    }

    @RabbitListener(queues = RabbitMQConfig.CANCEL_EMAIL_QUEUE)
    public void processCancellationEmails(EventCancellationDto payload) {
        System.out.println("📧 [Cancellation Mailer] Preparing apology emails for Event ID: " + payload.eventId());

        List<Seat> bookedSeats = seatRepo.findByEventEventIdAndStatus(payload.eventId(), SeatStatus.BOOKED);
        int emailCount = 0;

        for (Seat seat : bookedSeats) {
            if (seat.getLockedBy() != null && seat.getLockedBy().getEmailId() != null) {
                NotificationMessageDto apologyEmail = new NotificationMessageDto(
                        seat.getLockedBy().getEmailId(),
                        "CANCELED: " + payload.eventName(),
                        seat.getSeatNo()
                );
                notificationProducer.sendEmailTask(apologyEmail);
                emailCount++;
            }
        }

        System.out.println("📧 [Cancellation Mailer] Pushed " + emailCount + " apology emails to the Notification Queue!");
    }
}