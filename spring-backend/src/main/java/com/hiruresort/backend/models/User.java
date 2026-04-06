package com.hiruresort.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String username;
    
    private String password;
    
    private String role; // Admin, Manager, Accounts, Front Office
    
    private String hotelBranch; // Hiru Villa, Hiru Om, Hiru Mudhra, Hiru Aadya, All

    private String profilePicture; // Base64 or URL
}
