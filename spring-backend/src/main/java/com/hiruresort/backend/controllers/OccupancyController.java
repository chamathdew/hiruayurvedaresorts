package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.Occupancy;
import com.hiruresort.backend.models.Guest;
import com.hiruresort.backend.services.NotificationService;
import com.hiruresort.backend.repositories.OccupancyRepository;
import com.hiruresort.backend.repositories.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.ZoneId;
import java.util.Date;

@RestController
@RequestMapping("/api/occupancy")
public class OccupancyController {

    @Autowired
    private OccupancyRepository occupancyRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Occupancy> getAllOccupancy(@RequestHeader("Authorization") String token) {
        return occupancyRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Occupancy> createOccupancy(@RequestBody Occupancy occupancy) {
        if (occupancy == null) return ResponseEntity.badRequest().build();
        Occupancy saved = occupancyRepository.save(occupancy);
        
        // Sync Belegungsplan addition to Guests list for Arrival/Departure tracking
        try {
            Guest guest = new Guest();
            String name = (saved.getGuestDetail() != null && !saved.getGuestDetail().trim().isEmpty()) 
                            ? saved.getGuestDetail() 
                            : "Belegungsplan Entry";
            guest.setFullName(name);
            guest.setRoomNumber(saved.getRoomNo());
            guest.setHotelBranch(saved.getHotelBranch() != null ? saved.getHotelBranch() : "Hiru Ayurveda Resort");
            
            if (saved.getStartDate() != null) {
                guest.setArrivalDate(Date.from(saved.getStartDate().atStartOfDay(ZoneId.systemDefault()).toInstant()));
            }
            if (saved.getEndDate() != null) {
                guest.setDepartureDate(Date.from(saved.getEndDate().atStartOfDay(ZoneId.systemDefault()).toInstant()));
            }
            guest.setPaymentStatus("Pending");
            guest.setRemark(saved.getRemark());
            
            guestRepository.save(guest);
        } catch (Exception e) {
            System.err.println("Failed to sync Occupancy to Guest: " + e.getMessage());
        }

        // Trigger Activity Notification
        notificationService.createNotification(
            "BOOKING_ADDED", 
            "New Arrival added to Belegungsplan: Room " + saved.getRoomNo() + " (" + saved.getHotelBranch() + ")",
            saved.getHotelBranch() != null ? saved.getHotelBranch() : "Admin",
            null,
            null
        );
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Occupancy> updateOccupancy(@PathVariable String id, @RequestBody Occupancy occupancy) {
        if (id == null || occupancy == null) return ResponseEntity.badRequest().build();
        occupancy.setId(id);
        return ResponseEntity.ok(occupancyRepository.save(occupancy));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOccupancy(@PathVariable String id) {
        if (id == null) return ResponseEntity.badRequest().build();
        occupancyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
