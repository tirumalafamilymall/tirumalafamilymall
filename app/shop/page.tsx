'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { getProducts, getProductFilters } from '@/lib/api'

const SORT_MAP: Record<string, string> = { new: 'newest', low: 'price_asc', high: 'price_desc' }

function toCard(p: any) {
  return {
    id:            p.slug || p.id,
    name:          p.name,
    price:         Number(p.base_price), // Safely cast Decimal
    image:         p.images?.[0] || '',
    href:          `/products/${p.slug || p.id}`,
    badge:         p.stock === 0 ? 'Sold Out' : undefined
  }
}

export default function ShopPage() {
  const [products,     setProducts]     = useState<any[]>([])
  const [categories,   setCategories]   = useState<string[]>(['All'])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [category,     setCategory]     = useState('All')
  const [search,       setSearch]       = useState('')
  const [sort,         setSort]         = useState('new')
  const [debounced,    setDebounced]    = useState('')

  useEffect(() => {
    getProductFilters()
      .then(res => {
        if (res.success && res.filters?.categories) {
          setCategories(['All', ...res.filters.categories])
        }
      })
      .catch(err => console.error("Failed to load filters", err))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetch_ = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true)
      const res = await getProducts({
        page: pageNum, 
        limit: 20,
        category: category === 'All' ? undefined : category,
        sort: SORT_MAP[sort],
        search: debounced || undefined,
      })
      const mapped = (res.products || []).map(toCard)
      setProducts(prev => replace ? mapped : [...prev, ...mapped])
      setTotal(res.total || 0)
    } catch {
      // Handle error silently or show toast
    } finally { 
      setLoading(false); 
      setLoadingMore(false) 
    }
  }, [category, sort, debounced])

  useEffect(() => { 
    setPage(1); 
    fetch_(1, true) 
  }, [category, sort, debounced])

  return (
    <main className="bg-white text-[#111] min-h-screen">
      {/* Banner */}
      <section className="relative py-16 md:py-20 bg-[#fafafa] border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative overflow-hidden rounded-3xl h-[280px] md:h-[360px] shadow-2xl">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80" className="w-full h-full object-cover" alt="Collection"/>
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-red-600 mb-4">The Collection</p>
            <h1 className="heading-serif italic text-[36px] md:text-[50px] leading-[1.1] mb-6">Curated Elegance</h1>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-[440px]">
              Discover timeless silhouettes and premium fabrics crafted for those who appreciate the finer details of fashion.
            </p>
            <div className="w-12 h-1 bg-black mt-8" />
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
            <input type="text" placeholder="Search our collection..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-black focus:bg-white text-[13px] rounded-2xl outline-none transition-all" />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-6 py-2.5 text-[12px] font-medium rounded-full whitespace-nowrap transition-all border ${category === cat ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-500 border-gray-100 hover:border-black hover:text-black'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent text-[13px] font-semibold outline-none cursor-pointer">
              <option value="new">Newest Arrivals</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <p className="text-[12px] font-medium text-gray-400 mb-8 uppercase tracking-widest">
          {loading ? 'Refreshing collection...' : `${total} items found`}
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={32} className="animate-spin text-gray-200" />
            <p className="text-[13px] text-gray-400 font-medium">Loading items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-gray-50 rounded-3xl">
            <p className="text-gray-300 text-[15px] font-medium italic">No products matched your selection.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((p, i) => <ProductCard key={p.id} idx={i} product={p} />)}
            </div>
            
            {products.length < total && (
              <div className="text-center mt-20">
                <button onClick={() => { const next = page + 1; setPage(next); fetch_(next, false) }}
                  disabled={loadingMore}
                  className="group relative px-12 py-4 bg-white text-black border border-gray-200 rounded-full text-[11px] font-bold tracking-[0.3em] uppercase overflow-hidden hover:text-white transition-colors duration-500 disabled:opacity-50">
                  <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-3 justify-center">
                    {loadingMore ? <Loader2 size={14} className="animate-spin" /> : 'Load More'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}