import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Order, Product } from '../types';
import { adminStore } from '../lib/adminStore';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  itemCount: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;

  // Global modals
  isCustomBuilderOpen: boolean;
  openCustomBuilder: () => void;
  closeCustomBuilder: () => void;

  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;

  selectedProductForDetail: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;

  lastCompletedOrder: Order | null;
  setCompletedOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_CART_KEY = 'cakehouse_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(() => adminStore.getSettings());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setSettings(adminStore.getSettings());
    });
    return unsub;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to sync cart', e);
    }
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'cartItemId'>) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i =>
          i.productId === newItem.productId &&
          i.selectedWeight === newItem.selectedWeight &&
          (i.selectedFlavor || '') === (newItem.selectedFlavor || '') &&
          (i.customMessage || '') === (newItem.customMessage || '') &&
          i.isEggless === newItem.isEggless
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: existing.unitPrice * newQty,
        };
        return updated;
      }

      const generatedId = `ci_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return [...prev, { ...newItem, cartItemId: generatedId }];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 999;
  const standardDeliveryFee = settings.standardDeliveryFee ?? 50;

  const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const deliveryFee = items.length === 0 || subtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
  const totalAmount = subtotal + deliveryFee;
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        deliveryFee,
        totalAmount,
        itemCount,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,

        isCustomBuilderOpen,
        openCustomBuilder: () => setIsCustomBuilderOpen(true),
        closeCustomBuilder: () => setIsCustomBuilderOpen(false),

        isCheckoutOpen,
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),

        selectedProductForDetail,
        openProductDetail: (product: Product) => setSelectedProductForDetail(product),
        closeProductDetail: () => setSelectedProductForDetail(null),

        lastCompletedOrder,
        setCompletedOrder: (order: Order | null) => setLastCompletedOrder(order),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
