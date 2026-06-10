'use client'
import { useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Share2, Loader2, Plus, Minus, MapPin } from 'lucide-react' 
import { getProduct, getProducts, addToWishlist, removeFromWishlist, checkServiceability } from '@/lib/api'
import { useCartStore, useWishlistStore } from '@/store'
import { addToRecent } from '@/lib/recent'
import { Product as StoreProduct } from '@/components/ProductCard'

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
  
  // 🔥 NEW STATE: Quantity tracker
  const [quantity, setQuantity] = useState(1)

  const [pincode, setPincode] = useState('')
  const [checkingPincode, setCheckingPincode] = useState(false)
  const [pincodeResult, setPincodeResult] = useState<{ serviceable?: boolean, cost?: number, days?: number, error?: string } | null>(null)

  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

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
            image: p.images?.[0] || 'https://via.placeholder.com/400x500', 
            href: `/products/${p.slug || p.id}`
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


  const variants = (product?.variants || []).filter((v: any) => v.is_active !== false)
  const availableColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[]

  const availableSizes = variants
    .filter((v: any) => !selectedColor || v.color === selectedColor)
    .map((v: any) => v.size)
    .filter(Boolean)
    .filter((val: any, idx: any, self: any) => self.indexOf(val) === idx)

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0])
    }
  }, [availableColors, selectedColor])

  useEffect(() => {
    if (availableSizes.length > 0) {
      if (!selectedSize || !availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0])
      }
    } else {
      setSelectedSize(null) 
    }
  }, [availableSizes, selectedSize])

  useEffect(() => {
    if (selectedColor) {
      const match = variants.find((v: any) => v.color === selectedColor && v.image)
      if (match) setVariantImageOverride(match.image)
    }
  }, [selectedColor, variants])

  let filteredVariants = variants;
  if (selectedColor) {
    filteredVariants = filteredVariants.filter((v: any) => v.color === selectedColor);
  }
  if (selectedSize) {
    filteredVariants = filteredVariants.filter((v: any) => v.size === selectedSize);
  }
  
  const displayStock = filteredVariants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0);
  const isOutOfStock = displayStock <= 0;

  const activeVariant = variants.find((v: any) => 
    (availableSizes.length === 0 || v.size === selectedSize) &&
    (availableColors.length === 0 || v.color === selectedColor)
  )

  // 🔥 SAFETY FIX: Reset quantity to 1 if the user changes color or size 
  // so they don't accidentally try to order 5 of a new variant that only has 2 in stock
  useEffect(() => {
    setQuantity(1)
  }, [activeVariant?.id])

  const displayPrice = activeVariant ? Number(activeVariant.base_price) : (variants[0] ? Number(variants[0].base_price) : 0)

  const parentImages = product?.images || []
  const variantImages = variants.map((v: any) => v.image).filter(Boolean)
  const allImages = Array.from(new Set([...parentImages, ...variantImages])) 
  const displayImage = variantImageOverride || allImages[0] || 'https://placehold.co/800x1000?text=No+Image'

  // 🔥 NEW: Pincode Handler
  const handleCheckPincode = async () => {
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setPincodeResult({ error: 'Please enter a valid 6-digit pincode.' })
      return
    }
    setCheckingPincode(true)
    setPincodeResult(null)
    try {
      const res = await checkServiceability(pincode)
      if (res.is_serviceable) {
        setPincodeResult({ serviceable: true, cost: res.shipping_cost, days: Number(res.estimated_days) })
      }else {
        setPincodeResult({ serviceable: false, error: "Sorry, we don't deliver to this pincode yet." })
      }
    } catch (e: any) {
      setPincodeResult({ error: e.message || 'Failed to verify pincode.' })
    } finally {
      setCheckingPincode(false)
    }
  }

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
        image: activeVariant.image || displayImage, 
        size: activeVariant.size || undefined,
        color: activeVariant.color || undefined,
        qty: quantity, // 🔥 PASSING THE SELECTED QUANTITY TO THE STORE
      })
      if (redirectCheckout) router.push('/checkout')
      else { setAdded(true); openCart(); setTimeout(() => setAdded(false), 2000) }
    } catch (error) { alert("Failed to add to cart.") } finally { setIsAdding(false) }
  }

  const handleWishlist = async () => {
    const storePayload = { id: product.id, name: product.name, price: displayPrice, image: displayImage, href: `/products/${product.id}` }
    toggle(storePayload)
    try {
      if (has(product.id)) await removeFromWishlist(product.id)
      else await addToWishlist(product.id)
    } catch (e) { console.error("Wishlist sync failed") }
  }

  // Quantity Handlers
  const increaseQty = () => {
    if (quantity < displayStock) setQuantity(prev => prev + 1)
  }
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500 gap-4"><h2 className="text-2xl font-serif">Product Not Found</h2><Link href="/products" className="px-6 py-2 bg-black text-white rounded-full text-sm">Return to Shop</Link></div>

  return (
    <>
      <div className="bg-white min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
        <div className="border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 py-3 text-[11px] text-gray-400 uppercase tracking-wider flex items-center flex-wrap gap-2">
            <Link href="/" className="hover:text-black">Home</Link> <span className="text-gray-300">/</span> 
            <Link href={`/collections/${product.department?.toLowerCase()}`} className="hover:text-black"> {product.department} </Link> <span className="text-gray-300">/</span> 
            {product.subcategory && (
              <>
                <span className="text-gray-500">{product.subcategory}</span> <span className="text-gray-300">/</span> 
              </>
            )}
            <span className="text-gray-800"> {product.name}</span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            <div className="bg-white p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative group h-fit">
              <img src={displayImage as string} alt={product.name} onClick={() => setZoomOpen(true)} className="w-full h-[340px] sm:h-[480px] lg:h-[600px] object-contain bg-white cursor-zoom-in" />
              <button onClick={handleWishlist} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition">
                <Heart size={16} className={has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
              </button>
            </div>

            <div className="bg-[#fafafa] rounded-2xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] lg:sticky lg:top-[100px]">
              {product.brand && (
                <p className="text-[12px] font-semibold text-gray-500 tracking-[0.2em] uppercase mb-2">
                  {product.brand}
                </p>
              )}
              
              <div className="flex items-start justify-between gap-4">
                <h1 className="heading-serif text-[28px] md:text-[34px] tracking-[0.04em] leading-tight">{product.name}</h1>
                <button onClick={() => setShowShare(true)} className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition">
                  <Share2 size={16} />
                </button>
              </div>

              <div className="mt-3">
                <span className={`text-[13px] font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${displayStock} in Stock`}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-5 pb-6 border-b border-gray-200">
                <span className="text-[28px] font-semibold text-black">₹{displayPrice.toLocaleString('en-IN')}</span>
              </div>

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

              {/* 🔥 NEW: QUANTITY SELECTOR */}
              {!isOutOfStock && (
                <div className="mt-8">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-3">Quantity</p>
                  <div className="flex items-center gap-0 border border-gray-300 w-max rounded-xl overflow-hidden bg-white">
                    <button onClick={decreaseQty} disabled={quantity <= 1} 
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-[15px] font-medium text-gray-900">{quantity}</span>
                    <button onClick={increaseQty} disabled={quantity >= displayStock} 
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {selectionError && <p className="text-[12px] text-red-500 mt-4">Please select all required options.</p>}

<div className="border-t border-gray-200 my-6"></div>

              {/* 🔥 NEW: PINCODE CHECKER UI */}
              <div className="mb-8">
                <p className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-3 flex items-center gap-1.5">
                  <MapPin size={14} /> Check Delivery
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode" 
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value)
                      setPincodeResult(null) // Reset result when typing
                    }}
                    className="flex-1 border border-gray-300 px-4 py-3 rounded-xl text-[13px] outline-none focus:border-black transition"
                  />
                  <button 
                    onClick={handleCheckPincode}
                    disabled={checkingPincode || pincode.length !== 6}
                    className="bg-gray-100 hover:bg-gray-200 text-black px-6 py-3 rounded-xl text-[12px] font-semibold tracking-wider uppercase transition disabled:opacity-50 min-w-[100px] flex justify-center items-center"
                  >
                    {checkingPincode ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                  </button>
                </div>

                {/* Display Results */}
                {pincodeResult && (
                  <div className="mt-3 text-[12.5px] p-3 rounded-xl bg-gray-50 border border-gray-100">
                    {pincodeResult.error ? (
                      <span className="text-red-500 font-medium">{pincodeResult.error}</span>
                    ) : pincodeResult.serviceable ? (
                      <div className="flex flex-col gap-1 text-green-700">
                        <span className="font-semibold text-green-600">✓ Delivery Available</span>
                       {pincodeResult.days && <span>Estimated Delivery: {pincodeResult.days} - {pincodeResult.days + 2} Days</span>}
                        <span>Shipping Cost: ₹{pincodeResult.cost}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
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

      {zoomOpen && (
        <div className="fixed inset-0 z-[999] bg-white flex flex-col">
          <div className="p-6 flex justify-end"><button onClick={() => setZoomOpen(false)}>✕ Close</button></div>
          <div className="flex-1 flex items-center justify-center p-6">
            <img src={displayImage as string} className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </>
  )
}