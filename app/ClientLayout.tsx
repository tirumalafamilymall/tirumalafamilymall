'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import WishlistDrawer from '@/components/WishlistDrawer'
import BottomNav from '@/components/BottomNav'
import QuickViewModalWrapper from '@/components/QuickViewModalWrapper'

export default function ClientLayout({ children }: any) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {/* ❌ REMOVE ALL THESE IN ADMIN */}
      {!isAdmin && <Header />}

      <main className="min-h-screen">{children}</main>

      {!isAdmin && <BottomNav />}
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <WishlistDrawer />}
      {!isAdmin && <QuickViewModalWrapper />}
    </>
  )
}