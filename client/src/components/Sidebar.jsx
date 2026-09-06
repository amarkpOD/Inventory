import React from 'react';
import { LayoutDashboard, Boxes, History, ShoppingBag, PackagePlus, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobileMenu,
  onOpenSellModal,
  onOpenAddStockModal,
}) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, isTab: true },
    { id: 'item-master', label: 'Item Master', icon: Boxes, isTab: true },
    { id: 'transactions', label: 'Transactions', icon: History, isTab: true },
  ];

  const actionItems = [
    { id: 'sell', label: 'Sell', icon: ShoppingBag, action: onOpenSellModal, color: '#ef4444' },
    { id: 'add-stock', label: 'Add', icon: PackagePlus, action: onOpenAddStockModal, color: '#10b981' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const handleActionClick = (actionFn) => {
    if (actionFn) actionFn();
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 140,
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: '240px',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          borderRight: '1px solid var(--border-color)',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingLeft: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Navigation
            </span>

            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={onCloseMobileMenu}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Pages */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.1))'
                      : 'transparent',
                    border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                    minHeight: '44px',
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions Header */}
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              paddingLeft: '8px',
            }}
          >
            Quick Stock Actions
          </div>

          {/* Quick Action Buttons: Sell & Add */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleActionClick(item.action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                    minHeight: '44px',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = item.color)}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: item.color + '22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={item.color} />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Permission Card Info */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginTop: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {isAdmin ? (
              <ShieldAlert size={15} color="var(--badge-admin-text)" />
            ) : (
              <CheckCircle size={15} color="var(--badge-worker-text)" />
            )}
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {isAdmin ? 'Admin Role' : 'Worker Role'}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            {isAdmin
              ? 'Full management privileges'
              : 'Add items & update stock'}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
