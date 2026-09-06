import React, { useState, useEffect } from 'react';
import { fetchItems, deleteItem, bulkDeleteItems } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StockBadge from '../components/StockBadge';
import QuickStockModal from '../components/QuickStockModal';
import Modal from '../components/Modal';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';

const ItemMaster = ({ onAddNewItem, onEditItem, initialFilterStatus }) => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialFilterStatus || 'All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modals
  const [stockItem, setStockItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchItems({
        search: searchTerm,
        status: selectedStatus,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page,
        limit: 10,
      });
      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [searchTerm, selectedStatus, page]);

  // Checkbox Selection
  const handleSelectAllOnPage = () => {
    const pageItemIds = items.map((i) => i._id);
    const allSelected = pageItemIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageItemIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Item Delete
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteItem(itemToDelete._id);
      setSelectedIds((prev) => prev.filter((id) => id !== itemToDelete._id));
      setItemToDelete(null);
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await bulkDeleteItems(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to perform bulk delete');
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = () => {
    if (!items.length) return;
    const headers = ['Item Name', 'Price (₹)', 'Quantity', 'Status'];
    const rows = items.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      item.unitPrice,
      item.quantity,
      `"${item.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  const isAllPageSelected = items.length > 0 && items.every((i) => selectedIds.includes(i._id));
  const selectedItemsList = items.filter((i) => selectedIds.includes(i._id));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Title & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Item Master</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage items ({totalCount} total items)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={exportToCSV} title="Download CSV File">
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={onAddNewItem} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            <Plus size={18} /> Add New Item
          </button>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedIds.length > 0 && (
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '14px 20px',
            background: 'rgba(239, 68, 68, 0.12)',
            borderColor: 'var(--danger-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={18} color="var(--danger-text)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {selectedIds.length} item(s) selected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedIds([])}
              style={{ fontSize: '0.8rem' }}
            >
              Deselect All
            </button>

            <button
              className="btn btn-danger btn-sm"
              disabled={!isAdmin}
              title={isAdmin ? 'Delete selected items' : 'Admin privilege required to bulk delete'}
              onClick={() => setIsBulkDeleteModalOpen(true)}
              style={{ padding: '8px 16px', fontWeight: 700 }}
            >
              <Trash2 size={15} /> Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Clean Table: Item Name, Quantity, Price, Actions */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
            <p>Loading Item Master...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={36} color="var(--text-dim)" style={{ marginBottom: '10px' }} />
            <h4 style={{ color: 'var(--text-main)' }}>No Items Found</h4>
            <p style={{ fontSize: '0.85rem' }}>Click "+ Add New Item" to create one!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '44px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleSelectAllOnPage}
                    style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                    title="Select / Deselect all items on this page"
                  />
                </th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isSelected = selectedIds.includes(item._id);
                return (
                  <tr
                    key={item._id}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(item._id)}
                        style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>{item.name}</div>
                    </td>
                    <td>
                      <StockBadge status={item.status} quantity={item.quantity} />
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--success-text)' }}>
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          title="Adjust Quantity (+/-)"
                          onClick={() => setStockItem(item)}
                        >
                          <Layers size={14} /> Stock
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px' }}
                          title="Edit Item"
                          onClick={() => onEditItem(item)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 12px' }}
                          title={isAdmin ? 'Delete Item' : 'Delete (Admin Permission Required)'}
                          disabled={!isAdmin}
                          onClick={() => setItemToDelete(item)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of {totalPages} ({totalCount} total items)
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Stock Modal */}
      {stockItem && (
        <QuickStockModal
          isOpen={Boolean(stockItem)}
          onClose={() => setStockItem(null)}
          item={stockItem}
          onSuccess={loadInventory}
        />
      )}

      {/* Single Item Delete Confirmation Modal */}
      <Modal isOpen={Boolean(itemToDelete)} onClose={() => setItemToDelete(null)} title="Confirm Delete Item">
        <div>
          <p style={{ color: 'var(--text-main)', marginBottom: '16px' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--danger-text)' }}>{itemToDelete?.name}</strong>?
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            This action will permanently remove the item from the database.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setItemToDelete(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" disabled={deleting} onClick={handleDeleteConfirm}>
              {deleting ? 'Deleting...' : 'Delete Item'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title={`Confirm Bulk Delete (${selectedIds.length} items)`}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--danger-border)' }}>
            <AlertTriangle size={24} color="var(--danger-text)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.88rem', color: 'var(--danger-text)' }}>
              <strong>Warning:</strong> You are about to permanently delete <strong>{selectedIds.length} item(s)</strong>.
            </div>
          </div>

          <div style={{ marginBottom: '16px', maxHeight: '160px', overflowY: 'auto', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              SELECTED ITEMS TO DELETE:
            </div>
            {selectedItemsList.map((item) => (
              <div key={item._id} style={{ fontSize: '0.85rem', color: 'var(--text-main)', padding: '4px 0', borderBottom: '1px dashed var(--border-color)' }}>
                • <strong>{item.name}</strong> (${item.unitPrice})
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsBulkDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" disabled={deleting} onClick={handleBulkDeleteConfirm}>
              {deleting ? 'Deleting...' : `Confirm Delete ${selectedIds.length} Item(s)`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemMaster;
