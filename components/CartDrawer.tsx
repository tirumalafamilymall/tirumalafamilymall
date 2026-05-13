'use client'

import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
    totalItems,
    totalPrice
  } = useCartStore()

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-[150] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[160]
        flex flex-col shadow-2xl
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h2 className="text-sm font-semibold tracking-wide">Your Cart</h2>
            {totalItems() > 0 && (
              <span className="w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 hover:bg-gray-50 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <ShoppingBag size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.variantId} className="flex gap-3 py-3 border-b border-gray-50">
                <img src={item.image} className="w-16 h-20 object-cover rounded-lg bg-gray-50" alt={item.name} />

                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-2 text-gray-900">{item.name}</p>
                  
                  <div className="flex flex-wrap gap-x-2 mt-0.5">
                    {item.size && <p className="text-[11px] text-gray-400">Size: {item.size}</p>}
                    {item.color && <p className="text-[11px] text-gray-400">Color: {item.color}</p>}
                  </div>

                  <p className="text-sm font-semibold mt-1">₹{item.price.toLocaleString('en-IN')}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-0.5">
                      <button
                        onClick={() => updateQty(item.variantId, item.qty - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[12px] font-medium w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.variantId, item.qty + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-6 space-y-3 bg-gray-50/50">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-lg font-bold">₹{totalPrice().toLocaleString('en-IN')}</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block text-center py-3.5 bg-black text-white text-[12px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-[#CC0000] shadow-lg shadow-black/10 transition-all active:scale-95"
            >
              Checkout
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-gray-500 hover:text-black transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}