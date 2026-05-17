import HomeTop from '@/components/HomeTop'
import HomeBottom from '@/components/HomeBottom'
import { getStorefrontConfig } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let config = null

  try {
    const data = await getStorefrontConfig()
    if (data?.success) config = data.content
  } catch (error) {
    console.error("Failed to fetch storefront layout from backend API:", error)
  }

  // Pure frontend fallbacks if database is empty
  const safeConfig = config || {
    heroSlider: [{ img: 'https://via.placeholder.com/1400x700?text=Upload+Banner+in+Admin', href: '#' }],
    shopByCategory: Array(6).fill({ name: 'Category', href: '#', img: 'https://via.placeholder.com/400' }),
    discoverStyle: { women: '', men: '', kids: '' },
    flashSale: { img: 'https://via.placeholder.com/1400x300?text=Flash+Sale+Banner' },
    newSeason: Array(5).fill({ title: 'Trending', desc: 'Description', href: '#', img: 'https://via.placeholder.com/500', big: false })
  }

  return (
    <>
      <HomeTop config={safeConfig} />
      <HomeBottom config={safeConfig} />
    </>
  )
}