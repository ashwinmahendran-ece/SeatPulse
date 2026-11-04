package project.Seat_Pulse.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import project.Seat_Pulse.DTOs.PaymentVerificationDto;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.service.SeatService;
import project.Seat_Pulse.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final SeatService seatService;
    private final UserService userService;

    public PaymentController(SeatService seatService, UserService userService) {
        this.seatService = seatService;
        this.userService = userService;
    }

    @PostMapping("/create-order")
    public Map<String, String> createOrder(
            @RequestParam List<Long> seatIds,
            @RequestParam Double amount
    ) throws Exception {
        RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

        int amountInPaise = (int) (amount * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + UUID.randomUUID().toString());

        Order order = razorpay.orders.create(orderRequest);

        Map<String, String> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        return response;
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody PaymentVerificationDto dto, Authentication authentication) {
        try {

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", dto.getRazorpayOrderId());
            options.put("razorpay_payment_id", dto.getRazorpayPaymentId());
            options.put("razorpay_signature", dto.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (!isValid) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment signature verification failed.");
            }

            User user = userService.getUserByEmailId(authentication.getName());

            seatService.confirmOrder(dto.getRazorpayOrderId(), user.getUserId());

            return ResponseEntity.ok("Payment verified and seats booked successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment verified, but database update failed: " + e.getMessage());
        }
    }
}