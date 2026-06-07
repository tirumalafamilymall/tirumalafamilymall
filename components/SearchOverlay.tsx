'use client'

import { X, Search, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { searchProducts } from '@/lib/api';

export default function SearchOverlay({ open, onClose }: any) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🔥 DYNAMIC LIVE SEARCH: Fetches directly from your database
  useEffect(() => {
  if (!query.trim() || query.length < 2) {
    setResults([]);
    setLoading(false);
    return;
  }

  const delayDebounceFn = setTimeout(async () => {
    setLoading(true);
    try {
      // 🔥 Use the existing library function!
      const data = await searchProducts(query, 10);
      setResults(data.products || []);
    } catch (error) {
      console.error("Search fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, 400);

  return () => clearTimeout(delayDebounceFn);
}, [query]);

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?q=${query}`)
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-[999] bg-white transition-all duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <Search className="text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for products..."
          className="flex-1 outline-none text-[16px]"
        />
        <button onClick={onClose}><X /></button>
      </div>

      <div className="px-6 py-6">
        {query.length >= 2 ? (
          loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" /></div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map(item => (
                <Link key={item.id} href={`/products/${item.id}`} onClick={onClose} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition">
                  <img src={item.image || 'https://via.placeholder.com/100'} className="w-12 h-14 object-cover rounded" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">₹{item.base_price?.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No products found</p>
          )
        ) : (
          <p className="text-sm text-gray-400">Type at least 2 characters to search...</p>
        )}
      </div>
    </div>
  )
}