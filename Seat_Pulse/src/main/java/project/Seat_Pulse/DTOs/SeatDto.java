package project.Seat_Pulse.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class SeatDto {

    @JsonProperty("seatNumber")
    private Long seatNo;

    private String tier;

    private BigDecimal price;

    private String category;

    public Long getSeatNo() {
        return seatNo;
    }
    public void setSeatNumber(Long seatNo) {
        this.seatNo = seatNo;
    }
    public String getTier() {
        return tier;
    }
    public void setTier(String tier) {
        this.tier = tier;
    }
    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}