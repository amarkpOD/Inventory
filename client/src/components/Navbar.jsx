import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, Shield, HardHat, Menu } from 'lucide-react';

const Navbar = ({ onToggleMobileMenu }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header
      className="navbar-header"
      style={{
        height: '64px',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Header & Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          title="Toggle Navigation Menu"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'none', // Shown via media query in index.css
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={22} />
        </button>

        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Package size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Inventory<span style={{ color: 'var(--accent-primary)' }}>Hub</span>
          </h1>
        </div>
      </div>

      {/* User Info & Actions */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Active Role Tag */}
          <div
            className={isAdmin ? 'badge badge-admin desktop-only' : 'badge badge-worker desktop-only'}
            style={{ padding: '6px 10px', fontSize: '0.75rem', textTransform: 'uppercase' }}
          >
            {isAdmin ? <Shield size={13} /> : <HardHat size={13} />}
            {user.role}
          </div>

          {/* User Profile */}
          <div
            className="user-profile-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 10px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isAdmin ? 'var(--accent-primary)' : '#0ea5e9',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign out"
            style={{ padding: '7px 10px', fontSize: '0.78rem' }}
          >
            <LogOut size={14} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
