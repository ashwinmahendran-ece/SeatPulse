package project.Seat_Pulse.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import project.Seat_Pulse.DTOs.ForgotPasswordDtos;
import project.Seat_Pulse.DTOs.UserRegistrationDto;
import project.Seat_Pulse.DTOs.UserResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.repository.UserRepository;
import project.Seat_Pulse.service.JwtService;
import project.Seat_Pulse.service.TokenBlacklistService;
import project.Seat_Pulse.service.UserService;
import project.Seat_Pulse.service.OtpService;
import project.Seat_Pulse.config.RabbitMQConfig;
import project.Seat_Pulse.DTOs.OtpEmailEvent;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtService jwtService;

    private final OtpService otpService;
    private final RabbitTemplate rabbitTemplate;
    private final StringRedisTemplate redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserController(UserService userService, TokenBlacklistService tokenBlacklistService, JwtService jwtService,
                          OtpService otpService, RabbitTemplate rabbitTemplate, StringRedisTemplate redisTemplate,
                          PasswordEncoder passwordEncoder, UserRepository userRepository){
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtService = jwtService;

        this.otpService = otpService;
        this.rabbitTemplate = rabbitTemplate;
        this.redisTemplate = redisTemplate;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
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

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody ForgotPasswordDtos.SendOtpRequest request) {
        User user = userRepository.findByEmailId(request.getEmail());
        if (user == null) {
            return ResponseEntity.ok(Map.of("message", "If the email is registered, an OTP has been sent."));
        }

        String otp = otpService.generateAndSaveOtp(request.getEmail());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.OTP_EXCHANGE,
                RabbitMQConfig.OTP_ROUTING_KEY,
                new OtpEmailEvent(request.getEmail(), otp)
        );
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully."));
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody ForgotPasswordDtos.VerifyOtpRequest request) {
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp());

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP."));
        }
        String grantKey = "RESET_GRANTED:" + request.getEmail();
        redisTemplate.opsForValue().set(grantKey, "true", 5, TimeUnit.MINUTES);

        return ResponseEntity.ok(Map.of("message", "OTP verified. Proceed to reset password."));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ForgotPasswordDtos.ResetPasswordRequest request) {

        String grantKey = "RESET_GRANTED:" + request.getEmail();
        String isGranted = redisTemplate.opsForValue().get(grantKey);
        if (isGranted == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Password reset session expired or invalid. Please verify OTP again."));
        }
        User user = userRepository.findByEmailId(request.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        redisTemplate.delete(grantKey);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }
}