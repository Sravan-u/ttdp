package com.parking.demo.repository;

import com.parking.demo.model.Booking;
import com.parking.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByStatus(Booking.BookingStatus status);
    Optional<Booking> findByUserAndStatus(User user, Booking.BookingStatus status);
    List<Booking> findAllByOrderByBookedAtDesc();
}
