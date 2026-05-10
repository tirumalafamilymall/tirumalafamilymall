'use client'

import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useCartStore } from '@/store'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck } from 'lucide-react'
import { createOrder, createPaymentOrder, verifyPayment } from '@/lib/api'
import { onAuthChange } from '@/lib/auth'

declare global {
  interface Window {
    Razorpay: any
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { items, totalPrice, clear } = useCartStore()
  const router = useRouter()

  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    address: '',
    city:    '',
    state:   '',
    pincode: '',
    payment: 'online', // Changed default to online
  })

  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [isCheckingShipping, setIsCheckingShipping] = useState(false)

useEffect(() => {
  const unsub = onAuthChange(user => {
    if (!user) router.replace('/account')
  })
  return () => unsub()
}, [])

useEffect(() => {
    async function checkShipping() {
      if (form.pincode.length === 6) {
        setIsCheckingShipping(true)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/serviceability?pincode=${form.pincode}`)
          const data = await res.json()
          
          if (data.is_serviceable) {
            
            const cost = data.shipping_cost
            setShippingCost(cost)
          } else {
            setError("Sorry, we don't deliver to this pincode yet.")
            setShippingCost(null)
          }
        } catch (err) {
          console.error("Shipping check failed")
        } finally {
          setIsCheckingShipping(false)
        }
      } else {
        setShippingCost(null) // Reset if pincode is deleted/incomplete
      }
    }
    checkShipping()
  }, [form.pincode, totalPrice])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleOrder = async () => {
    const { name, phone, address, city, state, pincode } = form

    if (!name || !phone || !address || !city || !state || !pincode) {
      setError('Please fill all shipping details')
      return
    }
    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    if (shippingCost === null && !isCheckingShipping) {
      setError('Please enter a valid pincode to calculate shipping');
      return;
    }

    setError('')
    setLoading(true)

try {
      // Step 1 — PASS SHIPPING AMOUNT TO BACKEND
      const { order } = await createOrder({
        shipping_address: { name, phone, address, city, state, pincode },
        shipping_amount: displayShipping, // <--- PASS THIS HERE
      })

      // Step 2 — Online: open Razorpay
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Failed to load payment gateway')

      // FIXED: using razorpay_order_id to match backend response
      const { razorpay_order_id, amount, currency } = await createPaymentOrder(order.id)

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount,
          currency,
          order_id:    razorpay_order_id, // FIXED: matching new variable name
          name:        'Tirumala Family Mall',
          description: `Order #${order.id.slice(-8).toUpperCase()}`,
          prefill:     { name, contact: phone },
          theme:       { color: '#CC0000' },
          handler: async (response: any) => {
            try {
              await verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                order_id:            order.id,
              })
              clear()
              setSuccess(true)
              setTimeout(() => router.push(`/orders/${order.id}`), 2000)
              resolve()
            } catch {
              reject(new Error('Payment verification failed'))
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        })
        rzp.open()
      })

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayShipping = shippingCost !== null ? shippingCost : 0
  const total = totalPrice() + displayShipping

  return (
    <div className="bg-[#f8f8f8] min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">

        {/* LEFT: FORM */}
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-3">
            Secure Checkout
          </p>
          <h2 className="heading-serif italic text-[32px] mb-8">
            Shipping Details
          </h2>

          <div className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
            />

            <textarea
              name="address"
              placeholder="Street Address / House No."
              rows={2}
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
              />
              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
              />
            </div>

            <input
              name="pincode"
              placeholder="Pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
            />

            {/* Payment */}
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-gray-500 mb-2">
                Payment Method
              </p>
              <select
                name="payment"
                value={form.payment}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-lg bg-white focus:outline-none focus:border-black transition"
              >
                <option value="online">Pay Online (UPI / Card / Razorpay)</option>
              </select>
            </div>

            {error && (
              <p className="text-red-500 text-[13px] bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {success && (
              <p className="text-green-600 text-[13px] bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                Order placed successfully 🎉 Redirecting...
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
              <ShieldCheck size={13} className="text-green-500" />
              Secured & encrypted checkout
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] h-fit sticky top-28">
          <h3 className="heading-serif text-[20px] mb-6">Order Summary</h3>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 mb-6">
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm">Your cart is empty</p>
            ) : (
              items.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-start text-[14px]">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-[12px] text-gray-400">
                      {item.size && `Size: ${item.size} · `}Qty: {item.qty}
                    </p>
                  </div>
                  <span className="font-semibold shrink-0 ml-4">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 space-y-2 mb-6">
<div className="flex justify-between text-[14px]">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900 font-medium">
                {isCheckingShipping ? (
                  <span className="flex items-center gap-1 animate-pulse text-gray-400">Calculating...</span>
                ) : shippingCost === null ? (
                  <span className="text-[11px] text-gray-400 italic">Enter pincode</span>
                ) : (
                  `₹${displayShipping}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-[18px] pt-2 border-t">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleOrder}
            disabled={loading || success}
            className="w-full py-4 bg-black text-white rounded-full text-[12px] tracking-[0.25em] uppercase
            shadow-[0_10px_25px_rgba(0,0,0,0.2)]
            hover:bg-[#CC0000] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)]
            active:scale-95 transition-all duration-300
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

      </div>
    </div>
  )
}