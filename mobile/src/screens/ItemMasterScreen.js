import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { fetchItems, deleteItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  ShoppingBag,
  PackagePlus,
  Edit,
  Trash2,
  Boxes,
  Filter,
} from 'lucide-react-native';

export default function ItemMasterScreen({
  onAddNewItem,
  onEditItem,
  onOpenSellModal,
  onOpenAddStockModal,
}) {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      setError('');
      const res = await fetchItems({ limit: 500, sortBy: 'name', sortOrder: 'asc' });
      setItems(res.data.items || []);
    } catch (err) {
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, []);

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Inventory Item',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item._id);
              loadItems();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'In Stock') matchesStatus = item.quantity > item.reorderLevel;
    if (statusFilter === 'Low Stock') matchesStatus = item.quantity > 0 && item.quantity <= item.reorderLevel;
    if (statusFilter === 'Out of Stock') matchesStatus = item.quantity === 0;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Item Master...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header & Add Item Button */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Item Master</Text>
          <Text style={styles.pageSubtitle}>{filteredItems.length} item(s) listed</Text>
        </View>
        <TouchableOpacity style={styles.addNewBtn} onPress={onAddNewItem}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addNewBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBox}>
        <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by item name or SKU..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Status Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>{filter}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Item Cards List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Boxes size={36} color="#64748b" />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search query or filter</Text>
          </View>
        ) : (
          filteredItems.map((item) => {
            const isOutOfStock = item.quantity === 0;
            const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0;

            return (
              <View key={item._id} style={styles.itemCard}>
                {/* Item Details Header */}
                <View style={styles.itemHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>Unit Price: {formatCurrency(item.unitPrice)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.badge,
                        isOutOfStock ? styles.badgeDanger : isLowStock ? styles.badgeWarning : styles.badgeSuccess,
                      ]}
                    >
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </Text>
                    <Text style={styles.stockCountText}>{item.quantity} units</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Stock Valuation */}
                <View style={styles.valuationRow}>
                  <Text style={styles.valuationLabel}>Total Stock Valuation:</Text>
                  <Text style={styles.valuationVal}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
                </View>

                {/* Actions Row */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.sellBtn}
                    onPress={() => onOpenSellModal(item)}
                    disabled={isOutOfStock}
                  >
                    <ShoppingBag size={14} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Sell</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => onOpenAddStockModal(item)}
                  >
                    <PackagePlus size={14} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Add</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.editBtn} onPress={() => onEditItem(item)}>
                    <Edit size={14} color="#e2e8f0" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>

                  {isAdmin && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteItem(item)}>
                      <Trash2 size={14} color="#f87171" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addNewBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
  filterChipsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxHeight: 36,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#ffffff',
    fontWeight: '700',
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
  listContent: {
    paddingBottom: 30,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  itemPrice: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
  },
  badgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
  },
  stockCountText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 10,
  },
  valuationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valuationLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  valuationVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sellBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
