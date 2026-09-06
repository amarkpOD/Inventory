import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { createItem, updateItem } from '../services/api';
import { ArrowLeft, Save, Package } from 'lucide-react-native';

export default function AddEditItemScreen({ editingItem, onCancel, onSuccess }) {
  const isEditing = !!editingItem;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setSku(editingItem.sku || '');
      setQuantity(String(editingItem.quantity ?? 0));
      setUnitPrice(String(editingItem.unitPrice ?? 0));
      setReorderLevel(String(editingItem.reorderLevel ?? 5));
      setSupplier(editingItem.supplier || '');
      setDescription(editingItem.description || '');
    } else {
      setName('');
      setSku('');
      setQuantity('0');
      setUnitPrice('0');
      setReorderLevel('5');
      setSupplier('');
      setDescription('');
    }
  }, [editingItem]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Item Name is required');
      return;
    }

    setLoading(true);
    setError('');

    const itemData = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      quantity: Number(quantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      reorderLevel: Number(reorderLevel) || 5,
      supplier: supplier.trim() || 'Internal Warehouse',
      description: description.trim(),
    };

    try {
      if (isEditing) {
        await updateItem(editingItem._id, itemData);
      } else {
        await createItem(itemData);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onCancel}>
          <ArrowLeft size={18} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Inventory Item' : 'Add New Item'}</Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? `Updating SKU: ${editingItem.sku || 'N/A'}` : 'Fill in the item details'}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Form Card */}
      <View style={styles.card}>
        {/* Item Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Engine Oil 1L, Brake Pad"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Quantity & Unit Price Grid */}
        <View style={styles.gridRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Unit Price (₹) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={unitPrice}
              onChangeText={setUnitPrice}
            />
          </View>
        </View>

        {/* Reorder Level */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reorder Threshold Level</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={reorderLevel}
            onChangeText={setReorderLevel}
          />
          <Text style={styles.helpText}>Triggers Low Stock warning when quantity drops below this level</Text>
        </View>

        {/* Supplier */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Supplier Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spark Auto Parts"
            placeholderTextColor="#64748b"
            value={supplier}
            onChangeText={setSupplier}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description / Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter additional details..."
            placeholderTextColor="#64748b"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create Item'}</Text>
              </>
            )}
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  helpText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
