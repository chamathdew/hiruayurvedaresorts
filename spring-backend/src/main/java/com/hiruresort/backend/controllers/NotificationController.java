package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.Notification;
import com.hiruresort.backend.repositories.NotificationRepository;
import com.hiruresort.backend.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Notification>> getRecentActivities() {
        // Trigger Birthday Check when dashboard loads
        notificationService.checkAndCreateBirthdayNotifications();
        return ResponseEntity.ok(notificationRepository.findTop5ByActivityTrueOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        if (id == null) return ResponseEntity.badRequest().build();
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setRead(true);
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> !n.isRead())
                .peek(n -> n.setRead(true))
                .toList();
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
