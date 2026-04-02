package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.Guest;
import com.hiruresort.backend.repositories.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guests")
public class GuestController {

    @Autowired
    private GuestRepository guestRepository;

    @PostMapping
    public ResponseEntity<Guest> registerGuest(@RequestBody @NonNull Guest guest) {
        guest = calculateBalance(guest);
        Guest savedGuest = guestRepository.save(guest);
        return ResponseEntity.status(201).body(savedGuest);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Guest> guests = guestRepository.findAll();
        long totalGuests = guests.size();

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date today = cal.getTime();

        long arrivals = guests.stream()
            .filter(g -> g.getArrivalDate() != null && !g.getArrivalDate().before(today))
            .count();

        long departures = guests.stream()
            .filter(g -> g.getDepartureDate() != null && !g.getDepartureDate().before(today))
            .count();

        double revenue = guests.stream()
            .mapToDouble(g -> g.getTotalAmount() != null ? g.getTotalAmount() : 0.0)
            .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGuests", totalGuests);
        stats.put("todayArrivals", arrivals);
        stats.put("todayDepartures", departures);
        stats.put("totalRevenue", revenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<List<Guest>> getAllGuests() {
        return ResponseEntity.ok(guestRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guest> getGuest(@PathVariable @NonNull String id) {
        return guestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Guest> updateGuest(@PathVariable @NonNull String id, @RequestBody @NonNull Guest guest) {
        if (!guestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        guest.setId(id);
        guest = calculateBalance(guest);
        Guest updatedGuest = guestRepository.save(guest);
        return ResponseEntity.ok(updatedGuest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGuest(@PathVariable @NonNull String id) {
        if (!guestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        guestRepository.deleteById(id);
        return ResponseEntity.ok("Guest deleted successfully");
    }

    private @NonNull Guest calculateBalance(@NonNull Guest guest) {
        double total = guest.getTotalAmount() != null ? guest.getTotalAmount() : 0.0;
        double advance = guest.getAdvancePayment() != null ? guest.getAdvancePayment() : 0.0;
        guest.setBalance(total - advance);

        if (guest.getBalance() <= 0 && total > 0) {
            guest.setPaymentStatus("Paid");
        } else if (advance > 0) {
            guest.setPaymentStatus("Partial");
        } else {
            guest.setPaymentStatus("Pending");
        }
        return guest;
    }
}
