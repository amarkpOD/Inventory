import React, { useState } from 'react';
import Modal from './Modal';
import { quickStockAdjust } from '../services/api';
import { Plus, Minus, RefreshCw } from 'lucide-react';

const QuickStockModal = ({ isOpen, onClose, item, onSuccess }) => {
  const [mode, setMode] = useState('add'); // 'add', 'sub', 'set'
  const [amount, setAmount] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payload = { note };
      if (mode === 'add') payload.adjustment = Math.abs(Number(amount));
      if (mode === 'sub') payload.adjustment = -Math.abs(Number(amount));
      if (mode === 'set') payload.newQuantity = Math.max(0, Number(amount));

      await quickStockAdjust(item._id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock: ${item.name}`}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item SKU: <strong style={{ color: 'var(--accent-primary)' }}>{item.sku}</strong></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Quantity: <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{item.quantity}</strong></div>
        </div>

        {error && (
          <div style={{ color: 'var(--danger-text)', fontSize: '0.85rem', marginBottom: '12px', background: 'var(--danger-bg)', padding: '8px', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Action</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${mode === 'add' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('add')}
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Restock (+)
            </button>
            <button
              type="button"
              className={`btn ${mode === 'sub' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('sub')}
              style={{ fontSize: '0.8rem' }}
            >
              <Minus size={14} /> Consume (-)
            </button>
            <button
              type="button"
              className={`btn ${mode === 'set' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('set')}
              style={{ fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} /> Set Total
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            {mode === 'set' ? 'New Total Quantity' : 'Units Count'}
          </label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Audit Note / Reason (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Received shipment, Damaged box, Physical inventory check"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Confirm Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickStockModal;
