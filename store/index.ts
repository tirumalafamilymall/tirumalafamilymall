// store/index.ts
import { create } from 'zustand'
import {
  getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem,
  getWishlist, addToWishlist, removeFromWishlist,
} from '@/lib/api'
import { onAuthChange } from '@/lib/auth'

/* ─── Types ─── */
export interface CartItem {
  id:       string   // backend cart item ID (for API calls)
  productId: string  // product ID (for navigation)
  name:     string
  price:    number
  image:    string
  size?:    string
  qty:      number
}

export interface WishItem {
  id:    string
  name:  string
  price: number
  image: string
  href:  string
}

/* ─────────────────────────────────────────
   CART STORE
───────────────────────────────────────── */
interface CartStore {
  items:     CartItem[]
  isOpen:    boolean
  synced:    boolean   // true once we've loaded from backend
  openCart:  () => void
  closeCart: () => void
  // Load cart from backend (call on login)
  syncCart:  () => Promise<void>
  // Optimistic add — syncs to backend if logged in
  addItem:   (item: { id: string; name: string; price: number; image: string; size?: string }) => Promise<void>
  removeItem:(id: string, size?: string) => Promise<void>
  updateQty: (id: string, size: string | undefined, qty: number) => Promise<void>
  totalItems:() => number
  totalPrice:() => number
  clear:     () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items:  [],
  isOpen: false,
  synced: false,

  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  syncCart: async () => {
    try {
      const res = await getCart()
      const items: CartItem[] = (res.items ?? []).map((i: any) => ({
        id:        i.id,
        productId: i.product?.id ?? i.product_id,
        name:      i.product?.name ?? i.name,
        price:     i.product?.base_price ?? i.price,
        image:     i.product?.images?.[0] ?? i.image ?? '',
        qty:       i.quantity ?? i.qty,
      }))
      set({ items, synced: true })
    } catch {
      // Not logged in — keep local state
      set({ synced: true })
    }
  },

  addItem: async (incoming) => {
    const existing = get().items.find(i => i.productId === incoming.id && i.size === incoming.size)

    // Optimistic update
    if (existing) {
      set({
        items: get().items.map(i =>
          i.productId === incoming.id && i.size === incoming.size
            ? { ...i, qty: i.qty + 1 }
            : i
        ),
      })
    } else {
      const tempItem: CartItem = {
        id:        `temp-${Date.now()}`,
        productId: incoming.id,
        name:      incoming.name,
        price:     incoming.price,
        image:     incoming.image,
        size:      incoming.size,
        qty:       1,
      }
      set({ items: [...get().items, tempItem] })
    }

    // Sync to backend
    try {
      const res = await apiAddToCart(incoming.id, existing ? existing.qty + 1 : 1)
      // Replace temp id with real backend id
      if (res.item) {
        set({
          items: get().items.map(i =>
            i.productId === incoming.id && i.size === incoming.size
              ? { ...i, id: res.item.id }
              : i
          ),
        })
      }
    } catch {
      // Not logged in — local only is fine
    }
  },

  removeItem: async (id, size) => {
    const item = get().items.find(i => i.productId === id && i.size === size)
    // Optimistic
    set({ items: get().items.filter(i => !(i.productId === id && i.size === size)) })
    // Sync
    if (item && !item.id.startsWith('temp-')) {
      try { await removeCartItem(item.id) } catch {}
    }
  },

  updateQty: async (id, size, qty) => {
    if (qty <= 0) { get().removeItem(id, size); return }
    const item = get().items.find(i => i.productId === id && i.size === size)
    // Optimistic
    set({ items: get().items.map(i => i.productId === id && i.size === size ? { ...i, qty } : i) })
    // Sync
    if (item && !item.id.startsWith('temp-')) {
      try { await updateCartItem(item.id, qty) } catch {}
    }
  },

  totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
  totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
  clear:      () => set({ items: [], synced: false }),
}))

/* ─────────────────────────────────────────
   WISHLIST STORE
───────────────────────────────────────── */
interface WishlistStore {
  items:          WishItem[]
  isOpen:         boolean
  openWishlist:   () => void
  closeWishlist:  () => void
  syncWishlist:   () => Promise<void>
  toggle:         (item: WishItem) => Promise<void>
  has:            (id: string) => boolean
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items:  [],
  isOpen: false,

  openWishlist:  () => set({ isOpen: true }),
  closeWishlist: () => set({ isOpen: false }),

  syncWishlist: async () => {
    try {
      const res = await getWishlist()
      const items: WishItem[] = (res.items ?? []).map((i: any) => ({
        id:    i.product?.id ?? i.id,
        name:  i.product?.name ?? i.name,
        price: i.product?.base_price ?? i.price,
        image: i.product?.images?.[0] ?? i.image ?? '',
        href:  `/products/${i.product?.slug ?? i.product?.id ?? i.id}`,
      }))
      set({ items })
    } catch {
      // Not logged in
    }
  },

  toggle: async (item) => {
    const exists = get().items.find(i => i.id === item.id)
    // Optimistic
    set({
      items: exists
        ? get().items.filter(i => i.id !== item.id)
        : [...get().items, item],
    })
    // Sync
    try {
      if (exists) {
        await removeFromWishlist(item.id)
      } else {
        await addToWishlist(item.id)
      }
    } catch {
      // Not logged in — local only
    }
  },

  has: (id) => !!get().items.find(i => i.id === id),
}))

/* ─────────────────────────────────────────
   AUTH SYNC — call once in root layout
   Syncs cart + wishlist when user logs in/out
───────────────────────────────────────── */
if (typeof window !== 'undefined') {
  onAuthChange(user => {
    if (user) {
      useCartStore.getState().syncCart()
      useWishlistStore.getState().syncWishlist()
    } else {
      useCartStore.getState().clear()
      useWishlistStore.setState({ items: [] })
    }
  })
}