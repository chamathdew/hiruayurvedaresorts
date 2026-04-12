package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.Occupancy;
import com.hiruresort.backend.models.Guest;
import com.hiruresort.backend.services.NotificationService;
import com.hiruresort.backend.repositories.OccupancyRepository;
import com.hiruresort.backend.repositories.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.ss.util.CellRangeAddress;

import java.io.InputStream;
import java.io.FileOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Arrays;

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
        occupancy.setLastUpdated(new Date());
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
        occupancy.setLastUpdated(new Date());
        Occupancy updated = occupancyRepository.save(occupancy);

        // Trigger Update Notification
        notificationService.createNotification(
            "BOOKING_UPDATED", 
            "Booking Updated: Room " + updated.getRoomNo() + " (" + (updated.getHotelBranch() != null ? updated.getHotelBranch() : "Hiru") + ")",
            updated.getHotelBranch() != null ? updated.getHotelBranch() : "Admin",
            null,
            null
        );

        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOccupancy(@PathVariable String id) {
        if (id == null) return ResponseEntity.badRequest().build();
        
        occupancyRepository.findById(id).ifPresent(occ -> {
            notificationService.createNotification(
                "BOOKING_REMOVED", 
                "Booking Removed: Room " + occ.getRoomNo() + " (" + (occ.getHotelBranch() != null ? occ.getHotelBranch() : "Hiru") + ")",
                occ.getHotelBranch() != null ? occ.getHotelBranch() : "Admin",
                null,
                null
            );
        });

        occupancyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/import")
    public ResponseEntity<?> importOccupancy(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty");

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<String> roomMapping = Arrays.asList("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "15", "16", "17");
            List<Occupancy> records = new ArrayList<>();

            int currentYear = LocalDate.now().getYear();
            int currentMonth = LocalDate.now().getMonthValue() - 1; // 0-indexed

            for (int r = 0; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Cell firstCell = row.getCell(0);
                if (firstCell != null) {
                    if (firstCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(firstCell)) {
                        Date date = firstCell.getDateCellValue();
                        LocalDate localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                        currentYear = localDate.getYear();
                        currentMonth = localDate.getMonthValue() - 1;
                        continue;
                    }

                    String roomCandidate = "";
                    if (firstCell.getCellType() == CellType.STRING) {
                        roomCandidate = firstCell.getStringCellValue().trim();
                    } else if (firstCell.getCellType() == CellType.NUMERIC) {
                        roomCandidate = String.valueOf((int) firstCell.getNumericCellValue());
                    }

                    if (roomMapping.contains(roomCandidate)) {
                        for (int c = 1; c <= 31; c++) {
                            Cell cell = row.getCell(c);
                            if (cell != null && cell.getCellType() == CellType.STRING && !cell.getStringCellValue().trim().isEmpty()) {
                                String guestDesc = cell.getStringCellValue().trim();
                                if (guestDesc.length() < 2) continue;

                                // Clean Guest Name: Remove Flight details (e.g., "07.04. 09:00 QR 644 /Ms. Sharon")
                                String cleanedName = guestDesc;
                                if (guestDesc.contains("/")) {
                                    cleanedName = guestDesc.substring(guestDesc.lastIndexOf("/") + 1).trim();
                                }

                                int span = 1;
                                for (CellRangeAddress range : sheet.getMergedRegions()) {
                                    if (range.isInRange(r, c)) {
                                        span = range.getLastColumn() - range.getFirstColumn() + 1;
                                        break;
                                    }
                                }

                                Occupancy occ = new Occupancy();
                                occ.setRoomNo(roomCandidate);
                                occ.setHotelBranch("Hiru Om");
                                occ.setGuestDetail(cleanedName);
                                occ.setStartDate(LocalDate.of(currentYear, currentMonth + 1, c));
                                occ.setEndDate(LocalDate.of(currentYear, currentMonth + 1, Math.min(c + span - 1, 31)));
                                occ.setColor(getColorFromStyle(cell));
                                occ.setRemark("Imported from Excel");
                                occ.setLastUpdated(new Date());
                                records.add(occ);

                                if (span > 1) c += span - 1;
                            }
                        }
                    }
                }
            }

            if (!records.isEmpty()) {
                // Clear existing "Hiru Om" records for a fresh sync
                occupancyRepository.deleteByHotelBranch("Hiru Om"); 
                occupancyRepository.saveAll(records);

                // ALSO SYNC TO GUESTS
                guestRepository.deleteByHotelBranch("Hiru Om");
                List<Guest> guestList = new ArrayList<>();
                for (Occupancy occ : records) {
                    Guest g = new Guest();
                    g.setFullName(occ.getGuestDetail());
                    g.setRoomNumber(occ.getRoomNo());
                    g.setHotelBranch(occ.getHotelBranch());
                    if (occ.getStartDate() != null) {
                        g.setArrivalDate(Date.from(occ.getStartDate().atStartOfDay(ZoneId.systemDefault()).toInstant()));
                    }
                    if (occ.getEndDate() != null) {
                        g.setDepartureDate(Date.from(occ.getEndDate().atStartOfDay(ZoneId.systemDefault()).toInstant()));
                    }
                    g.setPaymentStatus("Pending");
                    g.setRemark("Imported from Excel");
                    guestList.add(g);
                }
                guestRepository.saveAll(guestList);
                
                notificationService.createNotification(
                    "SYSTEM", 
                    "Bulk import successful: " + records.size() + " records synced from Excel.",
                    "Admin",
                    null,
                    null
                );
                return ResponseEntity.ok("Imported " + records.size() + " records");
            } else {
                return ResponseEntity.ok("No records found to import");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Import failed: " + e.getMessage());
        }
    }

    @GetMapping("/spreadsheet")
    public ResponseEntity<?> getSpreadsheetData() {
        String filePath = "../hiruom.xlsx";
        File file = new File(filePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        try (InputStream is = Files.newInputStream(Paths.get(filePath));
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<List<String>> data = new ArrayList<>();
            for (int r = 0; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                List<String> rowData = new ArrayList<>();
                if (row != null) {
                    for (int c = 0; c < 40; c++) { // Read up to 40 columns
                        Cell cell = row.getCell(c);
                        if (cell == null) {
                            rowData.add("");
                        } else {
                            switch (cell.getCellType()) {
                                case STRING -> rowData.add(cell.getStringCellValue());
                                case NUMERIC -> rowData.add(String.valueOf(cell.getNumericCellValue()));
                                case BOOLEAN -> rowData.add(String.valueOf(cell.getBooleanCellValue()));
                                default -> rowData.add("");
                            }
                        }
                    }
                }
                data.add(rowData);
            }
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to read spreadsheet: " + e.getMessage());
        }
    }

    @PostMapping("/spreadsheet")
    public ResponseEntity<?> saveSpreadsheetData(@RequestBody List<List<String>> data) {
        String filePath = "../hiruom.xlsx";
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Occupancy");
            for (int r = 0; r < data.size(); r++) {
                Row row = sheet.createRow(r);
                List<String> rowData = data.get(r);
                for (int c = 0; c < rowData.size(); c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellValue(rowData.get(c));
                }
            }
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                workbook.write(fos);
            }
            return ResponseEntity.ok("Spreadsheet saved successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save spreadsheet: " + e.getMessage());
        }
    }

    private String getColorFromStyle(Cell cell) {
        try {
            CellStyle style = cell.getCellStyle();
            if (style instanceof XSSFCellStyle xssfStyle) {
                XSSFColor color = xssfStyle.getFillForegroundColorColor();
                if (color != null) {
                    byte[] rgb = color.getRGB();
                    if (rgb != null && rgb.length >= 3) {
                        // Fix for negative bytes in Java
                        return String.format("#%02x%02x%02x", rgb[rgb.length-3] & 0xFF, rgb[rgb.length-2] & 0xFF, rgb[rgb.length-1] & 0xFF);
                    }
                }
            }
        } catch (Exception e) {}
        return "#FFFF00"; // Default Yellow
    }

}
