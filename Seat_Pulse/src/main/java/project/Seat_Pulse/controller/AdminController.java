package project.Seat_Pulse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import project.Seat_Pulse.service.AdminService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAdminStats(authentication.getName()));
    }

    @PostMapping("/scan-ticket")
    public ResponseEntity<?> scanTicket(@RequestParam("seatId") Long seatId, Authentication authentication) {
        try {
            Map<String, String> response = adminService.scanTicket(seatId, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }
}