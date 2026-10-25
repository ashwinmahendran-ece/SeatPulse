package project.Seat_Pulse.Entity;
import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "Event")
public class Event implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;
    private String eventName;
    private String eventCategory;
    private LocalDateTime eventStartTime;
    private LocalDateTime eventEndTime;
    private String location;
    private String venue;
    private int totalSeats;

    public Event(Long eventId, String eventName, String eventCategory, LocalDateTime eventStartTime, LocalDateTime eventEndTime, String location, String venue, int totalSeats) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventCategory = eventCategory;
        this.eventStartTime = eventStartTime;
        this.eventEndTime = eventEndTime;
        this.location = location;
        this.venue = venue;
        this.totalSeats = totalSeats;
    }

    public Event(){
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventCategory() {
        return eventCategory;
    }

    public void setEventCategory(String eventCategory) {
        this.eventCategory = eventCategory;
    }

    public LocalDateTime getEventStartTime() {
        return eventStartTime;
    }

    public void setEventStartTime(LocalDateTime eventStartTime) {
        this.eventStartTime = eventStartTime;
    }

    public LocalDateTime getEventEndTime() {
        return eventEndTime;
    }

    public void setEventEndTime(LocalDateTime eventEndTime) {
        this.eventEndTime = eventEndTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    @Override
    public String toString() {
        return "Event{" +
                "eventId=" + eventId +
                ", eventName='" + eventName + '\'' +
                ", eventCategory='" + eventCategory + '\'' +
                ", eventStartTime=" + eventStartTime +
                ", eventEndTime=" + eventEndTime +
                ", location='" + location + '\'' +
                ", venue='" + venue + '\'' +
                ", totalSeats=" + totalSeats +
                '}';
    }
}
