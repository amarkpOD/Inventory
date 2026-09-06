import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { fetchItems, quickStockAdjust } from '../services/api';
import { ShoppingBag, Search, Check, X, DollarSign } from 'lucide-react-native';

export default function SellModal({ visible, onClose, onSuccess }) {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantityToSell, setQuantityToSell] = useState('1');
  const [customPrice, setCustomPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setSearchTerm('');
      loadItemsList();
    }
  }, [visible]);

  const loadItemsList = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await fetchItems({ limit: 500, sortBy: 'name', sortOrder: 'asc' });
      const fetchedItems = res.data.items || [];
      setItems(fetchedItems);
      if (fetchedItems.length > 0) {
        setSelectedItemId(fetchedItems[0]._id);
        setCustomPrice(String(fetchedItems[0].unitPrice || 0));
      }
    } catch (err) {
      setError('Failed to load items list');
    } finally {
      setFetching(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedItem = items.find((i) => i._id === selectedItemId);

  const handleSubmit = async () => {
    if (!selectedItem) return;

    const sellQty = Number(quantityToSell);
    const salePrice = Number(customPrice);

    if (isNaN(sellQty) || sellQty <= 0) {
      setError('Please enter a valid sell quantity greater than 0');
      return;
    }

    if (isNaN(salePrice) || salePrice < 0) {
      setError('Please enter a valid selling price (₹)');
      return;
    }

    if (sellQty > selectedItem.quantity) {
      setError(`Cannot sell ${sellQty} units. Only ${selectedItem.quantity} units in stock!`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await quickStockAdjust(selectedItem._id, {
        adjustment: -sellQty,
        customUnitPrice: salePrice,
        note: `Sold ${sellQty} unit(s) @ ₹${salePrice}`,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sell transaction');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} color="#ef4444" />
              <Text style={styles.modalTitle}>Sell Stock Item</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 480 }}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {fetching ? (
              <ActivityIndicator size="large" color="#6366f1" style={{ marginVertical: 30 }} />
            ) : (
              <>
                {/* Search Bar */}
                <Text style={styles.fieldLabel}>Search Item Name / SKU</Text>
                <View style={styles.searchBox}>
                  <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Type to filter matching items..."
                    placeholderTextColor="#64748b"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                </View>

                {/* Clickable Items List */}
                <Text style={styles.subLabel}>
                  Matching Items ({filteredItems.length}): Tap item to select
                </Text>
                <ScrollView style={styles.itemsListContainer} nestedScrollEnabled>
                  {filteredItems.length === 0 ? (
                    <Text style={styles.emptyText}>No matching items found</Text>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = item._id === selectedItemId;
                      return (
                        <TouchableOpacity
                          key={item._id}
                          style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                          onPress={() => {
                            setSelectedItemId(item._id);
                            setCustomPrice(String(item.unitPrice || 0));
                            setError('');
                          }}
                        >
                          <View>
                            <Text style={[styles.itemName, isSelected && { color: '#ffffff', fontWeight: '800' }]}>
                              {item.name}
                            </Text>
                            <Text style={styles.itemMeta}>Default: {formatCurrency(item.unitPrice)}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.stockBadge, item.quantity > 0 ? styles.stockSuccess : styles.stockDanger]}>
                              {item.quantity} in stock
                            </Text>
                            {isSelected && <Check size={18} color="#6366f1" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                {/* Inputs Grid */}
                <View style={styles.gridRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Selling Price (₹)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={customPrice}
                      onChangeText={setCustomPrice}
                      placeholder="0"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Quantity to Sell</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={quantityToSell}
                      onChangeText={setQuantityToSell}
                    />
                  </View>
                </View>

                {/* Revenue Calculation Banner */}
                {selectedItem && (
                  <View style={styles.revenueBanner}>
                    <Text style={styles.revenueLabel}>Calculated Total Revenue:</Text>
                    <Text style={styles.revenueValue}>
                      {formatCurrency((Number(quantityToSell) || 0) * (Number(customPrice) || 0))}
                    </Text>
                  </View>
                )}

                {/* Submit Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtn, (loading || !selectedItem) && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading || !selectedItem}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.submitBtnText}>Confirm Sell</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
  },
  fieldLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  subLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 10,
    fontSize: 14,
  },
  itemsListContainer: {
    maxHeight: 150,
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemCardSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
  },
  itemName: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    color: '#64748b',
    fontSize: 11,
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
  },
  stockDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#334155',
  },
  revenueBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  revenueLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  revenueValue: {
    color: '#34d399',
    fontSize: 16,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
