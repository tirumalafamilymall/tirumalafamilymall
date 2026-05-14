'use client'

import Link from 'next/link'

const PLACEHOLDER_COLORS = [
  '#f5ede4','#e8eff7','#f5e4ea','#e4f5ec','#f0e8f5','#f5f0e4','#e4edf5','#f5e9e4',
]

export interface Product {
  id: string; 
  name: string; 
  price: number; 
  originalPrice?: number;
  image: string;      
  images?: string[]; 
  variants?: any[];
  href: string;       
  badge?: string; 
  sold?: boolean; 
  colorIdx?: number;    
  hasSizes?: boolean;   
  brand?: string;     
  subcategory?: string; 
}

export default function ProductCard({ product, idx = 0 }: { product: Product; idx?: number }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null
  const placeholderBg = PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length]

  const parentImage = product.images?.[0]
  const variantImage = product.variants?.find((v: any) => v.image)?.image
  const displayImage = product.image || parentImage || variantImage || 'https://via.placeholder.com/400x500'

  return (
    <div className="group rounded-2xl overflow-hidden bg-white shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300">
      {/* Entire Image Area is now just a single Link */}
      <Link href={product.href} className="block relative overflow-hidden rounded-xl mb-3" style={{ aspectRatio: '3/4' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 z-10" />
        
        <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]" />

        {/* Top badges (Kept these as they show important status) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          {product.sold && <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase bg-gray-800 text-white px-2 py-0.5 rounded">Sold Out</span>}
          {!product.sold && product.badge && <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase bg-white text-gray-800 border border-gray-200 px-2 py-0.5 rounded">{product.badge}</span>}
          {discount && !product.sold && <span className="text-[9px] font-semibold bg-[#cc0000] tracking-[0.08em] text-white px-2 py-0.5 rounded-full">-{discount}%</span>}
        </div>
      </Link>

      <Link href={product.href} className="block px-1">
        {product.brand && <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{product.brand}</p>}
        <p className="text-[14px] text-gray-900 font-medium leading-snug line-clamp-2 hover:text-gray-900 transition-colors tracking-[0.02em]">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[14px] font-semibold text-black">₹{product.price?.toLocaleString('en-IN') || 0}</span>
          {product.originalPrice && <span className="text-[11px] text-gray-400/80 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
        </div>
      </Link>
    </div>
  )
}