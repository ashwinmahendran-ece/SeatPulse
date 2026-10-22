package project.Seat_Pulse.Service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import project.Seat_Pulse.DTOs.UserRegistrationDto;
import project.Seat_Pulse.DTOs.UserResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.repository.UserRepository;
import project.Seat_Pulse.service.JwtService;
import project.Seat_Pulse.service.UserService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    JwtService jwtService;

    @InjectMocks
    UserService userService;

    BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    @Test
    void testRegisteredUser(){

        UserRegistrationDto userRegistrationDto = new UserRegistrationDto();
        userRegistrationDto.setUserName("Ashwin");
        userRegistrationDto.setEmailId("ash@gmail.com");
        userRegistrationDto.setMobileNumber("1234567890");
        userRegistrationDto.setPassword("a1s2h3");

        User registeredUser = new User();
        registeredUser.setUserName(userRegistrationDto.getUserName());
        registeredUser.setEmailId(userRegistrationDto.getEmailId());
        registeredUser.setMobileNo(userRegistrationDto.getMobileNumber());
        registeredUser.setPassword(bCryptPasswordEncoder.encode(userRegistrationDto.getPassword()));
        registeredUser.setRole("USER");
        when(userRepository.save(any(User.class))).thenReturn(registeredUser);

        UserResponseDto userResponseDto = userService.registerUser(userRegistrationDto);

        assertNotNull(userResponseDto);
        assertEquals("Ashwin",userResponseDto.getUserName());
        assertEquals("ash@gmail.com",userResponseDto.getEmailId());
        assertEquals("1234567890",userResponseDto.getMobileNumber());

        verify(userRepository, Mockito.times(1)).save(any(User.class));
    }

    @Test
    void testGetUserbyUsername(){
        User user = new User();
        user.setUserName("Ashwin");
        when(userRepository.findByUserName("Ashwin")).thenReturn(user);

        User result = userService.getUserByUserName("Ashwin");

        assertNotNull(result);
        assertEquals("Ashwin",result.getUserName());
        verify(userRepository,Mockito.times(1)).findByUserName("Ashwin");
    }

    @Test
    void testVerifyUser(){
        User user = new User();
        user.setUserName("Ashwin");
        user.setPassword("12345");

        Authentication mockAuth = Mockito.mock(Authentication.class);

        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);

        when(jwtService.generateToken("Ashwin")).thenReturn("mock-jwt-token");

        String result = userService.verify(user);

        assertEquals("mock-jwt-token",result);
    }
}
