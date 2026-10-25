package project.Seat_Pulse.DTOs;
import java.util.List;

public class SeatCreationRequestDto {
    private List<SeatDto> seats;

    public List<SeatDto> getSeats() {
        return seats;
    }
    public void setSeats(List<SeatDto> seats) {
        this.seats = seats;
    }
}