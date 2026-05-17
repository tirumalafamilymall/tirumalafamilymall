'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/lib/api'
import ProductCard, { Product } from '@/components/ProductCard'
import { Loader2, SlidersHorizontal, ArrowUpDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Helper mapping network payload configurations cleanly to the ProductCard template layout
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

// Converts standard slugs back into readable display titles (e.g., "dress-materials" -> "Dress Materials")
function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function CategoryView({ rawCategory }: { rawCategory: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState('featured')
  
  const displayTitle = formatTitle(rawCategory)

  useEffect(() => {
    async function loadCategoryItems() {
      setLoading(true)
      try {
        // Query database via API client, matching formatting requirements precisely
        const res = await getProducts({ 
          category: displayTitle,
          limit: 100 
        })
        
        let loadedProducts = (res.products || []).map(toCardProduct)

// Find this block inside your useEffect function:

if (sortOrder === 'low-high') {
  // 🔥 FIX: Add explicit types to 'a' and 'b' parameters
  loadedProducts.sort((a: Product, b: Product) => a.price - b.price)
} else if (sortOrder === 'high-low') {
  // 🔥 FIX: Add explicit types to 'a' and 'b' parameters
  loadedProducts.sort((a: Product, b: Product) => b.price - a.price)
}

        setProducts(loadedProducts)
      } catch (error) {
        console.error("Failed to load category products mapping:", error)
      }
      setLoading(false)
    }

    loadCategoryItems()
  }, [rawCategory, sortOrder, displayTitle])

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* ── BREADCRUMB STRIP ── */}
      <div className="border-b border-gray-100 py-4 bg-gray-50/30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center gap-2 text-[11px] text-gray-400 tracking-wider uppercase font-medium">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <ChevronRight size={10} className="text-gray-300" />
          <span className="text-gray-900">{displayTitle}</span>
        </div>
      </div>

      {/* ── CATEGORY MAIN HERO BODY ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-10">
        
        {/* Header Ribbon Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
          <div>
            <h1 className="heading-serif text-3xl md:text-4xl tracking-wide text-gray-900 mb-2">
              {displayTitle}
            </h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              {loading ? 'Sizing catalog...' : `${products.length} Curated Styles`}
            </p>
          </div>

          {/* Interactive Utility Row Bar Controls */}
          <div className="flex items-center gap-4 self-end w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-4 py-2.5 rounded-full bg-white select-none">
              <SlidersHorizontal size={13} />
              <span className="font-medium tracking-wide">Filter</span>
            </div>

            <div className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full bg-white relative">
              <ArrowUpDown size={13} className="text-gray-400" />
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer pr-2 appearance-none"
              >
                <option value="featured">Featured Picks</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── CORE PRODUCTS MAPPING VIEW GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="animate-spin text-gray-300" size={32} />
            <p className="text-[10px] tracking-[0.25em] text-gray-400 uppercase font-bold">Assembling Grid...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-12">
            {products.map((p, index) => (
              <ProductCard key={p.id} product={p} idx={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 max-w-2xl mx-auto px-6">
            <p className="heading-serif italic text-xl text-gray-800 mb-2">Collection Restocking</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">Our latest arrivals for this category are being processed in the admin suite. Check back shortly!</p>
            <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-red-600 transition duration-300">
              Return Home
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}