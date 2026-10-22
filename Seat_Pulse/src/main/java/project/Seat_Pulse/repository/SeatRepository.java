package project.Seat_Pulse.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.enums.SeatStatus;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

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
}