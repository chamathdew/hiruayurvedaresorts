package com.hiruresort.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "ccpayments")
public class CCPayment {
    @Id
    @JsonProperty("_id")
    private String id;
    private Date date;
    private String invoiceNo;
    private String bank;
    private Double paymentAmount;
    private Double commission;
    private Double totalAmount;
    private String hotelBranch;
    private String enteredBy;
    private String status = "Pending";
}
