package com.hiruresort.backend.repositories;

import com.hiruresort.backend.models.CCPayment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CCPaymentRepository extends MongoRepository<CCPayment, String> {
    List<CCPayment> findByHotelBranchOrderByDateDesc(String hotelBranch);
    List<CCPayment> findAllByOrderByDateDesc();
}
