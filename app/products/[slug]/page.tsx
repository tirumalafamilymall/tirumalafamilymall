'use client'
import { addToRecent } from '@/lib/recent'
import { useRef, useState } from 'react'
import { useEffect } from 'react'

import Link from 'next/link'
import { Heart, Share2, ShieldCheck, Truck, RefreshCw, ChevronDown, Star } from 'lucide-react'
import ProductCard, { Product } from '@/components/ProductCard'
import { useRouter } from 'next/navigation'
import { useCartStore, useWishlistStore } from '@/store'
import Image from 'next/image'
import { useParams } from 'next/navigation'

const IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
]

const COLOR_IMAGES: Record<string, string[]> = {
  '#7b1e3a': [ // WINE / MAROON
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=90',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=90',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=90',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=90',
  ],

  '#e8cfc4': [ // BEIGE / LIGHT
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=90',
    'https://images.unsplash.com/photo-1520975922284-9f1d1f3a9c10?w=800&q=90',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=90',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=90',
  ],

  '#000000': [ // BLACK
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=90',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=90',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=90',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=90',
  ],

  '#d4af37': [ // GOLD
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=90',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=90',
    'https://images.unsplash.com/photo-1520975922284-9f1d1f3a9c10?w=800&q=90',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=90',
  ],
}

const RELATED: Product[] = [
  { id: 'r1', name: 'Georgette Printed Saree', price: 1099, originalPrice: 1399, image: IMAGES[1], href: '/products/r1', badge: 'Popular' },
  { id: 'r2', name: 'Embroidered Kurti Set', price: 749, image: IMAGES[2], href: '/products/r2' },
  { id: 'r3', name: 'Silk Blend Saree', price: 1499, originalPrice: 1899, image: IMAGES[0], href: '/products/r3', badge: 'New' },
  { id: 'r4', name: 'Cotton Anarkali Set', price: 899, image: IMAGES[3], href: '/products/r4' },

  { id: 'r5', name: 'Party Wear Saree', price: 1399, image: IMAGES[0], href: '/products/r5', badge: 'Hot' },
  { id: 'r6', name: 'Designer Kurti', price: 899, image: IMAGES[1], href: '/products/r6' },
  { id: 'r7', name: 'Festival Saree', price: 1599, image: IMAGES[2], href: '/products/r7' },
  { id: 'r8', name: 'Elegant Dress Set', price: 999, image: IMAGES[3], href: '/products/r8' },
]

const DETAILS = [
  { q: 'Description', a: 'Beautiful handcrafted saree with intricate embroidery. Perfect for festive occasions and weddings.' },
  { q: 'Fabric & Care', a: 'Premium Silk Blend · Dry clean recommended · Store in cool place' },
  { q: 'Shipping & Returns', a: 'Free shipping above ₹999 · 7-day easy returns · COD available' },
]

