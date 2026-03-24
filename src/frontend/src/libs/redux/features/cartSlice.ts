import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id?: string; // Backend database ID
  cartId: string; // unique identifier (productID + fishInstanceId)
  productId: string;
  fishInstanceId?: string;
  productType: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeId: string;
  storeName: string;
  availableStock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Load initial state from localStorage if available
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    ...initialState,
    items: loadCartFromStorage(),
  },
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.cartId === newItem.cartId
      );

      if (existingItemIndex !== -1) {
        if (newItem.productType === "LiveFish") {
          // Unique fish already in cart
        } else {
          state.items[existingItemIndex].quantity += newItem.quantity;
        }
      } else {
        state.items.push(newItem);
      }
      
      localStorage.setItem("cart", JSON.stringify(state.items));
      state.isOpen = true;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ cartId: string; quantity: number }>
    ) => {
      const { cartId, quantity } = action.payload;
      const item = state.items.find((i) => i.cartId === cartId);
      if (item && item.productType !== "LiveFish") {
        item.quantity = Math.max(1, quantity);
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartId !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    clearStoreItems: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.storeId !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },
  },
});

export const { 
  addItem, 
  updateQuantity, 
  removeItem, 
  clearStoreItems, 
  clearCart, 
  setCartOpen, 
  toggleCart,
  setItems
} = cartSlice.actions;

export default cartSlice.reducer;
