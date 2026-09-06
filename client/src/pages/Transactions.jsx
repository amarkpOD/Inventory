import React, { useState, useEffect } from 'react';
import { fetchTransactions } from '../services/api';
import Modal from '../components/Modal';
import DatePicker from '../components/DatePicker';
import {
  History,
  Download,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Layers,
  XCircle,
  Package,
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Modal Toggle
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchTransactions({
        type: typeFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 500,
      });
      setTransactions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, startDate, endDate]);

  const handleResetFilters = () => {
    setTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setIsFilterModalOpen(false);
  };

  const exportToExcelCSV = () => {
    if (!transactions.length) return;
    const headers = ['Date & Time', 'Transaction Type', 'Item Name', 'Quantity', 'Unit Price (₹)', 'Total Amount (₹)', 'Performed By'];
    const rows = transactions.map((tx) => [
      `"${new Date(tx.createdAt).toLocaleString()}"`,
      `"${tx.type}"`,
      `"${tx.itemName.replace(/"/g, '""')}"`,
      tx.quantity,
      tx.unitPrice || 0,
      tx.totalAmount || 0,
      `"${tx.performedBy || 'System'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Item_Transactions_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  // Totals in current view
  const totalSellValue = transactions.filter((t) => t.type === 'SELL').reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const totalAddValue = transactions.filter((t) => t.type === 'ADD').reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={24} color="var(--accent-primary)" />
            Transactions History
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track item additions and sales recorded in MongoDB Atlas ({transactions.length} transactions)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              borderColor: (typeFilter !== 'ALL' || startDate || endDate) ? 'var(--accent-primary)' : 'var(--border-color)',
            }}
          >
            <Filter size={16} color={(typeFilter !== 'ALL' || startDate || endDate) ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            Filter List {(typeFilter !== 'ALL' || startDate || endDate) && '• Active'}
          </button>
          <button className="btn btn-primary" onClick={exportToExcelCSV} title="Export to CSV / Excel">
            <Download size={16} /> Export to Excel
          </button>
        </div>
      </div>

      {/* Quick Filter Summary Pill */}
      {(typeFilter !== 'ALL' || startDate || endDate) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(99, 102, 241, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-highlight)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Active Filter: Type: <strong>{typeFilter}</strong> {startDate && `| From: ${startDate}`} {endDate && `| To: ${endDate}`}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleResetFilters} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Summary Valuation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtered Sell Revenue</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger-text)', marginTop: '4px' }}>
            {formatCurrency(totalSellValue)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtered Stock Addition</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-text)', marginTop: '4px' }}>
            {formatCurrency(totalAddValue)}
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={36} color="var(--text-dim)" style={{ marginBottom: '10px' }} />
            <h4 style={{ color: 'var(--text-main)' }}>No Transactions Recorded</h4>
            <p style={{ fontSize: '0.85rem' }}>Perform Sell or Add stock actions to see history</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Auditor / User</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {tx.type === 'SELL' ? (
                      <span className="badge badge-danger">
                        <ArrowDownRight size={13} /> SELL
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <ArrowUpRight size={13} /> ADD
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.itemName}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {tx.type === 'SELL' ? `-${tx.quantity}` : `+${tx.quantity}`} units
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(tx.unitPrice)}</td>
                  <td style={{ fontWeight: 800, color: tx.type === 'SELL' ? 'var(--danger-text)' : 'var(--success-text)' }}>
                    {formatCurrency(tx.totalAmount)}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{tx.performedBy || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Transactions List">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Transaction Type */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Transaction Type
            </label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types (Sell & Add)</option>
              <option value="SELL">Sell Only 🔻</option>
              <option value="ADD">Add Only 🟢</option>
            </select>
          </div>

          {/* 2. Modern DatePicker Component */}
          <DatePicker
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
            <button className="btn btn-primary" onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
