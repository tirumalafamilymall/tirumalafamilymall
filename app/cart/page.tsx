'use client'

import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react'
import { useCartStore } from '@/store'

const PLACEHOLDER_COLORS = ['#f5ede4','#e8f0fd','#f5e4ea','#e4f5ec']

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCartStore()
  const shipping = totalPrice() >= 999 ? 0 : 60
  const total    = totalPrice() + shipping

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
            {items.map((item, i) => (
              <div key={`${item.id}-${item.size}`}
                className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
              >
                <Link href={`/products/${item.productId}`}
                  className="w-20 h-24 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: PLACEHOLDER_COLORS[i % 4] }}
                >
                  <span className="text-3xl opacity-20">👗</span>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="text-[13.5px] font-medium text-gray-800 hover:text-gray-900 transition-colors block leading-snug mb-1">
                    {item.name}
                  </Link>
                  {item.size && <p className="text-[11.5px] text-gray-400 mb-1.5">Size: {item.size}</p>}
                  <p className="text-[15px] font-semibold text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 border border-gray-200 rounded-lg">
                      <button onClick={() => updateQty(item.id, item.size, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-lg transition-colors text-gray-500"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-8 text-center text-[13px] font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-lg transition-colors text-gray-500"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id, item.size)}
                      className="flex items-center gap-1 text-[11.5px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[14px] font-semibold text-gray-900">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
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

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Subtotal ({totalItems()} items)</span>
                <span>₹{totalPrice().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[11.5px] text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                  Add ₹{(999 - totalPrice()).toLocaleString('en-IN')} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-5 flex justify-between">
              <span className="text-[14px] font-semibold text-gray-900">Total</span>
              <span className="text-[16px] font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
            </div>

            {/* Promo code */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-white">
                <Tag size={13} className="text-gray-300 shrink-0" />
                <input type="text" placeholder="Promo code" className="flex-1 outline-none text-[12.5px] text-gray-600 bg-transparent py-2.5 placeholder:text-gray-300" />
              </div>
              <button className="px-4 border border-gray-200 rounded-xl text-[12px] font-medium text-gray-600 hover:bg-gray-100 transition-colors bg-white">
                Apply
              </button>
            </div>

            <Link href="/checkout"
              className="block w-full text-center py-3.5 bg-gray-900 text-white text-[13px] font-medium tracking-[0.06em] rounded-xl hover:bg-gray-800 transition-colors mb-3"
            >
              Proceed to Checkout
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <span>💳</span> COD & Online Payment Available
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
