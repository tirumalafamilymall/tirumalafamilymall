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

// ─── 3. DISCOVER YOUR STYLE (DYNAMIZED & UPGRADED) ──────────────────────────
export function OfferBanner({ images }: { images: { women: string, men: string, kids: string } }) {
  return (
    <section className="py-16 lg:py-24 bg-white border-t border-gray-50">
      <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-10">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-semibold mb-2.5">
            Collections
          </p>
          <h2 className="heading-serif italic text-3xl sm:text-4xl md:text-[42px] tracking-wide text-gray-900 font-normal leading-tight">
            Discover Your Style
          </h2>
          <div className="w-12 h-[2px] bg-[#CC0000] mt-5 mx-auto rounded-full"></div>
        </div>

        {/* BANNER LAYOUT GRID */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* TOP SPLIT PAIR: WOMEN & MEN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">

            {/* WOMEN CARD */}
            <Link
              href="/collections/women"
              className="group relative overflow-hidden rounded-[24px] shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out block bg-gray-950 aspect-[4/3] sm:h-[320px] lg:h-[380px] w-full"
            >
              <img
                src={images?.women || 'https://via.placeholder.com/1200x800?text=Women'}
                alt="Women Collection"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[800ms] ease-out opacity-90 group-hover:opacity-100"
              />

              {/* HIGH-FASHION CINEMATIC OVERLAYS */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

              {/* CARD DETAILS */}
              <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 right-6 text-white z-10 pointer-events-none">
                <p className="text-[9px] tracking-[0.3em] uppercase font-bold text-gray-300 mb-1.5 opacity-90">
                  New Arrivals
                </p>
                <h3 className="heading-serif text-2xl lg:text-3xl font-normal tracking-wide mb-3 transform group-hover:translate-x-1 transition-transform duration-300">
                  Women's Edit
                </h3>
                <div className="inline-flex items-center text-[11px] font-bold tracking-[0.2em] uppercase">
                  <span className="border-b border-white/60 pb-0.5 group-hover:border-white group-hover:text-red-400 transition-colors duration-300">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>

            {/* MEN CARD */}
            <Link
              href="/collections/men"
              className="group relative overflow-hidden rounded-[24px] shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out block bg-gray-950 aspect-[4/3] sm:h-[320px] lg:h-[380px] w-full"
            >
              <img
                src={images?.men || 'https://via.placeholder.com/1200x800?text=Men'}
                alt="Men Collection"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[800ms] ease-out opacity-90 group-hover:opacity-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

              <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 right-6 text-white z-10 pointer-events-none">
                <p className="text-[9px] tracking-[0.3em] uppercase font-bold text-gray-300 mb-1.5 opacity-90">
                  Modern Classics
                </p>
                <h3 className="heading-serif text-2xl lg:text-3xl font-normal tracking-wide mb-3 transform group-hover:translate-x-1 transition-transform duration-300">
                  Men's Edit
                </h3>
                <div className="inline-flex items-center text-[11px] font-bold tracking-[0.2em] uppercase">
                  <span className="border-b border-white/60 pb-0.5 group-hover:border-white group-hover:text-red-400 transition-colors duration-300">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* LOWER FULL-WIDTH CANVAS: KIDS */}
          <Link
            href="/collections/kids"
            className="group relative overflow-hidden rounded-[24px] shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out block bg-gray-950 h-[200px] sm:h-[240px] lg:h-[280px] w-full"
          >
            <img
              src={images?.kids || 'https://via.placeholder.com/1400x500?text=Kids'}
              alt="Kids Collection"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-[1000ms] ease-out opacity-90 group-hover:opacity-100"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

            <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 right-6 text-white z-10 pointer-events-none">
              <p className="text-[9px] tracking-[0.3em] uppercase font-bold text-gray-300 mb-1.5 opacity-90">
                Playful Picks
              </p>
              <h3 className="heading-serif text-2xl lg:text-3xl font-normal tracking-wide mb-3 transform group-hover:translate-x-1 transition-transform duration-300">
                Kids Edit
              </h3>
              <div className="inline-flex items-center text-[11px] font-bold tracking-[0.2em] uppercase">
                <span className="border-b border-white/60 pb-0.5 group-hover:border-white group-hover:text-red-400 transition-colors duration-300">
                  Shop Now →
                </span>
              </div>
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