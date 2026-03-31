package com.parking.demo.controller;

import com.parking.demo.model.Booking;
import com.parking.demo.model.ParkingSlot;
import com.parking.demo.model.User;
import com.parking.demo.repository.BookingRepository;
import com.parking.demo.repository.ParkingRepository;
import com.parking.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<ParkingSlot> getAllSlots() {
        return parkingRepository.findAll();
    }

    @GetMapping("/available")
    public List<ParkingSlot> getAvailableSlots() {
        return parkingRepository.findByStatus(ParkingSlot.SlotStatus.AVAILABLE);
    }

    @PostMapping("/book/{slotId}")
    public ResponseEntity<?> bookSlot(@PathVariable Long slotId, Authentication auth) {
        Optional<ParkingSlot> slotOpt = parkingRepository.findById(slotId);
        if (slotOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ParkingSlot slot = slotOpt.get();
        if (slot.getStatus() != ParkingSlot.SlotStatus.AVAILABLE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot is not available"));
        }

        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("message", "User not found"));

        // Check if user already has an active booking
        Optional<Booking> existingBooking = bookingRepository.findByUserAndStatus(user, Booking.BookingStatus.ACTIVE);
        if (existingBooking.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "You already have an active booking"));
        }

        slot.setStatus(ParkingSlot.SlotStatus.OCCUPIED);
        slot.setOccupiedBy(user);
        slot.setOccupiedAt(LocalDateTime.now());
        parkingRepository.save(slot);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSlot(slot);
        booking.setVehicleNumber(user.getVehicleNumber());
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        bookingRepository.save(booking);

        return ResponseEntity.ok(Map.of("message", "Slot booked successfully!", "bookingId", booking.getId()));
    }

    @PostMapping("/release/{slotId}")
    public ResponseEntity<?> releaseSlot(@PathVariable Long slotId, Authentication auth) {
        Optional<ParkingSlot> slotOpt = parkingRepository.findById(slotId);
        if (slotOpt.isEmpty()) return ResponseEntity.notFound().build();

        ParkingSlot slot = slotOpt.get();
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("message", "User not found"));

        Optional<Booking> bookingOpt = bookingRepository.findByUserAndStatus(user, Booking.BookingStatus.ACTIVE);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No active booking found"));
        }

        Booking booking = bookingOpt.get();
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setReleasedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
        slot.setOccupiedBy(null);
        slot.setOccupiedAt(null);
        parkingRepository.save(slot);

        return ResponseEntity.ok(Map.of("message", "Slot released successfully!"));
    }

    @GetMapping("/my-booking")
    public ResponseEntity<?> getMyBooking(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(null);
        Optional<Booking> booking = bookingRepository.findByUserAndStatus(user, Booking.BookingStatus.ACTIVE);
        return ResponseEntity.ok(booking.orElse(null));
    }

    @GetMapping("/my-history")
    public ResponseEntity<?> getMyHistory(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(null);
        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }
}
