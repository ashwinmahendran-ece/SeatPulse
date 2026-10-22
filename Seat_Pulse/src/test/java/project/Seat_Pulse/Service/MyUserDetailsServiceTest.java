package project.Seat_Pulse.Service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.repository.UserRepository;
import project.Seat_Pulse.service.MyUserDetailsService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MyUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MyUserDetailsService userDetailsService;

    @Test
    void testLoadUserByUsername_UserExists() {
        User user = new User();
        user.setUserName("admin");
        user.setPassword("secret");
        user.setRole("ADMIN");

        when(userRepository.findByUserName("admin")).thenReturn(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername("admin");

        assertNotNull(userDetails);
        assertEquals("admin", userDetails.getUsername());
        assertEquals("secret", userDetails.getPassword());
    }

    @Test
    void testLoadUserByUsername_UserNotFound_ThrowsException() {
        when(userRepository.findByUserName(anyString())).thenReturn(null);

        assertThrows(RuntimeException.class, () -> {
            userDetailsService.loadUserByUsername("unknown_user");
        });
    }
}