package project.Seat_Pulse.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
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
}