'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ProductCard, { Product } from './ProductCard'
const SLIDES = [
  { id: 1, img: '/banners/festival-wear-banner.png', alt: 'Saree Collection', href: '/collections/women' },
  { id: 2, img: '/banners/kids-banner.png', alt: 'New Arrivals', href: '/collections/kids' },
  { id: 3, img: '/banners/wome-banner2.png', alt: 'Festive Wear', href: '/collections/women' },
  { id: 4, img: '/banners/kids-banner.png', alt: 'Exclusive Deals', href: '/collections/kids' },
]

export function HeroSlider() {
  const [curr, setCurr] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)
  const [drag, setDrag] = useState<number | null>(null)
const [isDragging, setIsDragging] = useState(false)

  const go = useCallback((next: number, direction: 1 | -1 = 1) => {
    setDir(direction)
    setPrev(curr)
    setCurr(next)
    setTimeout(() => setPrev(null), 600)
  }, [curr])

  const next = () => go((curr + 1) % SLIDES.length, 1)
  const goTo = (i: number) => go(i, i > curr ? 1 : -1)

useEffect(() => {
  const t = setInterval(next, 4500)
  return () => clearInterval(t)
}, [next])

  /* swipe */
const onTouchStart = (e: React.TouchEvent) => {
  setDrag(e.touches[0].clientX)
  setIsDragging(false)
}

