package com.hiruresort.backend.repositories;

import com.hiruresort.backend.models.Occupancy;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OccupancyRepository extends MongoRepository<Occupancy, String> {
    List<Occupancy> findByHotelBranch(String hotelBranch);
    List<Occupancy> findByHotelBranchIn(List<String> branches);
}
