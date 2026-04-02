package com.hiruresort.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "guests")
public class Guest {
    @Id
    @JsonProperty("_id")
    private String id;
    
    private String fullName;
    private String nationality;
    private String passportNumber;
    private String passportCopyUrl;
    private Date dateOfBirth;
    private String gender;
    private String contactNumber;
    private String email;
    private String hotelBranch;
    private String roomNumber;
    private Date arrivalDate;
    private Date departureDate;
    private Integer pax = 1;
    private String agent;
    private String remark;
    private Date visaExpiryDate;
    private String treatmentPackage;
    private String specialNotes;
    private String paymentStatus = "Pending";
    private Double totalAmount = 0.0;
    private Double advancePayment = 0.0;
    private Double balance = 0.0;
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
}
