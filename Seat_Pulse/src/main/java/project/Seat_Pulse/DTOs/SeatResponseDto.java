package project.Seat_Pulse.DTOs;

import project.Seat_Pulse.enums.SeatStatus;

import java.io.Serializable;
import java.math.BigDecimal;

public class SeatResponseDto implements Serializable {
    private long seatId;
    private long seatNo;
    private String seatCategory;
    private SeatStatus seatStatus;
    private long eventId;
    private BigDecimal price;
    private String eventName;
    private String orderId;


    public SeatResponseDto(long seatId, long seatNo, String seatCategory, SeatStatus seatStatus, long eventId, BigDecimal price, String eventName, String orderId) {
        this.seatId = seatId;
        this.seatNo = seatNo;
        this.seatCategory = seatCategory;
        this.seatStatus = seatStatus;
        this.eventId = eventId;
        this.price = price;
        this.eventName = eventName;
        this.orderId = orderId;
    }

    public SeatResponseDto(){

    }

    public long getSeatNo() {
        return seatNo;
    }

    public void setSeatNo(long seatNo) {
        this.seatNo = seatNo;
    }

    public long getSeatId() {
        return seatId;
    }

    public void setSeatId(long seatId) {
        this.seatId = seatId;
    }

    public String getSeatCategory() {
        return seatCategory;
    }

    public void setSeatCategory(String seatCategory) {
        this.seatCategory = seatCategory;
    }

    public SeatStatus getSeatStatus() {
        return seatStatus;
    }

    public void setSeatStatus(SeatStatus seatStatus) {
        this.seatStatus = seatStatus;
    }

    public long getEventId() {
        return eventId;
    }

    public void setEventId(long eventId) {
        this.eventId = eventId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
}
