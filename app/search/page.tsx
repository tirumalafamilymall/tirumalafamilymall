'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { searchProducts } from '@/lib/api'

const SUGGESTIONS = ['Sarees', 'Kurtis', 'Nighties', 'Leggings', 'Men Shirts', 'Kids Frocks', 'Sherwani', 'Palazzo', 'Anarkali']

function toCard(p: any) {
  return {
    id:            p.slug || p.id,
    name:          p.name,
    price:         Number(p.base_price), // FIXED: Safety for Decimal
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    image:         p.images?.[0] || '',
    href:          `/products/${p.slug || p.id}`,
  }
}

function SearchContent() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const q             = searchParams.get('q') ?? ''

  const [products, setProducts] = useState<any[]>([])
  const [loading,  setLoading]  = useState(false)
  const [input,    setInput]    = useState(q)

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setProducts([]); return }
    setLoading(true)
    try {
      const res = await searchProducts(query, 24)
      setProducts((res.products || []).map(toCard))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { doSearch(q) }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input.trim())}`)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}
      <div className="bg-[#fafafa] border-b">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#CC0000] mb-3">Search</p>
          <h1 className="heading-serif text-4xl md:text-5xl italic leading-tight tracking-wide">
            {q ? `Results for "${q}"` : 'Search Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            {loading ? 'Searching...' : q ? `${products.length} products found` : 'Find sarees, kurtis, shirts and more'}
          </p>
          <div className="w-10 h-[2px] bg-[#CC0000] mx-auto mt-4" />

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-6">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-gray-200 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-black transition"
            />
            <button type="submit" className="px-5 py-2.5 bg-black text-white text-sm rounded-xl hover:bg-gray-800 transition">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-14 md:py-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : q ? (
          products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm mb-4">No products found for "{q}"</p>
              <Link href="/collections/all" className="text-[12px] text-gray-500 underline">Browse all products</Link>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-gray-500 mb-8">
                Showing <span className="text-black font-medium">{products.length}</span> results
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {products.map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
              </div>
            </>
          )
        ) : (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#fafafa] shadow-sm flex items-center justify-center mx-auto mb-5">
              <Search size={22} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-8">Start searching for products</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <Link key={s} href={`/search?q=${s}`}
                  className="text-[12px] text-gray-600 border border-gray-200 px-5 py-2 rounded-full hover:border-black hover:text-black hover:scale-[1.03] transition-all">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}