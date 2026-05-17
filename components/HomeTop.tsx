'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ProductCard, { Product } from './ProductCard'
import { getProducts } from '@/lib/api'
import { Loader2 } from 'lucide-react'

// Safe helper mapping backend product models to the UI ProductCard structure
function toCardProduct(p: any): Product {
  const variants = p.variants || []
  const stock = p.stock !== undefined ? p.stock : variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
  const price = p.base_price !== undefined ? p.base_price : (variants[0]?.base_price || p.price || 0)
  
  let mainImage = null;
  if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) mainImage = p.images[0];
  else if (typeof p.images === 'string' && p.images.length > 5) {
    try { const parsed = JSON.parse(p.images); if (Array.isArray(parsed)) mainImage = parsed[0]; } catch(e) {}
  }
  const variantImage = variants.find((v: any) => v.image)?.image;
  
  return {
    id: p.id || p.slug, 
    name: p.name,
    price: Number(price), 
    image: mainImage || variantImage || 'https://via.placeholder.com/400x500?text=No+Image', 
    href: `/products/${p.slug || p.id}`,
    badge: stock <= 0 ? 'Sold Out' : undefined,
    sold: stock <= 0,
  }
}

// ─── 1. HERO SLIDER (DYNAMIZED) ───────────────────────────────────
export function HeroSlider({ slides }: { slides: any[] }) {
  const [curr, setCurr] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)

  const go = useCallback((next: number, direction: 1 | -1 = 1) => {
    setDir(direction); setPrev(curr); setCurr(next); setTimeout(() => setPrev(null), 600)
  }, [curr])

  useEffect(() => {
    if (!slides || slides.length <= 1) return
    const t = setInterval(() => go((curr + 1) % slides.length, 1), 4500)
    return () => clearInterval(t)
  }, [curr, slides?.length, go])

  if (!slides || slides.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden bg-white" style={{ height: 'clamp(260px, 52vw, 680px)' }}>
      {slides.map((slide, i) => {
        const isActive = i === curr
        const isLeaving = i === prev
        return (
          <div key={i} className="absolute inset-0 block transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: isActive ? 1 : isLeaving ? 0 : 0,
              transform: isActive ? 'scale(1)' : isLeaving ? `scale(1.04) translateX(${dir * -3}%)` : `scale(0.96) translateX(${dir * 3}%)`,
              zIndex: isActive ? 2 : isLeaving ? 1 : 0,
            }}>
            <img src={slide.img || 'https://via.placeholder.com/1400x700'} className="w-full h-full object-cover object-center transition-transform duration-[4000ms] ease-linear scale-[1.05]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </div>
        )
      })}
    </div>
  )
}

