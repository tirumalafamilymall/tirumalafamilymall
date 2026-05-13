'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, X, Grid, LayoutGrid, Loader2 } from 'lucide-react'
import ProductCard, { Product } from '@/components/ProductCard'
import { getProducts } from '@/lib/api'

const SORT_OPTIONS = [
  { label: 'Newest First',      value: 'newest' },
  { label: 'Price: Low to High',  value: 'price_asc' },
  { label: 'Price: High to Low',  value: 'price_desc' },
]

const PRICE_RANGES = [
  { label: 'Under ₹500',        min: 0,    max: 499  },
  { label: '₹500 – ₹1,000',    min: 500,  max: 1000 },
  { label: '₹1,000 – ₹1,500',  min: 1000, max: 1500 },
  { label: 'Above ₹1,500',      min: 1500, max: 99999 },
]

function toCardProduct(p: any): Product {
  // 🔥 SMART CHECK: Handles both flattened responses and nested variant arrays
  const variants = p.variants || []
  const stock = p.stock !== undefined 
    ? p.stock 
    : variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
    
  const price = p.base_price !== undefined 
    ? p.base_price 
    : (variants[0]?.base_price || 0)

  return {
    id:            p.id, // Better to use the true ID for React keys
    name:          p.name,
    price:         Number(price), // Safely convert Decimal to Number
    image:         p.images?.[0] || '',
    href:          `/products/${p.slug || p.id}`,
    badge:         stock <= 0 ? 'Sold Out' : undefined,
  }
}

