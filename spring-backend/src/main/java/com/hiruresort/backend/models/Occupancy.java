package com.hiruresort.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

@Data
@Document(collection = "occupancy")
public class Occupancy {
    @Id
    private String id;
    
    private String roomNo;
    private String hotelBranch;
    private String guestDetail; // Guest Name / Flight No
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private String color; // Orange, Pink, Yellow, Green, etc.
    private String remark;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    private java.util.Date lastUpdated;
}

