'use client'

import { useState, useEffect } from 'react'
import { X, Heart } from 'lucide-react'
import { Product } from './ProductCard'
import { useCartStore, useWishlistStore } from '@/store'
import Link from 'next/link'
import { getRecent } from '@/lib/recent'

export default function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [recent, setRecent] = useState<any[]>([])

  const { addItem, openCart } = useCartStore()
  const { toggle, has } = useWishlistStore()

  useEffect(() => {
    setRecent(getRecent())
  }, [])

  if (!product) return null
  
  const filteredRecent = recent.filter(p => p.id !== product.id)
  
  // ✅ Clean array using the strictly required image string
  const images = [product.image, product.image, product.image]

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        className="relative bg-white w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.25)] grid md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition"
        >
          <X size={16} />
        </button>

        {/* WISHLIST */}
        <button
          onClick={() =>
            toggle({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image, // ✅ Safely passing the guaranteed string
              href: product.href,   // ✅ Safely passing the guaranteed string
            })
          }
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition"
        >
          <Heart
            size={16}
            className={has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}
          />
        </button>

        {/* LEFT SIDE */}
        <div className="bg-gradient-to-br from-[#fafafa] to-[#f1f1f1] flex flex-col h-full overflow-hidden">

          {/* IMAGE AREA */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-sm">
              <img
                src={images[activeImg]}
                className="max-h-[90%] max-w-[90%] object-contain"
                alt="Product"
              />
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="h-[100px] flex items-center justify-center gap-3 pb-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImg(i)}
                className={`w-14 h-16 object-cover rounded-md cursor-pointer border ${
                  activeImg === i
                    ? 'border-black scale-105'
                    : 'border-gray-200'
                }`}
                alt="Thumbnail"
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="h-full flex flex-col overflow-hidden">

          {/* TOP SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pr-2">

            <h2 className="heading-serif italic text-[32px] leading-tight mb-2">
              {product.name}
            </h2>

            <div className="text-sm text-amber-500 mb-2">
              ★★★★★ <span className="text-gray-400 text-xs">(24 reviews)</span>
            </div>

            <p className="text-[22px] font-semibold mb-3">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>

            <div className="flex gap-4 text-xs text-gray-500 mb-5">
              <span>✓ Premium</span>
              <span>✓ Fast Delivery</span>
            </div>

            <p className="text-gray-500 text-sm mb-5">
              Elegant and premium outfit designed for modern lifestyle with comfort and style.
            </p>

            {/* SIZE */}
            {(product.hasSizes ?? true) && (
              <>
                <p className="text-[11px] tracking-widest uppercase text-gray-400 mb-2">
                  Select Size
                </p>

                <div className="flex gap-2 mb-4">
                  {['S','M','L','XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size)
                        setError(false)
                      }}
                      className={`px-4 py-2 border rounded-lg text-sm ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : error
                          ? 'border-red-500'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-red-500 mb-2">
                    Please select a size
                  </p>
                )}
              </>
            )}
          </div>

          {/* FIXED BOTTOM */}
          <div className="p-6 md:p-8 border-t bg-white">

            {/* BUTTONS */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  if (product.hasSizes !== false && !selectedSize) {
                    setError(true)
                    return
                  }

                  const chosenSize = (product.hasSizes ?? true) ? selectedSize || undefined : undefined;

                  addItem({
                    variantId: `${product.id}-${chosenSize || 'base'}`, 
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image, // ✅ Safely passing the guaranteed string
                    size: chosenSize,
                    color: undefined 
                  })

                  openCart()
                }}
                className="flex-1 bg-black text-white py-3 rounded-xl text-sm hover:bg-red-600 transition"
              >
                Add to Cart
              </button>

              <Link
                href={product.href} // ✅ Safely passing the guaranteed string, Next.js won't crash
                className="flex-1 border py-3 rounded-xl text-sm text-center hover:bg-black hover:text-white transition"
              >
                View Details
              </Link>
            </div>

            {/* RECENT */}
            {filteredRecent.length > 0 && (
              <div>
                <p className="text-[11px] tracking-widest text-gray-400 mb-2">
                  Recently Viewed
                </p>
                <div className="flex gap-2">
                  {filteredRecent.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      className="w-14 h-16 object-cover rounded-md"
                      alt="Recent"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}