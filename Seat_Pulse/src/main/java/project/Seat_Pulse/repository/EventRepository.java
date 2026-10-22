package project.Seat_Pulse.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.Seat_Pulse.Entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE (:category = '' OR e.eventCategory = :category) AND e.eventStartTime > CURRENT_TIMESTAMP")
    Page<Event> searchUpcomingEvents(@Param("category") String category, Pageable pageable);
}