import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  AVAILABLE:   { color: '#00e676', bg: 'rgba(0,230,118,0.15)', label: '🟢 Available' },
  OCCUPIED:    { color: '#ff4757', bg: 'rgba(255,71,87,0.15)',  label: '🔴 Occupied'  },
  RESERVED:    { color: '#ffab00', bg: 'rgba(255,171,0,0.15)',  label: '🟡 Reserved'  },
  MAINTENANCE: { color: '#7ba7c7', bg: 'rgba(123,167,199,0.1)', label: '⚪ Maintenance'},
};

const ZONE_COLORS = {
  'Zone A': '#00d4ff',
  'Zone B': '#ff6b35',
  'Zone C': '#a855f7',
  'Zone D': '#00e676',
  'Zone E': '#ffab00',
  'Zone F': '#ff4757',
};

const createSlotIcon = (status, vehicleType, slotNumber) => {
  const c = STATUS_COLORS[status]?.color || '#7ba7c7';
  const icons = { CAR: '🚗', BIKE: '🏍️', BICYCLE: '🚲', ANY: '🅿️' };
  const icon = icons[vehicleType] || '🅿️';
  return L.divIcon({
    html: `
      <div style="
        width:42px; height:42px; border-radius:50%;
        background:${c}22; border:3px solid ${c};
        box-shadow:0 0 12px ${c}88, 0 2px 8px rgba(0,0,0,0.4);
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        font-size:14px; cursor:pointer;
        transition: transform 0.2s;
      ">
        <span style="font-size:12px;line-height:1">${icon}</span>
        <span style="font-size:8px;font-weight:700;color:${c};line-height:1">${slotNumber}</span>
      </div>`,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

const createEntranceIcon = () => L.divIcon({
  html: `<div style="
    width:36px;height:36px;border-radius:8px;
    background:#0f4c75;border:2px solid #00d4ff;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 0 10px rgba(0,212,255,0.5)">🏛️</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 18); }, [center, map]);
  return null;
}

function LocateMe({ onLocate }) {
  const map = useMap();
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 18 });
    map.on('locationfound', (e) => {
      onLocate && onLocate(e.latlng);
      L.circle(e.latlng, { radius: e.accuracy / 2, color: '#00d4ff' }).addTo(map);
    });
  };
  return (
    <div style={{
      position: 'absolute', bottom: '80px', right: '10px', zIndex: 1000,
    }}>
      <button onClick={handleLocate} style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: '#0f4c75', border: '2px solid #00d4ff',
        color: '#00d4ff', cursor: 'pointer', fontSize: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }} title="Find my location">📍</button>
    </div>
  );
}

export default function ParkingMap({ slots, onSlotClick, centerLat = 17.4485, centerLng = 78.3908, myBooking }) {
  const [filter, setFilter] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');

  const zones = ['ALL', ...new Set((slots || []).map(s => s.zone).filter(Boolean))];
  const statuses = ['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];

  const filteredSlots = (slots || []).filter(s => {
    const statusOk = filter === 'ALL' || s.status === filter;
    const zoneOk = selectedZone === 'ALL' || s.zone === selectedZone;
    return statusOk && zoneOk;
  });

  const available = slots.filter(s => s.status === 'AVAILABLE').length;
  const occupied  = slots.filter(s => s.status === 'OCCUPIED').length;

  if (!slots || slots.length === 0) return (
    <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
      Loading map...
    </div>
  );

  return (
    <div>
      {/* Filter Bar */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '14px',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: filter === s ? (STATUS_COLORS[s]?.color || '#00d4ff') : 'var(--border)',
              background: filter === s ? (STATUS_COLORS[s]?.bg || 'rgba(0,212,255,0.1)') : 'transparent',
              color: filter === s ? (STATUS_COLORS[s]?.color || '#00d4ff') : 'var(--text-secondary)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
            }}>{s === 'ALL' ? '🗺️ All' : STATUS_COLORS[s]?.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {zones.map(z => (
            <button key={z} onClick={() => setSelectedZone(z)} style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: selectedZone === z ? (ZONE_COLORS[z] || '#00d4ff') : 'var(--border)',
              background: selectedZone === z ? `${ZONE_COLORS[z]}22` || 'rgba(0,212,255,0.1)' : 'transparent',
              color: selectedZone === z ? (ZONE_COLORS[z] || '#00d4ff') : 'var(--text-secondary)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
            }}>{z}</button>
          ))}
        </div>
      </div>

      {/* Live Stats Bar */}
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '12px',
        padding: '10px 16px', background: 'var(--bg-card)',
        borderRadius: '10px', border: '1px solid var(--border)',
        fontSize: '13px', flexWrap: 'wrap'
      }}>
        <span>🟢 Available: <strong style={{ color: '#00e676' }}>{available}</strong></span>
        <span>🔴 Occupied: <strong style={{ color: '#ff4757' }}>{occupied}</strong></span>
        <span>📍 Showing: <strong style={{ color: '#00d4ff' }}>{filteredSlots.length}</strong> slots</span>
        {myBooking && (
          <span style={{ marginLeft: 'auto', color: '#00d4ff' }}>
            ✅ Your slot: <strong>{myBooking.slot?.slotNumber}</strong>
          </span>
        )}
      </div>

      {/* Map */}
      <div className="map-container" style={{ height: '500px', position: 'relative' }}>
        <MapContainer center={[centerLat, centerLng]} zoom={18}
          style={{ height: '100%', width: '100%' }}>
          <RecenterMap center={[centerLat, centerLng]} />
          <LocateMe />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors' />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri' />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Entrance marker */}
          <Marker position={[centerLat + 0.0008, centerLng]} icon={createEntranceIcon()}>
            <Popup>
              <strong>🏛️ Main Entrance</strong><br />
              Smart Parking Management<br />
              <span style={{ color: 'green', fontSize: '12px' }}>Entry / Exit point</span>
            </Popup>
          </Marker>

          {/* Zone boundary circles */}
          {zones.filter(z => z !== 'ALL').map((zone, i) => {
            const zoneSlots = filteredSlots.filter(s => s.zone === zone && s.latitude && s.longitude);
            if (zoneSlots.length === 0) return null;
            const avgLat = zoneSlots.reduce((a, s) => a + s.latitude, 0) / zoneSlots.length;
            const avgLng = zoneSlots.reduce((a, s) => a + s.longitude, 0) / zoneSlots.length;
            return (
              <Circle key={zone} center={[avgLat, avgLng]} radius={15}
                pathOptions={{ color: ZONE_COLORS[zone] || '#00d4ff', fillOpacity: 0.05, weight: 1, dashArray: '4' }} />
            );
          })}

          {/* Slot markers */}
          {filteredSlots.map(slot => {
            if (!slot.latitude || !slot.longitude) return null;
            const isMySlot = myBooking?.slot?.id === slot.id;
            return (
              <Marker key={slot.id}
                position={[slot.latitude, slot.longitude]}
                icon={createSlotIcon(isMySlot ? 'AVAILABLE' : slot.status, slot.vehicleType, slot.slotNumber)}
                eventHandlers={{ click: () => onSlotClick && onSlotClick(slot) }}>
                <Popup>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '180px' }}>
                    <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '6px' }}>
                      {isMySlot ? '⭐ ' : ''} Slot {slot.slotNumber}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                      📍 {slot.zone}<br />
                      🚗 {slot.vehicleType}<br />
                      📝 {slot.description || 'N/A'}
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                      background: STATUS_COLORS[slot.status]?.bg,
                      color: STATUS_COLORS[slot.status]?.color,
                      fontWeight: '700', fontSize: '12px', marginBottom: '8px'
                    }}>{slot.status}</div>
                    {isMySlot && (
                      <div style={{ color: '#00d4ff', fontWeight: '700', fontSize: '13px' }}>
                        ✅ This is YOUR slot!
                      </div>
                    )}
                    {slot.status === 'AVAILABLE' && !isMySlot && onSlotClick && (
                      <button onClick={() => onSlotClick(slot)} style={{
                        width: '100%', background: '#00e676', color: '#040d1a',
                        border: 'none', padding: '8px', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: '700', marginTop: '4px'
                      }}>Book This Slot</button>
                    )}
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                      📡 {slot.latitude?.toFixed(4)}, {slot.longitude?.toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}