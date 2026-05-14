import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem,
  getWishlist, addToWishlist, removeFromWishlist,
} from '@/lib/api'
import { onAuthChange } from '@/lib/auth'

/* --- Types Updated for Variants --- */
export interface CartItem {
  id: string;         // The CartItem row ID
  variantId: string;  // The specific physical item
  productId: string;  // The parent blueprint
  name: string; 
  price: number; 
  image: string; 
  size?: string; 
  color?: string;
  qty: number;
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
  addItem: (item: { variantId: string; productId: string; name: string; price: number; image: string; size?: string; color?: string }) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQty: (variantId: string, qty: number) => Promise<void>;
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

      syncCart: async () => {
        try {
          const res = await getCart()
          if (res.success && res.cart?.items) {
            const dbItems = res.cart.items.map((i: any) => ({
              id: i.id,
              variantId: i.variant_id || i.variant?.id,
              productId: i.variant?.product_id || i.variant?.product?.id,
              name: i.variant?.product?.name,
              price: Number(i.variant?.base_price || 0),
              // ✅ FIX: Check variant.image first, then fall back to parent product images
              image: i.variant?.image || i.variant?.product?.images?.[0] || '',
              qty: i.quantity,
              size: i.variant?.size || undefined,
              color: i.variant?.color || undefined
            }))
            set({ items: dbItems })
          }
        } catch (e) {
          console.error("Cart sync failed - likely guest mode")
        }
      },

      addItem: async (incoming) => {
        const items = get().items
        const existing = items.find(i => i.variantId === incoming.variantId)
        
        // 1. Update UI Instantly (Optimistic)
        if (existing) {
          set({ items: items.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i) })
        } else {
          set({ items: [...items, { ...incoming, id: `temp-${Date.now()}`, qty: 1 }] })
        }

        // 2. Sync to DB if logged in
        try {
          await apiAddToCart(incoming.variantId, 1)
          get().syncCart()
        } catch { /* Stay in guest mode */ }
      },

      removeItem: async (variantId) => {
        const item = get().items.find(i => i.variantId === variantId)
        set({ items: get().items.filter(i => i !== item) })
        if (item && !item.id.startsWith('temp-')) {
          try { await removeCartItem(item.id) } catch {}
        }
      },

      updateQty: async (variantId, qty) => {
        const items = get().items
        const item = items.find(i => i.variantId === variantId)
        if (!item) return
        if (qty <= 0) return get().removeItem(variantId)

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
      name: 'tfm-cart',
      partialize: (state) => ({ items: state.items }), 
    }
  )
)

/* ─────────────────────────────────────────
   WISHLIST STORE (Member + Guest Hybrid)
───────────────────────────────────────── */
interface WishlistStore {
  items:          WishItem[];
  isOpen:         boolean;           
  openWishlist:   () => void;        
  closeWishlist:  () => void;        
  syncWishlist:   () => Promise<void>;
  toggle:         (item: WishItem) => Promise<void>;
  has:            (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false, 

      openWishlist:  () => set({ isOpen: true }),  
      closeWishlist: () => set({ isOpen: false }), 

      syncWishlist: async () => {
        try {
          const res = await getWishlist()
          if (res.success && res.wishlist?.items) {
            const dbItems = res.wishlist.items.map((i: any) => ({
              id: i.product?.id,
              name: i.product?.name,
              price: Number(i.product?.variants?.[0]?.base_price || 0),
              // ✅ FIX: Check variant.image first, then fall back to parent product images
              // This fixes the "image flashes then disappears" bug for Excel-uploaded products
              image: i.product?.variants?.find((v: any) => v.image)?.image
                     || i.product?.images?.[0]
                     || '',
              href: `/products/${i.product?.slug || i.product?.id}`
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
      partialize: (state) => ({ items: state.items }),
    }
  )
)

/* ─────────────────────────────────────────
   INITIALIZATION LOGIC
───────────────────────────────────────── */
if (typeof window !== 'undefined') {
  useCartStore.getState().syncCart()
  useWishlistStore.getState().syncWishlist()

  onAuthChange(user => {
    if (user) {
      useCartStore.getState().syncCart()
      useWishlistStore.getState().syncWishlist()
    } else {
      useCartStore.getState().clear()
    }
  })
}