'use client'

import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useCartStore } from '@/store'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, AlertCircle, Info, Tag, CheckCircle2, Ticket } from 'lucide-react'
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

interface Coupon {
  id: string
  name: string
  code: string
  description?: string
  discount_percent: number
  min_order_value: number
  expires_at: string
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

  // ─── COUPON STATES ───
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, amount: number, percent: number } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  
  // 🔥 ACTIVE COUPONS FROM BACKEND
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (!user) router.replace('/account')
    })
    return () => unsub()
  }, [])


  useEffect(() => {
    async function fetchCoupons() {
      try {
        // CHANGED: Now hitting the public endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/active`) 
        const data = await res.json()
        if (data.success) {
          // The backend is already filtering for active/unexpired, but we can double check
          setAvailableCoupons(data.coupons || [])
        }
      } catch (err) {
        console.error("Failed to load active coupons grid:", err)
      } finally {
        setLoadingCoupons(false)
      }
    }
    fetchCoupons()
  }, [])

  useEffect(() => {
    async function checkShipping() {
      if (form.pincode.length === 6) {
        setIsCheckingShipping(true);
        setError(''); 
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/serviceability?pincode=${form.pincode}`);
          const data = await res.json();
          
          if (!res.ok) {
            setError(data.error || "Could not verify shipping. Please try again.");
            setShippingCost(null);
            return;
          }
          
          if (data.is_serviceable) {
            setShippingCost(Number(data.shipping_cost));
            setEstimatedDays(Number(data.estimated_days));
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

  // ─── EXECUTE VALIDATE & SUBMIT FUNCTION ───
  const runCouponValidation = async (targetCode: string) => {
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode, subtotal: Number(totalPrice()) })
      })
      const data = await res.json()
      
      if (!res.ok || data.error) {
        setCouponError(data.error || 'Invalid coupon')
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon({ code: data.code, amount: data.discountAmount, percent: data.percent })
        setCouponInput('')
      }
    } catch (e) {
      setCouponError('Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    await runCouponValidation(couponInput)
  }

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
      const orderPayload: any = {
        shipping_address: { name, phone, address, city, state, pincode },
        shipping_amount: displayShipping, 
      }
      if (appliedCoupon) {
        orderPayload.coupon_code = appliedCoupon.code;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('tfm_token')}` 
        },
        body: JSON.stringify(orderPayload)
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to place order')
      
      const order = data.order

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
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
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
  const baseSubtotal = Number(totalPrice())
  const finalDiscount = appliedCoupon ? appliedCoupon.amount : 0
  const finalTotal = baseSubtotal - finalDiscount + displayShipping

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

          <div className="space-y-6 max-h-[240px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
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

          {/* ── PROMO CODE CONTAINER ── */}
          <div className="border-t border-gray-100 pt-6 mb-6">
            {!appliedCoupon ? (
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Promo Code" 
                      value={couponInput}
                      onChange={e => {setCouponInput(e.target.value.toUpperCase()); setCouponError('')}}
                      className="w-full border border-gray-200 py-3 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:border-black transition"
                    />
                  </div>
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-6 bg-black text-white rounded-xl text-[12px] font-bold tracking-widest uppercase disabled:opacity-50 hover:bg-[#CC0000] transition"
                  >
                    {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-[11px] mt-2 ml-1">{couponError}</p>}
                
                <p className="text-[10px] text-gray-400 mt-2.5 ml-1 italic flex items-center gap-1.5">
                  <Info size={10} /> Note: Use this coupon for eligible products.
                </p>

                {/* 🔥 DYNAMIC ACTIVE COUPONS DISPLAY ENGINE */}
                {availableCoupons.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                      <Ticket size={12} className="text-gray-400" /> Available Offers
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {availableCoupons.map((coupon) => {
                        const isEligible = baseSubtotal >= Number(coupon.min_order_value)
                        return (
                          <div 
                            key={coupon.id} 
                            onClick={() => isEligible && runCouponValidation(coupon.code)}
                            className={`p-3 rounded-xl border text-left min-w-[200px] flex-shrink-0 transition-all cursor-pointer select-none ${
                              isEligible 
                                ? 'border-dashed border-gray-300 hover:border-black bg-gray-50/50' 
                                : 'border-gray-100 bg-gray-50/30 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm text-black">
                                {coupon.code}
                              </span>
                              <span className="text-[11px] font-bold text-green-600 shrink-0">
                                {Number(coupon.discount_percent)}% OFF
                              </span>
                            </div>
                            <p className="text-[12px] font-semibold mt-2 text-gray-800 line-clamp-1">{coupon.name}</p>
                            {isEligible ? (
                              <p className="text-[10px] text-green-600 font-medium mt-1">Tap to apply code</p>
                            ) : (
                              <p className="text-[9.5px] text-red-500 font-medium mt-1">
                                Add ₹{(Number(coupon.min_order_value) - baseSubtotal).toLocaleString('en-IN')} more to unlock
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <div>
                    <p className="text-[13px] font-bold text-green-800 tracking-wide">{appliedCoupon.code}</p>
                    <p className="text-[10px] text-green-700">{appliedCoupon.percent}% Off Applied!</p>
                  </div>
                </div>
                <button onClick={() => setAppliedCoupon(null)} className="text-[11px] text-red-500 underline font-medium hover:text-red-700">
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-3 mb-8">
            <div className="flex justify-between text-[14px] text-gray-600">
              <span>Subtotal</span>
              <span>₹{baseSubtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between text-[14px] font-medium text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{finalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            )}

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
              <span>₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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