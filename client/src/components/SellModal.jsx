import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchItems, quickStockAdjust } from '../services/api';
import { ShoppingBag, Edit3, Search, Check } from 'lucide-react';

const SellModal = ({ isOpen, onClose, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantityToSell, setQuantityToSell] = useState(1);
  const [customPrice, setCustomPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      loadItemsList();
    }
  }, [isOpen]);

  const loadItemsList = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await fetchItems({ limit: 500, sortBy: 'name', sortOrder: 'asc' });
      const fetchedItems = res.data.items || [];
      setItems(fetchedItems);
      if (fetchedItems.length > 0) {
        setSelectedItemId(fetchedItems[0]._id);
        setCustomPrice(fetchedItems[0].unitPrice || 0);
      }
    } catch (err) {
      setError('Failed to load items list');
    } finally {
      setFetching(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedItem = items.find((i) => i._id === selectedItemId);

  const handleItemSelectChange = (e) => {
    const id = e.target.value;
    setSelectedItemId(id);
    setError('');
    const found = items.find((i) => i._id === id);
    if (found) {
      setCustomPrice(found.unitPrice || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const sellQty = Number(quantityToSell);
    const salePrice = Number(customPrice);

    if (sellQty <= 0) {
      setError('Please enter a valid sell quantity greater than 0');
      return;
    }

    if (salePrice < 0) {
      setError('Please enter a valid selling price (₹)');
      return;
    }

    if (sellQty > selectedItem.quantity) {
      setError(`Cannot sell ${sellQty} units. Only ${selectedItem.quantity} units available in stock!`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await quickStockAdjust(selectedItem._id, {
        adjustment: -sellQty,
        customUnitPrice: salePrice,
        note: note || `Sold ${sellQty} unit(s) @ ₹${salePrice}`,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sell transaction');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sell Stock Item">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: 'var(--danger-text)', fontSize: '0.85rem', marginBottom: '14px', background: 'var(--danger-bg)', padding: '10px', borderRadius: '6px', border: '1px solid var(--danger-border)' }}>
            {error}
          </div>
        )}

        {fetching ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</div>
        ) : (
          <>
            {/* Search Input Bar */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Search & Select Item to Sell *
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Type item name or SKU to filter list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Matching Items Selection List */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Matching Items ({filteredItems.length}): Click item to select</span>
                {selectedItem && (
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                    Selected: {selectedItem.name}
                  </span>
                )}
              </div>
              <div
                style={{
                  maxHeight: '170px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '4px',
                }}
              >
                {filteredItems.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    No matching items found for "{searchTerm}"
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = item._id === selectedItemId;
                    return (
                      <div
                        key={item._id}
                        onClick={() => {
                          setSelectedItemId(item._id);
                          setCustomPrice(item.unitPrice || 0);
                          setError('');
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.08))'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected
                            ? '1px solid var(--accent-primary)'
                            : '1px solid var(--border-color)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? '#ffffff' : 'var(--text-main)', fontSize: '0.92rem' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Default Price: {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge ${item.quantity > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                            {item.quantity} in stock
                          </span>
                          {isSelected && <Check size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Stock Available Banner */}
            {selectedItem && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Available Stock: <strong style={{ color: selectedItem.quantity > 0 ? 'var(--success-text)' : 'var(--danger-text)', fontSize: '1rem' }}>{selectedItem.quantity} units</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Default Price: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(selectedItem.unitPrice)}</strong>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* 3. Custom Selling Price Field */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Selling Price (₹) <Edit3 size={13} color="var(--accent-primary)" />
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  style={{ fontSize: '1rem', padding: '10px 14px' }}
                  placeholder="Enter selling price"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Pre-filled from Master (Editable)
                </span>
              </div>

              {/* 4. Quantity to Sell */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Quantity to Sell *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem ? selectedItem.quantity : undefined}
                  className="form-input"
                  style={{ fontSize: '1rem', padding: '10px 14px' }}
                  value={quantityToSell}
                  onChange={(e) => setQuantityToSell(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Total Sale Value Preview */}
            {selectedItem && (
              <div
                style={{
                  marginTop: '6px',
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--success-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Calculated Revenue:</span>
                <strong style={{ color: 'var(--success-text)', fontSize: '1.15rem', fontWeight: 800 }}>
                  {formatCurrency((Number(quantityToSell) || 0) * (Number(customPrice) || 0))}
                </strong>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !selectedItem || selectedItem.quantity <= 0}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <ShoppingBag size={16} />
                {loading ? 'Processing Sale...' : 'Confirm Sell'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default SellModal;
