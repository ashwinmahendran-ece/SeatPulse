package project.Seat_Pulse.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.Seat_Pulse.DTOs.UserRegistrationDto;
import project.Seat_Pulse.DTOs.UserResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.service.JwtService;
import project.Seat_Pulse.service.TokenBlacklistService;
import project.Seat_Pulse.service.UserService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtService jwtService;

    public UserController(UserService userService, TokenBlacklistService tokenBlacklistService, JwtService jwtService){
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> addUser(@Valid @RequestBody UserRegistrationDto dto){
        UserResponseDto response = userService.registerUser(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){
        String token = userService.verify(user);

        User dbUser = userService.getUserByEmailId(user.getEmailId());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", dbUser.getRole()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            long ttlInMillis = jwtService.getRemainingExpirationTime(token);
            if (ttlInMillis > 0) {
                tokenBlacklistService.blacklistToken(token, ttlInMillis);
            }
        }

        return ResponseEntity.ok("Logged out successfully");
    }
}