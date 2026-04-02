package com.hiruresort.backend.repositories;

import com.hiruresort.backend.models.Guest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GuestRepository extends MongoRepository<Guest, String> {
    List<Guest> findByHotelBranch(String hotelBranch);
}
