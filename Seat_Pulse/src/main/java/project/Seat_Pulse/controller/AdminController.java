package project.Seat_Pulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.Seat_Pulse.DTOs.AdminStatsDto;
import project.Seat_Pulse.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getDashboardStats() {
        AdminStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}