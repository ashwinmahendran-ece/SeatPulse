package project.Seat_Pulse.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.service.JwtService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import project.Seat_Pulse.DTOs.EventRequestDto;
import project.Seat_Pulse.DTOs.EventResponseDto;
import project.Seat_Pulse.controller.EventController;
import project.Seat_Pulse.service.EventService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@AutoConfigureMockMvc(addFilters = false)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void testAddEvent_ReturnsCreatedEvent() throws Exception {
        EventRequestDto requestDto = new EventRequestDto();
        requestDto.setEventName("UI/UX Masterclass");
        requestDto.setEventCategory("Design");
        requestDto.setTotalSeats(100);
        requestDto.setEventStartTime(LocalDateTime.now().plusDays(5));
        requestDto.setEventEndTime(LocalDateTime.now().plusDays(5).plusHours(2));

        EventResponseDto responseDto = new EventResponseDto(1L, "UI/UX Masterclass", 100);

        when(eventService.addEvent(any(EventRequestDto.class))).thenReturn(responseDto);

        String jsonRequest = objectMapper.writeValueAsString(requestDto);

        mockMvc.perform(post("/api/events/addEvent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventId").value(1L))
                .andExpect(jsonPath("$.eventName").value("UI/UX Masterclass"))
                .andExpect(jsonPath("$.totalSeats").value(100));
    }

    @Test
    void testSearchEvents_ReturnsPaginatedList() throws Exception {

        Event fakeEvent = new Event();
        fakeEvent.setEventName("Rock Concert");
        fakeEvent.setEventCategory("Music");

        Page<Event> fakePage = new PageImpl<>(List.of(fakeEvent));

        when(eventService.searchUpcomingEvents("Music", 0, 10, "eventStartTime"))
                .thenReturn(fakePage);

        mockMvc.perform(get("/api/events/search")

                        .param("category", "Music")
                        .param("pageNo", "0")
                        .param("pageSize", "10")
                        .param("sortBy", "eventStartTime"))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].eventName").value("Rock Concert"))
                .andExpect(jsonPath("$.content.length()").value(1))

                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.page.totalPages").value(1));
    }
}