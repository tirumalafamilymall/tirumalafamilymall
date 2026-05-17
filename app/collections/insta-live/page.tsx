'use client'

import { useState, useEffect } from 'react'
import { Instagram, Play, Loader2 } from 'lucide-react'
import ProductCard, { Product } from '@/components/ProductCard'
import { getInstaLivePosts, getProducts } from '@/lib/api' // 🔥 Imported getProducts

function toCardProduct(p: any): Product {
  const variants = p.variants || []
  const stock = p.stock !== undefined ? p.stock : variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
  const price = p.base_price !== undefined ? p.base_price : (variants[0]?.base_price || p.price || 0)
  const variantImage = variants.find((v: any) => v.image)?.image;

  return {
    id:            p.id || p.slug, 
    name:          p.name,
    price:         Number(price), 
    image:         p.images?.[0] || variantImage || 'https://via.placeholder.com/400x500', 
    images:        p.images || [], 
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
        // Fetch posts AND exclusive Insta Live products simultaneously
        const [postsRes, prodsRes] = await Promise.all([
          getInstaLivePosts(),
          getProducts({ sales_channel: 'INSTA_LIVE', limit: 50 })
        ])

        // 🔥 Auto-Hide Logic: Only keep posts where the combined stock is > 0
        const validPosts = (postsRes.posts || []).filter((post: any) => {
          const combinedStock = post.products.reduce((acc: number, lp: any) => acc + (lp.product?.stock || 0), 0)
          return combinedStock > 0
        })

        // Take the top 3 newest active posts
        setTopPosts(validPosts.slice(0, 3))
        
        // Map the grid of exclusive products
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-red-500/20">
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
              <div className="mb-20 space-y-12">
                {topPosts.map(post => (
                  <div key={post.id} className="bg-[#fafafa] rounded-3xl p-5 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-10 items-start border border-gray-100">
                    
                    {/* Reel Player Box (Updated with Video Support) */}
                    <a href={post.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className="relative shrink-0 w-full lg:w-[260px] aspect-[9/16] rounded-2xl overflow-hidden group shadow-[0_15px_35px_rgba(0,0,0,0.08)] block bg-gray-900">
                      
                      {post.thumbnail?.includes('.mp4') ? (
                        <video src={post.thumbnail} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
                      ) : (
                        <img src={post.thumbnail || 'https://via.placeholder.com/300x500'} alt="Instagram Reel" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
                      )}

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.2em] border border-white/30 group-hover:scale-110 transition-transform shadow-lg">
                          WATCH FULL REEL
                        </div>
                      </div>
                      
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-md">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Featured
                      </div>
                    </a>

                    {/* Linked Products */}
                    <div className="flex-1 w-full pt-2">
                      <h3 className="text-xl font-serif mb-6 text-gray-900">{post.title || 'Shop this look'}</h3>
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