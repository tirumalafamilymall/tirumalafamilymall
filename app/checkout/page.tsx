'use client'

import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useCartStore } from '@/store'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, AlertCircle, Info } from 'lucide-react'
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
    payment: 'online', 
  })

  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null) 
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
        setIsCheckingShipping(true);
        setError(''); 
        
        try {
          // Verify with the Shipping API
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/serviceability?pincode=${form.pincode}`);
          const data = await res.json();
          
          if (!res.ok) {
            setError(data.error || "Could not verify shipping. Please try again.");
            setShippingCost(null);
            return;
          }
          
if (data.is_serviceable) {
            setShippingCost(Number(data.shipping_cost));
            setEstimatedDays(Number(data.estimated_days)); // 🔥 ADD THIS LINE
            setError(''); 
          } else {
            setError("Sorry, we don't deliver to this pincode yet.");
            setShippingCost(null);
          }
        } catch (err) {
          setError("Shipping service is currently unavailable.");
        } finally {
          setIsCheckingShipping(false);
        }
      } else {
        setShippingCost(null);
      }
    }
    checkShipping();
  }, [form.pincode]);

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
      const { order } = await createOrder({
        shipping_address: { name, phone, address, city, state, pincode },
        shipping_amount: displayShipping, 
      })

      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Failed to load payment gateway')

      const { razorpay_order_id, amount, currency, key_id } = await createPaymentOrder(order.id)

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         key_id,
          amount,
          currency,
          order_id:    razorpay_order_id, 
          name:        'Tirumala Family Mall',
          description: `Order #${order.order_number}`,
          prefill:     { name, contact: phone },
          theme:       { color: '#000000' },
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
  const total = Number(totalPrice()) + displayShipping

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">

        {/* LEFT: FORM */}
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-3">Secure Checkout</p>
          <h2 className="heading-serif italic text-[32px] mb-8">Shipping Details</h2>

          <div className="space-y-4">
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange}
              className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:outline-none focus:border-black transition shadow-sm" />

            <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange}
              className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:outline-none focus:border-black transition shadow-sm" />

            <textarea name="address" placeholder="Street Address / House No." rows={2} value={form.address} onChange={handleChange}
              className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:outline-none focus:border-black transition shadow-sm" />

            <div className="grid grid-cols-2 gap-4">
              <input name="city" placeholder="City" value={form.city} onChange={handleChange}
                className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:outline-none focus:border-black transition shadow-sm" />
              <input name="state" placeholder="State" value={form.state} onChange={handleChange}
                className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:outline-none focus:border-black transition shadow-sm" />
            </div>

            <input name="pincode" placeholder="Pincode (6 Digits)" value={form.pincode} onChange={handleChange} maxLength={6}
              className="w-full border border-gray-200 p-4 rounded-xl bg-white focus:outline-none focus:border-black transition shadow-sm" />

            <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
              <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-3">Payment Method</p>
              <div className="flex items-center gap-3 p-3 border border-black rounded-lg bg-black/5">
                 <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white"/></div>
                 <span className="text-[13px] font-medium">Online Payment (UPI, Card, NetBanking)</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
                <Info size={12}/> Cash on Delivery (COD) is not available.
              </p>
            </div>

            {error && <p className="text-red-500 text-[13px] bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle size={14}/> {error}</p>}
            {success && <p className="text-green-600 text-[13px] bg-green-50 border border-green-100 px-4 py-3 rounded-xl">Order placed successfully 🎉 Redirecting...</p>}
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-fit sticky top-28">
          <h3 className="heading-serif text-[22px] mb-8">Order Summary</h3>

          <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
            {items.map(item => (
              <div key={`${item.variantId}`} className="flex justify-between items-start text-[14px]">
                <div className="flex gap-4">
                  <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {item.size && `Size: ${item.size}`} {item.color && ` · ${item.color}`}
                    </p>
                    <p className="text-[12px] text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">₹{(Number(item.price) * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
            <div className="flex justify-between text-[14px] text-gray-600">
              <span>Subtotal</span>
              <span>₹{Number(totalPrice()).toLocaleString('en-IN')}</span>
            </div>
<div className="flex justify-between text-[14px]">
              <span className="text-gray-600 flex flex-col">
                Shipping
                {estimatedDays && (
                  <span className="text-[10px] text-green-600 font-bold tracking-wide mt-0.5">
                    Est. Delivery: {estimatedDays} - {estimatedDays + 2} Days
                  </span>
                )}
              </span>
              <span className="text-gray-900 font-bold">
                {isCheckingShipping ? <span className="animate-pulse text-gray-300">Calculating...</span> : shippingCost === null ? '—' : `₹${displayShipping}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[20px] pt-4 border-t border-gray-100 text-black">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* STORE POLICY BOX */}
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl mb-6">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
               <AlertCircle size={13}/> Store Policy
            </h4>
            <ul className="text-[11px] text-amber-700/80 space-y-1 leading-relaxed">
              <li>• All sales are final. No returns or refunds.</li>
              <li>• Orders cannot be cancelled once placed.</li>
              <li>• By clicking "Pay Now", you agree to these terms.</li>
            </ul>
          </div>

          <button onClick={handleOrder} disabled={loading || success || items.length === 0}
            className="w-full py-4 bg-black text-white rounded-full text-[12px] font-bold tracking-[0.25em] uppercase
            shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:bg-[#CC0000] active:scale-[0.98] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16}/>}
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          
          <p className="text-center text-[11px] text-gray-400 mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-green-500"/> Payments secured by Razorpay
          </p>
        </div>

      </div>
    </div>
  )
}