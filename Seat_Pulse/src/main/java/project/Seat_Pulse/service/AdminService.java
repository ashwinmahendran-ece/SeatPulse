package project.Seat_Pulse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.AdminStatsDto;
import project.Seat_Pulse.repository.EventRepository;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    public AdminStatsDto getDashboardStats() {
        long totalEvents = eventRepository.count();
        long registeredUsers = userRepository.count();
        long activeBookings = seatRepository.countBookedSeats();
        double totalRevenue = seatRepository.sumTotalRevenue();

        return new AdminStatsDto(
                totalEvents,
                activeBookings,
                totalRevenue,
                registeredUsers
        );
    }
}