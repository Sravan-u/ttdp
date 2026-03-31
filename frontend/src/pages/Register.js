import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', userId: '',
    phoneNumber: '', vehicleNumber: '', vehicleType: 'CAR'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await registerUser(form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({...form, [field]: e.target.value});

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🚗</div>
          <div className="auth-brand-name">ParkSmart</div>
        </div>
        <h1 className="auth-headline">
          Join Smart Parking Management
        </h1>
        <p className="auth-subtext">
          Register once, park smarter every day. Your vehicle info is saved 
          so booking takes just one click.
        </p>
        <div className="auth-features">
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Free for all registered users</div>
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Multiple vehicle type support</div>
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Live map with slot locations</div>
        </div>
      </div>

      <div className="auth-right" style={{overflowY: 'auto', alignItems: 'flex-start', paddingTop: '60px', paddingBottom: '60px'}}>
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">Register to get your parking slot</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Rajesh Kumar" required
                value={form.fullName} onChange={set('fullName')} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">User ID</label>
                <input className="form-input" placeholder="USR2024001" required
                  value={form.userId} onChange={set('userId')} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+91 9876543210"
                  value={form.phoneNumber} onChange={set('phoneNumber')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="user@example.com" required
                value={form.email} onChange={set('email')} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" required minLength={6}
                value={form.password} onChange={set('password')} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <input className="form-input" placeholder="TS09AB1234"
                  value={form.vehicleNumber} onChange={set('vehicleNumber')} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={form.vehicleType} onChange={set('vehicleType')}>
                  <option value="CAR">🚗 Car</option>
                  <option value="BIKE">🏍️ Bike</option>
                  <option value="BICYCLE">🚲 Bicycle</option>
                </select>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-link">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
