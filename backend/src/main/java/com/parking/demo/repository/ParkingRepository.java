package com.parking.demo.repository;

import com.parking.demo.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByStatus(ParkingSlot.SlotStatus status);
    List<ParkingSlot> findByZone(String zone);
    long countByStatus(ParkingSlot.SlotStatus status);
}
