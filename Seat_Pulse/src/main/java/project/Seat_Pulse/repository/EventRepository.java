package project.Seat_Pulse.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.Seat_Pulse.Entity.Event;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE (:category = '' OR e.eventCategory = :category) AND e.eventStartTime > CURRENT_TIMESTAMP")
    Page<Event> searchUpcomingEvents(@Param("category") String category, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT s.orderId) FROM Seat s WHERE s.status = 'BOOKED' AND s.orderId IS NOT NULL")
    long countActiveOrders();

    @Query("SELECT e FROM Event e WHERE e.eventStartTime > CURRENT_TIMESTAMP ORDER BY (SELECT COUNT(s) FROM Seat s WHERE s.event = e AND s.status = 'BOOKED') DESC")
    List<Event> findTopTrendingUpcomingEvents(Pageable pageable);
}