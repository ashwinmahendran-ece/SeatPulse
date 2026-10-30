package project.Seat_Pulse.Entity;

import jakarta.persistence.*;
import project.Seat_Pulse.enums.SeatStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatId;

    private String seatCategory;

    private Long seatNo;

    private LocalDateTime lockedAt;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    private String tier;

    @ManyToOne
    @JoinColumn(name="locked_by_userid")
    private User lockedBy;

    @ManyToOne
    @JoinColumn(name="event_id")
    private Event event;

    private String orderId;

    public Seat(Long seatId, String seatCategory, Long seatNo, User lockedBy, Event event, LocalDateTime lockedAt,BigDecimal price,String orderId) {
        this.seatId = seatId;
        this.seatCategory = seatCategory;
        this.seatNo = seatNo;
        this.lockedBy = lockedBy;
        this.event = event;
        this.lockedAt = lockedAt;
        this.price = price;
        this.orderId = orderId;
    }

    public Seat(){

    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public String getSeatCategory() {
        return seatCategory;
    }

    public void setSeatCategory(String seatCategory) {
        this.seatCategory = seatCategory;
    }

    public Long getSeatNo() {
        return seatNo;
    }

    public void setSeatNo(Long seatNo) {
        this.seatNo = seatNo;
    }

    public User getLockedBy() {
        return lockedBy;
    }

    public void setLockedBy(User lockedBy) {
        this.lockedBy = lockedBy;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public LocalDateTime getLockedAt() {
        return lockedAt;
    }

    public void setLockedAt(LocalDateTime lockedAt) {
        this.lockedAt = lockedAt;
    }

    public SeatStatus getStatus() {
        return status;
    }

    public void setStatus(SeatStatus status)  {
        this.status = status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    @Override
    public String toString() {
        return "Seat{" +
                "seatId=" + seatId +
                ", seatCategory='" + seatCategory + '\'' +
                ", seatNo=" + seatNo +
                ", lockedAt=" + lockedAt +
                ", price=" + price +
                ", status=" + status +
                ", tier='" + tier + '\'' +
                ", lockedBy=" + lockedBy +
                ", event=" + event +
                ", orderId='" + orderId + '\'' +
                '}';
    }
}
