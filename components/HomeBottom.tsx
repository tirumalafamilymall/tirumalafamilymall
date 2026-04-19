'use client'

import Link from 'next/link'
import { useRef } from 'react'


export  function FlashSaleBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">

        <Link
          href="/collections/sale"
          className="group relative block overflow-hidden rounded-[14px] lg:rounded-[16px] shadow-[0_6px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.1)] transition duration-300"
        >

          {/* IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1400&q=90"
            alt="Flash Sale Banner"
            className="w-full h-[220px] sm:h-[240px] lg:h-[260px] object-cover object-center group-hover:scale-[1.04] transition duration-700"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300" />

          {/* CONTENT */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">

  <p className="text-[11px] tracking-[0.4em] uppercase opacity-80 mb-2">
    Limited Time
  </p>

  <h2 className="heading-serif italic text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] font-normal tracking-[0.12em] leading-[1.1] mb-2">
    Flash Sale
  </h2>

  <p className="text-sm opacity-90 mb-4">
    Up to 50% Off
  </p>

  {/* CTA */}
  <span className="inline-block text-[12px] tracking-[0.25em] uppercase border-b border-white pb-1 group-hover:text-[#ff4d4d] group-hover:border-[#ff4d4d] transition-all duration-300">
    Shop Now
  </span>

</div>

        </Link>

      </div>
    </section>
  )
}

import ProductCard, { Product } from './ProductCard'

const PRODUCTS: Product[] = [
  {
    id: 'il1',
    name: '3 Piece Set – Special Edition',
    price: 1049,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=90',
    href: '/products/il1',
    badge: 'Live',
  },
  {
    id: 'il2',
    name: 'Silk Blend Saree',
    price: 1249,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=90',
    href: '/products/il2',
    badge: 'New',
  },
  {
    id: 'il3',
    name: '2 Piece Coord Set',
    price: 799,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=90',
    href: '/products/il3',
  },
  {
    id: 'il4',
    name: 'Anarkali Set – Premium',
    price: 1199,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=90',
    href: '/products/il4',
    badge: 'Trending',
  },
  {
    id: 'il5',
    name: 'Long Frock Design',
    price: 699,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=90',
    href: '/products/il5',
  },
  {
    id: 'il6',
    name: 'Kurti with Plazo',
    price: 899,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=90',
    href: '/products/il6',
  },
  {
    id: 'il7',
    name: 'Cotton Dress Material',
    price: 549,
    originalPrice: 749,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=90',
    href: '/products/il7',
    badge: 'Popular',
  },
  {
    id: 'il8',
    name: 'Lehenga Choli Set',
    price: 1599,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=90',
    href: '/products/il8',
  },
]

export  function InstaLive() {
  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">

          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">
  Live Shopping
</p>

<h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">
  Insta Live
</h2>

            {/* RED ACCENT */}
            <div className="w-10 h-[2px] bg-[#CC0000] mt-3 rounded-full" />
          </div>

          <Link
            href="/collections/insta-live"
            className="px-5 py-2.5 rounded-full 

bg-gray-50
text-gray-800
text-[12px] font-medium tracking-[0.18em]

border border-gray-200

hover:bg-white
hover:border-[#CC0000]
hover:text-[#CC0000]

shadow-[0_6px_20px_rgba(0,0,0,0.05)]
hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]

transition-all duration-300"
          >
            View All
          </Link>

        </div>

        {/* CLEAN CTA STRIP */}
        <a
          href="https://instagram.com/tirumalafamilymall777"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-gray-200 px-6 py-4 mb-10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition"
        >
          <div>
            <p className="text-[13px] font-medium text-gray-900 flex items-center gap-2">
              Watch Live Sessions
              <span className="text-[9px] bg-[#CC0000] text-white px-2 py-0.5 rounded-full tracking-wide animate-pulse">
                LIVE
              </span>
            </p>
            <p className="text-[12px] text-gray-400 mt-1">
              New arrivals showcased daily — @tirumalafamilymall777
            </p>
          </div>

          <span className="text-gray-400 text-lg">→</span>
        </a>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} idx={i} />
          ))}
        </div>

      </div>
    </section>
  )
}


const ITEMS = [
  {
    title: 'Anarkali Sets',
    desc: 'Timeless ethnic elegance',
    href: '/collections/anarkali',
    img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=90',
    big: true,
  },
  {
    title: 'Printed Kurtis',
    href: '/collections/kurtis',
    img: 'https://images.unsplash.com/photo-1622339442030-9c0cdbaff342?w=800&q=90',
  },
  {
    title: 'Cotton Trousers',
    href: '/collections/leggings',
    img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=90',
  },
  {
    title: 'Leggings',
    href: '/collections/leggings',
    img: 'https://images.unsplash.com/photo-1516822003754-cca485356ecb?w=800&q=90',
  },
  {
    title: 'Dress Materials',
    href: '/collections/dress-materials',
    img: 'https://images.unsplash.com/photo-1593032465171-8c6b3b5e0d64?w=800&q=90',
  },
]

