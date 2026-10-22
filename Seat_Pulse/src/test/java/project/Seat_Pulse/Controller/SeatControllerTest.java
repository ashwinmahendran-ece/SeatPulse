package project.Seat_Pulse.Controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import project.Seat_Pulse.DTOs.SeatResponseDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.controller.SeatController;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.service.SeatService;
import project.Seat_Pulse.service.UserService;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SeatController.class)
@AutoConfigureMockMvc(addFilters = false)
public class SeatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    SeatService seatService;

    @MockitoBean
    UserService userService;

    @MockitoBean
    project.Seat_Pulse.service.JwtService jwtService;

    @Test
    void testLockedSeat() throws Exception {
        long seatId = 1L;
        long userId = 12L;
        String fakeUsername = "Ashwin";

        User mockUser = new User();
        mockUser.setUserId(userId);
        when(userService.getUserByUserName(fakeUsername)).thenReturn(mockUser);

        SeatResponseDto seatResponseDto = new SeatResponseDto(seatId, 123L, "VIP", SeatStatus.LOCKED, 2L);
        when(seatService.lockedSeat(seatId, userId)).thenReturn(seatResponseDto);

        UsernamePasswordAuthenticationToken mockAuth =
                new UsernamePasswordAuthenticationToken(fakeUsername, null);

        mockMvc.perform(post("/api/seat/lock")
                        .param("seatId", String.valueOf(seatId))
                        .principal(mockAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatId").value(1L));
    }

    @Test
    void testBookSeat_Success() throws Exception {
        long seatId = 1L;
        long userId = 12L;
        String fakeUsername = "Ashwin";

        User mockUser = new User();
        mockUser.setUserId(userId);
        when(userService.getUserByUserName(fakeUsername)).thenReturn(mockUser);

        SeatResponseDto seatResponseDto = new SeatResponseDto(seatId, 123L, "VIP", SeatStatus.BOOKED, 2L);
        when(seatService.bookSeat(seatId, userId)).thenReturn(seatResponseDto);

        UsernamePasswordAuthenticationToken mockAuth =
                new UsernamePasswordAuthenticationToken(fakeUsername, null);

        mockMvc.perform(post("/api/seat/book")
                        .param("seatId", String.valueOf(seatId))
                        .principal(mockAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatId").value(1L))
                .andExpect(jsonPath("$.seatStatus").value("BOOKED"));
    }

    @Test
    void testGetAvailableSeats_ReturnsList() throws Exception {
        long eventId = 2L;
        SeatResponseDto seat1 = new SeatResponseDto(1L, 101L, "VIP", SeatStatus.AVAILABLE, eventId);
        SeatResponseDto seat2 = new SeatResponseDto(2L, 102L, "REGULAR", SeatStatus.AVAILABLE, eventId);

        when(seatService.getSeats(eventId)).thenReturn(List.of(seat1, seat2));

        mockMvc.perform(get("/api/seat/available")
                        .param("eventId", String.valueOf(eventId))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())

                .andExpect(jsonPath("$.length()").value(2))

                .andExpect(jsonPath("$[0].seatId").value(1L))
                .andExpect(jsonPath("$[0].seatCategory").value("VIP"))

                .andExpect(jsonPath("$[1].seatId").value(2L))
                .andExpect(jsonPath("$[1].seatCategory").value("REGULAR"));
    }
}