package project.Seat_Pulse.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.enums.SeatStatus;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEvent_EventId(Long eventId);

    List<Seat> findByEventEventIdAndStatus(Long eventId, SeatStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.seatId = :seatId")
    Optional<Seat> findByIdForUpdate(@Param("seatId") Long seatId);

    @Modifying
    @Query("UPDATE Seat s SET s.status = :status, s.lockedBy = null, s.lockedAt = null WHERE s.event.eventId = :eventId")
    void cancelAllSeatsForEvent(@Param("eventId") Long eventId, @Param("status") SeatStatus status);

    @Modifying
    @Query("UPDATE Seat s SET s.status = :available, s.lockedBy = null, s.lockedAt = null WHERE s.seatId = :seatId AND s.status = :locked")
    int releaseSingleSeatLock(
            @Param("seatId") Long seatId,
            @Param("available") SeatStatus available,
            @Param("locked") SeatStatus locked
    );

    List<Seat> findByLockedBy_UserIdAndStatus(Long userId, SeatStatus status);

    @Query("SELECT COUNT(DISTINCT s.orderId) FROM Seat s WHERE s.status = 'BOOKED' AND s.orderId IS NOT NULL")
    long countBookedSeats();

    @Query("SELECT COALESCE(SUM(s.price), 0.0) FROM Seat s WHERE s.status = 'BOOKED'")
    double sumTotalRevenue();

    @Modifying
    @Query("DELETE FROM Seat s WHERE s.event = :event")
    void deleteByEvent(@Param("event") Event event);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.status = 'BOOKED' AND s.event.organizer.userId = :organizerId")
    long countBookingsByOrganizer(@Param("organizerId") Long organizerId);

    @Query("SELECT SUM(s.price) FROM Seat s WHERE s.status = 'BOOKED' AND s.event.organizer.userId = :organizerId")
    Double sumRevenueByOrganizer(@Param("organizerId") Long organizerId);

    @Query("SELECT COUNT(DISTINCT s.lockedBy.userId) FROM Seat s WHERE s.status = 'BOOKED' AND s.event.organizer.userId = :organizerId")
    long countUniqueCustomersByOrganizer(@Param("organizerId") Long organizerId);
}