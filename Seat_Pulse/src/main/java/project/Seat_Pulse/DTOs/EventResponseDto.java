package project.Seat_Pulse.DTOs;

public class EventResponseDto {
    private long eventId;
    private String eventName;
    private int totalSeats;

    public EventResponseDto(long eventId, String eventName, int totalSeats) {
        this.eventId = eventId;
        this.eventName = eventName;
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
}
