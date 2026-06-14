'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import WishlistDrawer from '@/components/WishlistDrawer'
import BottomNav from '@/components/BottomNav'
import { useCartStore, useWishlistStore } from '@/store'

export default function ClientLayout({ children }: any) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
  }, [])

  return (
    <>
      {!isAdmin && <Header />}
      <main className="min-h-screen">{children}</main>
      {!isAdmin && <BottomNav />}
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <WishlistDrawer />}
    </>
  )
}