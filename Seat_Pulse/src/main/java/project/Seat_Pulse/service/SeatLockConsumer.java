package project.Seat_Pulse.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.SeatLockDto;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.config.RabbitMQConfig;

@Service
public class SeatLockConsumer {

    private final SeatRepository seatRepo;
    private final CacheManager cacheManager;

    public SeatLockConsumer(SeatRepository seatRepo, CacheManager cacheManager) {
        this.seatRepo = seatRepo;
        this.cacheManager = cacheManager;
    }

    @RabbitListener(queues = RabbitMQConfig.LOCK_PROCESS_QUEUE)
    public void processExpiredLock(SeatLockDto payload) {
        System.out.println("[Lock Expiration] Timer finished for Seat ID: " + payload.seatId() + ". Checking status...");

        Seat seat = seatRepo.findById(payload.seatId()).orElse(null);

        if (seat != null && seat.getStatus() == SeatStatus.LOCKED) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockedBy(null);
            seat.setLockedAt(null);
            seatRepo.save(seat);

            var cache = cacheManager.getCache("eventSeats");
            if (cache != null) {
                cache.evict(seat.getEvent().getEventId());
                System.out.println("[Redis] Cleared cache for Event ID: " + seat.getEvent().getEventId() + " (Lock Expired)");
            }

            System.out.println("[Lock Expiration] Seat ID: " + payload.seatId() + " was not purchased in time. Unlocked and returned to pool!");
        } else {
            System.out.println("[Lock Expiration] Seat ID: " + payload.seatId() + " was already purchased or processed. No action needed.");
        }
    }
}