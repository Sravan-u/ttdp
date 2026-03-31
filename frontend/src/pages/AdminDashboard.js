import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStats, getAllUsers, deleteUser,
  getAllSlotsAdmin, addSlot, updateSlot, deleteSlot,
  getAllBookings
} from '../services/api';
import ParkingMap from '../components/ParkingMap';

const EMPTY_SLOT = { slotNumber: '', zone: 'Zone A', vehicleType: 'CAR', status: 'AVAILABLE', latitude: '', longitude: '', description: '' };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [slotModal, setSlotModal] = useState(null); // null | 'add' | slot object
  const [slotForm, setSlotForm] = useState(EMPTY_SLOT);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, usersRes, slotsRes, bookingsRes] = await Promise.all([
        getAdminStats(), getAllUsers(), getAllSlotsAdmin(), getAllBookings()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Real-time refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => { getAdminStats().then(r => setStats(r.data)).catch(() => {}); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      showAlert('User deleted');
    } catch { showAlert('Failed to delete user', 'error'); }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this parking slot?')) return;
    try {
      await deleteSlot(id);
      setSlots(slots.filter(s => s.id !== id));
      showAlert('Slot deleted');
    } catch { showAlert('Failed to delete slot', 'error'); }
  };

  const openAddSlot = () => { setSlotForm(EMPTY_SLOT); setSlotModal('add'); };
  const openEditSlot = (slot) => {
    setSlotForm({ ...slot, latitude: slot.latitude || '', longitude: slot.longitude || '' });
    setSlotModal(slot);
  };

  const handleSaveSlot = async () => {
    const data = { ...slotForm, latitude: parseFloat(slotForm.latitude) || null, longitude: parseFloat(slotForm.longitude) || null };
    try {
      if (slotModal === 'add') {
        const res = await addSlot(data);
        setSlots([...slots, res.data]);
        showAlert('Slot added successfully!');
      } else {
        const res = await updateSlot(slotModal.id, data);
        setSlots(slots.map(s => s.id === slotModal.id ? res.data : s));
        showAlert('Slot updated!');
      }
      setSlotModal(null);
    } catch { showAlert('Failed to save slot', 'error'); }
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const sf = (field) => (e) => setSlotForm({ ...slotForm, [field]: e.target.value });

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="topbar-icon" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff4757)' }}>🛡️</div>
          <span className="topbar-name">ParkSmart <span style={{ color: 'var(--accent-warm)', fontSize: '14px' }}>Admin</span></span>
        </div>
        <div className="topbar-right">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 10px', background: 'rgba(255,107,53,0.1)', borderRadius: '6px', border: '1px solid rgba(255,107,53,0.2)' }}>
            🟢 Live Monitoring
          </div>
          <div className="topbar-user">
            <div className="topbar-avatar" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff4757)' }}>A</div>
            <span>{user?.fullName}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className="dashboard-content">
        {alert && (
          <div className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '20px' }}>
            {alert.msg}
          </div>
        )}

        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users, parking slots and real-time bookings</p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, color: '' },
            { label: 'Total Slots', value: stats.totalSlots, color: 'blue' },
            { label: 'Available', value: stats.availableSlots, color: 'green' },
            { label: 'Occupied', value: stats.occupiedSlots, color: 'red' },
            { label: 'Total Bookings', value: stats.totalBookings, color: '' },
            { label: 'Active Now', value: stats.activeBookings, color: 'green' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.color}`}>{s.value ?? '—'}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'users', 'slots', 'bookings', 'map'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : t === 'slots' ? '🅿️ Slots' : t === 'bookings' ? '📋 Bookings' : '🗺️ Map'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid-2">
              <div>
                <div className="section-title">Recent Bookings</div>
                <table className="data-table">
                  <thead><tr><th>User</th><th>Slot</th><th>Time</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.slice(0, 8).map(b => (
                      <tr key={b.id}>
                        <td>{b.user?.fullName}</td>
                        <td>{b.slot?.slotNumber}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(b.bookedAt).toLocaleString()}</td>
                        <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="section-title">Slot Occupancy</div>
                <table className="data-table">
                  <thead><tr><th>Slot</th><th>Zone</th><th>Occupied By</th><th>Status</th></tr></thead>
                  <tbody>
                    {slots.filter(s => s.status === 'OCCUPIED').slice(0, 8).map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.slotNumber}</strong></td>
                        <td>{s.zone}</td>
                        <td>{s.occupiedBy?.fullName || '—'}</td>
                        <td><span className="badge" style={{ background: 'rgba(255,71,87,0.15)', color: '#ff4757' }}>OCCUPIED</span></td>
                      </tr>
                    ))}
                    {slots.filter(s => s.status === 'OCCUPIED').length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>All slots available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="section-title">All Users <span>{users.filter(u => u.role === 'USER').length} registered</span></div>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>User ID</th><th>Vehicle</th><th>Phone</th><th>Role</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td><strong>{u.fullName}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>{u.userId}</td>
                    <td>{u.vehicleNumber || '—'} <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{u.vehicleType || ''}</span></td>
                    <td>{u.phoneNumber || '—'}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>
                      {u.role !== 'ADMIN' && (
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Parking Slots <span>{slots.length} total</span></div>
              <button className="btn-sm btn-accent" onClick={openAddSlot} style={{ padding: '10px 20px' }}>+ Add Slot</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Slot No.</th><th>Zone</th><th>Type</th><th>Status</th><th>Occupied By</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {slots.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td><strong>{s.slotNumber}</strong></td>
                    <td>{s.zone}</td>
                    <td>{s.vehicleType}</td>
                    <td><span className={`slot-status ${s.status.toLowerCase()}`}>{s.status}</span></td>
                    <td>{s.occupiedBy?.fullName || '—'}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-sm btn-accent" onClick={() => openEditSlot(s)}>Edit</button>
                      <button className="btn-sm btn-danger" onClick={() => handleDeleteSlot(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            <div className="section-title">All Bookings <span>{bookings.length} total</span></div>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>User</th><th>Slot</th><th>Vehicle</th><th>Booked At</th><th>Released At</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td><strong>{b.user?.fullName}</strong><br /><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.user?.userId}</span></td>
                    <td>{b.slot?.slotNumber} — {b.slot?.zone}</td>
                    <td>{b.vehicleNumber || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{new Date(b.bookedAt).toLocaleString()}</td>
                    <td style={{ fontSize: '13px' }}>{b.releasedAt ? new Date(b.releasedAt).toLocaleString() : '—'}</td>
                    <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <>
            <div className="section-title">Live Parking Map</div>
            <ParkingMap slots={slots} />
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>🟢 Available ({stats.availableSlots})</span>
              <span>🔴 Occupied ({stats.occupiedSlots})</span>
              <span>🟡 Reserved</span>
            </div>
          </>
        )}
      </div>

      {/* Slot Modal */}
      {slotModal !== null && (
        <div className="modal-overlay" onClick={() => setSlotModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '520px' }}>
            <h3>{slotModal === 'add' ? 'Add New Parking Slot' : 'Edit Parking Slot'}</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Slot Number</label>
                <input className="form-input" placeholder="A-01" value={slotForm.slotNumber} onChange={sf('slotNumber')} />
              </div>
              <div className="form-group">
                <label className="form-label">Zone</label>
                <select className="form-select" value={slotForm.zone} onChange={sf('zone')}>
                  {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'].map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={slotForm.vehicleType} onChange={sf('vehicleType')}>
                  {['CAR', 'BIKE', 'BICYCLE', 'ANY'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={slotForm.status} onChange={sf('status')}>
                  {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" placeholder="17.4485" value={slotForm.latitude} onChange={sf('latitude')} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" placeholder="78.3908" value={slotForm.longitude} onChange={sf('longitude')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Near main gate..." value={slotForm.description} onChange={sf('description')} />
            </div>

            <div className="modal-actions">
              <button className="btn-sm btn-danger" onClick={() => setSlotModal(null)}>Cancel</button>
              <button className="btn-sm btn-success" onClick={handleSaveSlot}>
                {slotModal === 'add' ? '+ Add Slot' : '✅ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
