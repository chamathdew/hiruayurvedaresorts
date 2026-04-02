package com.hiruresort.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    @JsonProperty("_id")
    private String id;
    
    private String userId;
    private String type; // CC_PAYMENT_ADDED
    private String message;
    private boolean isRead = false;
    private String paymentId;
    private Date createdAt = new Date();
}
