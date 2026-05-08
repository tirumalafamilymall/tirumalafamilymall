'use client'

import Link from 'next/link'
import { Heart, ShoppingBag, X } from 'lucide-react'
import { useWishlistStore, useCartStore } from '@/store'

const PLACEHOLDER_COLORS = ['#f5ede4','#e8f0fd','#f5e4ea','#e4f5ec','#f5e8fd','#fdf8e4']

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore()
  const addToCart = useCartStore(s => s.addItem)
  const openCart  = useCartStore(s => s.openCart)

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-5 px-4 bg-white">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-2">
          <Heart size={30} className="text-gray-300" />
        </div>
        <h1 className="text-[20px] font-light text-gray-700">Your wishlist is empty</h1>
        <p className="text-[13px] text-gray-400 text-center">Save the products you love here</p>
        <Link href="/collections/all"
          className="mt-2 px-8 py-3 bg-gray-900 text-white text-[12.5px] font-medium tracking-[0.08em] rounded-xl hover:bg-gray-700 transition-colors"
        >
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-3">
          <p className="text-[11px] text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-600">Wishlist</span>
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8">
        <div className="flex items-baseline gap-3 mb-8">
          <h1 className="text-[24px] font-light text-gray-900">My Wishlist</h1>
          <span className="text-[13px] text-gray-400">({items.length} items)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {items.map((item, i) => (
            <div key={item.id} className="group relative">
// Change the Link inside wishlist map to:
<Link href={item.href}
  className="block aspect-[3/4] rounded-xl overflow-hidden mb-3"
  style={{ background: PLACEHOLDER_COLORS[i % 6] }}
>
  {item.image ? (
    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
  ) : (
    <span className="text-6xl opacity-20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center h-full">👗</span>
  )}
</Link>

              {/* Remove */}
              <button onClick={() => void toggle(item)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors border border-gray-100"
              >
                <X size={12} className="text-gray-400 hover:text-red-500" />
              </button>

              <Link href={item.href} className="block text-[13px] font-medium text-gray-800 hover:text-gray-900 line-clamp-2 mb-1.5">
                {item.name}
              </Link>
              <p className="text-[14px] font-semibold text-gray-900 mb-3">₹{item.price.toLocaleString('en-IN')}</p>
              <button
                onClick={() => { addToCart({ id: item.id, name: item.name, price: item.price, image: item.image }); openCart() }}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-[12px] font-medium text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
              >
                <ShoppingBag size={13} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
