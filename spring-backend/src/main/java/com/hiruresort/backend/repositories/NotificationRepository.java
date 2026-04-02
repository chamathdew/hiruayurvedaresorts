package com.hiruresort.backend.repositories;

import com.hiruresort.backend.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
