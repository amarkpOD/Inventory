import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Trash2, ShoppingBag, PackagePlus, Info } from 'lucide-react-native';

const ToastContext = createContext(null);

const TYPE_STYLES = {
  success: { border: '#34d399', icon: CheckCircle2, iconColor: '#34d399', bg: '#064e3b' },
  sell: { border: '#f87171', icon: ShoppingBag, iconColor: '#fecaca', bg: '#7f1d1d' },
  add: { border: '#34d399', icon: PackagePlus, iconColor: '#6ee7b7', bg: '#064e3b' },
  delete: { border: '#fb923c', icon: Trash2, iconColor: '#fed7aa', bg: '#7c2d12' },
  info: { border: '#818cf8', icon: Info, iconColor: '#c7d2fe', bg: '#312e81' },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const hideTimer = useRef(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.92, duration: 160, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, scale]);

  const showToast = useCallback(
    (message, type = 'success') => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message: String(message || ''), type });
      opacity.setValue(0);
      scale.setValue(0.92);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, 2600);
    },
    [hide, opacity, scale]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const meta = TYPE_STYLES[toast?.type] || TYPE_STYLES.success;
  const Icon = meta.icon;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={styles.overlay}>
          <Animated.View
            style={[
              styles.toast,
              {
                opacity,
                transform: [{ scale }],
                borderColor: meta.border,
                backgroundColor: meta.bg,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: meta.border }]}>
              <Icon size={18} color="#0f172a" />
            </View>
            <Text style={styles.toastText} numberOfLines={3}>
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 30,
  },
  toast: {
    maxWidth: '86%',
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 24,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flexShrink: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
});
