package project.Seat_Pulse.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.AdminStatsDto;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.EventRepository;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final UserService userService;
    private final SeatService seatService;

    public AdminService(EventRepository eventRepository, UserRepository userRepository, SeatRepository seatRepository, UserService userService , SeatService seatService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.seatRepository = seatRepository;
        this.userService = userService;
        this.seatService = seatService;
    }

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

    public Map<String, Object> getAdminStats(String adminEmail) {
        User admin = userService.getUserByEmailId(adminEmail);
        Long adminId = admin.getUserId();

        long totalEvents = eventRepository.countByOrganizer_UserId(adminId);
        long activeBookings = seatRepository.countBookingsByOrganizer(adminId);

        Double rawRevenue = seatRepository.sumRevenueByOrganizer(adminId);
        double totalRevenue = (rawRevenue != null) ? rawRevenue : 0.0;

        long registeredUsers = seatRepository.countUniqueCustomersByOrganizer(adminId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("activeBookings", activeBookings);
        stats.put("totalRevenue", totalRevenue);
        stats.put("registeredUsers", registeredUsers);

        return stats;
    }

    @Transactional
    public Map<String, String> scanTicket(Long seatId, String adminEmail) {
        User admin = userService.getUserByEmailId(adminEmail);

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Ticket: Seat not found."));

        if (!seat.getEvent().getOrganizer().getUserId().equals(admin.getUserId())) {
            throw new SecurityException("Unauthorized: This ticket belongs to a different organizer's event.");
        }

        if (seat.getStatus() == SeatStatus.CHECKED_IN) {
            throw new IllegalStateException("ALREADY SCANNED: This ticket was already used.");
        }

        if (seat.getStatus() != SeatStatus.BOOKED) {
            throw new IllegalArgumentException("INVALID: This ticket is not booked (Status: " + seat.getStatus() + ").");
        }

        seat.setStatus(SeatStatus.CHECKED_IN);
        seatRepository.save(seat);

        seatService.evictSeatMapCache(seat.getEvent().getEventId());

        Map<String, String> response = new HashMap<>();
        response.put("success", "Valid Ticket! Seat " + seat.getSeatNo() + " checked in successfully.");
        return response;
    }
}