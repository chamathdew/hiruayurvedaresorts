package com.hiruresort.backend.services;

import com.hiruresort.backend.models.Guest;
import com.hiruresort.backend.models.Notification;
import com.hiruresort.backend.repositories.NotificationRepository;
import com.hiruresort.backend.repositories.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private GuestRepository guestRepository;

    public void createNotification(String type, String message, String hotelBranch, String guestId, String paymentId) {
        Notification n = new Notification();
        n.setType(type);
        n.setMessage(message);
        n.setHotelBranch(hotelBranch);
        n.setGuestId(guestId);
        n.setPaymentId(paymentId);
        n.setActivity(true);
        n.setCreatedAt(new Date());
        notificationRepository.save(n);
    }

    public void checkAndCreateBirthdayNotifications() {
        Calendar today = Calendar.getInstance();
        List<Guest> allGuests = guestRepository.findAll();
        
        for (Guest guest : allGuests) {
            if (guest.getDateOfBirth() != null) {
                Calendar dob = Calendar.getInstance();
                dob.setTime(guest.getDateOfBirth());
                
                if (dob.get(Calendar.MONTH) == today.get(Calendar.MONTH) && 
                    dob.get(Calendar.DAY_OF_MONTH) == today.get(Calendar.DAY_OF_MONTH)) {
                    
                    String msg = guest.getFullName() + "'s Birthday Today!";
                    boolean exists = notificationRepository.findAll().stream()
                        .anyMatch(n -> "BIRTHDAY".equals(n.getType()) && 
                                  n.getMessage() != null &&
                                  n.getMessage().contains(guest.getFullName()) &&
                                  isToday(n.getCreatedAt()));
                    
                    if (!exists) {
                        createNotification("BIRTHDAY", msg, guest.getHotelBranch(), guest.getId(), null);
                    }
                }
            }
        }
    }

    private boolean isToday(Date d) {
        if (d == null) return false;
        Calendar today = Calendar.getInstance();
        Calendar cal = Calendar.getInstance();
        cal.setTime(d);
        return cal.get(Calendar.YEAR) == today.get(Calendar.YEAR) && 
               cal.get(Calendar.DAY_OF_YEAR) == today.get(Calendar.DAY_OF_YEAR);
    }
}