export default function CollectionPage() {
  const params = useParams()
  const rawSlug  = (params?.slug as string) ?? 'all'
  
  const deriveLabel = (s: string) => s === 'all' ? 'All Products' : s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const label = deriveLabel(rawSlug)
  
  // Differentiate between Department (Men/Women/Kids) vs Category (Shirts/Sarees)
  const isDepartment = ['Women', 'Men', 'Kids'].includes(label)
  const activeDepartment = isDepartment ? label.toUpperCase() : undefined
  const activeCategory = !isDepartment && rawSlug !== 'all' ? label : undefined

  const [products,     setProducts]     = useState<Product[]>([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [sort,         setSort]         = useState('newest')
  const [inStock,      setInStock]      = useState(false)
  const [priceRange,   setPriceRange]   = useState<{ min: number; max: number } | null>(null)
  const [mobileFilter, setMobileFilter] = useState(false)
  const [cols,         setCols]         = useState<2 | 3>(2)
  const [openFilter,   setOpenFilter]   = useState<string | null>('price')

  const LIMIT = 20

  const fetchProducts = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true)

      const res = await getProducts({
        page:      pageNum,
        limit:     LIMIT,
        department: activeDepartment,
        category:  activeCategory, 
        sort,
        in_stock:  inStock || undefined,
        min_price: priceRange?.min,
        max_price: priceRange?.max === 99999 ? undefined : priceRange?.max,
      })

      const mapped = (res.products || []).map(toCardProduct)
      setProducts(prev => replace ? mapped : [...prev, ...mapped])
      setTotal(res.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeDepartment, activeCategory, sort, inStock, priceRange])

  useEffect(() => {
    setPage(1)
    fetchProducts(1, true)
  }, [fetchProducts]) // 🔥 FIXED: Added fetchProducts to dependency array

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchProducts(next, false)
  }

  const hasMore = products.length < total

  const FilterContent = () => (
    <div className="space-y-0 divide-y divide-gray-100">
      <div>
        <button onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')} className="w-full flex items-center justify-between py-4 text-left">
          <span className="text-[12px] font-semibold text-gray-700 tracking-[0.08em] uppercase">Price</span>
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${openFilter === 'price' ? 'rotate-180' : ''}`} />
        </button>
        {openFilter === 'price' && (
          <div className="pb-4 space-y-2.5">
            {PRICE_RANGES.map(r => (
              <label key={r.label} className="flex items-center gap-2.5 cursor-pointer group">
                <div onClick={() => setPriceRange(priceRange?.min === r.min ? null : { min: r.min, max: r.max })}
                  className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all cursor-pointer ${priceRange?.min === r.min ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-500'}`}>
                  {priceRange?.min === r.min && <span className="text-white text-[10px] leading-none">✓</span>}
                </div>
                <span className="text-[12.5px] text-gray-600 group-hover:text-gray-900 transition-colors">{r.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div>
        <button onClick={() => setOpenFilter(openFilter === 'avail' ? null : 'avail')} className="w-full flex items-center justify-between py-4 text-left">
          <span className="text-[12px] font-semibold text-gray-700 tracking-[0.08em] uppercase">Availability</span>
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${openFilter === 'avail' ? 'rotate-180' : ''}`} />
        </button>
        {openFilter === 'avail' && (
          <div className="pb-4 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div onClick={() => setInStock(!inStock)}
                className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all cursor-pointer ${inStock ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-500'}`}>
                {inStock && <span className="text-white text-[10px] leading-none">✓</span>}
              </div>
              <span className="text-[12.5px] text-gray-600 group-hover:text-gray-900 transition-colors">In Stock Only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )

  const activeFilterCount = (priceRange ? 1 : 0) + (inStock ? 1 : 0)

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-3">
          <p className="text-[11px] text-gray-400 tracking-wide">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-600">{label}</span>
          </p>
        </div>
      </div>

      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[24px] font-light text-gray-900 tracking-wide">{label}</h1>
            <p className="text-[12px] text-gray-400 mt-1">{loading ? 'Loading...' : `${total} products`}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileFilter(true)} className="lg:hidden flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] text-gray-600 hover:border-gray-400 transition-colors">
              <SlidersHorizontal size={13} /> Filter
              {activeFilterCount > 0 && <span className="w-4 h-4 bg-gray-900 text-white text-[9px] rounded-full flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            <div className="hidden sm:flex gap-1 border border-gray-200 rounded-lg overflow-hidden">
              {([2, 3] as const).map(n => (
                <button key={n} onClick={() => setCols(n)} className={`w-8 h-8 flex items-center justify-center transition-colors ${cols === n ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {n === 2 ? <Grid size={13} /> : <LayoutGrid size={13} />}
                </button>
              ))}
            </div>
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)} className="appearance-none pl-3.5 pr-8 h-9 border border-gray-200 rounded-lg text-[12.5px] text-gray-600 bg-white cursor-pointer outline-none hover:border-gray-400 transition-colors">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {(priceRange || inStock) && (
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-3 flex items-center gap-2 flex-wrap border-b border-gray-50">
          <span className="text-[11px] text-gray-400">Filters:</span>
          {priceRange && (
            <button onClick={() => setPriceRange(null)} className="flex items-center gap-1.5 text-[11px] bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 transition-colors">
              {PRICE_RANGES.find(r => r.min === priceRange.min)?.label} <X size={10} />
            </button>
          )}
          {inStock && (
            <button onClick={() => setInStock(false)} className="flex items-center gap-1.5 text-[11px] bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 transition-colors">
              In Stock <X size={10} />
            </button>
          )}
          <button onClick={() => { setPriceRange(null); setInStock(false) }} className="text-[11px] text-red-500 hover:text-red-700 transition-colors ml-1">Clear all</button>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-8 flex gap-8">
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-28">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-700 mb-4">Filter</p>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-[14px]">No products found</p>
              <button onClick={() => { setPriceRange(null); setInStock(false) }} className="mt-4 text-[12px] text-gray-500 underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className={cols === 3 ? 'grid gap-x-4 gap-y-8 grid-cols-2 lg:grid-cols-4' : 'grid gap-x-4 gap-y-8 grid-cols-2 lg:grid-cols-3'}>
                {products.map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
              </div>
              {hasMore && (
                <div className="text-center mt-12">
                  <button onClick={handleLoadMore} disabled={loadingMore} className="px-10 py-3 border border-gray-300 text-[12px] tracking-[0.15em] uppercase font-medium text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto">
                    {loadingMore && <Loader2 size={13} className="animate-spin" />}
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFilter && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/30" onClick={() => setMobileFilter(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto px-5 pt-5 pb-8" style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.10)' }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[14px] font-semibold text-gray-900">Filter Products</p>
              <button onClick={() => setMobileFilter(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={16} className="text-gray-500" /></button>
            </div>
            <FilterContent />
            <button onClick={() => setMobileFilter(false)} className="w-full mt-5 py-3.5 bg-gray-900 text-white text-[13px] font-medium rounded-xl hover:bg-gray-800 transition-colors">Apply Filters</button>
          </div>
        </>
      )}
    </div>
  )
}