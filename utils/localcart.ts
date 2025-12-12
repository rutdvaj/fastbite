// utils/localCart.ts

export interface CartItem {
  product_id: number;
  qty: number;
}

// Add item to localStorage cart
export const addToLocalCart = (productId: number, qty: number = 1): void => {
  if (typeof window === 'undefined') return;

  try {
    const cart = getLocalCart();
    const existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.push({ product_id: productId, qty });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('✅ Added to local cart:', { productId, qty });
  } catch (error) {
    console.error('Error adding to local cart:', error);
  }
};

// Subtract from localStorage cart
export const subtractFromLocalCart = (productId: number, qty: number = 1): void => {
  if (typeof window === 'undefined') return;

  try {
    let cart = getLocalCart();
    const existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
      existingItem.qty -= qty;

      // Remove if quantity is 0 or less
      if (existingItem.qty <= 0) {
        cart = cart.filter(item => item.product_id !== productId);
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('✅ Subtracted from local cart:', { productId, qty });
  } catch (error) {
    console.error('Error subtracting from local cart:', error);
  }
};

// Get cart from localStorage
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

// Clear localStorage cart
export const clearLocalCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cart');
};