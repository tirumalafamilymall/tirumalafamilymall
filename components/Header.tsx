'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, Heart, ShoppingBag, User, X } from 'lucide-react'
import SearchOverlay from '@/components/SearchOverlay'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const open = () => setSearchOpen(true)
    window.addEventListener('openSearch', open)
    return () => window.removeEventListener('openSearch', open)
  }, [])

  return (
    <>
      {/* 🔥 PREMIUM HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#f1f1f1] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">

        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 relative">

          <div className="flex items-center justify-between h-[75px] lg:h-[95px]">

            {/* LEFT */}
            <div className="flex items-center gap-3 pl-2 lg:pl-0 w-[120px] lg:w-auto">

              {/* MOBILE MENU */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden translate-x-[3px] w-[40px] h-[40px] flex items-center justify-center rounded-full bg-white shadow-md border border-[#eee] hover:bg-gray-200 transition"
              >
                <div className="grid grid-cols-3 gap-[3px]">
                  {[...Array(9)].map((_, i) => (
                    <span key={i} className="w-[4px] h-[4px] bg-gray-700 rounded-full" />
                  ))}
                </div>
              </button>

              {/* NAV */}
              <nav className="hidden lg:flex items-center gap-12 text-[13px] tracking-[0.16em] font-medium text-gray-600">
                {['Women','Men','Kids','Insta Live'].map((item) => (
                  <Link
                    key={item}
                    href={`/collections/${item.toLowerCase().replace(' ', '-')}`}
                    className="group relative"
                  >
                    <span className="group-hover:text-black transition">
                      {item}
                    </span>

                    {/* PREMIUM UNDERLINE */}
                    <span className="absolute left-0 -bottom-[8px] h-[2px] w-0 bg-gradient-to-r from-[#CC0000] to-transparent transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}

                <Link href="/collections/sale" className="text-[#CC0000] font-semibold">
                  Sale
                </Link>
              </nav>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* ICON STYLE */}
              {[
  { icon: User, link: '/account', hideMobile: true },
  { icon: Search, action: () => setSearchOpen(true), hideMobile: true },
  { icon: Heart, link: '/wishlist' },
  { icon: ShoppingBag, link: '/cart' }
].map((item, i) => {
  const Icon = item.icon

  const baseClass =
    "w-[40px] h-[40px] items-center justify-center rounded-full bg-white border border-gray-100 shadow-[0_6px_18px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)] hover:scale-105 transition-all duration-300"

  const mobileHide = item.hideMobile ? "hidden lg:flex" : "flex"

  if (item.action) {
    return (
      <button
        key={i}
        onClick={item.action}
        className={`${mobileHide} ${baseClass}`}
      >
        <Icon className="w-[18px] h-[18px] text-gray-600" />
      </button>
    )
  }

  return (
    <Link
      key={i}
      href={item.link}
      className={`${mobileHide} ${baseClass}`}
    >
      <Icon className="w-[18px] h-[18px] text-gray-600" />
    </Link>
  )
})}

            </div>

          </div>

          {/* 🔥 LOGO (UPGRADED) */}
          <Link href="/" className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">

            <img src="/logo1.png" className="h-[38px] lg:h-[52px]" />

            <span className="text-[13px] lg:text-[18px] tracking-[0.35em] font-semibold uppercase">
              Tirumala
            </span>

            <span className="text-[10px] tracking-[0.45em] text-[#CC0000] uppercase">
              Family Mall
            </span>

          </Link>

        </div>
      </header>

      {/* SEARCH */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* MOBILE DRAWER (UNCHANGED — already good) */}
      {/* 🔥 MOBILE DRAWER */}
<>
  {/* OVERLAY */}
  <div
    className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
      menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}
    onClick={() => setMenuOpen(false)}
  />

  {/* DRAWER */}
<div
  className={`fixed inset-0 w-[88%] max-w-[340px] 
  bg-gradient-to-b from-white via-[#fafafa] to-white
  z-[999] px-6 pt-6 pb-28 h-[100dvh]
  shadow-[30px_0_80px_rgba(0,0,0,0.15)]
  transition-transform duration-300 ease-out
  ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
>

    {/* TOP */}
    <div className="flex items-start text-left justify-between mb-8">

<div className="flex flex-col items-center leading-tight">

  {/* ICON */}
  <img src="/logo1.png" className="h-[40px] lg:h-[50px] mb-1" />

  {/* BRAND NAME */}
  <h1 className="text-[18px] lg:text-[22px] font-semibold uppercase tracking-[0.12em] text-black">
    Tirumala
  </h1>

  {/* SUBTEXT */}
  <p className="text-[10px] tracking-[0.25em] text-[#8b1e1e] uppercase mt-[2px]">
    Family Mall
  </p>

</div>

      <button
        onClick={() => setMenuOpen(false)}
        className="w-[36px] h-[36px] rounded-full bg-white border border-[#eee] shadow-sm flex items-center justify-center"
      >
        <X size={18} />
      </button>

    </div>

    {/* MENU */}
<nav className="flex flex-col mt-6">

  {[
    'Home',
    'Women',
    'Men',
    'Kids',
    'Insta Live'
  ].map((item, i) => (
    <Link
      key={item}
      href={item === 'Home' ? '/' : `/collections/${item.toLowerCase().replace(' ', '-')}`}
      onClick={() => setMenuOpen(false)}
      className="group py-3 flex items-center justify-between border-b border-[#f5f5f5]"
    >
      <span className="text-[18px] font-medium text-black group-hover:tracking-wide transition-all duration-300">
        {item}
      </span>

      <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition">
        →
      </span>
    </Link>
  ))}

  {/* DIVIDER */}
  <div className="my-4 border-t border-[#eee]" />

  {/* SMALL LINKS */}
  <div className="flex flex-col gap-3">
    <Link href="/about" className="text-[14px] text-gray-500 hover:text-black transition">
      About Us
    </Link>

    <Link href="/contact" className="text-[14px] text-gray-500 hover:text-black transition">
      Contact
    </Link>
  </div>

  {/* SALE */}
  <Link
    href="/collections/sale"
    className="text-[16px] text-[#8b1e1e] font-semibold mt-5"
  >
    Sale
  </Link>

</nav>


    {/* CTA */}
<div className="absolute bottom-6 left-6 right-6">

  <Link
    href="/collections/new"
    className="block text-center py-4 rounded-full 
    bg-[#8b1e1e] 
    hover:bg-[#a83232]
    text-white text-[12px] tracking-[0.3em] uppercase
    shadow-[0_8px_25px_rgba(139,30,30,0.25)]
    transition-all duration-300"
  >
    Shop New Arrivals
  </Link>

</div>

  </div>
</>
    </>
  )
}