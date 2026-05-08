'use client'

import { useState, useEffect } from 'react'
import { Instagram, Play, Loader2 } from 'lucide-react'
import ProductCard, { Product } from '@/components/ProductCard'
import { getInstaLivePosts } from '@/lib/api'

function toCardProduct(p: any): Product {
  return {
    id:            p.slug || p.id,
    name:          p.name,
    price:         p.base_price ?? p.price,
    originalPrice: p.original_price ?? undefined,
    image:         p.images?.[0] || '',
    href:          `/products/${p.slug || p.id}`,
    badge:         undefined,
  }
}

export default function InstaLivePage() {
  const [posts,   setPosts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Flatten all products from all active posts, deduplicated
  const products: Product[] = []
  const seen = new Set<string>()
  for (const post of posts) {
    for (const lp of post.products ?? []) {
      const p = lp.product ?? lp
      if (!seen.has(p.id)) {
        seen.add(p.id)
        products.push(toCardProduct(p))
      }
    }
  }

  useEffect(() => {
    getInstaLivePosts(true)
      .then(res => setPosts(res.posts ?? res ?? []))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-xs text-gray-400">Home / <span className="text-gray-700">Insta Live</span></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-red-50 px-4 py-2 rounded-full mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-red-600 tracking-wide">LIVE NOW</span>
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Insta Live Collection</h1>
          <p className="text-sm text-gray-400">Products from our latest Instagram Live sessions</p>
          <div className="w-10 h-px bg-gray-200 mx-auto mt-4" />
        </div>

        {/* Follow CTA */}
        <a
          href="https://instagram.com/tirumalafamilymall777"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-xl p-5 mb-10 border border-pink-100 hover:shadow-md transition-shadow group max-w-2xl mx-auto"
        >
          <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Instagram size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Follow us on Instagram</p>
            <p className="text-xs text-gray-500 mt-0.5">@tirumalafamilymall777 — Live sessions every week with exclusive deals</p>
          </div>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Play size={14} className="text-gray-600 fill-gray-600 ml-0.5" />
          </div>
        </a>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-gray-400 text-sm">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">
            No products yet — check back after the next live session!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

      </div>
    </div>
  )
}