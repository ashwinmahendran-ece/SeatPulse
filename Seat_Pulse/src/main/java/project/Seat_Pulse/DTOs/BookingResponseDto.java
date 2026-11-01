package project.Seat_Pulse.DTOs;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponseDto {
    private Long eventId;
    private String eventName;
    private LocalDateTime eventStartTime;
    private String seatNo;
    private String status;
    private Long seatId;
    private String location;
    private String venue;
    private String orderId;
    private BigDecimal price;

    public BookingResponseDto(Long eventId, String eventName, LocalDateTime eventStartTime, String seatNo, String status, Long seatId, String location, String venue, String orderId, BigDecimal price) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventStartTime = eventStartTime;
        this.seatNo = seatNo;
        this.status = status;
        this.seatId = seatId;
        this.location = location;
        this.venue = venue;
        this.orderId = orderId;
        this.price = price;
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

    public String getSeatNo() {
        return seatNo;
    }
    public void setSeatNo(String seatNo) {
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

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}