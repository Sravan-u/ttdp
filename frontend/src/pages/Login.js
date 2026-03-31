import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🚗</div>
          <div className="auth-brand-name">ParkSmart</div>
        </div>
        <h1 className="auth-headline">
          Smart Parking<br />for <span>Everyone</span>
        </h1>
        <p className="auth-subtext">
          Book, track and manage your smart parking slot in real-time. 
          No more searching for parking — your spot is one click away.
        </p>
        <div className="auth-features">
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Real-time slot availability</div>
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Interactive smart parking map</div>
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Instant booking & release</div>
          <div className="auth-feature-item"><div className="auth-feature-dot"></div>Complete booking history</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Welcome back 👋</h2>
          <p className="auth-form-subtitle">Sign in to your user account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="your@email.com" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
          <div className="auth-link" style={{marginTop: '12px'}}>
            Are you an admin? <Link to="/admin/login">Admin Portal →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
