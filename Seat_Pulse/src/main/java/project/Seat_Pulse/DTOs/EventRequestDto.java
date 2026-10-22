package project.Seat_Pulse.DTOs;


import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class EventRequestDto {

    @NotBlank(message = "Event Name is mandatory")
    private String eventName;

    @NotBlank(message = "Event Category is mandatory")
    private String eventCategory;

    @NotNull(message = "Event start Time should be mentioned")
    @Future
    private LocalDateTime eventStartTime;

    @Future
    @NotNull(message = "Event end Time should be mentioned")
    private LocalDateTime eventEndTime;

    @Min(value = 1 ,message="Total Seats must be greater than 0")
    private int totalSeats;

    public EventRequestDto(String eventName, String eventCategory, LocalDateTime eventStartTime, LocalDateTime eventEndTime, int totalSeats) {
        this.eventName = eventName;
        this.eventCategory = eventCategory;
        this.eventStartTime = eventStartTime;
        this.eventEndTime = eventEndTime;
        this.totalSeats = totalSeats;
    }

    public EventRequestDto(){

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

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }
}
