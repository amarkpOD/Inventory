import React, { useState, useEffect } from 'react';
import { createItem, updateItem } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const AddEditItem = ({ editingItem, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    unitPrice: '',
    quantity: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        unitPrice: editingItem.unitPrice || '',
        quantity: editingItem.quantity || '',
      });
    }
  }, [editingItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        unitPrice: Number(formData.unitPrice) || 0,
        quantity: Number(formData.quantity) || 0,
        sku: editingItem?.sku || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        category: editingItem?.category || 'General',
      };

      if (editingItem) {
        await updateItem(editingItem._id, payload);
      } else {
        await createItem(payload);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-icon" onClick={onCancel}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enter item name, price, and stock quantity
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '14px', marginBottom: '20px', borderColor: 'var(--danger-border)', color: 'var(--danger-text)' }}>
          {error}
        </div>
      )}

      {/* Ultra Simple Form: Only Name, Price, Quantity */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Item Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              style={{ fontSize: '1rem', padding: '12px 16px' }}
              placeholder="e.g. Wireless Ergonomic Mouse"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 2. Price ($) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Price (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="unitPrice"
              className="form-input"
              style={{ fontSize: '1rem', padding: '12px 16px' }}
              placeholder="e.g. 49.99"
              value={formData.unitPrice}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* 3. Quantity */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Quantity in Stock *
            </label>
            <input
              type="number"
              min="0"
              name="quantity"
              className="form-input"
              style={{ fontSize: '1rem', padding: '12px 16px' }}
              placeholder="e.g. 25"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
            <Save size={16} />
            {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditItem;
