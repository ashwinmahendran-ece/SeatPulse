package project.Seat_Pulse.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.Seat_Pulse.DTOs.UserRegistrationDto;
import project.Seat_Pulse.DTOs.UserResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.service.UserService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> addUser(@Valid @RequestBody UserRegistrationDto dto){
        UserResponseDto response = userService.registerUser(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){
        String token = userService.verify(user);

        User dbUser = userService.getUserByUserName(user.getUserName());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", dbUser.getRole()
        ));
    }
}