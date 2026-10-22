package project.Seat_Pulse.DTOs;

import java.time.LocalDateTime;

public class BookingResponseDto {
    private Long eventId;
    private String eventName;
    private LocalDateTime eventStartTime;
    private Long seatNo;
    private String status;
    private Long seatId;

    public BookingResponseDto(Long eventId, String eventName, LocalDateTime eventStartTime, Long seatNo, String status,Long seatId) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventStartTime = eventStartTime;
        this.seatNo = seatNo;
        this.status = status;
        this.seatId = seatId;
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
}