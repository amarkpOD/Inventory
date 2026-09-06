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
import { fetchTransactions } from '../services/api';
import { History, ArrowDownRight, ArrowUpRight, Filter, Clock } from 'lucide-react-native';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    try {
      setError('');
      const res = await fetchTransactions({
        type: typeFilter,
        limit: 500,
      });
      setTransactions(res.data || []);
    } catch (err) {
      setError('Failed to load transactions history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [typeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  const totalSellValue = transactions.filter((t) => t.type === 'SELL').reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const totalAddValue = transactions.filter((t) => t.type === 'ADD').reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Transactions Log</Text>
          <Text style={styles.pageSubtitle}>
            {transactions.length} record(s) in last 30 days
          </Text>
        </View>
      </View>

      {/* Type Filter Chips */}
      <View style={styles.filterChipsRow}>
        {[
          { id: 'ALL', label: 'All Transactions' },
          { id: 'SELL', label: 'Sell Only 🔻' },
          { id: 'ADD', label: 'Add Only 🟢' },
        ].map((f) => {
          const isActive = typeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setTypeFilter(f.id)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
          <Text style={styles.metricLabel}>Filtered Sell Value</Text>
          <Text style={[styles.metricVal, { color: '#f87171' }]}>{formatCurrency(totalSellValue)}</Text>
        </View>
        <View style={[styles.metricCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
          <Text style={styles.metricLabel}>Filtered Restock Value</Text>
          <Text style={[styles.metricVal, { color: '#34d399' }]}>{formatCurrency(totalAddValue)}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Transactions List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <History size={36} color="#64748b" />
            <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
            <Text style={styles.emptySubtitle}>Sell or Add stock to see logs here</Text>
          </View>
        ) : (
          transactions.map((tx) => {
            const isSell = tx.type === 'SELL';
            return (
              <View key={tx._id} style={styles.txCard}>
                <View style={styles.txHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txItemName}>{tx.itemName}</Text>
                    <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</Text>
                  </View>
                  <View
                    style={[
                      styles.txBadge,
                      isSell ? styles.badgeDanger : styles.badgeSuccess,
                    ]}
                  >
                    {isSell ? <ArrowDownRight size={12} color="#f87171" /> : <ArrowUpRight size={12} color="#34d399" />}
                    <Text style={[styles.badgeText, isSell ? { color: '#f87171' } : { color: '#34d399' }]}>
                      {tx.type}
                    </Text>
                  </View>
                </View>

                <View style={styles.txBodyRow}>
                  <Text style={styles.txMetaText}>
                    Quantity: <Text style={{ color: '#ffffff', fontWeight: '800' }}>{isSell ? `-${tx.quantity}` : `+${tx.quantity}`}</Text>
                  </Text>
                  <Text style={styles.txMetaText}>
                    Price: <Text style={{ color: '#ffffff' }}>{formatCurrency(tx.unitPrice)}</Text>
                  </Text>
                  <Text style={[styles.txTotalVal, isSell ? { color: '#f87171' } : { color: '#34d399' }]}>
                    {formatCurrency(tx.totalAmount)}
                  </Text>
                </View>

                {tx.performedBy ? (
                  <Text style={styles.txUserText}>Auditor: {tx.performedBy}</Text>
                ) : null}
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
  header: {
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
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
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
  txCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  txItemName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  txDate: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  txBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  txBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  txMetaText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  txTotalVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  txUserText: {
    color: '#818cf8',
    fontSize: 11,
    marginTop: 6,
  },
});
