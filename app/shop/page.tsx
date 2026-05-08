'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/lib/api'

const CATEGORIES = ['All', 'Women', 'Men', 'Kids']
const SORT_MAP: Record<string, string> = { new: 'newest', low: 'price_asc', high: 'price_desc' }
const CATEGORY_MAP: Record<string, string | undefined> = {
  All: undefined, Women: 'Women', Men: 'Men', Kids: 'Kids',
}

function toCard(p: any) {
  return {
    id:            p.slug || p.id,
    name:          p.name,
    price:         p.base_price,
    originalPrice: p.original_price ?? undefined,
    image:         p.images?.[0] || '',
    href:          `/products/${p.slug || p.id}`,
  }
}

export default function ShopPage() {
  const [products,    setProducts]    = useState<any[]>([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [category,    setCategory]    = useState('All')
  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState('new')
  const [debounced,   setDebounced]   = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetch_ = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true)
      const res = await getProducts({
        page: pageNum, limit: 20,
        category: CATEGORY_MAP[category],
        sort: SORT_MAP[sort],
        search: debounced || undefined,
      })
      const mapped = (res.products || []).map(toCard)
      setProducts(prev => replace ? mapped : [...prev, ...mapped])
      setTotal(res.total || 0)
    } catch {}
    finally { setLoading(false); setLoadingMore(false) }
  }, [category, sort, debounced])

  useEffect(() => { setPage(1); fetch_(1, true) }, [category, sort, debounced])

  return (
    <main className="bg-white text-[#111] min-h-screen">
      <section className="relative py-14 md:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-2xl h-[240px] sm:h-[280px] md:h-[320px]">
            <img src="https://images.unsplash.com/photo-1520975922284-9c0cddfd2dcd?w=1400&q=100" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20" />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">Collection</p>
            <h1 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[40px] leading-tight">Shop Collection</h1>
            <p className="mt-4 text-gray-600 text-[14px] md:text-[15px] font-medium tracking-wide leading-relaxed max-w-[420px]">
              Discover timeless styles curated for every generation with elegance and comfort.
            </p>
            <div className="w-10 h-[2px] bg-[#8b1e1e] mt-5 rounded-full" />
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 py-10">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <input type="text" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-4 py-2 text-sm w-full md:w-64 focus:outline-none rounded-lg" />
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-sm border rounded-full transition ${category === cat ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="border px-4 py-2 text-sm rounded-lg">
            <option value="new">Newest First</option>
            <option value="low">Price Low → High</option>
            <option value="high">Price High → Low</option>
          </select>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
        </p>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {products.map((p, i) => <ProductCard key={p.id} idx={i} product={p} />)}
            </div>
            {products.length < total && (
              <div className="text-center mt-12">
                <button onClick={() => { const next = page + 1; setPage(next); fetch_(next, false) }}
                  disabled={loadingMore}
                  className="px-10 py-3 border border-gray-300 text-[12px] tracking-[0.15em] uppercase font-medium text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 mx-auto">
                  {loadingMore && <Loader2 size={13} className="animate-spin" />}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}