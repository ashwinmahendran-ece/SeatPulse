package project.Seat_Pulse.Repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.repository.EventRepository;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class EventRepoTest {

    @Autowired
    private EventRepository eventRepository;

    @Test
    void testFindByEventCategoryAndEventStartTimeAfter() {
        LocalDateTime now = LocalDateTime.now();

        Event pastMusicEvent = new Event();
        pastMusicEvent.setEventCategory("Music");
        pastMusicEvent.setEventStartTime(now.minusDays(1));

        Event futureMusicEvent = new Event();
        futureMusicEvent.setEventCategory("Music");
        futureMusicEvent.setEventStartTime(now.plusDays(1));

        Event futureSportsEvent = new Event();
        futureSportsEvent.setEventCategory("Sports");
        futureSportsEvent.setEventStartTime(now.plusDays(1));

        eventRepository.save(pastMusicEvent);
        eventRepository.save(futureMusicEvent);
        eventRepository.save(futureSportsEvent);

        Page<Event> result = eventRepository.findByEventCategoryAndEventStartTimeAfter(
                "Music",
                now,
                PageRequest.of(0, 10)
        );

        assertEquals(1, result.getTotalElements());
        assertEquals("Music", result.getContent().get(0).getEventCategory());

        eventRepository.deleteAll();
    }
}