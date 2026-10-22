package project.Seat_Pulse.Repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.SeatRepository;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SeatRepoTest {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testReleaseSingleSeatLock_FromRabbitMQ() {
        User user = new User();
        user = entityManager.persist(user);

        Seat lockedSeat = new Seat();
        lockedSeat.setStatus(SeatStatus.LOCKED);
        lockedSeat.setLockedAt(LocalDateTime.now().minusSeconds(35));
        lockedSeat.setLockedBy(user);
        lockedSeat = entityManager.persist(lockedSeat);

        entityManager.flush();
        entityManager.clear();

        int updatedCount = seatRepository.releaseSingleSeatLock(
                lockedSeat.getSeatId(),
                SeatStatus.AVAILABLE,
                SeatStatus.LOCKED
        );

        assertEquals(1, updatedCount, "One seat should have been updated");

        Seat updatedSeat = seatRepository.findById(lockedSeat.getSeatId()).orElseThrow();
        assertEquals(SeatStatus.AVAILABLE, updatedSeat.getStatus(), "Seat should be AVAILABLE");
        assertNull(updatedSeat.getLockedBy(), "LockedBy should be cleared");
        assertNull(updatedSeat.getLockedAt(), "LockedAt should be cleared");
    }

    @Test
    void testReleaseSingleSeatLock_FailsIfAlreadyBooked() {
        User user = new User();
        user = entityManager.persist(user);

        Seat bookedSeat = new Seat();
        bookedSeat.setStatus(SeatStatus.BOOKED);
        bookedSeat.setLockedBy(user);
        bookedSeat = entityManager.persist(bookedSeat);

        entityManager.flush();
        entityManager.clear();

        int updatedCount = seatRepository.releaseSingleSeatLock(
                bookedSeat.getSeatId(),
                SeatStatus.AVAILABLE,
                SeatStatus.LOCKED
        );

        assertEquals(0, updatedCount, "Update count should be 0 because seat was not LOCKED");

        Seat unchangedSeat = seatRepository.findById(bookedSeat.getSeatId()).orElseThrow();
        assertEquals(SeatStatus.BOOKED, unchangedSeat.getStatus(), "Seat must remain BOOKED");
    }
}