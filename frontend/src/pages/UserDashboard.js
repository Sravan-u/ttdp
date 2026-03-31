import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSlots, bookSlot, releaseSlot, getMyBooking, getMyHistory } from '../services/api';
import ParkingMap from '../components/ParkingMap';
import ChatBot from '../components/ChatBot';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('map');
  const [slots, setSlots] = useState([]);
  const [myBooking, setMyBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const [slotsRes, bookingRes] = await Promise.all([getAllSlots(), getMyBooking()]);
      setSlots(slotsRes.data);
      setMyBooking(bookingRes.data);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    try { const res = await getMyHistory(); setHistory(res.data); }
    catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === 'history') fetchHistory(); }, [activeTab, fetchHistory]);
  useEffect(() => {
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBook = (slot) => { setConfirmSlot(slot); };

  const confirmBook = async () => {
    try {
      await bookSlot(confirmSlot.id);
      showAlert(`✅ Slot ${confirmSlot.slotNumber} booked successfully!`);
      setConfirmSlot(null);
      fetchData();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Booking failed', 'error');
      setConfirmSlot(null);
    }
  };

  const handleRelease = async () => {
    if (!myBooking) return;
    try {
      await releaseSlot(myBooking.slot.id);
      showAlert('✅ Slot released successfully!');
      setMyBooking(null);
      fetchData();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to release', 'error');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const zones = ['ALL', ...new Set(slots.map(s => s.zone).filter(Boolean))];
  const types = ['ALL', 'CAR', 'BIKE', 'BICYCLE', 'ANY'];

  const filteredSlots = slots.filter(s => {
    const zoneOk = filterZone === 'ALL' || s.zone === filterZone;
    const typeOk = filterType === 'ALL' || s.vehicleType === filterType;
    const searchOk = searchTerm === '' || s.slotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return zoneOk && typeOk && searchOk;
  });

  const availableCount = slots.filter(s => s.status === 'AVAILABLE').length;
  const occupiedCount  = slots.filter(s => s.status === 'OCCUPIED').length;
  const slotIcon = (type) => ({ CAR: '🚗', BIKE: '🏍️', BICYCLE: '🚲', ANY: '🅿️' }[type] || '🅿️');

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="topbar-icon">🚗</div>
          <span className="topbar-name">ParkSmart</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#00e676' }}>●</span>
            Live · Updated {lastRefresh.toLocaleTimeString()}
          </div>
          <button onClick={fetchData} style={{
            padding: '6px 14px', background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px',
            color: '#00d4ff', fontSize: '12px', cursor: 'pointer', fontWeight: '600'
          }}>🔄 Refresh</button>
        </div>
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.fullName?.[0] || 'U'}</div>
            <span>{user?.fullName}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className="dashboard-content">
        {alert && (
          <div className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}
            style={{ marginBottom: '20px' }}>{alert.msg}</div>
        )}

        {/* Active Booking Banner */}
        {myBooking && (
          <div className="active-booking-card">
            <div>
              <div style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                🟢 Active Booking
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                Slot {myBooking.slot?.slotNumber} — {myBooking.slot?.zone}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {myBooking.slot?.vehicleType} · Booked at {new Date(myBooking.bookedAt).toLocaleTimeString()}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <button className="btn-sm btn-danger" onClick={handleRelease}>🔓 Release Slot</button>
              <button onClick={() => setActiveTab('map')} style={{
                padding: '6px 14px', background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.25)', borderRadius: '7px',
                color: '#00d4ff', fontSize: '12px', cursor: 'pointer', fontWeight: '600'
              }}>🗺️ View on Map</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Slots</div>
            <div className="stat-value blue">{slots.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Available</div>
            <div className="stat-value green">{availableCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Occupied</div>
            <div className="stat-value red">{occupiedCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Occupancy</div>
            <div className="stat-value">{slots.length ? Math.round((occupiedCount / slots.length) * 100) : 0}%</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['map', 'slots', 'history'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'map' ? '🗺️ Map View' : t === 'slots' ? '🅿️ All Slots' : '📋 My History'}
            </button>
          ))}
        </div>

        {/* Map Tab */}
        {activeTab === 'map' && (
          <>
            <div className="section-title">
              Live Parking Map <span>{availableCount} Available</span>
            </div>
            <ParkingMap
              slots={slots}
              myBooking={myBooking}
              onSlotClick={(slot) => slot.status === 'AVAILABLE' && !myBooking && handleBook(slot)}
            />
          </>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="🔍 Search slot number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '9px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px', outline: 'none', width: '200px'
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {zones.map(z => (
                  <button key={z} onClick={() => setFilterZone(z)} style={{
                    padding: '7px 14px', borderRadius: '20px', border: '1px solid',
                    borderColor: filterZone === z ? 'var(--accent)' : 'var(--border)',
                    background: filterZone === z ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: filterZone === z ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}>{z}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {types.map(t => (
                  <button key={t} onClick={() => setFilterType(t)} style={{
                    padding: '7px 14px', borderRadius: '20px', border: '1px solid',
                    borderColor: filterType === t ? 'var(--accent-warm)' : 'var(--border)',
                    background: filterType === t ? 'rgba(255,107,53,0.1)' : 'transparent',
                    color: filterType === t ? 'var(--accent-warm)' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}>
                    {t === 'ALL' ? '🅿️ All' : t === 'CAR' ? '🚗 Car' : t === 'BIKE' ? '🏍️ Bike' : t === 'BICYCLE' ? '🚲 Bicycle' : '🅿️ Any'}
                  </button>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Showing {filteredSlots.length} slots
              </span>
            </div>

            <div className="section-title">Parking Slots</div>
            <div className="parking-grid">
              {filteredSlots.map(slot => (
                <div key={slot.id}
                  className={`parking-slot ${slot.status.toLowerCase()}`}
                  onClick={() => slot.status === 'AVAILABLE' && !myBooking && handleBook(slot)}
                  title={slot.status === 'AVAILABLE' ? 'Click to book' : slot.status}>
                  <div className="slot-icon">{slotIcon(slot.vehicleType)}</div>
                  <div className="slot-number">{slot.slotNumber}</div>
                  <div className="slot-zone">{slot.zone}</div>
                  {slot.occupiedBy && slot.status === 'OCCUPIED' && (
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      In use
                    </div>
                  )}
                  <div className={`slot-status ${slot.status.toLowerCase()}`}>{slot.status}</div>
                </div>
              ))}
              {filteredSlots.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No slots match your filter.
                </div>
              )}
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            <div className="section-title">My Booking History <span>{history.length} total</span></div>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                No bookings yet. Book your first slot from the Map or Slots tab!
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Slot</th><th>Zone</th><th>Vehicle</th>
                    <th>Booked At</th><th>Released At</th><th>Duration</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b, i) => {
                    const duration = b.releasedAt
                      ? Math.round((new Date(b.releasedAt) - new Date(b.bookedAt)) / 60000) + ' mins'
                      : b.status === 'ACTIVE' ? '🟢 Active now' : '—';
                    return (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                        <td><strong>{b.slot?.slotNumber}</strong></td>
                        <td>{b.slot?.zone}</td>
                        <td>{b.vehicleNumber || '—'}</td>
                        <td style={{ fontSize: '12px' }}>{new Date(b.bookedAt).toLocaleString()}</td>
                        <td style={{ fontSize: '12px' }}>{b.releasedAt ? new Date(b.releasedAt).toLocaleString() : '—'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--accent)' }}>{duration}</td>
                        <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmSlot && (
        <div className="modal-overlay" onClick={() => setConfirmSlot(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Booking</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You're about to book slot <strong style={{ color: 'var(--accent)' }}>{confirmSlot.slotNumber}</strong> in {confirmSlot.zone}.
            </p>
            <div style={{ background: 'rgba(0,212,255,0.06)', borderRadius: '10px', padding: '16px', fontSize: '14px', lineHeight: '1.8' }}>
              <div>🅿️ Slot: <strong>{confirmSlot.slotNumber}</strong></div>
              <div>📍 Zone: <strong>{confirmSlot.zone}</strong></div>
              <div>🚗 Type: <strong>{confirmSlot.vehicleType}</strong></div>
              <div>📝 {confirmSlot.description || 'N/A'}</div>
            </div>
            <div className="modal-actions">
              <button className="btn-sm btn-accent" onClick={() => setConfirmSlot(null)}>Cancel</button>
              <button className="btn-sm btn-success" onClick={confirmBook}>✅ Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* ChatBot */}
      <ChatBot slots={slots} myBooking={myBooking} />
    </div>
  );
}