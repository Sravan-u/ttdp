package com.parking.demo.controller;

import com.parking.demo.model.Booking;
import com.parking.demo.model.ParkingSlot;
import com.parking.demo.model.User;
import com.parking.demo.repository.BookingRepository;
import com.parking.demo.repository.ParkingRepository;
import com.parking.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private ParkingRepository parkingRepository;
    @Autowired private BookingRepository bookingRepository;

    // Dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSlots", parkingRepository.count());
        stats.put("availableSlots", parkingRepository.countByStatus(ParkingSlot.SlotStatus.AVAILABLE));
        stats.put("occupiedSlots", parkingRepository.countByStatus(ParkingSlot.SlotStatus.OCCUPIED));
        stats.put("totalBookings", bookingRepository.count());
        stats.put("activeBookings", bookingRepository.findByStatus(Booking.BookingStatus.ACTIVE).size());
        return ResponseEntity.ok(stats);
    }

    // User management
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Parking slot management
    @GetMapping("/slots")
    public List<ParkingSlot> getAllSlots() {
        return parkingRepository.findAll();
    }

    @PostMapping("/slots")
    public ParkingSlot addSlot(@RequestBody ParkingSlot slot) {
        return parkingRepository.save(slot);
    }

    @PutMapping("/slots/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, @RequestBody ParkingSlot slotData) {
        return parkingRepository.findById(id).map(slot -> {
            slot.setSlotNumber(slotData.getSlotNumber());
            slot.setZone(slotData.getZone());
            slot.setStatus(slotData.getStatus());
            slot.setVehicleType(slotData.getVehicleType());
            slot.setLatitude(slotData.getLatitude());
            slot.setLongitude(slotData.getLongitude());
            slot.setDescription(slotData.getDescription());
            return ResponseEntity.ok(parkingRepository.save(slot));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        parkingRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
    }

    // Bookings
    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookedAtDesc();
    }
}