export default function ProductPage() {
  const router = useRouter()
  const [size, setSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const [openQ, setOpenQ] = useState<string | null>(null)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const [sizeError, setSizeError] = useState(false)
  const { addItem, openCart } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const [added, setAdded] = useState(false)
  const relatedRef = useRef<HTMLDivElement | null>(null)
const recentRef = useRef<HTMLDivElement | null>(null)
const params = useParams()
const productId = params.id as string

const [recent, setRecent] = useState<Product[]>([])
const [showShare, setShowShare] = useState(false)
const product: Product = {
  id: productId,
  name: 'Silk Blend Designer Saree',
  price: 1299,
  image: selectedColor && COLOR_IMAGES[selectedColor]
    ? COLOR_IMAGES[selectedColor][imgIdx % COLOR_IMAGES[selectedColor].length]
    : IMAGES[imgIdx],
  href: `/products/${productId}`,
}




/* ✅ RECENTLY VIEWED */
useEffect(() => {
  const updated = addToRecent(product)
  setRecent(updated)
}, [product.id])


/* ✅ AUTO SLIDER */
useEffect(() => {
  let scroll = 0

  const interval = setInterval(() => {
    const el = relatedRef.current
    if (!el) return

const first = el.children[0] as HTMLElement | null
const cardWidth = first?.clientWidth || 220
scroll += cardWidth + 24

    if (scroll >= el.scrollWidth - el.clientWidth) {
      scroll = 0
    }

    el.scrollTo({ left: scroll, behavior: 'smooth' })
  }, 2500)

  return () => {
    clearInterval(interval)
  }
}, [])

const currentImages =
  selectedColor && COLOR_IMAGES[selectedColor]
    ? COLOR_IMAGES[selectedColor]
    : IMAGES

  return (
    <>
  <div className="bg-white min-h-screen pb-20 lg:pb-0 overflow-x-hidden">

      {/* BREADCRUMB */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 py-3 text-[11px] text-gray-400">
          Home / Women / Sarees / <span className="text-gray-600">Silk Saree</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* IMAGE SECTION */}
          <div className="flex flex-col sm:flex-row gap-4">

            <div className="flex gap-3 overflow-x-auto max-w-full pb-2 sm:flex-col sm:overflow-visible">
              {(selectedColor ? COLOR_IMAGES[selectedColor] : IMAGES).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative w-[70px] h-[90px] rounded-lg overflow-hidden border transition ${
                   imgIdx === i ? 'border-black ring-2 ring-black/20': 'border-gray-200 hover:border-black'
                  }`}
                >
                  <Image
  src={img}
  alt=""
  fill className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)]">

              {/* 🔥 IMAGE WITH SMOOTH ZOOM */}
              <div
                className="relative overflow-hidden rounded-xl cursor-zoom-in group"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100

                  e.currentTarget.style.setProperty('--x', `${x}%`)
                  e.currentTarget.style.setProperty('--y', `${y}%`)
                }}
              >
                <img
                 src={currentImages[imgIdx % currentImages.length]}
                  onClick={() => setZoomOpen(true)}
                  className="w-full h-[340px] sm:h-[480px] lg:h-[520px] object-contain bg-white transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
<div className="absolute bottom-3 right-3 text-[10px] bg-white/80 px-2 py-1 rounded">
  Click to zoom
</div>
                <button
  onClick={(e) => {
    e.stopPropagation()
    toggle(product)
  }}
  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition"
>
  <Heart
    size={16}
    className={has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}
  />
</button>

                {/* 🔥 CONTROLLED ZOOM */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
                  <img
                   src={currentImages[imgIdx % currentImages.length]}
                    className="w-full h-full object-contain scale-[1.25] object-contain bg-white"
                    style={{ transformOrigin: 'var(--x) var(--y)' }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="bg-[#fafafa] rounded-2xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sticky top-[100px]">

          

            <div className="flex items-start justify-between gap-4">
  <h1 className="heading-serif text-[28px] md:text-[34px] tracking-[0.04em]">
    {product.name}
  </h1>

  {/* SHARE */}
<button
  onClick={() => setShowShare(true)}
  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
>
  <Share2 size={16} />
</button>
</div>

            <div className="flex items-center gap-2 mt-3">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[12px] text-gray-400">(28 reviews)</span>
            </div>

            <div className="flex items-center gap-3 mt-5 pb-6 border-b border-gray-100">
              <span className="text-[28px] font-semibold text-black">₹1,299</span>
              <span className="line-through text-gray-400">₹1,599</span>
              <span className="text-[#CC0000] text-[12px] font-medium">19% OFF</span>
            </div>
{/* COLOR */}
<div className="mt-6">
  <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-3">
    Select Color
  </p>

  <div className="flex gap-3">
{Object.entries(COLOR_IMAGES).map(([color, imgs], i) => (
  <button
    key={i}
    onClick={() => {
      setSelectedColor(color)
      setImgIdx(0)
    }}
    className={`relative w-[55px] h-[70px] rounded-lg overflow-hidden border transition ${
      selectedColor === color
        ? 'border-black ring-2 ring-black/20'
        : 'border-gray-200 hover:border-black'
    }`}
  >
    <img
      src={imgs[0]}
      className="w-full h-full object-cover"
    />

    {/* COLOR DOT */}
    <span
      className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white"
      style={{ backgroundColor: color }}
    />
  </button>
))}
  </div>
</div>

            {/* SIZE */}
            <div className="mt-6">
             <div className="flex items-center justify-between mb-3">
  <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500">
    Select Size
  </p>

  {/* SIZE GUIDE BUTTON */}
  <button
    onClick={() => setOpenQ('size-guide')}
    className="text-[11px] text-[#cc0000] hover:underline tracking-wide"
  >
    Size Guide
  </button>
</div>
              <div className="flex gap-3 flex-wrap">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-[44px] h-[44px] rounded-full border transition ${
  size === s
    ? 'bg-black text-white border-black'
    : sizeError
    ? 'border-red-500 animate-pulse'
    : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'
}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

 {sizeError && (
  <p className="text-[12px] text-red-500 mt-2">
    Please select a size
  </p>
)}

            <div className="border-t border-gray-100 my-6"></div>

            {/* BUTTONS */}
            <div className="space-y-3">
            <button
  onClick={() => {
    if (!size) {
      setSizeError(true)
      return
    }

    setSizeError(false)

addItem({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  size,
})

    openCart()

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }}
  className="w-full py-4 rounded-full bg-black text-white text-[12px] tracking-[0.2em] uppercase 
  shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)]
  hover:bg-[#111] active:scale-95 transition-all duration-300"
>
  {added ? 'Added ✓' : 'Add to Cart'}
</button>

              <button
 onClick={() => {
  if (!size) {
    setSizeError(true)
    return
  }

  setSizeError(false)

addItem({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  size,
})

  

  router.push('/checkout')
}}
  className="w-full py-4 rounded-full border border-black text-black text-[12px] tracking-[0.2em] uppercase 
  hover:bg-black hover:text-white active:scale-95 transition-all duration-300"
>
  Buy Now
</button>
            </div>
           

          </div>
        </div>

    

      </div>

      {/* RELATED PRODUCTS */}
<div className="mt-24 px-6 lg:px-10">
  <h2 className="heading-serif italic text-[28px] md:text-[32px] text-center mb-8 tracking-[0.04em]">
    
    Complete Your Look
    <div className="w-10 h-[2px] bg-[#cc0000] mx-auto mt-3"></div>
  </h2>

<div className="flex justify-end gap-3 mb-4 px-2">
<button
  onClick={() => {
    relatedRef.current?.scrollBy({ left: -250, behavior: 'smooth' })
  }}
  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300">
  ‹
</button>

<button
  onClick={() => {
    relatedRef.current?.scrollBy({ left: 250, behavior: 'smooth' })
  }}
 className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
>
  ›
</button>
</div>

<div
  ref={relatedRef}
  className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-1"
>
  {RELATED.map((item, i) => (
    <div key={item.id} className="min-w-[180px] sm:min-w-[220px] snap-start">
      <ProductCard product={item} idx={i} />
    </div>
  ))}
</div>
</div>

{/* 🔥 PREMIUM RECENTLY VIEWED */}
{(() => {
  const filteredRecent = recent.filter(p => p.id !== product.id)

  if (filteredRecent.length === 0) return null

  return (
    <div className="mt-20 px-6 lg:px-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h2 className="heading-serif italic text-[26px] md:text-[32px] tracking-[0.04em]">
          Recently Viewed
        </h2>
        <div className="w-10 h-[2px] bg-[#cc0000] mx-auto mt-3"></div>
      </div>

      {/* ARROWS */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={() => recentRef.current?.scrollBy({ left: -250, behavior: 'smooth' })}
          className="hidden sm:flex w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:bg-black hover:text-white transition"
        >
          ‹
        </button>

        <button
          onClick={() => recentRef.current?.scrollBy({ left: 250, behavior: 'smooth' })}
          className="hidden sm:flex w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:bg-black hover:text-white transition"
        >
          ›
        </button>
      </div>

      {/* SLIDER */}
      <div
        ref={recentRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {filteredRecent.map((item, i) => (
          <div
            key={item.id}
            className="min-w-[180px] sm:min-w-[220px] max-w-[180px] sm:max-w-[220px] snap-start"
          >
            <ProductCard product={item} idx={i} />
          </div>
        ))}
      </div>

    </div>
  )
})()}

      {/* 🔥 FULLSCREEN ZOOM */}
{zoomOpen && (
  <div className="fixed inset-0 z-[999] bg-[#f4f4f4] flex flex-col">

    {/* TOP BAR */}
    <div className="flex justify-between items-center px-6 py-4 text-black">
      <span className="text-[13px] tracking-wide text-gray-600">
        {imgIdx + 1} / {(selectedColor ? COLOR_IMAGES[selectedColor] : IMAGES).length}
      </span>

      <button
        onClick={() => setZoomOpen(false)}
        className="text-[18px] hover:opacity-70 transition"
      >
        ✕
      </button>
    </div>

    {/* IMAGE AREA */}
    <div className="flex-1 flex items-center justify-center relative">

      {/* 🔥 IMAGE CARD (IMPORTANT) */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <img
 src={currentImages[imgIdx % currentImages.length]}
  className="max-h-[75vh] object-contain"
/>
      </div>

      {/* LEFT */}
      {/* LEFT */}
<button
  onClick={() =>
    setImgIdx((prev) => {
      const length = selectedColor
        ? COLOR_IMAGES[selectedColor].length
        : IMAGES.length

      return (prev - 1 + length) % length
    })
  }
  className="absolute left-6 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-black hover:scale-110 transition"
>
  ‹
</button>

{/* RIGHT */}
<button
  onClick={() =>
    setImgIdx((prev) => {
      const length = selectedColor
        ? COLOR_IMAGES[selectedColor].length
        : IMAGES.length

      return (prev + 1) % length
    })
  }
  className="absolute right-6 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-black hover:scale-110 transition"
>
  ›
</button>

    </div>
  </div>
)}

      {/* 🔥 MOBILE STICKY */}
     <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 lg:hidden z-50">
  <button
    onClick={() => {
      if (!size) {
        setSizeError(true)
        return
      }

addItem({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  size,
})

      openCart()
    }}
    className="flex-1 py-3 bg-black text-white rounded-full text-[12px] uppercase tracking-[0.2em]"
  >
    Add to Cart
  </button>

  <button
    onClick={() => {
      if (!size) {
        setSizeError(true)
        return
      }

addItem({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  size,
})

      router.push('/checkout')
    }}
    className="flex-1 py-3 border border-black rounded-full text-[12px] uppercase tracking-[0.2em]"
  >
    Buy Now
  </button>
</div>

    </div>
    {showShare && (
  <div
    className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center"
    onClick={() => setShowShare(false)}
  >
    <div
      className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-[fadeIn_.3s_ease]"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="heading-serif italic text-[22px] mb-5 text-center">
        Share Product
      </h3>

      <div className="grid grid-cols-4 gap-4 text-center">

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          className="flex flex-col items-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
            W
          </div>
          <span className="text-xs">WhatsApp</span>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          className="flex flex-col items-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
            f
          </div>
          <span className="text-xs">Facebook</span>
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          className="flex flex-col items-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center">
            T
          </div>
          <span className="text-xs">Telegram</span>
        </a>

        {/* Copy */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied!')
          }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center">
            🔗
          </div>
          <span className="text-xs">Copy</span>
        </button>

      </div>
    </div>
  </div>
)}

    {openQ === 'size-guide' && (
  <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
    
    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="heading-serif italic text-[20px]">
          Size Guide
        </h3>

        <button onClick={() => setOpenQ(null)}>✕</button>
      </div>

      {/* TABLE */}
      <div className="text-[13px] text-gray-600 space-y-3">

        <div className="flex justify-between border-b pb-2">
          <span>Size</span>
          <span>Bust (inches)</span>
        </div>

        {[
          ['XS', '32'],
          ['S', '34'],
          ['M', '36'],
          ['L', '38'],
          ['XL', '40'],
          ['XXL', '42'],
        ].map(([s, val]) => (
          <div key={s} className="flex justify-between">
            <span>{s}</span>
            <span>{val}</span>
          </div>
        ))}

      </div>

    </div>
  </div>
)}
</>
  )
}