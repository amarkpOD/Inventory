import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { fetchDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Layers,
  ShoppingBag,
  PackagePlus,
  RefreshCw,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';

export default function DashboardScreen({ onOpenSellModal, onOpenAddStockModal, onLogout }) {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setError('');
      const res = await fetchDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Connecting to Inventory Hub...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
    >
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{user?.name || 'User'}</Text>
        </View>
        <View style={styles.userRoleBadge}>
          {isAdmin ? <ShieldCheck size={14} color="#a855f7" /> : <UserCheck size={14} color="#3b82f6" />}
          <Text style={[styles.roleText, isAdmin ? { color: '#c084fc' } : { color: '#60a5fa' }]}>
            {isAdmin ? 'Admin Role' : 'Worker Role'}
          </Text>
        </View>
      </View>

      {/* Quick Action Stock Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.sellActionBtn} onPress={onOpenSellModal}>
          <ShoppingBag size={18} color="#ffffff" />
          <Text style={styles.actionBtnText}>Sell Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addActionBtn} onPress={onOpenAddStockModal}>
          <PackagePlus size={18} color="#ffffff" />
          <Text style={styles.actionBtnText}>Add Stock</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Primary Revenue Cards */}
      <Text style={styles.sectionHeaderTitle}>REVENUE & SALES METRICS</Text>

      <View style={styles.salesCardsGrid}>
        <View style={[styles.card, styles.todayCard]}>
          <Text style={styles.cardLabel}>TODAY'S SELL</Text>
          <Text style={[styles.cardValue, { color: '#f87171' }]}>
            {formatCurrency(stats?.todaySellValue)}
          </Text>
        </View>

        <View style={[styles.card, styles.weeklyCard]}>
          <Text style={styles.cardLabel}>WEEKLY SELL</Text>
          <Text style={[styles.cardValue, { color: '#fb923c' }]}>
            {formatCurrency(stats?.weeklySellValue)}
          </Text>
        </View>
      </View>

      <View style={styles.salesCardsGrid}>
        <View style={[styles.card, styles.monthlyCard]}>
          <Text style={styles.cardLabel}>MONTHLY SELL</Text>
          <Text style={[styles.cardValue, { color: '#38bdf8' }]}>
            {formatCurrency(stats?.monthlySellValue)}
          </Text>
        </View>

        <View style={[styles.card, styles.valuationCard]}>
          <Text style={styles.cardLabel}>TOTAL VALUATION</Text>
          <Text style={[styles.cardValue, { color: '#34d399' }]}>
            {formatCurrency(stats?.totalValue)}
          </Text>
        </View>
      </View>

      {/* Inventory Counts & Status Cards */}
      <View style={styles.statusGrid}>
        <View style={styles.statusBox}>
          <Layers size={18} color="#818cf8" />
          <Text style={styles.statusNum}>{stats?.totalItems || 0}</Text>
          <Text style={styles.statusLabel}>Total Items</Text>
        </View>

        <View style={styles.statusBox}>
          <Package size={18} color="#34d399" />
          <Text style={styles.statusNum}>{stats?.inStockCount || 0}</Text>
          <Text style={styles.statusLabel}>In Stock</Text>
        </View>

        <View style={styles.statusBox}>
          <AlertTriangle size={18} color="#f87171" />
          <Text style={[styles.statusNum, { color: '#f87171' }]}>
            {(stats?.lowStockCount || 0) + (stats?.outOfStockCount || 0)}
          </Text>
          <Text style={styles.statusLabel}>Low/Out Stock</Text>
        </View>
      </View>

      {/* All Items Ranked by Stock Quantity */}
      <View style={styles.rankingSection}>
        <View style={styles.rankingHeader}>
          <TrendingUp size={18} color="#6366f1" />
          <Text style={styles.rankingTitle}>All Items Ranked by Stock Quantity</Text>
        </View>
        <Text style={styles.rankingSubtitle}>Sorted Highest to Lowest</Text>

        <View style={styles.tableCard}>
          {stats?.itemsByQuantityDesc?.length === 0 ? (
            <Text style={styles.emptyTableText}>No inventory items recorded</Text>
          ) : (
            stats?.itemsByQuantityDesc?.map((item, index) => (
              <View key={item._id} style={styles.rankingItemRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNum}>#{index + 1}</Text>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <Text style={styles.itemNameText}>{item.name}</Text>
                  <Text style={styles.itemPriceText}>Unit Price: {formatCurrency(item.unitPrice)}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemQtyText}>{item.quantity} units</Text>
                  <Text style={styles.itemValuationText}>
                    Valuation: {formatCurrency(item.quantity * item.unitPrice)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
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
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  userNameText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  userRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  sellActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 10,
  },
  addActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
  },
  salesCardsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 24,
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusNum: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  rankingSection: {
    marginBottom: 20,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankingTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  rankingSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  tableCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTableText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    padding: 20,
  },
  rankingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
  itemNameText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemPriceText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  itemQtyText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '800',
  },
  itemValuationText: {
    color: '#94a3b8',
    fontSize: 11,
  },
});
