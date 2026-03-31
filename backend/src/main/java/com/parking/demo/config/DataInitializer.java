package com.parking.demo.config;

import com.parking.demo.model.ParkingSlot;
import com.parking.demo.model.User;
import com.parking.demo.repository.ParkingRepository;
import com.parking.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ParkingRepository parkingRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (!userRepository.existsByEmail("admin@parking.com") && !userRepository.existsByUserId("ADMIN001")) {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@parking.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setUserId("ADMIN001");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Admin created");
        } else {
            System.out.println("✅ Admin already exists — skipping");
        }

        if (parkingRepository.count() == 0) {
            // slot: slotNumber, zone, vehicleType, lat, lng, description
            Object[][] slots = {
                // Zone A — Cars (Main Entrance Right)
                {"A-01","Zone A","CAR", 17.44850, 78.39080, "Near main entrance gate"},
                {"A-02","Zone A","CAR", 17.44860, 78.39090, "Row 1, Slot 2"},
                {"A-03","Zone A","CAR", 17.44870, 78.39100, "Row 1, Slot 3"},
                {"A-04","Zone A","CAR", 17.44880, 78.39110, "Row 2, Slot 1"},
                {"A-05","Zone A","CAR", 17.44890, 78.39120, "Row 2, Slot 2"},
                {"A-06","Zone A","CAR", 17.44900, 78.39130, "Row 2, Slot 3"},
                {"A-07","Zone A","CAR", 17.44910, 78.39140, "Row 3, Slot 1 — covered"},
                {"A-08","Zone A","CAR", 17.44920, 78.39150, "Row 3, Slot 2 — covered"},
                // Zone B — Bikes (Left Wing)
                {"B-01","Zone B","BIKE", 17.44850, 78.39200, "Bike stand 1 — left wing"},
                {"B-02","Zone B","BIKE", 17.44860, 78.39210, "Bike stand 2"},
                {"B-03","Zone B","BIKE", 17.44870, 78.39220, "Bike stand 3"},
                {"B-04","Zone B","BIKE", 17.44880, 78.39230, "Bike stand 4"},
                {"B-05","Zone B","BIKE", 17.44890, 78.39240, "Bike stand 5"},
                {"B-06","Zone B","BIKE", 17.44900, 78.39250, "Bike stand 6 — near canteen"},
                // Zone C — Bicycles (Back)
                {"C-01","Zone C","BICYCLE", 17.44950, 78.39080, "Cycle stand — back garden"},
                {"C-02","Zone C","BICYCLE", 17.44960, 78.39090, "Cycle stand 2"},
                {"C-03","Zone C","BICYCLE", 17.44970, 78.39100, "Cycle stand 3"},
                {"C-04","Zone C","BICYCLE", 17.44980, 78.39110, "Cycle stand 4 — shaded"},
                // Zone D — Any Vehicle (Side Entrance)
                {"D-01","Zone D","ANY", 17.44850, 78.39300, "Side entrance — any vehicle"},
                {"D-02","Zone D","ANY", 17.44860, 78.39310, "Side entrance slot 2"},
                {"D-03","Zone D","ANY", 17.44870, 78.39320, "Side entrance slot 3"},
                {"D-04","Zone D","ANY", 17.44880, 78.39330, "Side entrance slot 4"},
                // Zone E — VIP/Staff Cars (Front)
                {"E-01","Zone E","CAR", 17.44800, 78.39080, "Staff parking — front"},
                {"E-02","Zone E","CAR", 17.44810, 78.39090, "Staff parking slot 2"},
                {"E-03","Zone E","CAR", 17.44820, 78.39100, "Staff parking slot 3"},
                // Zone F — Overflow (Far Right)
                {"F-01","Zone F","ANY", 17.44850, 78.39400, "Overflow parking — far right"},
                {"F-02","Zone F","ANY", 17.44860, 78.39410, "Overflow slot 2"},
                {"F-03","Zone F","ANY", 17.44870, 78.39420, "Overflow slot 3"},
                {"F-04","Zone F","ANY", 17.44880, 78.39430, "Overflow slot 4"},
                {"F-05","Zone F","ANY", 17.44890, 78.39440, "Overflow slot 5"},
            };

            for (Object[] s : slots) {
                ParkingSlot slot = new ParkingSlot();
                slot.setSlotNumber((String) s[0]);
                slot.setZone((String) s[1]);
                slot.setVehicleType(ParkingSlot.VehicleType.valueOf((String) s[2]));
                slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
                slot.setLatitude((Double) s[3]);
                slot.setLongitude((Double) s[4]);
                slot.setDescription((String) s[5]);
                parkingRepository.save(slot);
            }
            System.out.println("✅ 30 parking slots created across 6 zones");
        } else {
            System.out.println("✅ Parking slots already exist — skipping");
        }
    }
}
