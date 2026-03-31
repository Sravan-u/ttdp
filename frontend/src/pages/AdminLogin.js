import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
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
      const res = await adminLogin(form);
      login(res.data);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '48px',
        width: '420px',
        maxWidth: '95vw',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #ff6b35, #ff4757)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px'
          }}>🛡️</div>
          <h2 style={{fontSize: '26px', fontWeight: '800', letterSpacing: '-1px'}}>Admin Portal</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px'}}>
            Restricted access — authorized personnel only
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input className="form-input" type="email" placeholder="admin@parking.com" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" required
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}
            style={{background: 'linear-gradient(135deg, #ff6b35, #ff4757)', color: 'white'}}>
            {loading ? 'Authenticating...' : '🔐 Admin Sign In'}
          </button>
        </form>

        <div className="auth-link">
          Not an admin? <Link to="/login">User Login</Link>
        </div>

        <div style={{
          marginTop: '24px', padding: '14px', borderRadius: '10px',
          background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)',
          fontSize: '13px', color: 'var(--text-secondary)'
        }}>
          💡 <strong style={{color: 'var(--accent-warm)'}}>Default Admin:</strong> admin@parking.com / admin123
        </div>
      </div>
    </div>
  );
}
