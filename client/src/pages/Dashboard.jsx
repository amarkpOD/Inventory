import React, { useState, useEffect } from 'react';
import { fetchDashboardStats, fetchItems } from '../services/api';
import StockBadge from '../components/StockBadge';
import QuickStockModal from '../components/QuickStockModal';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ArrowDownUp,
} from 'lucide-react';

const Dashboard = ({ onNavigateToItemMaster }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);

  const [allQuantityItems, setAllQuantityItems] = useState([]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      let statsData = null;
      try {
        const statsRes = await fetchDashboardStats();
        statsData = statsRes.data;
      } catch (e) {
        console.warn('Dashboard stats endpoint warning:', e);
      }

      let itemsList = [];
      try {
        const itemsRes = await fetchItems({ limit: 200 });
        itemsList = itemsRes.data?.items || [];
      } catch (e) {
        console.warn('Items endpoint warning:', e);
      }

      if (!statsData && itemsList.length === 0) {
        setError('Failed to connect to Inventory API. Please check server connection.');
        setLoading(false);
        return;
      }

      const totalItems = statsData?.totalItems ?? itemsList.length;
      const totalQuantity = statsData?.totalQuantity ?? itemsList.reduce((acc, i) => acc + (i.quantity || 0), 0);
      const totalValue = statsData?.totalValue ?? itemsList.reduce((acc, i) => acc + (i.quantity || 0) * (i.unitPrice || 0), 0);

      const safeStats = {
        totalItems,
        totalQuantity,
        totalValue,
        todaySellValue: statsData?.todaySellValue ?? 0,
        weeklySellValue: statsData?.weeklySellValue ?? 0,
        monthlySellValue: statsData?.monthlySellValue ?? 0,
        lowStockCount: statsData?.lowStockCount ?? itemsList.filter(i => (i.quantity || 0) <= (i.reorderLevel || 5) && (i.quantity || 0) > 0).length,
        outOfStockCount: statsData?.outOfStockCount ?? itemsList.filter(i => (i.quantity || 0) === 0).length,
        alerts: statsData?.alerts ?? itemsList.filter(i => (i.quantity || 0) <= (i.reorderLevel || 5)),
      };

      setStats(safeStats);

      const sortedByQty = [...itemsList].sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      setAllQuantityItems(sortedByQty);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <RefreshCw size={28} className="animate-spin" color="var(--accent-primary)" />
        <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '24px', borderColor: 'var(--danger-border)' }}>
        <h3 style={{ color: 'var(--danger-text)' }}>Failed to load Dashboard</h3>
        <p style={{ color: 'var(--text-muted)', margin: '10px 0' }}>{error}</p>
        <button className="btn btn-secondary" onClick={loadStats}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Executive Dashboard</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time sales tracking (Today, Weekly, Monthly) and quantity ranking
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadStats}>
          <RefreshCw size={14} /> Refresh Stats
        </button>
      </div>

      {/* Sales Summary Cards Grid (Today, Weekly, Monthly Sell Value) */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          💰 Sales Performance Summary
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Today Sell Value */}
          <div className="glass-card" style={{ padding: '20px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Today's Sell Value
              </span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <TrendingUp size={20} color="var(--success-text)" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success-text)' }}>
              {formatCurrency(stats.todaySellValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total sales revenue recorded today
            </div>
          </div>

          {/* Card 2: Weekly Sell Value */}
          <div className="glass-card" style={{ padding: '20px', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Weekly Sell Value (7 Days)
              </span>
              <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Calendar size={20} color="#38bdf8" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatCurrency(stats.weeklySellValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total sales revenue past 7 days
            </div>
          </div>

          {/* Card 3: Monthly Sell Value */}
          <div className="glass-card" style={{ padding: '20px', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Monthly Sell Value (30 Days)
              </span>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Calendar size={20} color="#c084fc" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>
              {formatCurrency(stats.monthlySellValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total sales revenue past 30 days
            </div>
          </div>

          {/* Card 4: Total Inventory Valuation */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Stock Valuation
              </span>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Boxes size={20} color="var(--accent-primary)" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {formatCurrency(stats.totalValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.totalItems} products ({stats.totalQuantity} total units)
            </div>
          </div>
        </div>
      </div>

      {/* Priority Restock Alerts Panel */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--warning-text)" />
            Priority Reorder Alerts ({stats.lowStockCount + stats.outOfStockCount})
          </h3>
          {onNavigateToItemMaster && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToItemMaster('Low Stock')}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              View All <ArrowRight size={12} />
            </button>
          )}
        </div>

        {stats.alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={28} color="var(--success-text)" style={{ marginBottom: '6px' }} />
            <p>All inventory levels are healthy!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.alerts.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--success-text)' }}>Price: {formatCurrency(item.unitPrice)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StockBadge status={item.status} quantity={item.quantity} />
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => setSelectedItemForStock(item)}
                  >
                    + Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Items Section Sorted in Descending Order by Quantity */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowDownUp size={18} color="var(--accent-primary)" />
            All Items Ranked by Stock Quantity (Highest to Lowest)
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Sorted in Descending Order ⬇️
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                <th>Item Name</th>
                <th>Quantity (Desc ⬇️)</th>
                <th>Unit Price</th>
                <th>Total Stock Value</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {allQuantityItems && allQuantityItems.length > 0 ? (
                allQuantityItems.map((item, index) => (
                  <tr key={item._id}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: index < 3 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      #{index + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{item.name}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: item.quantity > 0 ? 'var(--text-main)' : 'var(--danger-text)' }}>
                        {item.quantity} units
                      </strong>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success-text)' }}>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                    <td>
                      <StockBadge status={item.status} quantity={item.quantity} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No items in inventory
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stock Modal */}
      {selectedItemForStock && (
        <QuickStockModal
          isOpen={Boolean(selectedItemForStock)}
          onClose={() => setSelectedItemForStock(null)}
          item={selectedItemForStock}
          onSuccess={loadStats}
        />
      )}
    </div>
  );
};

export default Dashboard;