export function CategoryHighlight() {
  return (
    <section className="py-16 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* 💎 HEADER */}
        <div className="flex items-end justify-between mb-10">

          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">
  Trending
</p>

<h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">
  New Season Picks
</h2>

            <div className="w-12 h-[2px] bg-[#CC0000] mt-4 rounded-full"></div>
          </div>

          {/* 💎 PREMIUM VIEW ALL BUTTON */}
          <Link
            href="/collections/women"
            className="
            hidden sm:inline-flex items-center gap-2

            px-6 py-2.5 rounded-full

            text-[11px] tracking-[0.25em] uppercase font-medium

            border border-gray-300 text-gray-700

            hover:border-[#CC0000] hover:text-[#CC0000]

            hover:shadow-md

            transition-all duration-300
            "
          >
            View All →
          </Link>

        </div>

        {/* 🔥 MOBILE SLIDER */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory sm:hidden pb-2">

          {ITEMS.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="
              snap-start shrink-0 w-[230px]

              relative rounded-[14px] overflow-hidden

              shadow-[0_10px_30px_rgba(0,0,0,0.08)]
              "
            >
              <div className="h-[190px]">

                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

              </div>

              <div className="absolute inset-0 bg-black/25" />

              <div className="absolute bottom-4 left-5">
                <h3 className="text-[15px] font-medium text-white">
                  {item.title}
                </h3>
                {item.desc && (
                  <p className="text-[11px] text-white/80">
                    {item.desc}
                  </p>
                )}
              </div>
            </Link>
          ))}

        </div>

        {/* 🖥 DESKTOP GRID */}
        <div
          className="hidden sm:grid gap-5"
          style={{
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '200px 200px',
          }}
        >
          {ITEMS.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`
              group relative overflow-hidden

              rounded-[14px]

              shadow-[0_10px_30px_rgba(0,0,0,0.06)]
              hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]

              transition-all duration-300

              ${item.big ? 'row-span-2' : ''}
              `}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-700"
              />

              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition" />

              <div className="absolute bottom-5 left-6">
                <h3 className="text-[17px] font-medium text-white">
                  {item.title}
                </h3>
                {item.desc && (
                  <p className="text-[12px] text-white/80 mt-1">
                    {item.desc}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 💎 MOBILE VIEW ALL */}
        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/collections/women"
            className="
            inline-flex items-center gap-2

            px-7 py-3 rounded-full

            text-[12px] tracking-[0.25em] uppercase font-medium

            bg-black text-white

            shadow-[0_10px_30px_rgba(0,0,0,0.12)]
            hover:bg-[#CC0000]

            transition-all duration-300
            "
          >
            View All →
          </Link>
        </div>

      </div>

      {/* HIDE SCROLLBAR */}
      <style>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}



const REELS = [
  {
    id: 'r1',
    caption: 'New Saree Collection',
    video: '/reels/reel1.mp4',
    category: 'Sarees',
    link: '/collections/sarees',
  },
  {
    id: 'r2',
    caption: "Men's Ethnic Wear",
    video: '/reels/reel1.mp4',
    category: 'Men',
    link: '/collections/mens',
  },
  {
    id: 'r3',
    caption: 'Kids Special',
    video: '/reels/reel1.mp4',
    category: 'Kids',
    link: '/collections/kids',
  },
  {
    id: 'r4',
    caption: 'Festival Collection',
    video: '/reels/reel1.mp4',
    category: 'Festive',
    link: '/collections/festive',
  },
  {
    id: 'r5',
    caption: 'Live Highlights',
    video: '/reels/reel1.mp4',
    category: 'Trending',
    link: '/collections/trending',
  },
]

export function PremiumReels() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const handleMouseEnter = (index: number) => {
    const video = videoRefs.current[index]
    if (video) video.play()
  }

  const handleMouseLeave = (index: number) => {
    const video = videoRefs.current[index]
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <section className="py-24 bg-white">

      <div className="max-w-[1400px] mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-3">
            Instagram
          </p>

          <h2 className="heading-serif italic text-[30px] sm:text-[34px] md:text-[38px] lg:text-[44px]">
            Follow Our Style Stories
          </h2>

          <p className="text-gray-500 text-sm mt-4">
            @tirumalafamilymall777
          </p>

          <div className="w-12 h-[2px] bg-[#c47a5a] mt-5 mx-auto rounded-full"></div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:grid grid-cols-5 gap-6">

          {REELS.map((reel, i) => (
            <a
              key={reel.id}
            href="https://instagram.com/tirumalafamilymall777"
target="_blank"
rel="noopener noreferrer"
              className={`group relative ${
                i === 2
                  ? 'scale-[1.12] z-20'
                  : 'scale-[0.92] opacity-70'
              } hover:scale-[1.05] hover:opacity-100 transition-all duration-500`}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
            >

              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black
                shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                group-hover:shadow-[0_40px_120px_rgba(0,0,0,0.25)]
                transition-all duration-500">

                <video
                  ref={(el) => {
                    videoRefs.current[i] = el
                  }}
                  src={reel.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.05]"
                />

                {/* GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* PREMIUM OVERLAY */}
                <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/5 border-t border-white/10">

                  <span className="text-[10px] tracking-widest uppercase text-gray-300">
                    {reel.category}
                  </span>

                  <h3 className="text-white text-sm font-semibold mt-1">
                    {reel.caption}
                  </h3>

                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-xs text-gray-400">
                      Explore Now →
                    </span>

                    <button className="px-3 py-1 text-[11px] rounded-full bg-white text-black font-medium
                      hover:bg-[#c47a5a] hover:text-white transition">
                      Shop
                    </button>

                  </div>

                </div>

              </div>

            </a>
          ))}

        </div>

        {/* MOBILE */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">

          {REELS.map((reel) => (
            <a
              key={reel.id}
              href="https://instagram.com/tirumalafamilymall777"
target="_blank"
rel="noopener noreferrer"
              className="min-w-[150px] group relative snap-center"
            >

              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-md">

                <video
                  src={reel.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] text-gray-300 uppercase">
                    {reel.category}
                  </span>

                  <p className="text-white text-[11px] font-medium">
                    {reel.caption}
                  </p>
                </div>

              </div>

            </a>
          ))}

        </div>

      </div>

    </section>
  )
}

export default function HomeBottom() {
  return (
    <>
      <FlashSaleBanner />
      <InstaLive />
      <CategoryHighlight />
      <PremiumReels />
    </>
  )
}