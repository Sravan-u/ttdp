package com.parking.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slotNumber;

    @Enumerated(EnumType.STRING)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    private String zone;
    private Double latitude;
    private Double longitude;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User occupiedBy;

    private LocalDateTime occupiedAt;
    private String description;

    public enum SlotStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    }

    public enum VehicleType {
        CAR, BIKE, BICYCLE, ANY
    }

    public ParkingSlot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }

    public SlotStatus getStatus() { return status; }
    public void setStatus(SlotStatus status) { this.status = status; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public User getOccupiedBy() { return occupiedBy; }
    public void setOccupiedBy(User occupiedBy) { this.occupiedBy = occupiedBy; }

    public LocalDateTime getOccupiedAt() { return occupiedAt; }
    public void setOccupiedAt(LocalDateTime occupiedAt) { this.occupiedAt = occupiedAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
