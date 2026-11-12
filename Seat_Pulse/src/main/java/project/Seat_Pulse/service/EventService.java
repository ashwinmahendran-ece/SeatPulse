package project.Seat_Pulse.service;

import com.razorpay.RazorpayClient;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.DTOs.EventCancellationDto;
import project.Seat_Pulse.DTOs.EventRequestDto;
import project.Seat_Pulse.DTOs.EventResponseDto;
import project.Seat_Pulse.Entity.Event;
import project.Seat_Pulse.Entity.Seat;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.enums.EventStatus;
import project.Seat_Pulse.enums.SeatStatus;
import project.Seat_Pulse.repository.EventRepository;
import project.Seat_Pulse.repository.SeatRepository;
import project.Seat_Pulse.repository.UserRepository;

import java.util.*;

@Service
public class EventService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final EventRepository eventRepo;
    private final SeatService seatService;
    private final UserRepository userRepo;
    private final SeatRepository seatRepo;
    private final RabbitTemplate rabbitTemplate;
    private final CancellationProducer cancellationProducer;

    public EventService(EventRepository eventRepo, SeatService seatService, UserRepository userRepo, SeatRepository seatRepo, RabbitTemplate rabbitTemplate, CancellationProducer cancellationProducer){
        this.eventRepo = eventRepo;
        this.seatService = seatService;
        this.userRepo = userRepo;
        this.seatRepo = seatRepo;
        this.rabbitTemplate = rabbitTemplate;
        this.cancellationProducer = cancellationProducer;
    }

    @Transactional
    @CacheEvict(value = "eventsCache", allEntries = true)
    public EventResponseDto addEvent(EventRequestDto eventRequestDto, String username) {

        User organizer = userRepo.findByEmailId(username);
        if (organizer == null) {
            throw new RuntimeException("Organizer not found");
        }

        Event event = new Event();
        event.setEventName(eventRequestDto.getEventName());
        event.setEventCategory(eventRequestDto.getEventCategory());
        event.setLocation(eventRequestDto.getLocation());
        event.setVenue(eventRequestDto.getVenue());
        event.setEventStartTime(eventRequestDto.getEventStartTime());
        event.setEventEndTime(eventRequestDto.getEventEndTime());
        event.setTotalSeats(eventRequestDto.getTotalSeats());

        event.setOrganizer(organizer);

        Event savedEvent = eventRepo.save(event);

        seatService.generateSeatsForEvent(savedEvent, savedEvent.getTotalSeats());

        EventResponseDto responseDto = new EventResponseDto();
        responseDto.setEventId(savedEvent.getEventId());
        responseDto.setEventName(savedEvent.getEventName());
        responseDto.setEventCategory(savedEvent.getEventCategory());
        responseDto.setLocation(savedEvent.getLocation());
        responseDto.setVenue(savedEvent.getVenue());
        responseDto.setEventStartTime(savedEvent.getEventStartTime());
        responseDto.setTotalSeats(savedEvent.getTotalSeats());

        return responseDto;
    }

    @Cacheable(value="eventsCache")
    public Page<Event> searchUpcomingEvents(String category, int pageNo, int pageSize, String sortBy) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortBy).descending());
        System.out.println("[DB HIT] Executing SQL to fetch events from the database...");

        return eventRepo.searchUpcomingEvents(category, pageable);
    }

    public List<Event> getEventsByOrganizer(String username) {
        User organizer = userRepo.findByEmailId(username);
        if (organizer == null) {
            throw new RuntimeException("Organizer not found");
        }

        return eventRepo.findByOrganizer_UserIdOrderByEventStartTimeDesc(organizer.getUserId());
    }

    @Transactional
    public void cancelEntireEvent(Long eventId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(EventStatus.CANCELLED);
        eventRepo.save(event);

        List<Seat> bookedSeats = seatRepo.findByEvent_EventId(eventId).stream()
                .filter(seat -> seat.getStatus() == SeatStatus.BOOKED)
                .toList();

        List<String> affectedEmails = new ArrayList<>();

        Set<String> uniquePaymentIdsToRefund = new HashSet<>();

        for (Seat seat : bookedSeats) {
            affectedEmails.add(seat.getLockedBy().getEmailId());

            if (seat.getPaymentId() != null && !seat.getPaymentId().isEmpty()) {
                uniquePaymentIdsToRefund.add(seat.getPaymentId()); // Set automatically prevents duplicates!
            }

            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockedBy(null);
            seat.setOrderId(null);
            seat.setPaymentId(null);
        }

        seatRepo.saveAll(bookedSeats);
        seatService.evictSeatMapCache(eventId);

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            for (String paymentId : uniquePaymentIdsToRefund) {
                JSONObject refundReq = new JSONObject();
                razorpay.payments.refund(paymentId, refundReq);
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to process event refunds - " + e.getMessage());
        }

        EventCancellationDto payload = new EventCancellationDto(eventId, event.getEventName(), affectedEmails);
        rabbitTemplate.convertAndSend("cancellation_exchange", "routing.cancellation", payload);
    }
}