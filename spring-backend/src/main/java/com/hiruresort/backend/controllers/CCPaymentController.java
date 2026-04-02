package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.CCPayment;
import com.hiruresort.backend.models.Notification;
import com.hiruresort.backend.models.User;
import com.hiruresort.backend.repositories.CCPaymentRepository;
import com.hiruresort.backend.repositories.NotificationRepository;
import com.hiruresort.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cc-payments")
public class CCPaymentController {

    @Autowired
    private CCPaymentRepository ccPaymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<CCPayment> addPayment(@RequestBody @NonNull CCPayment payment) {
        CCPayment savedPayment = ccPaymentRepository.save(payment);

        // Create notifications for Admin and Accounts
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if ("Admin".equals(user.getRole()) || "Accounts".equals(user.getRole())) {
                Notification notification = new Notification();
                notification.setUserId(user.getId());
                notification.setType("CC_PAYMENT_ADDED");
                notification.setMessage("New CC Settlement: " + savedPayment.getInvoiceNo() + " at " + savedPayment.getHotelBranch());
                notification.setPaymentId(savedPayment.getId());
                notificationRepository.save(notification);
            }
        }

        return ResponseEntity.status(201).body(savedPayment);
    }

    @GetMapping
    public ResponseEntity<List<CCPayment>> getAllPayments() {
        List<CCPayment> payments = ccPaymentRepository.findAllByOrderByDateDesc();
        return ResponseEntity.ok(payments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable @NonNull String id) {
        if (!ccPaymentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        ccPaymentRepository.deleteById(id);
        return ResponseEntity.ok("Payment has been deleted...");
    }
}
