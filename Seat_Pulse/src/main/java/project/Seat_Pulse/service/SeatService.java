package project.Seat_Pulse.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.CacheManager;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.BookingResponseDto;
import project.Seat_Pulse.DTOs.NotificationMessageDto;
import project.Seat_Pulse.DTOs.SeatLockDto;
import project.Seat_Pulse.DTOs.SeatResponseDto;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
public class SeatService {

    private final SeatRepository seatRepo;
    private final UserRepository userRepo;
    private final NotificationProducer notificationProducer;
    private final SeatLockProducer seatLockProducer;
    private final CacheManager cacheManager;

    public SeatService(SeatRepository seatRepo, UserRepository userRepo,
                       NotificationProducer notificationProducer, SeatLockProducer seatLockProducer,
                       CacheManager cacheManager){
        this.seatRepo = seatRepo;
        this.userRepo = userRepo;
        this.notificationProducer = notificationProducer;
        this.seatLockProducer = seatLockProducer;
        this.cacheManager = cacheManager;
    }

    @Transactional
    public void generateSeatsForEvent(Event event, int totalSeats) {
        List<Seat> seatsToSave = new ArrayList<>();

        for (int i = 1; i <= totalSeats; i++) {
            Seat seat = new Seat();
            seat.setSeatNo((long) i);
            seat.setSeatCategory(i <= 10 ? "VIP" : "REGULAR");
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setEvent(event);

            seatsToSave.add(seat);
        }
        seatRepo.saveAll(seatsToSave);
    }

    @Transactional
    public SeatResponseDto lockedSeat(long seatId, long userId) {

        Seat seat = seatRepo.findByIdForUpdate(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            throw new RuntimeException("Seat is locked by another user!!");
        }

        seat.setStatus(SeatStatus.LOCKED);
        seat.setLockedAt(LocalDateTime.now());
        seat.setLockedBy(user);
        seatRepo.save(seat);

        evictSeatMapCache(seat.getEvent().getEventId());

        seatLockProducer.startLockTimer(new SeatLockDto(seatId));
        return new SeatResponseDto(seat.getSeatId(), seat.getSeatNo(), seat.getSeatCategory(), seat.getStatus(), seat.getEvent().getEventId(),seat.getPrice());
    }

    @Transactional
    public SeatResponseDto bookSeat(long seatId, long userId) {

        Seat seat = seatRepo.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() != SeatStatus.LOCKED) {
            throw new RuntimeException("Seat must be locked before booking!");
        }

        if (seat.getLockedBy() == null || !seat.getLockedBy().getUserId().equals(userId)) {
            throw new RuntimeException("You cannot book a seat locked by someone else!");
        }

        seat.setStatus(SeatStatus.BOOKED);
        seatRepo.save(seat);

        evictSeatMapCache(seat.getEvent().getEventId());

        System.out.println("[Main Thread] Payment confirmed. Handing off email task...");

        User user = seat.getLockedBy();
        Event event = seat.getEvent();

        NotificationMessageDto emailPayload = new NotificationMessageDto(
                user.getEmailId(),
                event.getEventName(),
                seat.getSeatNo()
        );

        notificationProducer.sendEmailTask(emailPayload);
        return new SeatResponseDto(seat.getSeatId(), seat.getSeatNo(), seat.getSeatCategory(), seat.getStatus(), seat.getEvent().getEventId(),seat.getPrice());
    }

    @Cacheable(value = "eventSeats", key = "#eventId")
    public List<SeatResponseDto> getSeats(long eventId){
        System.out.println("🗄️ [Database] Fetching seat map from MySQL for Event ID: " + eventId);
        List<Seat> getSeatsfromRepo = seatRepo.findByEventEventIdAndStatus(eventId, SeatStatus.AVAILABLE);
        List<SeatResponseDto> availableSeats = new ArrayList<>();
        for(Seat seat : getSeatsfromRepo){
            SeatResponseDto seatResponseDto = new SeatResponseDto(seat.getSeatId(), seat.getSeatNo(), seat.getSeatCategory(), seat.getStatus(), eventId,seat.getPrice());
            availableSeats.add(seatResponseDto);
        }
        return availableSeats;
    }

    public void evictSeatMapCache(Long eventId) {
        var cache = cacheManager.getCache("eventSeats");
        if (cache != null) {
            cache.evict(eventId);
            System.out.println("🧹 [Redis] Cleared seat map cache for Event ID: " + eventId);
        }
    }

    public List<BookingResponseDto> getUserBookings(String username) {
        User user = userRepo.findByUserName(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        List<Seat> userSeats = seatRepo.findByLockedBy_UserIdAndStatus(user.getUserId(), SeatStatus.BOOKED);

        return userSeats.stream().map(seat -> new BookingResponseDto(
                seat.getEvent().getEventId(),
                seat.getEvent().getEventName(),
                seat.getEvent().getEventStartTime(),
                seat.getSeatNo(),
                seat.getStatus().name(),
                seat.getSeatId()
        )).toList();
    }

    public String cancelBooking(Long seatId, String username) {
        Seat seat = seatRepo.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getLockedBy() == null || !seat.getLockedBy().getUserName().equals(username)) {
            throw new RuntimeException("Unauthorized: You do not own this ticket!");
        }

        if (seat.getStatus() != SeatStatus.BOOKED) {
            throw new RuntimeException("Only confirmed bookings can be cancelled.");
        }
        seat.setStatus(SeatStatus.AVAILABLE);
        seat.setLockedBy(null);
        seat.setLockedAt(null);
        seatRepo.save(seat);

        evictSeatMapCache(seat.getEvent().getEventId());
        return "Ticket cancelled successfully";
    }
}