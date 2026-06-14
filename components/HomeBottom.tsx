'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Instagram, Play, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard, { Product } from './ProductCard'
import { getProducts, getInstaLivePosts } from '@/lib/api'

// Helper to handle main image and variant image extraction safely
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

// ─── 1. FLASH SALE BANNER ─────────────────────────────────────────
export function FlashSaleBanner({ flashConfig }: { flashConfig: any }) {
  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <Link href="/collections/sale" className="group relative block overflow-hidden rounded-[16px] shadow-[0_6px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.1)] transition duration-300">
          <img
            src={flashConfig?.img || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1400&q=90"}
            alt="Flash Sale Banner"
            className="w-full h-[220px] sm:h-[240px] lg:h-[260px] object-cover object-center group-hover:scale-[1.04] transition duration-700"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300" />
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">
            <p className="text-[11px] tracking-[0.4em] uppercase opacity-80 mb-2">Limited Time</p>
            <h2 className="heading-serif italic text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] font-normal tracking-[0.12em] leading-[1.1] mb-2">Flash Sale</h2>
            <p className="text-sm opacity-90 mb-4">Up to 50% Off</p>
            <span className="inline-block text-[12px] tracking-[0.25em] uppercase border-b border-white pb-1 group-hover:text-[#ff4d4d] group-hover:border-[#ff4d4d] transition-all duration-300">Shop Now</span>
          </div>
        </Link>
      </div>
    </section>
  )
}

// ─── 2. INSTA LIVE (RANDOM 8 EXCLUSIVES) ─────────────────────────
export function InstaLive() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLiveItems() {
      try {
        // 🔥 FIX: Removed 'is_active' to perfectly match the api.ts TypeScript parameters
        const res = await getProducts({ sales_channel: 'INSTA_LIVE', limit: 8 })
        setProducts((res.products || []).map(toCardProduct))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchLiveItems()
  }, [])

  
  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">Live Shopping</p>
            <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">Insta Live</h2>
            <div className="w-10 h-[2px] bg-[#CC0000] mt-3 rounded-full" />
          </div>
          <Link href="/collections/insta-live" className="px-5 py-2.5 rounded-full bg-gray-50 text-gray-800 text-[12px] font-medium tracking-[0.18em] border border-gray-200 hover:bg-white hover:border-[#CC0000] hover:text-[#CC0000] shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300">View All</Link>
        </div>

        <a href="https://instagram.com/tirumalafamilymall777" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 px-6 py-4 mb-10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition">
          <div>
            <p className="text-[13px] font-medium text-gray-900 flex items-center gap-2">Watch Live Sessions <span className="text-[9px] bg-[#CC0000] text-white px-2 py-0.5 rounded-full tracking-wide animate-pulse">LIVE</span></p>
            <p className="text-[12px] text-gray-400 mt-1">New arrivals showcased daily — @tirumalafamilymall777</p>
          </div>
          <span className="text-gray-400 text-lg">→</span>
        </a>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-200" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── 3. NEW SEASON PICKS (INFINITE CAROUSEL UPGRADE) ──────────────────────────────
