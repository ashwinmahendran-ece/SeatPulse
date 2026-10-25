package project.Seat_Pulse.DTOs;

public class AdminStatsDto {
    private long totalEvents;
    private long activeBookings;
    private double totalRevenue;
    private long registeredUsers;

    public AdminStatsDto(long totalEvents, long activeBookings, double totalRevenue, long registeredUsers) {
        this.totalEvents = totalEvents;
        this.activeBookings = activeBookings;
        this.totalRevenue = totalRevenue;
        this.registeredUsers = registeredUsers;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getRegisteredUsers() {
        return registeredUsers;
    }

    public void setRegisteredUsers(long registeredUsers) {
        this.registeredUsers = registeredUsers;
    }
}