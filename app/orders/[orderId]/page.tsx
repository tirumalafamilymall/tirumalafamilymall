'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Package, MapPin, CreditCard, Truck, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react'
import { getMyOrder } from '@/lib/api'
import { onAuthChange } from '@/lib/auth'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const STATUS_ICON: Record<string, any> = {
  PENDING:   Clock,
  CONFIRMED: CheckCircle2,
  SHIPPED:   Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'text-yellow-600 bg-yellow-50 border-yellow-200',
  CONFIRMED: 'text-blue-600 bg-blue-50 border-blue-200',
  SHIPPED:   'text-purple-600 bg-purple-50 border-purple-200',
  DELIVERED: 'text-green-600 bg-green-50 border-green-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200',
}

const PAYMENT_COLOR: Record<string, string> = {
  PAID:   'text-green-600',
  UNPAID: 'text-red-500',
  COD:    'text-gray-500',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (!user) { router.push('/account'); return }
      getMyOrder(orderId)
        .then(res => setOrder(res.order ?? res))
        .catch(() => setError('Order not found'))
        .finally(() => setLoading(false))
    })
    return () => unsub()
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-gray-300" />
    </div>
  )

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400">{error || 'Order not found'}</p>
      <Link href="/orders" className="text-sm underline text-gray-600">Back to orders</Link>
    </div>
  )

  const addr    = order.shipping_address ?? {}
  const isCancelled = order.status === 'CANCELLED'
  const currentStep = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[900px] mx-auto px-5 lg:px-10 py-3 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <ChevronRight size={10} />
          <Link href="/orders" className="hover:text-gray-700">My Orders</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600">{order.order_number}</span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 lg:px-10 py-8 space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mb-1">Order</p>
              <h1 className="text-[20px] font-semibold text-gray-900">{order.order_number}</h1>
              <p className="text-[12px] text-gray-400 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full border ${STATUS_COLOR[order.status] ?? ''}`}>
                {order.status}
              </span>
              <span className={`text-[11px] font-medium ${PAYMENT_COLOR[order.payment_status] ?? 'text-gray-400'}`}>
                Payment: {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-6">Order Progress</p>
            <div className="flex items-center justify-between relative">
              {/* line */}
              <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-100 z-0" />
              <div
                className="absolute top-4 left-0 h-[2px] bg-gray-900 z-0 transition-all duration-500"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
              {STATUS_STEPS.map((step, i) => {
                const Icon = STATUS_ICON[step]
                const done = i <= currentStep
                return (
                  <div key={step} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide ${done ? 'text-gray-700' : 'text-gray-300'}`}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Tracking */}
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank"
                className="mt-6 flex items-center gap-2 text-[12px] text-blue-600 hover:underline"
              >
                <Truck size={13} /> Track Shipment →
              </a>
            )}
            {order.awb && (
              <p className="mt-2 text-[11px] text-gray-400">AWB: {order.awb}</p>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-3">
            <XCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-[13px] text-red-600">This order has been cancelled.</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-5">
            Items ({order.items?.length ?? 0})
          </p>
          <div className="space-y-4">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">👗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-gray-800 leading-snug">{item.name}</p>
                  <div className="flex flex-wrap gap-x-3 mt-1">
                    {item.size  && <p className="text-[11px] text-gray-400">Size: {item.size}</p>}
                    {item.color && <p className="text-[11px] text-gray-400">Color: {item.color}</p>}
                    {item.brand && <p className="text-[11px] text-gray-400">Brand: {item.brand}</p>}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-gray-400">₹{item.price.toLocaleString('en-IN')} each</p>
                </div>
              </div>
            ))}
          </div>

{/* Total Breakdown */}
          <div className="border-t border-gray-100 mt-6 pt-5 space-y-2">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Subtotal</span>
              {/* Math: Total minus shipping gives you the items price */}
              <span>₹{(Number(order.total_amount) - Number(order.shipping_amount || 0)).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Shipping</span>
              <span className={Number(order.shipping_amount) === 0 ? "text-green-600 font-medium" : "text-gray-900"}>
                {Number(order.shipping_amount) === 0 ? 'FREE' : `₹${Number(order.shipping_amount).toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex justify-between text-[16px] font-bold text-gray-900 pt-3 border-t border-gray-100 mt-2">
              <span>Total Paid</span>
              <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-gray-400" />
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-500">Shipping Address</p>
          </div>
          <p className="text-[13.5px] font-medium text-gray-800">{addr.name}</p>
          <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">
            {addr.address}<br />
            {addr.city}, {addr.state} – {addr.pincode}
          </p>
          <p className="text-[12.5px] text-gray-500 mt-1">📞 {addr.phone}</p>
        </div>

        {/* Payment info */}
        {(order.razorpay_payment_id || order.payment_status) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={14} className="text-gray-400" />
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-500">Payment</p>
            </div>
            <p className={`text-[13px] font-medium ${PAYMENT_COLOR[order.payment_status] ?? 'text-gray-500'}`}>
              {order.payment_status}
            </p>
            {order.razorpay_payment_id && (
              <p className="text-[11px] text-gray-400 mt-1">ID: {order.razorpay_payment_id}</p>
            )}
          </div>
        )}

        {/* Help */}
        <div className="text-center pt-4">
          <p className="text-[12px] text-gray-400 mb-3">Need help with this order?</p>
          <a
            href={`https://wa.me/919966248223?text=${encodeURIComponent(`Hi, I need help with order ${order.order_number}`)}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white text-[12px] font-medium rounded-full hover:bg-green-600 transition"
          >
            Contact on WhatsApp
          </a>
        </div>

      </div>
    </div>
  )
}