export function CategoryHighlight({ newSeasonConfig }: { newSeasonConfig: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Smooth scroll logic for desktop arrows
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 250 : 400
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  if (!newSeasonConfig || newSeasonConfig.length === 0) return null

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header & Desktop Navigation Arrows */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">Trending</p>
            <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">New Season Picks</h2>
            <div className="w-12 h-[2px] bg-[#CC0000] mt-4 rounded-full"></div>
          </div>
          
          {/* Interactive Arrows (Visible on Desktop Only) */}
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Unified Mobile Swipe & Desktop Slider Track */}
        <div ref={scrollRef} className="flex gap-5 lg:gap-6 overflow-x-auto snap-x snap-mandatory hide-scroll-track pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {newSeasonConfig.map((item, i) => (
            <Link key={i} href={item.href || '#'} className="snap-start shrink-0 w-[240px] sm:w-[280px] lg:w-[320px] group relative overflow-hidden rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300">
              <div className="h-[280px] sm:h-[340px] lg:h-[400px]">
                <img src={item.img || 'https://via.placeholder.com/500'} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-700" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition duration-300" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/70 mb-1 font-semibold">{item.desc || 'Explore'}</p>
                <h3 className="text-[18px] lg:text-[20px] font-medium text-white mb-3">{item.title || 'Collection'}</h3>
                <div className="inline-block border-b border-white/50 text-white text-[11px] tracking-[0.15em] uppercase pb-1 group-hover:border-[#CC0000] group-hover:text-[#CC0000] transition-colors">
                  Shop Now →
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
      <style>{`
        .hide-scroll-track::-webkit-scrollbar { display: none; } 
        .hide-scroll-track { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}

// ─── 4. STYLE STORIES (PREMIUM AUTOPLAY LAST 3 REELS) ────────────
export function PremiumReels() {
  const [reels, setReels] = useState<any[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await getInstaLivePosts()
        setReels((res.posts || []).slice(0, 3)) 
      } catch (e) { console.error(e) }
    }
    fetchStories()
  }, [])

  const handleMouseEnter = (index: number) => { videoRefs.current[index]?.play() }
  const handleMouseLeave = (index: number) => {
    const video = videoRefs.current[index]
    if (video) { video.pause(); video.currentTime = 0 }
  }

  if (reels.length === 0) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">Instagram</p>
          <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">Follow Our Style Stories</h2>
          <p className="text-gray-500 text-sm mt-4">@tirumalafamilymall777</p>
          <div className="w-12 h-[2px] bg-[#c47a5a] mt-5 mx-auto rounded-full"></div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex justify-center gap-8">
          {reels.map((reel, i) => (
            <a key={reel.id} href={reel.instagram_url} target="_blank" rel="noopener noreferrer"
               className="w-[260px] group relative transition-all duration-500 hover:scale-[1.05]"
               onMouseEnter={() => handleMouseEnter(i)} onMouseLeave={() => handleMouseLeave(i)}>
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.12)] group-hover:shadow-[0_40px_120px_rgba(0,0,0,0.25)] transition-all duration-500">
                {reel.thumbnail?.includes('.mp4') ? (
                  <video ref={el => { videoRefs.current[i] = el }} src={reel.thumbnail} muted loop playsInline className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.05]" />
                ) : (
                  <img src={reel.thumbnail} className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.05]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/5 border-t border-white/10">
                  <span className="text-[10px] tracking-widest uppercase text-gray-300">Live commerce</span>
                  <h3 className="text-white text-sm font-semibold mt-1 truncate">{reel.title || 'Watch Session'}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Explore Now →</span>
                    <button className="px-4 py-1.5 text-[11px] rounded-full bg-white text-black font-medium transition hover:bg-red-600 hover:text-white">Shop</button>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
          {reels.map((reel) => (
            <a key={reel.id} href={reel.instagram_url} target="_blank" rel="noopener noreferrer" className="min-w-[160px] group relative snap-center">
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-md">
                {reel.thumbnail?.includes('.mp4') ? (
                  <video src={reel.thumbnail} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={reel.thumbnail} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] text-gray-300 uppercase">Live Commerce</span>
                  <p className="text-white text-[11px] font-medium truncate">{reel.title || 'Watch Reel'}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

interface StorefrontConfigProps {
  config: {
    heroSlider: any[]
    shopByCategory: any[]
    discoverStyle: { women: string; men: string; kids: string }
    flashSale: { img: string }
    newSeason: any[]
  }
}

export default function HomeBottom({ config }: StorefrontConfigProps) {
  if (!config) return null
  return (
    <>
      <FlashSaleBanner flashConfig={config.flashSale} />
      <InstaLive />
      <CategoryHighlight newSeasonConfig={config.newSeason} />
      <PremiumReels />
    </>
  )
}