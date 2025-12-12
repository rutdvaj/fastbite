// utils/cartSync.ts

export interface CartItem {
  product_id: number;
  qty: number;
}

export const getLocalCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

export const clearLocalCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart');
};

export const syncCartOnLogin = async (): Promise<boolean> => {
  try {
    const localCart = getLocalCart();
    
    // If no items in localStorage, nothing to sync
    if (localCart.length === 0) {
      console.log('No items to sync');
      return true;
    }

    console.log(`Syncing ${localCart.length} items from localStorage...`);

    const res = await fetch('/api/cart/sync', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_items: localCart })
    });

    const result = await res.json();

    if (result.success) {
      console.log('✅ Cart synced successfully:', result);
      clearLocalCart(); // Clear localStorage after successful sync
      return true;
    } else {
      console.error('❌ Cart sync failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
    return false;
  }
};