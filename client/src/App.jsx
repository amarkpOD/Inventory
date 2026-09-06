import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ItemMaster from './pages/ItemMaster';
import AddEditItem from './pages/AddEditItem';
import Transactions from './pages/Transactions';
import SellModal from './components/SellModal';
import AddStockModal from './components/AddStockModal';
import { RefreshCw } from 'lucide-react';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTabState] = useState(() => {
    const saved = localStorage.getItem('inventory_activeTab');
    if (saved === 'add-item') return 'item-master';
    return saved || 'dashboard';
  });

  const setActiveTab = (tab) => {
    localStorage.setItem('inventory_activeTab', tab);
    setActiveTabState(tab);
  };

  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-main)',
        }}
      >
        <RefreshCw size={32} className="animate-spin" color="var(--accent-primary)" />
        <span style={{ marginLeft: '12px', fontSize: '1rem', fontWeight: 600 }}>Connecting to Inventory Hub...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigateToItemMaster = (status = 'All') => {
    setFilterStatus(status);
    setActiveTab('item-master');
  };

  const handleAddNewItem = () => {
    setEditingItem(null);
    setActiveTab('add-item');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setActiveTab('add-item');
  };

  const handleItemSaved = () => {
    setEditingItem(null);
    setActiveTab('item-master');
    setRefreshKey((k) => k + 1);
  };

  const handleStockUpdated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <Navbar onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              if (tab === 'add-item') setEditingItem(null);
              setActiveTab(tab);
            }}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobileMenu={() => setIsMobileSidebarOpen(false)}
            onOpenSellModal={() => setIsSellModalOpen(true)}
            onOpenAddStockModal={() => setIsAddStockModalOpen(true)}
          />
          <main className="page-body">
            {activeTab === 'dashboard' && (
              <Dashboard key={refreshKey} onNavigateToItemMaster={handleNavigateToItemMaster} />
            )}
            {activeTab === 'item-master' && (
              <ItemMaster
                key={refreshKey}
                onAddNewItem={handleAddNewItem}
                onEditItem={handleEditItem}
                initialFilterStatus={filterStatus}
              />
            )}
            {activeTab === 'add-item' && (
              <AddEditItem
                editingItem={editingItem}
                onCancel={() => setActiveTab('item-master')}
                onSuccess={handleItemSaved}
              />
            )}
            {activeTab === 'transactions' && (
              <Transactions key={refreshKey} />
            )}
          </main>
        </div>
      </div>

      {/* Global Quick Action Modals */}
      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={handleStockUpdated}
      />
      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSuccess={handleStockUpdated}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