// ─── 2. SHOP BY CATEGORY (DYNAMIZED) ─────────────────────────────
export function ShopByCategory({ categories }: { categories: any[] }) {
  const [showAll, setShowAll] = useState(false)
  if (!categories || categories.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-10">
        <div className="mb-10 text-center">
          <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">Shop by Category</h2>
          <div className="w-14 h-[3px] bg-[#CC0000] mt-4 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {categories.map((cat, i) => {
            const isHiddenMobile = !showAll && i >= 4
            return (
              <div key={i} className={isHiddenMobile ? "hidden md:block" : "block"}>
                <Link href={cat.href || '#'} className="group block">
                  <div className="overflow-hidden rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.05)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition duration-300">
                    <div className="relative">
                      <img src={cat.img || 'https://via.placeholder.com/400x500'} alt={cat.name} className="w-full h-[180px] sm:h-[200px] object-cover group-hover:scale-[1.08] transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 text-white text-center py-3 bg-gradient-to-t from-[#cc0000]/90 via-[#cc0000]/70 to-transparent">
                        <p className="text-[13px] font-semibold tracking-[0.06em]">{cat.name || 'Category'}</p>
                        <p className="text-[11px] tracking-[0.2em] uppercase opacity-90">Shop Now →</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
        {!showAll && (
          <div className="text-center mt-6 md:hidden">
            <button onClick={() => setShowAll(true)} className="text-[12px] tracking-[0.2em] uppercase text-[#cc0000] font-medium">View More →</button>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 3. DISCOVER YOUR STYLE (DYNAMIZED) ──────────────────────────
export function OfferBanner({ images }: { images: { women: string, men: string, kids: string } }) {
  return (
    <section className="py-20 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">Collections</p>
          <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] font-normal tracking-[0.06em] leading-[1.1] text-black">Discover Your Style</h2>
          <div className="w-12 h-[2px] bg-[#CC0000] mt-4 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* WOMEN */}
            <Link href="/collections/women" className="group relative overflow-hidden rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300">
              <img src={images?.women || 'https://via.placeholder.com/1200x800?text=Women'} alt="Women Collection" className="w-full h-[260px] sm:h-[300px] object-cover group-hover:scale-[1.05] transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/70 transition" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-[10px] tracking-[0.4em] uppercase opacity-80 mb-2">New Arrivals</p>
                <h3 className="heading-serif text-[28px] md:text-[32px] mb-2">Women's Edit</h3>
                <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1">Shop Now</span>
              </div>
            </Link>

            {/* MEN */}
            <Link href="/collections/men" className="group relative overflow-hidden rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300">
              <img src={images?.men || 'https://via.placeholder.com/1200x800?text=Men'} alt="Men Collection" className="w-full h-[260px] sm:h-[300px] object-cover group-hover:scale-[1.05] transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-[10px] tracking-[0.4em] uppercase opacity-80 mb-2">MODERN CLASSICS</p>
                <h3 className="heading-serif text-[26px] md:text-[30px] mb-2">Men's Edit</h3>
                <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1">Shop Now</span>
              </div>
            </Link>
          </div>

          {/* KIDS */}
          <Link href="/collections/kids" className="group relative overflow-hidden rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300">
            <img src={images?.kids || 'https://via.placeholder.com/1400x500?text=Kids'} alt="Kids Collection" className="w-full h-[220px] sm:h-[260px] object-cover group-hover:scale-[1.05] transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:bg-black/35 transition" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[10px] tracking-[0.4em] uppercase opacity-80 mb-2">PLAYFUL PICKS</p>
              <h3 className="heading-serif text-[26px] md:text-[30px] mb-2">Kids Edit</h3>
              <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1">Shop Now</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── 4. OUR COLLECTION (LIVE FETCHING NO PARAM CONFLICT) ──────────
const TABS = [
  { id: 'WOMEN', label: 'Women' },
  { id: 'MEN', label: 'Men' },
  { id: 'KIDS', label: 'Kids' },
]

export function FeaturedProducts() {
  const [tab, setTab] = useState('WOMEN')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // 🔥 Cleaned: Uses the type-safe params from your lib/api.ts
        const res = await getProducts({ department: tab, limit: 8 })
        setProducts((res.products || []).map(toCardProduct))
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    load()
  }, [tab])

  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">Explore</p>
            <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">Our Collection</h2>
            <div className="w-12 h-[2px] bg-[#CC0000] mt-4 rounded-full"></div>
          </div>
          <div className="flex gap-6 border-b border-gray-200">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`pb-2 text-[13px] font-medium tracking-wide border-b-2 transition-all duration-300 ${tab === t.id ? 'border-[#CC0000] text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={30} className="animate-spin text-gray-300" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} idx={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">No products found in this category yet.</div>
        )}

        <div className="text-center mt-14">
          <Link href={`/collections/${tab.toLowerCase()}`} className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[12px] tracking-[0.25em] uppercase font-medium bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] hover:bg-[#CC0000] hover:-translate-y-1 transition-all duration-300">
            View All {TABS.find(t => t.id === tab)?.label} →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── TYPES & MASTER COMPONENT EXPORT ─────────────────────────────
interface StorefrontConfigProps {
  config: {
    heroSlider: any[]
    shopByCategory: any[]
    discoverStyle: { women: string; men: string; kids: string }
    flashSale: { img: string }
    newSeason: any[]
  }
}

export default function HomeTop({ config }: StorefrontConfigProps) {
  if (!config) return null
  return (
    <>
      <HeroSlider slides={config.heroSlider} />
      <ShopByCategory categories={config.shopByCategory} />
      <OfferBanner images={config.discoverStyle} />
      <FeaturedProducts />
    </>
  )
}