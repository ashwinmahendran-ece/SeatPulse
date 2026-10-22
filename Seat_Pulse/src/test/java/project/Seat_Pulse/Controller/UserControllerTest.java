package project.Seat_Pulse.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import project.Seat_Pulse.DTOs.UserRegistrationDto;
import project.Seat_Pulse.DTOs.UserResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.controller.UserController;
import project.Seat_Pulse.service.UserService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    MockMvc mockmvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    project.Seat_Pulse.service.JwtService jwtService;

    @MockitoBean
    project.Seat_Pulse.service.MyUserDetailsService myUserDetailsService;

    @MockitoBean
    UserService userService;

    @Test
    void testRegisteredUser() throws Exception {

        UserRegistrationDto userRegistrationDto = new UserRegistrationDto();

        userRegistrationDto.setUserName("Ashwin");
        userRegistrationDto.setMobileNumber("1234567890");
        userRegistrationDto.setEmailId("ash@gmail.com");
        userRegistrationDto.setPassword("12345");

        UserResponseDto userResponseDto = new UserResponseDto();

        userResponseDto.setUserName(userRegistrationDto.getUserName());
        userResponseDto.setMobileNumber(userRegistrationDto.getMobileNumber());
        userResponseDto.setEmailId(userRegistrationDto.getEmailId());

        when(userService.registerUser(any(UserRegistrationDto.class))).thenReturn(userResponseDto);

        mockmvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRegistrationDto)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("Ashwin"))
                .andExpect(jsonPath("$.mobileNumber").value("1234567890"))
                .andExpect(jsonPath("$.emailId").value("ash@gmail.com"));
    }

    @Test
    void testLogin_ReturnsTokenAndRole() throws Exception {
        User loginUser = new User();
        loginUser.setUserName("Ashwin");
        loginUser.setPassword("secure123");

        User dbUser = new User();
        dbUser.setUserName("Ashwin");
        dbUser.setRole("ADMIN");

        when(userService.verify(any(User.class))).thenReturn("dummy.jwt.token");
        when(userService.getUserByUserName("Ashwin")).thenReturn(dbUser);

        mockmvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("dummy.jwt.token"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
