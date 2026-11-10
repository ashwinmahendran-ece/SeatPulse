package project.Seat_Pulse.DTOs;

import java.time.LocalDateTime;

public class EventResponseDto {
    private long eventId;
    private String eventName;
    private String eventCategory;
    private String location;
    private String venue;
    private LocalDateTime eventStartTime;

    private int totalSeats;


    public EventResponseDto(long eventId, String eventName, String eventCategory, String location, String venue, LocalDateTime eventStartTime, int totalSeats) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventCategory = eventCategory;
        this.location = location;
        this.venue = venue;
        this.eventStartTime = eventStartTime;
        this.totalSeats = totalSeats;
    }

    public EventResponseDto(){

    }

    public long getEventId() {
        return eventId;
    }

    public void setEventId(long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public String getEventCategory() {
        return eventCategory;
    }

    public void setEventCategory(String eventCategory) {
        this.eventCategory = eventCategory;
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

    public LocalDateTime getEventStartTime() {
        return eventStartTime;
    }

    public void setEventStartTime(LocalDateTime eventStartTime) {
        this.eventStartTime = eventStartTime;
    }
}
