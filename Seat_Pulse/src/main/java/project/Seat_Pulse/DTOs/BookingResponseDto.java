package project.Seat_Pulse.DTOs;

import java.time.LocalDateTime;

public class BookingResponseDto {
    private Long eventId;
    private String eventName;
    private LocalDateTime eventStartTime;
    private Long seatNo;
    private String status;
    private Long seatId;
    private String location;
    private String venue;

    public BookingResponseDto(Long eventId, String eventName, LocalDateTime eventStartTime, Long seatNo, String status,Long seatId, String location, String venue) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventStartTime = eventStartTime;
        this.seatNo = seatNo;
        this.status = status;
        this.seatId = seatId;
        this.location = location;
        this.venue = venue;
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

    public LocalDateTime getEventStartTime() {
        return eventStartTime;
    }
    public void setEventStartTime(LocalDateTime eventStartTime) {
        this.eventStartTime = eventStartTime;
    }

    public Long getSeatNo() {
        return seatNo;
    }
    public void setSeatNo(Long seatNo) {
        this.seatNo = seatNo;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
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
}