package project.Seat_Pulse.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;
import project.Seat_Pulse.service.JwtService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    @Mock
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        String testSecret = "VGhpcy1pcy1hLXZlcnktc2VjdXJlLXRlc3Qta2V5LTEyMzQ1Njc4OTA=";
        ReflectionTestUtils.setField(jwtService, "secretKey", testSecret);
    }

    @Test
    void testGenerateAndValidateToken() {

        String username = "Ashwin";
        when(userDetails.getUsername()).thenReturn(username);

        String token = jwtService.generateToken(username, user.getRole());
        String extractedUsername = jwtService.extractUsername(token);
        boolean isValid = jwtService.validateToken(token, userDetails);

        assertNotNull(token);
        assertEquals(username, extractedUsername);
        assertTrue(isValid);
    }
}