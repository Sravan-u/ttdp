import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid rgba(255,71,87,0.25)',
        borderRadius: '24px', padding: '56px 48px', textAlign: 'center',
        maxWidth: '460px', width: '90%'
      }}>
        <div style={{
          width: '80px', height: '80px', background: 'rgba(255,71,87,0.12)',
          border: '2px solid rgba(255,71,87,0.3)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', margin: '0 auto 24px'
        }}>🚫</div>

        <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '3px', color: 'var(--danger)', textTransform: 'uppercase', marginBottom: '12px' }}>
          403 — Access Denied
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '14px' }}>
          Unauthorized Access
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
          You do not have permission to view this page.<br />
          This area is restricted to <strong style={{ color: 'var(--accent-warm)' }}>Admins only</strong>.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <button onClick={() => navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')}
              style={{ padding: '12px 28px', background: 'linear-gradient(135deg, var(--accent), var(--primary-light))', border: 'none', borderRadius: '10px', color: 'var(--bg-dark)', fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              ← Go to My Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg, var(--accent), var(--primary-light))', border: 'none', borderRadius: '10px', color: 'var(--bg-dark)', fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                User Login
              </button>
              <button onClick={() => navigate('/admin/login')}
                style={{ padding: '12px 24px', background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '10px', color: 'var(--accent-warm)', fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                Admin Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}