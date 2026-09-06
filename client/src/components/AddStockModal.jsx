import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { fetchItems, quickStockAdjust } from '../services/api';
import { PackagePlus, Edit3, Search, Check } from 'lucide-react';

const AddStockModal = ({ isOpen, onClose, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState(5);
  const [unitPrice, setUnitPrice] = useState('');
  const [updateMasterPrice, setUpdateMasterPrice] = useState(false);
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
        setUnitPrice(fetchedItems[0].unitPrice || 0);
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
      setUnitPrice(found.unitPrice || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const addQty = Number(quantityToAdd);
    const priceVal = Number(unitPrice);

    if (addQty <= 0) {
      setError('Please enter a valid add quantity greater than 0');
      return;
    }

    if (priceVal < 0) {
      setError('Please enter a valid price (₹)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await quickStockAdjust(selectedItem._id, {
        adjustment: addQty,
        unitPrice: priceVal,
        updateMasterPrice,
        note: note || `Added ${addQty} unit(s) @ ₹${priceVal}`,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock quantity');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stock Quantity">
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
                Search & Select Item to Restock *
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
                          setUnitPrice(item.unitPrice || 0);
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
                            Current Price: {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
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

            {/* 2. Stock Info Banner */}
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
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Stock:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedItem.quantity} units
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expected New Stock:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-text)' }}>
                    {selectedItem.quantity + (Number(quantityToAdd) || 0)} units
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* 3. Quantity to Add */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  style={{ fontSize: '1rem', padding: '10px 14px' }}
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  required
                />
              </div>

              {/* 4. Unit Price Field */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Unit Price (₹) <Edit3 size={13} color="var(--accent-primary)" />
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  style={{ fontSize: '1rem', padding: '10px 14px' }}
                  placeholder="Unit price"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Checkbox option to update Item Master price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                id="updateMasterPriceCheck"
                checked={updateMasterPrice}
                onChange={(e) => setUpdateMasterPrice(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              <label htmlFor="updateMasterPriceCheck" style={{ cursor: 'pointer' }}>
                Update default price in Item Master to <strong>{formatCurrency(Number(unitPrice) || 0)}</strong>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !selectedItem}
                style={{ padding: '10px 20px' }}
              >
                <PackagePlus size={16} />
                {loading ? 'Adding Stock...' : 'Confirm Add Stock'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddStockModal;
