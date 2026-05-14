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
  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null) // 🔥 Added
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
          const recentPayload = { 
            id: p.id, 
            name: p.name, 
            price: p.variants?.[0]?.base_price || 0, 
            image: p.images?.[0] || 'https://via.placeholder.com/400x500', // 🔥 Fallback
            href: `/products/${p.slug || p.id}` // 🔥 ADDED: Required by interface
          }
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

// --- VARIANT LOGIC ---
  const variants = product?.variants || []
  const availableColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[]

  const availableSizes = variants
    .filter((v: any) => !selectedColor || v.color === selectedColor)
    .map((v: any) => v.size)
    .filter(Boolean)
    .filter((val: any, idx: any, self: any) => self.indexOf(val) === idx)

  // Watch color selection to change image
  useEffect(() => {
    if (selectedColor) {
      const match = variants.find((v: any) => v.color === selectedColor && v.image)
      if (match) setVariantImageOverride(match.image)
    }
  }, [selectedColor, variants])

  const activeVariant = variants.find((v: any) => 
    (availableSizes.length === 0 || v.size === selectedSize) &&
    (availableColors.length === 0 || v.color === selectedColor)
  )


  // ... (keep availableSizes logic the same) ...

  const displayPrice = activeVariant ? Number(activeVariant.base_price) : (variants[0] ? Number(variants[0].base_price) : 0)
  const displayStock = activeVariant ? activeVariant.stock : variants.reduce((sum: number, v: any) => sum + v.stock, 0)
  const isOutOfStock = displayStock <= 0

  // 🔥 THE FIX: Combine Parent Images and Variant Images into one clean gallery
  const parentImages = product?.images || []
  const variantImages = variants.map((v: any) => v.image).filter(Boolean)
  const allImages = Array.from(new Set([...parentImages, ...variantImages])) // Removes duplicates

  const images = allImages.length > 0 ? allImages : ['https://placehold.co/800x1000?text=No+Image']
  const displayImage = variantImageOverride || images[imgIdx] || images[0]

  const handleAddToCart = async (redirectCheckout = false) => {
    if ((availableSizes.length > 0 && !selectedSize) || (availableColors.length > 0 && !selectedColor)) {
      setSelectionError(true)
      return
    }
    if (!activeVariant) {
      alert("Combination unavailable.")
      return
    }
    setSelectionError(false)
    setIsAdding(true)
    try {
      await addItem({
        variantId: activeVariant.id,
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: activeVariant.image || product.images?.[0], // Use variant image in cart
        size: activeVariant.size || undefined,
        color: activeVariant.color || undefined,
      })
      if (redirectCheckout) router.push('/checkout')
      else { setAdded(true); openCart(); setTimeout(() => setAdded(false), 2000) }
    } catch (error) { alert("Failed to add to cart.") } finally { setIsAdding(false) }
  }

  const handleWishlist = async () => {
    const storePayload = { id: product.id, name: product.name, price: displayPrice, image: product.images?.[0], href: `/products/${product.id}` }
    toggle(storePayload)
    try {
      if (has(product.id)) await removeFromWishlist(product.id)
      else await addToWishlist(product.id)
    } catch (e) { console.error("Wishlist sync failed") }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500 gap-4"><h2 className="text-2xl font-serif">Product Not Found</h2><Link href="/products" className="px-6 py-2 bg-black text-white rounded-full text-sm">Return to Shop</Link></div>

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
                  <button key={i} onClick={() => { setImgIdx(i); setVariantImageOverride(null); }} // 🔥 Reset override on gallery click
                    className={`relative w-[70px] h-[90px] shrink-0 rounded-lg overflow-hidden border transition ${imgIdx === i && !variantImageOverride ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-black'}`}>
                    <Image src={img} alt="Thumbnail" fill className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-white p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative group">
                <img src={displayImage} alt={product.name} onClick={() => setZoomOpen(true)} className="w-full h-[340px] sm:h-[480px] lg:h-[520px] object-contain bg-white cursor-zoom-in" />
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

              {/* DYNAMIC COLORS WITH THUMBNAILS */}
              {availableColors.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-3">Color: {selectedColor || 'Select'}</p>
                  <div className="flex gap-3 flex-wrap">
                    {availableColors.map((c: string) => {
                      const vImg = variants.find((v: any) => v.color === c && v.image)?.image;
                      return (
                        <button key={c} onClick={() => setSelectedColor(c)}
                          className={`relative w-12 h-12 rounded-full border transition overflow-hidden ${selectedColor === c ? 'border-black ring-2 ring-black/20' : 'border-gray-300 hover:border-black'}`}>
                          {vImg ? (
                            <img src={vImg} className="w-full h-full object-cover" alt={c} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px]">{c[0]}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* DYNAMIC SIZES */}
              {availableSizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Select Size</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {availableSizes.map((s: string) => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className={`w-[44px] h-[44px] rounded-full border transition text-sm ${selectedSize === s ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectionError && <p className="text-[12px] text-red-500 mt-4">Please select all required options.</p>}

              <div className="border-t border-gray-200 my-6"></div>

              <div className="space-y-3">
                <button onClick={() => handleAddToCart(false)} disabled={isAdding || isOutOfStock}
                  className="w-full py-4 rounded-full bg-black text-white text-[12px] tracking-[0.2em] uppercase shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:bg-[#111] active:scale-95 transition-all duration-300 disabled:opacity-50">
                  {isAdding ? 'Processing...' : isOutOfStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
                </button>
                <button onClick={() => handleAddToCart(true)} disabled={isAdding || isOutOfStock}
                  className="w-full py-4 rounded-full border border-black text-black text-[12px] tracking-[0.2em] uppercase hover:bg-black hover:text-white active:scale-95 transition-all">
                  Buy Now
                </button>
              </div>

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
      </div>

      {/* MODALS (Simplified for brevity, keep your existing zoom/share/size logic here) */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[999] bg-white flex flex-col">
          <div className="p-6 flex justify-end"><button onClick={() => setZoomOpen(false)}>✕ Close</button></div>
          <div className="flex-1 flex items-center justify-center p-6">
            <img src={displayImage} className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </>
  )
}