const onTouchEnd = (e: React.TouchEvent) => {
  if (drag === null) return

  const d = drag - e.changedTouches[0].clientX

  if (Math.abs(d) > 50) {
    setIsDragging(true)
    d > 0 ? next() : go((curr - 1 + SLIDES.length) % SLIDES.length, -1)
  }

  setDrag(null)
}

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      style={{ height: 'clamp(260px, 52vw, 680px)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {SLIDES.map((slide, i) => {
        const isActive = i === curr
        const isLeaving = i === prev

        return (
         <Link
  key={slide.id}
  href={slide.href}
  onClick={(e) => {
    if (isDragging) e.preventDefault()
  }}
            className="absolute inset-0 block transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: isActive ? 1 : isLeaving ? 0 : 0,
              transform: isActive
                ? 'scale(1)'
                : isLeaving
                ? `scale(1.04) translateX(${dir * -3}%)`
                : `scale(0.96) translateX(${dir * 3}%)`,
              zIndex: isActive ? 2 : isLeaving ? 1 : 0,
            }}
          >
            {/* IMAGE */}
            <img
              src={slide.img}
              alt={slide.alt}
              className="w-full h-full object-cover object-center transition-transform duration-[4000ms] ease-linear scale-[1.05]"
            />

            {/* PREMIUM OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </Link>
        )
      })}

      {/* ARROWS */}
   

  

      {/* DOTS */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === curr
                ? 'w-6 h-[2px] bg-black'
                : 'w-2 h-[2px] bg-gray-400/60 hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}



const CATS = [
  { name: 'Ethnic Wear', href: '/collections/sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=90' },
  { name: 'Kurtis', href: '/collections/kurtis', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=90' },
  { name: 'Activewear', href: '/collections/tops', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=90' },
  { name: 'Western Wear', href: '/collections/dress-materials', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=90' },
  { name: 'Frocks', href: '/collections/frocks', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=90' },
  { name: 'Kids Wear', href: '/collections/kids', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=90' },
  { name: 'Nightwear', href: '/collections/nightwear', img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=90' },
  { name: 'Innerwear', href: '/collections/innerwear', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=90' },
  { name: 'Lingerie', href: '/collections/lingerie', img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=90' },
  { name: 'Accessories', href: '/collections/accessories', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=90' },
  { name: 'Grooming', href: '/collections/grooming', img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=90' },
  { name: 'Beauty', href: '/collections/beauty', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=90' },
]

export function ShopByCategory() {
  const [showAll, setShowAll] = useState(false)

  return (
    <section className="py-16 bg-white">

      <div className="max-w-[1400px] mx-auto px-4 lg:px-10">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">
            Shop by Category
          </h2>
          <div className="w-14 h-[3px] bg-[#CC0000] mt-4 mx-auto rounded-full"></div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">

          {CATS.map((cat, i) => {
            // 👇 MOBILE: show only first 4 unless expanded
            if (!showAll && i >= 4) {
              return (
                <div key={i} className="hidden md:block">
                  <Link href={cat.href} className="group block">

                    <div className="overflow-hidden rounded-xl 
                      shadow-[0_8px_25px_rgba(0,0,0,0.05)]
                      group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                      transition duration-300">

                      <div className="relative">
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="w-full h-[180px] sm:h-[200px] object-cover group-hover:scale-[1.08] transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 text-white text-center py-3 
                          bg-gradient-to-t from-[#cc0000]/90 via-[#cc0000]/70 to-transparent">

                          <p className="text-[13px] font-semibold tracking-[0.06em]">
                            {cat.name}
                          </p>

                          <p className="text-[11px] tracking-[0.2em] uppercase opacity-90">
                            Shop Now →
                          </p>

                        </div>
                      </div>

                    </div>

                  </Link>
                </div>
              )
            }

            return (
              <Link key={cat.name} href={cat.href} className="group block">

                <div className="overflow-hidden rounded-xl 
                  shadow-[0_8px_25px_rgba(0,0,0,0.05)]
                  group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                  transition duration-300">

                  <div className="relative">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-[180px] sm:h-[200px] object-cover group-hover:scale-[1.08] transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 text-white text-center py-3 
                      bg-gradient-to-t from-[#cc0000]/90 via-[#cc0000]/70 to-transparent">

                      <p className="text-[13px] font-semibold tracking-[0.06em]">
                        {cat.name}
                      </p>

                      <p className="text-[11px] tracking-[0.2em] uppercase opacity-90">
                        Shop Now →
                      </p>

                    </div>
                  </div>

                </div>

              </Link>
            )
          })}

        </div>

        {/* 👇 VIEW MORE (ONLY MOBILE) */}
        {!showAll && (
          <div className="text-center mt-6 md:hidden">
            <button
              onClick={() => setShowAll(true)}
              className="text-[12px] tracking-[0.2em] uppercase text-[#cc0000] font-medium"
            >
              View More →
            </button>
          </div>
        )}

      </div>

    </section>
  )
}



export function OfferBanner() {
  return (
    <section className="py-20 bg-white">

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* 🔥 HEADER (MATCHING YOUR SITE STYLE) */}
        <div className="text-center mb-14">

         <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">
  Collections
</p>

<h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] font-normal tracking-[0.06em] leading-[1.1] text-black">
  Discover Your Style
</h2>

          <div className="w-12 h-[2px] bg-[#CC0000] mt-4 mx-auto rounded-full"></div>

        </div>

        <div className="space-y-6">

          {/* TOP 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* WOMEN */}
            <Link
              href="/collections/women"
              className="group relative overflow-hidden rounded-xl 
              shadow-[0_10px_35px_rgba(0,0,0,0.06)]
              hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
              transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=90"
                alt="Women Collection"
                className="w-full h-[260px] sm:h-[300px] object-cover group-hover:scale-[1.05] transition duration-700"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/70 transition" />

              {/* TEXT */}
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-[10px] tracking-[0.4em] uppercase opacity-80 mb-2">
                  New Arrivals
                </p>

                <h3 className="heading-serif text-[28px] md:text-[32px] mb-2">
                  Women's Edit
                </h3>

                <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1">
                  Shop Now
                </span>
              </div>
            </Link>

            {/* MEN */}
            <Link
              href="/collections/men"
              className="group relative overflow-hidden rounded-xl 
              shadow-[0_10px_35px_rgba(0,0,0,0.06)]
              hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
              transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=90"
                alt="Men Collection"
                className="w-full h-[260px] sm:h-[300px] object-cover group-hover:scale-[1.05] transition duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition" />

              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-[10px] tracking-[0.4em] uppercase opacity-80 mb-2">
                  MODERN CLASSICS
                </p>

                <h3 className="heading-serif text-[26px] md:text-[30px] mb-2">
                  Men's Edit
                </h3>

                <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1">
                  Shop Now
                </span>
              </div>
            </Link>

          </div>

          {/* FULL WIDTH */}
          <Link
            href="/collections/kids"
            className="group relative overflow-hidden rounded-xl 
            shadow-[0_10px_35px_rgba(0,0,0,0.06)]
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
            transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=90"
              alt="Kids Collection"
              className="w-full h-[220px] sm:h-[260px] object-cover group-hover:scale-[1.05] transition duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:bg-black/35 transition" />

            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[10px] tracking-[0.4em] uppercase opacity-80 mb-2">
                PLAYFUL PICKS
              </p>

              <h3 className="heading-serif text-[26px] md:text-[30px] mb-2">
                Kids Edit
              </h3>

              <span className="text-[12px] tracking-[0.2em] uppercase border-b border-white pb-1">
                Shop Now
              </span>
            </div>
          </Link>

        </div>

      </div>
    </section>
  )
}


/* 🔥 TABS */
const TABS = [
  { id: 'new', label: 'New Arrivals' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
]

/* 🔥 DYNAMIC LINKS */
const TAB_LINKS: Record<string, string> = {
  new: '/collections/new',
  women: '/collections/women',
  men: '/collections/men',
  kids: '/collections/kids',
}

/* 🔥 PRODUCT GENERATOR */
const makeProducts = (
  prefix: string,
  names: string[],
  prices: number[]
): Product[] =>
  names.map((name, i) => ({
    id: `${prefix}${i}`,
    name,
    price: prices[i],
    originalPrice: i % 3 === 0 ? prices[i] + 200 : undefined,
    image: '',
    href: `/products/${prefix}-${i}`,
    badge:
      i === 0
        ? 'New'
        : i === 1
        ? 'Trending'
        : i === 3
        ? 'Popular'
        : undefined,
  }))

/* 🔥 PRODUCTS WITH IMAGES */
const PRODUCTS: Record<string, Product[]> = {
  new: makeProducts(
    'n',
    [
      'Silk Blend Saree',
      'Embroidered Kurti Set',
      'Cotton Anarkali',
      '3 Piece Coord Set',
      'Linen Shirt Men',
      'Girls Lehenga Set',
      'Palazzo Kurti Combo',
      'Boys Kurta Set',
    ],
    [1299, 699, 999, 1049, 599, 799, 849, 649]
  ).map((p, i) => ({
    ...p,
image: [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
  'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80',
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',
  'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
][i]
  })),

  women: makeProducts(
    'w',
    [
      'Georgette Saree',
      'Palazzo Kurti Set',
      'Nighty Full Length',
      'Western Crop Top',
      'Cotton Leggings',
      'Half Saree Set',
      'Printed Frock',
      'Blouse Readymade',
    ],
    [1199, 899, 449, 499, 249, 1499, 699, 299]
  ).map((p, i) => ({
    ...p,
image: [
  'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80',
  'https://images.unsplash.com/photo-1593032465171-8b6b5f3b5b0e?w=600&q=80',
][i]
  })),

  men: makeProducts(
    'm',
    [
      'Full Sleeve Shirt',
      'Cotton Trouser',
      'Ethnic Kurtha',
      'Ramraj Dhoti',
      'Formal Blazer',
      'Sports T-Shirt',
      'Slim Fit Jeans',
      'Sherwani Set',
    ],
    [549, 649, 749, 399, 1499, 349, 799, 2499]
  ).map((p, i) => ({
    ...p,
image: [
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80',
  'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&q=80',
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80',
  'https://images.unsplash.com/photo-1583391733956-6c77a90c2c59?w=600&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
  'https://images.unsplash.com/photo-1593032465171-8b6b5f3b5b0e?w=600&q=80',
][i]
  })),

  kids: makeProducts(
    'k',
    [
      'Girls Frock',
      'Boys Kurta Set',
      'Girls Lehenga',
      'Boys Denim Set',
      'Girls Dress',
      'Boys Sherwani',
      'Girls Co-ord Set',
      'Kids Night Suit',
    ],
    [499, 599, 799, 549, 449, 899, 649, 399]
  ).map((p, i) => ({
    ...p,
image: [
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
  'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80',
  'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80',
  'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80',
  'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600&q=80',
][i]
  })),
}

export function FeaturedProducts() {
  const [tab, setTab] = useState('new')

  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* 🔥 HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">

          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">
  Explore
</p>

<h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">
  Our Collection
</h2>

            <div className="w-12 h-[2px] bg-[#CC0000] mt-4 rounded-full"></div>
          </div>

          {/* 🔥 TABS */}
          <div className="flex gap-6 border-b border-gray-200">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-2 text-[13px] font-medium tracking-wide border-b-2 transition-all duration-300
                ${
                  tab === t.id
                    ? 'border-[#CC0000] text-black'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>

        {/* 🔥 PRODUCTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {PRODUCTS[tab].map((p, i) => (
            <ProductCard key={p.id} product={p} idx={i} />
          ))}
        </div>

        {/* 💎 DYNAMIC CTA BUTTON */}
        <div className="text-center mt-14">
          <Link
            href={TAB_LINKS[tab]}
            className="
            inline-flex items-center gap-2
            px-8 py-3 rounded-full

            text-[12px] tracking-[0.25em] uppercase font-medium

            bg-black text-white

            shadow-[0_10px_30px_rgba(0,0,0,0.12)]
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]

            hover:bg-[#CC0000]
            hover:-translate-y-1

            transition-all duration-300
            "
          >
            View All {TABS.find(t => t.id === tab)?.label} →
          </Link>
        </div>

      </div>
    </section>
  )
}

export default function HomeTop() {
  return (
    <>
      <HeroSlider />
      <ShopByCategory />
      <OfferBanner />
      <FeaturedProducts />
    </>
  )
}