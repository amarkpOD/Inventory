import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider, useToast } from './src/context/ToastContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ItemMasterScreen from './src/screens/ItemMasterScreen';
import AddEditItemScreen from './src/screens/AddEditItemScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SellModal from './src/components/SellModal';
import AddStockModal from './src/components/AddStockModal';
import {
  LayoutDashboard,
  Boxes,
  History,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react-native';

function MainApp() {
  const { user, loading, logout, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingItem, setEditingItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [preselectedItem, setPreselectedItem] = useState(null);

  const openSellModal = (item = null) => {
    setPreselectedItem(item || null);
    setIsSellModalOpen(true);
  };

  const openAddStockModal = (item = null) => {
    setPreselectedItem(item || null);
    setIsAddStockModalOpen(true);
  };

  const closeSellModal = () => {
    setIsSellModalOpen(false);
    setPreselectedItem(null);
  };

  const closeAddStockModal = () => {
    setIsAddStockModalOpen(false);
    setPreselectedItem(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing Inventory App...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleAddNewItem = () => {
    setEditingItem(null);
    setActiveTab('add-edit-item');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setActiveTab('add-edit-item');
  };

  const handleItemSaved = () => {
    setEditingItem(null);
    setActiveTab('item-master');
    setRefreshKey((k) => k + 1);
  };

  const handleStockUpdated = (message, type = 'success') => {
    setRefreshKey((k) => k + 1);
    if (message) showToast(message, type);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Main Page Area */}
      <View style={styles.pageBody}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            key={refreshKey}
            onOpenSellModal={openSellModal}
            onOpenAddStockModal={openAddStockModal}
          />
        )}
        {activeTab === 'item-master' && (
          <ItemMasterScreen
            key={refreshKey}
            onAddNewItem={handleAddNewItem}
            onEditItem={handleEditItem}
            onOpenSellModal={openSellModal}
            onOpenAddStockModal={openAddStockModal}
          />
        )}
        {activeTab === 'add-edit-item' && (
          <AddEditItemScreen
            editingItem={editingItem}
            onCancel={() => setActiveTab('item-master')}
            onSuccess={handleItemSaved}
          />
        )}
        {activeTab === 'transactions' && <TransactionsScreen key={refreshKey} />}

        {activeTab === 'account' && (
          <View style={styles.accountScreen}>
            <View style={styles.userCard}>
              <View style={styles.avatarCircle}>
                <User size={32} color="#6366f1" />
              </View>
              <Text style={styles.accountName}>{user.name}</Text>
              <Text style={styles.accountEmail}>{user.email || user.username}</Text>

              <View style={styles.roleTag}>
                <ShieldCheck size={16} color={isAdmin ? '#a855f7' : '#3b82f6'} />
                <Text style={[styles.roleTagText, { color: isAdmin ? '#c084fc' : '#60a5fa' }]}>
                  {isAdmin ? 'System Administrator' : 'Warehouse Worker'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={18} color="#f87171" />
              <Text style={styles.logoutBtnText}>Sign Out of Mobile App</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Tab Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard
            size={22}
            color={activeTab === 'dashboard' ? '#6366f1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'dashboard' && styles.activeTabLabel,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('item-master')}
        >
          <Boxes
            size={22}
            color={activeTab === 'item-master' || activeTab === 'add-edit-item' ? '#6366f1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabLabel,
              (activeTab === 'item-master' || activeTab === 'add-edit-item') && styles.activeTabLabel,
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('transactions')}
        >
          <History
            size={22}
            color={activeTab === 'transactions' ? '#6366f1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'transactions' && styles.activeTabLabel,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('account')}
        >
          <User
            size={22}
            color={activeTab === 'account' ? '#6366f1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'account' && styles.activeTabLabel,
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global Quick Action Modals */}
      <SellModal
        visible={isSellModalOpen}
        onClose={closeSellModal}
        onSuccess={handleStockUpdated}
        initialItem={preselectedItem}
      />
      <AddStockModal
        visible={isAddStockModalOpen}
        onClose={closeAddStockModal}
        onSuccess={handleStockUpdated}
        initialItem={preselectedItem}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '700',
  },
  pageBody: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 3,
  },
  activeTabLabel: {
    color: '#6366f1',
    fontWeight: '800',
  },
  accountScreen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  accountEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '800',
  },
});
