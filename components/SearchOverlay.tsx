'use client'

import { X, Search, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SearchOverlay({ open, onClose }: any) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🔥 LIVE DYNAMIC SEARCH WITH DEBOUNCE
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    // Wait 400ms after the user stops typing before hitting the database
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.success) {
          setResults(data.products || [])
        }
      } catch (error) {
        console.error("Search fetch failed", error)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?q=${query}`)
    onClose()
  }

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-[999] bg-white transition-all duration-300 ${
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* 🔥 TOP BAR */}
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <Search className="text-gray-400" />
        <input
          autoFocus={open}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for products..."
          className="flex-1 outline-none text-[16px]"
        />
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
          <X className="text-gray-600" />
        </button>
      </div>

      {/* 🔥 LIVE RESULTS */}
      <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-70px)]">
        {query.length >= 2 ? (
          loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-gray-300 w-8 h-8" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map(item => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={item.image || 'https://placehold.co/200x300?text=No+Image'}
                    className="w-12 h-14 object-cover rounded shadow-sm border border-gray-100"
                    alt={item.name}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-600 font-semibold">₹{item.base_price?.toLocaleString('en-IN') || 0}</p>
                      {item.category && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400">No products found for "{query}"</p>
            </div>
          )
        ) : (
          <>
            {/* TRENDING SEARCHES (Static suggestions) */}
            <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-4 font-semibold">
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-3">
              {['Sarees', 'Kurtis', 'Nighties', 'Men Shirts', 'Kids Wear'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    router.push(`/search?q=${item}`)
                    onClose()
                  }}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-black hover:text-white hover:border-black transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}