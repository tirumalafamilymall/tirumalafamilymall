'use client'

import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store'

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCartStore()
  
  const subtotal = totalPrice()

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-5 px-4 bg-white">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-2">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h1 className="text-[20px] font-light text-gray-700">Your cart is empty</h1>
        <p className="text-[13px] text-gray-400 text-center">Looks like you haven't added anything yet.</p>
        <Link href="/collections/all"
          className="mt-2 px-8 py-3 bg-gray-900 text-white text-[12.5px] font-medium tracking-[0.08em] rounded-xl hover:bg-gray-700 transition-colors"
        >
          Start Shopping
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
            <span className="text-gray-600">Cart</span>
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-5 lg:px-10 py-8 lg:py-12">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-[24px] font-light text-gray-900">Shopping Cart</h1>
          <p className="text-[13px] text-gray-400">{totalItems()} item{totalItems() !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.variantId}
                className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
              >
                <Link href={`/products/${item.productId}`}
                  className="w-20 h-24 rounded-xl overflow-hidden shrink-0 relative bg-gray-50 flex items-center justify-center"
                >
                  {/* 🔥 FIX: Replaced strict next/image with standard img tag */}
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl opacity-20">👗</span>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="text-[13.5px] font-medium text-gray-800 hover:text-gray-900 transition-colors block leading-snug mb-1">
                    {item.name}
                  </Link>
                  <div className="flex flex-wrap gap-x-3 mb-1.5">
                    {item.size && <p className="text-[11.5px] text-gray-400">Size: {item.size}</p>}
                    {item.color && <p className="text-[11.5px] text-gray-400">Color: {item.color}</p>}
                  </div>
                  <p className="text-[15px] font-semibold text-gray-900">₹{Number(item.price).toLocaleString('en-IN')}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 border border-gray-200 rounded-lg">
                      <button onClick={() => updateQty(item.variantId, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-lg transition-colors text-gray-500"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-8 text-center text-[13px] font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.variantId, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-lg transition-colors text-gray-500"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.variantId)}
                      className="flex items-center gap-1 text-[11.5px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[14px] font-semibold text-gray-900">
                    ₹{(Number(item.price) * item.qty).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}

            <Link href="/collections/all" className="flex items-center gap-1.5 text-[12.5px] text-gray-400 hover:text-gray-700 transition-colors mt-4">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="bg-gray-50 rounded-2xl p-6 h-fit border border-gray-100 sticky top-28">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-5 pb-4 border-b border-gray-200">Order Summary</h2>

            <div className="space-y-3 mb-5 border-b border-gray-200 pb-5">
              <div className="flex justify-between text-[14px] font-medium text-gray-900">
                <span>Subtotal ({totalItems()} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11.5px] text-gray-400 leading-relaxed italic">
                Shipping will be calculated at checkout based on your delivery address.
              </p>
            </div>

            <Link href="/checkout"
              className="block w-full text-center py-3.5 bg-gray-900 text-white text-[13px] font-medium tracking-[0.06em] rounded-xl hover:bg-gray-800 transition-colors mb-3 shadow-lg shadow-black/10"
            >
              Proceed to Checkout
            </Link>

            <div className="text-center space-y-2 mt-6">
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Store Policies</p>
               <p className="text-[10px] text-gray-400 leading-tight">No COD · No Returns · No Cancellations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}