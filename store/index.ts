import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware' // Added persistence
import {
  getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem,
  getWishlist, addToWishlist, removeFromWishlist,
} from '@/lib/api'
import { onAuthChange } from '@/lib/auth'

/* --- Types remain the same --- */
export interface CartItem {
  id: string; productId: string; name: string; price: number; image: string; size?: string; qty: number;
}
export interface WishItem {
  id: string; name: string; price: number; image: string; href: string;
}

/* ─────────────────────────────────────────
   CART STORE (Member + Guest Hybrid)
───────────────────────────────────────── */
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  syncCart: () => Promise<void>;
  addItem: (item: { id: string; name: string; price: number; image: string; size?: string }) => Promise<void>;
  removeItem: (id: string, size?: string) => Promise<void>;
  updateQty: (id: string, size: string | undefined, qty: number) => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Fetches from DB and replaces local state
      syncCart: async () => {
        try {
          const res = await getCart()
          if (res.success && res.cart?.items) {
            const dbItems = res.cart.items.map((i: any) => ({
              id: i.id,
              productId: i.product?.id,
              name: i.product?.name,
              price: i.product?.base_price,
              image: i.product?.images?.[0] || '',
              qty: i.quantity,
              size: i.size || undefined
            }))
            set({ items: dbItems })
          }
        } catch (e) {
          console.error("Cart sync failed - likely guest mode")
        }
      },

      addItem: async (incoming) => {
        const items = get().items
        const existing = items.find(i => i.productId === incoming.id && i.size === incoming.size)
        
        // 1. Update UI Instantly (Optimistic)
        if (existing) {
          set({ items: items.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i) })
        } else {
          set({ items: [...items, { ...incoming, productId: incoming.id, id: `temp-${Date.now()}`, qty: 1 }] })
        }

        // 2. Sync to DB if logged in
        try {
          await apiAddToCart(incoming.id, 1) 
          get().syncCart() // Refresh IDs from DB
        } catch { /* Stay in guest mode */ }
      },

      removeItem: async (id, size) => {
        const item = get().items.find(i => i.productId === id && i.size === size)
        set({ items: get().items.filter(i => i !== item) })
        if (item && !item.id.startsWith('temp-')) {
          try { await removeCartItem(item.id) } catch {}
        }
      },

      updateQty: async (id, size, qty) => {
        const items = get().items
        const item = items.find(i => i.productId === id && i.size === size)
        if (!item) return
        if (qty <= 0) return get().removeItem(id, size)

        set({ items: items.map(i => i === item ? { ...i, qty } : i) })
        if (!item.id.startsWith('temp-')) {
          try { await updateCartItem(item.id, qty) } catch {}
        }
      },

      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
      totalPrice: () => get().items.reduce((s, i) => s + (i.price * i.qty), 0),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'tfm-cart', // Browser storage key
      partialize: (state) => ({ items: state.items }), // Only save items, not "isOpen"
    }
  )
)

/* ─────────────────────────────────────────
   WISHLIST STORE (Member + Guest Hybrid)
───────────────────────────────────────── */
interface WishlistStore {
  items:          WishItem[];
  isOpen:         boolean;           // <--- Added back
  openWishlist:   () => void;        // <--- Added back
  closeWishlist:  () => void;        // <--- Added back
  syncWishlist:   () => Promise<void>;
  toggle:         (item: WishItem) => Promise<void>;
  has:            (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false, // <--- Initial state

      openWishlist:  () => set({ isOpen: true }),  // <--- Implementation
      closeWishlist: () => set({ isOpen: false }), // <--- Implementation

      syncWishlist: async () => {
        try {
          const res = await getWishlist()
          if (res.success && res.wishlist?.items) {
            const dbItems = res.wishlist.items.map((i: any) => ({
              id: i.product?.id,
              name: i.product?.name,
              price: i.product?.base_price,
              image: i.product?.images?.[0] || '',
              href: `/products/${i.product?.id}`
            }))
            set({ items: dbItems })
          }
        } catch {}
      },

      toggle: async (item) => {
        const exists = get().items.find(i => i.id === item.id)
        set({ items: exists ? get().items.filter(i => i.id !== item.id) : [...get().items, item] })
        try {
          exists ? await removeFromWishlist(item.id) : await addToWishlist(item.id)
        } catch {}
      },

      has: (id) => get().items.some(i => i.id === id),
    }),
    { 
      name: 'tfm-wishlist',
      // partialize ensures we don't save the 'isOpen' state to the browser,
      // so the drawer is always closed when the page first loads.
      partialize: (state) => ({ items: state.items }),
    }
  )
)

/* ─────────────────────────────────────────
   INITIALIZATION LOGIC
───────────────────────────────────────── */
if (typeof window !== 'undefined') {
  // 1. Run sync immediately on load in case user is already logged in
  useCartStore.getState().syncCart()
  useWishlistStore.getState().syncWishlist()

  // 2. Listen for auth changes (Login/Logout)
  onAuthChange(user => {
    if (user) {
      useCartStore.getState().syncCart()
      useWishlistStore.getState().syncWishlist()
    } else {
      useCartStore.getState().clear()
    }
  })
}