'use client'

import { useState, useEffect } from 'react'
import { Instagram, Play, Loader2 } from 'lucide-react'
import ProductCard, { Product } from '@/components/ProductCard'
import { getInstaLivePosts, getProducts } from '@/lib/api' 

// 🔥 BULLETPROOF PARSER: Will find the image no matter how the database formats it
function toCardProduct(p: any): Product {
  const variants = p.variants || []
  const stock = p.stock !== undefined ? p.stock : variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
  const price = p.base_price !== undefined ? p.base_price : (variants[0]?.base_price || p.price || 0)
  
  // 1. Try to get the main image safely
  let mainImage = null;
  if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
    mainImage = p.images[0];
  } else if (typeof p.images === 'string' && p.images.length > 5) {
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
    } catch(e) {}
  }

  // 2. Fallback to a variant image if the main image is missing
  const variantImage = variants.find((v: any) => v.image && v.image.trim() !== '')?.image;

  return {
    id:            p.id || p.slug, 
    name:          p.name,
    price:         Number(price), 
    image:         mainImage || variantImage || 'https://via.placeholder.com/400x500?text=No+Image', 
    images:        Array.isArray(p.images) ? p.images : [], 
    variants:      variants,       
    href:          `/products/${p.slug || p.id}`,
    badge:         stock <= 0 ? 'Sold Out' : undefined,
    sold:          stock <= 0,
  }
}

export default function InstaLivePage() {
  const [topPosts, setTopPosts] = useState<any[]>([])
  const [exclusiveProducts, setExclusiveProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [postsRes, prodsRes] = await Promise.all([
          getInstaLivePosts(),
          getProducts({ sales_channel: 'INSTA_LIVE', limit: 50 })
        ])

        const validPosts = (postsRes.posts || []).filter((post: any) => {
          const combinedStock = post.products.reduce((acc: number, lp: any) => acc + (lp.product?.stock || 0), 0)
          return combinedStock > 0
        })

        setTopPosts(validPosts.slice(0, 3))
        setExclusiveProducts((prodsRes.products || []).map(toCardProduct))

      } catch (err) {
        setError('Failed to load Insta Live collection')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="border-b border-gray-100 py-3">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
          <p className="text-[11px] text-gray-400 tracking-wide">
            Home <span className="mx-2 text-gray-300">/</span> <span className="text-gray-700">Insta Live</span>
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-10 lg:py-16">
        
        <div className="text-center mb-16">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-red-500/30">
            <Instagram size={22} />
          </div>
          <h1 className="heading-serif text-3xl md:text-4xl tracking-wide text-gray-900 mb-3">Live Exclusives</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">Shop the exact looks featured in our latest Instagram Reels. These styles sell out fast!</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
        ) : error ? (
          <div className="text-center py-24 text-gray-400 text-sm">{error}</div>
        ) : (
          <>
            {/* 🔥 SECTION 1: TOP 3 REELS WITH LINKED PRODUCTS */}
            {topPosts.length > 0 && (
              <div className="mb-24 space-y-16">
                {topPosts.map(post => (
                  <div key={post.id} className="bg-[#fafafa] rounded-[32px] p-5 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    
                    {/* 🔥 PREMIUM REEL PLAYER CARD */}
                    <a href={post.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className="relative shrink-0 w-full lg:w-[300px] aspect-[9/16] rounded-[24px] overflow-hidden group shadow-2xl block bg-[#111]">
                      
                      {/* Video/Image Layer */}
                      {post.thumbnail?.includes('.mp4') ? (
                        <video src={post.thumbnail} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" />
                      ) : (
                        <img src={post.thumbnail || 'https://via.placeholder.com/300x500'} alt="Instagram Reel" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" />
                      )}

                      {/* Cinematic Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

                      {/* Top Header */}
                      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                        <div className="bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-red-600/30">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> EXCLUSIVE
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-lg">
                          <Instagram size={14} />
                        </div>
                      </div>
                      
                      {/* Center Play Button (Reveals on Hover) */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                         <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)] transform scale-75 group-hover:scale-100 transition-all duration-500">
                            <Play size={24} className="text-white ml-1" fill="currentColor" />
                         </div>
                      </div>

                      {/* Bottom Call to Action */}
                      <div className="absolute bottom-5 left-5 right-5 z-10">
                        <div className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-5 py-4 rounded-xl text-xs font-bold tracking-[0.1em] border border-white/20 flex items-center justify-center gap-2 transition-all duration-300 shadow-xl">
                          <Instagram size={16} /> WATCH ON INSTAGRAM
                        </div>
                      </div>
                    </a>

                    {/* Linked Products */}
                    <div className="flex-1 w-full pt-4">
                      <h3 className="text-2xl font-serif mb-8 text-gray-900 border-b border-gray-200 pb-4">{post.title || 'Featured in this Reel'}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                        {post.products.map((lp: any) => <ProductCard key={lp.id} product={toCardProduct(lp.product)} />)}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* 🔥 SECTION 2: ALL EXCLUSIVE PRODUCTS GRID */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 tracking-wide uppercase">More Live Styles</h3>
                <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{exclusiveProducts.length} Items</span>
              </div>
              
              {exclusiveProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-10">
                  {exclusiveProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No additional live styles available right now.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}