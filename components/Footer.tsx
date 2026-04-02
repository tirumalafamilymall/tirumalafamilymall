'use client'

import Link from 'next/link'
import { Instagram, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-[#0f0f0f] text-gray-400 overflow-hidden">

      {/* 🔥 PREMIUM GLOW */}
      <div className="absolute w-[600px] h-[600px] bg-[#CC0000]/10 blur-[200px] top-[-250px] left-[-200px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-10 pt-16 md:pt-20 pb-24 md:pb-12">

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 mb-14 md:mb-16">

          {/* 🔥 BRAND */}
          <div className="text-center sm:text-left max-w-[300px] mx-auto sm:mx-0">

            <img
              src="/logo1.png"
              className="h-20 sm:h-24 mx-auto sm:mx-0 object-contain mb-5 transition duration-500 hover:scale-105"
            />

            {/* 🔥 BIGGER LOGO TEXT */}
            <p className="heading-serif text-white text-xl sm:text-2xl italic">
              Tirumala
            </p>

            <p className="text-[#CC0000] text-[11px] tracking-[0.45em] uppercase mb-4">
              Family Mall
            </p>

            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
              Premium fashion destination in Tekkali — style, comfort and elegance for every generation.
            </p>

          </div>

          {/* 🔥 QUICK LINKS */}
          <div className="text-center sm:text-left">
            <p className="text-white text-[11px] tracking-[0.35em] uppercase mb-6">
              Quick Links
            </p>

            <ul className="space-y-3">
              {[
                ['Home', '/'],
                ['Shop', '/shop'],
                ['Women', '/collections/women'],
                ['Men', '/collections/men'],
                ['Kids', '/collections/kids'],
                ['About', '/about'],
                ['Contact', '/contact'],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link
                    href={h}
                    className="text-[13px] text-gray-500 hover:text-white transition duration-300 hover:underline underline-offset-4"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 🔥 CATEGORIES */}
          <div className="text-center sm:text-left">
            <p className="text-white text-[11px] tracking-[0.35em] uppercase mb-6">
              Categories
            </p>

            <ul className="space-y-3">
              {[
                ['Sarees', '/collections/sarees'],
                ['Kurtis', '/collections/kurtis'],
                ['Dress Materials', '/collections/dress-materials'],
                ['Nightwear', '/collections/nightwear'],
                ['Men Shirts', '/collections/shirts'],
                ['Kids Frocks', '/collections/girls-frocks'],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link
                    href={h}
                    className="text-[13px] text-gray-500 hover:text-white transition duration-300 hover:underline underline-offset-4"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 🔥 CONTACT */}
          <div className="text-center sm:text-left">
            <p className="text-white text-[11px] tracking-[0.35em] uppercase mb-6">
              Contact
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Tekkali, Srikakulam District,<br />Andhra Pradesh
              </p>

              <a
                href="https://wa.me/919966248223"
                className="text-[13px] text-gray-500 hover:text-white transition duration-300"
              >
                +91 99662 48223
              </a>
            </div>

            {/* 🔥 SOCIAL ICONS */}
            <div className="flex justify-center sm:justify-start gap-3 mb-6">

              <a
                href="https://instagram.com/tirumalafamilymall777"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-full hover:border-[#CC0000] hover:text-white hover:scale-110 transition-all duration-300"
              >
                <Instagram size={18} />
              </a>

              <a
                href="https://wa.me/919966248223"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-full hover:border-[#CC0000] hover:text-white hover:scale-110 transition-all duration-300"
              >
                <Phone size={18} />
              </a>

            </div>

            {/* 🔥 CTA */}
            <a
              href="https://wa.me/919966248223"
              target="_blank"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#CC0000] text-white text-[12px] rounded-full hover:bg-black hover:scale-[1.05] transition-all duration-300"
            >
              Chat on WhatsApp →
            </a>

          </div>

        </div>

        {/* 🔥 DIVIDER */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

        {/* 🔥 BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">

          <p className="text-[12px] text-gray-600">
            © {new Date().getFullYear()} Tirumala Family Mall
          </p>

          <div className="flex flex-wrap justify-center sm:justify-end gap-6">
            {[
              ['Privacy', '/privacy'],
              ['Terms', '/terms'],
              ['Shipping', '/shipping'],
              ['Returns', '/returns'],
              ['Help', '/help'],
            ].map(([l, h]) => (
              <Link
                key={l}
                href={h}
                className="text-[12px] text-gray-600 hover:text-white transition duration-300"
              >
                {l}
              </Link>
            ))}
          </div>

        </div>

      </div>
    </footer>
  )
}