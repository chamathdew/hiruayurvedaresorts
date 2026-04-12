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

    @PostMapping("/import")
    public ResponseEntity<?> importGuests(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty");
        
        try (java.io.InputStream is = file.getInputStream();
             org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(is)) {
            
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            java.util.List<Guest> guestsToSave = new java.util.ArrayList<>();
            
            // Clear existing records for this branch to ensure a clean sync
            guestRepository.deleteByHotelBranch("Hiru Om");
            
            // Skip headers (Rows 1-3) - Data starts at Row 4 (index 3)
            for (int r = 3; r <= sheet.getLastRowNum(); r++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(r);
                if (row == null) continue;
                
                Guest g = new Guest();
                // Column D (index 3): Name
                g.setFullName(getCellValueAsString(row.getCell(3)));
                if (g.getFullName() == null || g.getFullName().isEmpty()) continue;
                
                // Column E (index 4): Country
                g.setNationality(getCellValueAsString(row.getCell(4)));
                // Column F (index 5): Passport
                g.setPassportNumber(getCellValueAsString(row.getCell(5)));
                // Column G (index 6): Room No
                g.setRoomNumber(getCellValueAsString(row.getCell(6)));
                // Column H (index 7): Date of arrival
                g.setArrivalDate(getCellValueAsDate(row.getCell(7)));
                // Column I (index 8): Date of Departure
                g.setDepartureDate(getCellValueAsDate(row.getCell(8)));
                // Column J (index 9): Visa expiry date
                g.setVisaExpiryDate(getCellValueAsDate(row.getCell(9)));
                // Column K (index 10): Sponsored by (Agent)
                g.setAgent(getCellValueAsString(row.getCell(10)));
                // Column L (index 11): Birth date
                g.setDateOfBirth(getCellValueAsDate(row.getCell(11)));
                // Column M (index 12): Email
                g.setEmail(getCellValueAsString(row.getCell(12)));
                // Column N (index 13): Telephone
                g.setContactNumber(getCellValueAsString(row.getCell(13)));
                
                g.setHotelBranch("Hiru Om");
                g.setPaymentStatus("Pending");
                
                guestsToSave.add(g);
            }
            
            if (!guestsToSave.isEmpty()) {
                guestRepository.saveAll(guestsToSave);
                return ResponseEntity.ok("Successfully imported " + guestsToSave.size() + " guests.");
            }
            return ResponseEntity.ok("No valid guest data found in the sheet.");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Import failed: " + e.getMessage());
        }
    }

    private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: 
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) return null; // handled by date getter
                return String.valueOf((long)cell.getNumericCellValue());
            default: return null;
        }
    }

    private Date getCellValueAsDate(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC && org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue();
        }
        if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            if (val.isEmpty()) return null;
            try {
                // Handle "02.01." or "02.01" formats
                if (val.matches("\\d{1,2}\\.\\d{1,2}\\.?")) {
                    String[] parts = val.split("\\.");
                    int day = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    java.util.Calendar cal = java.util.Calendar.getInstance();
                    cal.set(java.util.Calendar.DATE, day);
                    cal.set(java.util.Calendar.MONTH, month - 1);
                    // Default to current year or look for year in sheet? 
                    // Let's use 2024 as seen in previous import or current
                    return cal.getTime();
                }
                // Handle "dd/MM/yyyy"
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
                return sdf.parse(val);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}
