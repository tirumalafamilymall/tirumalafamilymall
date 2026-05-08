'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'
import { getMyOrders } from '@/lib/api'
import { onAuthChange } from '@/lib/auth'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED:   'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const PAYMENT_COLORS: Record<string, string> = {
  PAID:   'text-green-600',
  UNPAID: 'text-red-500',
  COD:    'text-gray-500',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (!user) {
        router.push('/account')
        return
      }
      getMyOrders()
        .then(res => setOrders(res.orders ?? []))
        .catch(() => setError('Failed to load orders'))
        .finally(() => setLoading(false))
    })
    return () => unsub()
  }, [])

  return (
    <div className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto px-5 lg:px-10 py-3">
          <p className="text-[11px] text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-600">My Orders</span>
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-5 lg:px-10 py-10">

        <h1 className="text-[24px] font-light text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-gray-400 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
              <ShoppingBag size={30} className="text-gray-300" />
            </div>
            <p className="text-[16px] font-light text-gray-600">No orders yet</p>
            <p className="text-[13px] text-gray-400">Your orders will appear here once you place one.</p>
            <Link href="/collections/all"
              className="mt-2 px-8 py-3 bg-gray-900 text-white text-[12.5px] font-medium tracking-[0.08em] rounded-xl hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* LEFT */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{order.order_number}</p>
                      <p className="text-[11.5px] text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-[11.5px] text-gray-500 mt-1">
                        {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                        {' · '}
                        <span className="font-medium text-gray-700">
                          ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[10.5px] font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                    <span className={`text-[10.5px] ${PAYMENT_COLORS[order.payment_status] ?? 'text-gray-400'}`}>
                      {order.payment_status}
                    </span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition mt-1" />
                  </div>

                </div>

                {/* Item thumbnails */}
                {order.items?.length > 0 && (
                  <div className="flex gap-2 mt-4 pl-14">
                    {order.items.slice(0, 4).map((item: any, i: number) => (
                      <div key={i} className="w-12 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👗</div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-[11px] text-gray-400 shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}