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
    private String type; // CC_PAYMENT_ADDED, BIRTHDAY, BOOKING_ADDED
    private String message;
    private String hotelBranch;
    
    @org.springframework.data.mongodb.core.mapping.Field("isRead")
    @JsonProperty("isRead")
    private boolean read = false;
    
    @org.springframework.data.mongodb.core.mapping.Field("isActivity")
    @JsonProperty("isActivity")
    private boolean activity = true;
    private String paymentId;
    private String guestId;
    private Date createdAt = new Date();
}
