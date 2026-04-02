'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bg-white text-[#111] overflow-hidden">

      {/* 🔥 HERO (UPGRADED) */}
{/* 🔥 BALANCED HERO (MATCHES SITE) */}
<section className="py-24 bg-[#fafafa] text-center px-6">

  <p className="text-xs tracking-[4px] uppercase text-[#CC0000] mb-3">
    About Us
  </p>

  <h1 className="heading-serif text-5xl italic mb-4">
    Tirumala Family Mall
  </h1>

  <p className="text-gray-500 text-sm max-w-md mx-auto">
    Premium fashion for every generation, blending tradition with modern style.
  </p>

</section>

      {/* 🔥 STORY (MORE PREMIUM) */}
      <section className="py-32 px-6 md:px-16 relative">

        {/* subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-[#fafafa] -z-10" />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-24 items-center">

          {/* TEXT */}
          <div className="max-w-md">
            <h2 className="heading-serif text-5xl italic mb-8 leading-tight">
              Built for <br /> Families
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Located in Tekkali, Tirumala Family Mall blends tradition with modern fashion.
            </p>

            <p className="text-gray-600 text-sm leading-relaxed">
              Every collection is curated with elegance, comfort, and timeless design.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative flex justify-center">

            <div className="w-[75%] group">
              <img
                src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80"
                className="rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.15)] group-hover:scale-105 transition duration-700"
              />
            </div>

            {/* floating card */}
            <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md border rounded-2xl px-6 py-4 shadow-xl">
              <p className="text-lg font-semibold text-[#CC0000]">5000+</p>
              <p className="text-xs text-gray-500">Happy Customers</p>
            </div>

          </div>

        </div>

      </section>

      {/* 🔥 DARK STRIP (UPGRADED) */}
      <section className="bg-black text-white py-24 text-center px-6">

        <h2 className="heading-serif text-5xl italic mb-10">
          Why We Are Different
        </h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">

          {[
            'Premium Quality',
            'Affordable Pricing',
            'Wide Variety',
            'Trusted Brand',
          ].map((item) => (
            <div
              key={item}
              className="p-8 rounded-2xl border border-white/10 hover:bg-white hover:text-black transition duration-500 hover:scale-[1.05]"
            >
              <p className="text-sm tracking-wide">{item}</p>
            </div>
          ))}

        </div>

      </section>

      {/* 🔥 SHOWCASE (MORE PREMIUM GRID) */}
<section className="py-32 px-6 md:px-16">

  <h2 className="heading-serif text-5xl italic text-center mb-16">
    Designed for Every Occasion
  </h2>

  <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

    {[
      {
        img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
        title: "Women Collection",
        link: "/collections/women",
      },
      {
        img: "https://images.unsplash.com/photo-1583391733956-6c77a90c2c59?w=600&q=80",
        title: "Men Collection",
        link: "/collections/men",
      },
      {
        img: "https://images.unsplash.com/photo-1622339442030-9c0cdbaff342?w=600&q=80",
        title: "Kids Collection",
        link: "/collections/kids",
      },
    ].map((item, i) => (
      <Link key={i} href={item.link} className="group block">

        <div className="relative overflow-hidden rounded-2xl">

          {/* IMAGE */}
          <img
            src={item.img}
            className="w-full h-[350px] object-cover group-hover:scale-110 transition duration-700"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />

          {/* TEXT */}
          <div className="absolute bottom-6 left-6 text-white">
            <p className="heading-serif text-xl italic">
              {item.title}
            </p>
          </div>

        </div>

      </Link>
    ))}

  </div>

</section>

      {/* 🔥 CTA (ENHANCED) */}
      <section className="py-24 text-center relative">

        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa] to-white -z-10" />

        <h2 className="heading-serif text-5xl italic mb-6">
          Visit Our Store
        </h2>

        <p className="text-gray-500 text-sm mb-8">
          Tekkali, Srikakulam • Open Daily 9AM – 9PM
        </p>

        <div className="flex justify-center gap-4">

          <a
            href="https://wa.me/919966248223"
            className="bg-[#CC0000] text-white px-10 py-3 rounded-full text-sm hover:scale-105 transition"
          >
            WhatsApp →
          </a>

          <Link
            href="/shop"
            className="border px-10 py-3 rounded-full text-sm hover:bg-black hover:text-white transition"
          >
            Shop Now
          </Link>

        </div>

      </section>

    </main>
  )
}