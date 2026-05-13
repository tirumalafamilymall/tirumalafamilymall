'use client'
import { useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Star, Loader2 } from 'lucide-react'

import { getProduct, getProducts, addToWishlist, removeFromWishlist } from '@/lib/api'
import { useCartStore, useWishlistStore } from '@/store'
import { addToRecent } from '@/lib/recent'
import ProductCard, { Product as StoreProduct } from '@/components/ProductCard'

// FIXED: Exact store rules updated to prevent customer confusion
const DETAILS = [
  { q: 'Description', a: 'Premium quality product crafted with care. Perfect for your collection.' },
  { q: 'Shipping & Policies', a: 'Standard shipping rates apply. Note: We do not offer Cash on Delivery (COD), returns, refunds, or order cancellations once placed.' },
]

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.slug as string || params.id as string 

  const { addItem, openCart } = useCartStore()
  const { toggle, has } = useWishlistStore()

  const [product, setProduct] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [recent, setRecent] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectionError, setSelectionError] = useState(false)
  
  const [imgIdx, setImgIdx] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [openQ, setOpenQ] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const relatedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await getProduct(productId)
        const p = res.product || res
        setProduct(p)

        if (p) {
          const recentPayload = { id: p.id, name: p.name, price: p.variants?.[0]?.base_price || 0, image: p.images?.[0] }
          setRecent(addToRecent(recentPayload))
        }

        if (p.category) {
          const relRes = await getProducts({ category: p.category, limit: 8 })
          const relatedItems = (relRes.products || relRes).filter((item: any) => item.id !== p.id)
          setRelated(relatedItems)
        }
      } catch (error) {
        console.error("Failed to load product:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [productId])

  useEffect(() => {
    let scroll = 0
    const interval = setInterval(() => {
      const el = relatedRef.current
      if (!el) return
      const first = el.children[0] as HTMLElement | null
      const cardWidth = first?.clientWidth || 220
      scroll += cardWidth + 24
      if (scroll >= el.scrollWidth - el.clientWidth) scroll = 0
      el.scrollTo({ left: scroll, behavior: 'smooth' })
    }, 3000)
    return () => clearInterval(interval)
  }, [related])

  // --- VARIANT LOGIC ---
  const variants = product?.variants || []
  
 // 1. Extract ALL unique colors first
const availableColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[]

// 2. 🔥 SMART FILTER: Only show sizes that actually exist for the SELECTED color
const availableSizes = variants
  .filter((v: any) => !selectedColor || v.color === selectedColor)
  .map((v: any) => v.size)
  .filter(Boolean)
  .filter((value: any, index: any, self: any) => self.indexOf(value) === index) // Unique
  
  // Find the exact variant the user has selected (or default to the first one)
  const activeVariant = variants.find((v: any) => 
    (availableSizes.length === 0 || v.size === selectedSize) &&
    (availableColors.length === 0 || v.color === selectedColor)
  )

  const displayPrice = activeVariant ? Number(activeVariant.base_price) : (variants[0] ? Number(variants[0].base_price) : 0)
  const displayStock = activeVariant ? activeVariant.stock : variants.reduce((sum: number, v: any) => sum + v.stock, 0)
  const isOutOfStock = displayStock <= 0
const handleAddToCart = async (redirectCheckout = false) => {
    // Force user to pick options if they exist
    if ((availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor)) {
      setSelectionError(true)
      return
    }
    
    if (!activeVariant) {
      alert("This specific combination is currently unavailable.")
      return
    }

    setSelectionError(false)
    setIsAdding(true)

    try {
      await addItem({
        variantId: activeVariant.id, // FIXED: Now using variantId
        productId: product.id,       // FIXED: Added productId 
        name: product.name,
        price: displayPrice,
        image: product.images?.[0],
        size: activeVariant.size || undefined,
        color: activeVariant.color || undefined,
      })

      if (redirectCheckout) {
        router.push('/checkout')
      } else {
        setAdded(true)
        openCart()
        setTimeout(() => setAdded(false), 2000)
      }
    } catch (error) {
      alert("Failed to add to cart.")
    } finally {
      setIsAdding(false)
    }
  }

  const handleWishlist = async () => {
    const storePayload = { 
      id: product.id, // Wishlist uses Parent ID
      name: product.name, 
      price: displayPrice, 
      image: product.images?.[0],
      href: `/products/${product.id}` 
    }
    
    toggle(storePayload) 
    
    try {
      if (has(product.id)) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product.id)
      }
    } catch (e) {
      console.error("Wishlist sync failed")
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500 gap-4">
      <h2 className="text-2xl font-serif">Product Not Found</h2>
      <Link href="/products" className="px-6 py-2 bg-black text-white rounded-full text-sm">Return to Shop</Link>
    </div>
  )

  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/800x1000?text=No+Image']

  return (
    <>
      <div className="bg-white min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
        <div className="border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 py-3 text-[11px] text-gray-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-black">Home</Link> / 
            <Link href={`/collections/${product.department?.toLowerCase()}`} className="hover:text-black"> {product.department} </Link> / 
            <span className="text-gray-800"> {product.name}</span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* LEFT: IMAGES */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3 overflow-x-auto max-w-full pb-2 sm:flex-col sm:overflow-visible">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`relative w-[70px] h-[90px] shrink-0 rounded-lg overflow-hidden border transition ${imgIdx === i ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-black'}`}>
                    <Image src={img} alt="Thumbnail" fill className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-white p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative group">
                <img src={images[imgIdx]} alt={product.name} onClick={() => setZoomOpen(true)} className="w-full h-[340px] sm:h-[480px] lg:h-[520px] object-contain bg-white cursor-zoom-in" />
                <button onClick={handleWishlist} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition">
                  <Heart size={16} className={has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
                </button>
              </div>
            </div>

            {/* RIGHT: PRODUCT INFO */}
            <div className="bg-[#fafafa] rounded-2xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] lg:sticky lg:top-[100px]">
              <div className="flex items-start justify-between gap-4">
                <h1 className="heading-serif text-[28px] md:text-[34px] tracking-[0.04em] leading-tight">{product.name}</h1>
                <button onClick={() => setShowShare(true)} className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition">
                  <Share2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                <span className={`text-[12px] ml-2 font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-400'}`}>
                  ({isOutOfStock ? 'Out of Stock' : `${displayStock} in Stock`})
                </span>
              </div>

              <div className="flex items-center gap-3 mt-5 pb-6 border-b border-gray-200">
                <span className="text-[28px] font-semibold text-black">₹{displayPrice.toLocaleString('en-IN')}</span>
              </div>

              {/* DYNAMIC COLORS */}
              {availableColors.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-3">Select Color</p>
                  <div className="flex gap-3 flex-wrap">
                    {availableColors.map((c: string) => (
                      <button key={c} onClick={() => setSelectedColor(c)}
                        className={`px-5 py-2 rounded-full border transition text-sm ${selectedColor === c ? 'bg-black text-white border-black' : selectionError && !selectedColor ? 'border-red-500 animate-pulse' : 'border-gray-300 hover:border-black'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC SIZES */}
              {availableSizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Select Size</p>
                    <button onClick={() => setOpenQ('size-guide')} className="text-[11px] text-[#cc0000] hover:underline tracking-wide">Size Guide</button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {availableSizes.map((s: string) => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className={`w-[44px] h-[44px] rounded-full border transition text-sm ${selectedSize === s ? 'bg-black text-white border-black' : selectionError && !selectedSize ? 'border-red-500 animate-pulse' : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectionError && <p className="text-[12px] text-red-500 mt-4">Please select all required options.</p>}

              <div className="border-t border-gray-200 my-6"></div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3">
                <button onClick={() => handleAddToCart(false)} disabled={isAdding || isOutOfStock}
                  className="w-full py-4 rounded-full bg-black text-white text-[12px] tracking-[0.2em] uppercase shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:bg-[#111] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAdding ? 'Processing...' : isOutOfStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
                </button>
                <button onClick={() => handleAddToCart(true)} disabled={isAdding || isOutOfStock}
                  className="w-full py-4 rounded-full border border-black text-black text-[12px] tracking-[0.2em] uppercase hover:bg-black hover:text-white active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  Buy Now
                </button>
              </div>

              {/* STORE POLICIES */}
              <div className="mt-8 space-y-4">
                {DETAILS.map((d, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-[13px] font-semibold text-black mb-1">{d.q}</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{d.a}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="mt-24 px-6 lg:px-10">
            <h2 className="heading-serif italic text-[28px] md:text-[32px] text-center mb-8 tracking-[0.04em]">
              Complete Your Look
              <div className="w-10 h-[2px] bg-[#cc0000] mx-auto mt-3"></div>
            </h2>
            <div ref={relatedRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-1">
              {related.map((item, i) => (
                <div key={item.id} className="min-w-[180px] sm:min-w-[220px] snap-start">
                  <ProductCard product={{ id: item.id, name: item.name, price: item.base_price, image: item.images?.[0], href: `/products/${item.id}` }} idx={i} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN ZOOM MODAL */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[999] bg-[#f4f4f4] flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 text-black">
            <span className="text-[13px] tracking-wide text-gray-600">{imgIdx + 1} / {images.length}</span>
            <button onClick={() => setZoomOpen(false)} className="text-[18px] hover:opacity-70 transition">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="bg-white p-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <img src={images[imgIdx]} className="max-h-[75vh] object-contain" />
            </div>
            <button onClick={() => setImgIdx((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-6 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:scale-110">‹</button>
            <button onClick={() => setImgIdx((prev) => (prev + 1) % images.length)} className="absolute right-6 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:scale-110">›</button>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 lg:hidden z-50">
        <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className="flex-1 py-3 bg-black text-white rounded-full text-[12px] uppercase tracking-[0.2em] disabled:opacity-50">Add to Cart</button>
        <button onClick={() => handleAddToCart(true)} disabled={isOutOfStock} className="flex-1 py-3 border border-black rounded-full text-[12px] uppercase tracking-[0.2em] disabled:opacity-50">Buy Now</button>
      </div>

      {/* SHARE & SIZE GUIDE MODALS */}
      {showShare && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center" onClick={() => setShowShare(false)}>
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="heading-serif italic text-[22px] mb-5 text-center">Share Product</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center">🔗</div>
                <span className="text-xs">Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {openQ === 'size-guide' && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="heading-serif italic text-[20px]">Size Guide</h3>
              <button onClick={() => setOpenQ(null)}>✕</button>
            </div>
            <div className="text-[13px] text-gray-600 space-y-3">
              <div className="flex justify-between border-b pb-2"><span>Size</span><span>Bust (inches)</span></div>
              {[['XS', '32'], ['S', '34'], ['M', '36'], ['L', '38'], ['XL', '40'], ['XXL', '42']].map(([s, val]) => (
                <div key={s} className="flex justify-between"><span>{s}</span><span>{val}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}