'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight, 
  Zap,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';

const PAYMENT_METHODS = [
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery (Moulvibazar Area)', icon: '💵' },
  { id: 'BKASH', label: 'bKash Mobile Payment', icon: '📱' },
  { id: 'NAGAD', label: 'Nagad Mobile Banking', icon: '📲' },
  { id: 'CARD', label: 'Debit / Credit Card', icon: '💳' },
];

export default function CheckoutPage() {
  const { items, subtotal, discount, deliveryCharge, total, clearCart, couponCode } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'address' | 'payment' | 'review' | 'done'>('address');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);

  const [form, setForm] = useState({
    recipientName: user?.name || '',
    phone: '',
    division: 'Sylhet',
    district: 'Moulvibazar',
    upazila: 'Moulvibazar Sadar',
    area: 'Kusumbag Point',
    addressLine: '',
    landmark: '',
    paymentMethod: 'CASH_ON_DELIVERY',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push('/customer/login?redirect=/checkout');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          deliveryAddress: {
            recipientName: form.recipientName,
            phone: form.phone,
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            area: form.area,
            addressLine: form.addressLine,
            landmark: form.landmark,
          },
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderResult(data.order);
        clearCart();
        setStep('done');
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch {
      alert('Network error placing order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <Link href="/shop" className="btn-primary text-xs py-3 px-6">
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-brand-600">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Checkout</span>
      </nav>

      {/* Progress Indicator */}
      {step !== 'done' && (
        <div className="flex items-center gap-3 text-xs font-bold">
          {['address', 'payment', 'review'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-1.5 ${
                  step === s ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="hidden sm:inline capitalize">{s}</span>
              </div>
              {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Order Confirmation Success Screen */}
      {step === 'done' && orderResult && (
        <div className="max-w-lg mx-auto text-center py-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">Order Placed!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Thank you for your purchase. Order reference:
            </p>
            <p className="text-lg font-mono font-black text-brand-600 mt-2">{orderResult.orderNumber}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-xs text-left space-y-2">
            <p><strong>Delivery To:</strong> {orderResult.deliveryAddress?.addressLine}, {orderResult.deliveryAddress?.area}, Moulvibazar</p>
            <p><strong>Payment Method:</strong> {orderResult.paymentMethod?.replace(/_/g, ' ')}</p>
            <p><strong>Total Paid / Payable:</strong> ৳{orderResult.totalAmount?.toLocaleString()}</p>
            <p className="text-slate-500">
              Our team will confirm your order within 30 minutes during business hours. For urgent orders, call <strong>01733 983752</strong>.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/customer/dashboard" className="btn-primary flex-1 text-xs py-3">
              Track in My Account
            </Link>
            <Link href="/shop" className="btn-secondary flex-1 text-xs py-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {step !== 'done' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Multi-Step Form */}
          <div className="lg:col-span-2 space-y-6">
            {!user ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Customer Sign In Required to Checkout
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    To place an order, activate your <strong>official digital warranty</strong>, and receive real-time courier tracking updates, please sign in or register your customer account.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 max-w-sm mx-auto text-xs text-slate-700 flex items-center justify-between shadow-xs">
                  <span className="font-semibold text-slate-600">Reserved in Cart:</span>
                  <span className="font-black text-brand-600">{items.length} items (৳{total.toLocaleString()})</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  <Link
                    href="/customer/login?redirect=/checkout"
                    className="btn-primary w-full sm:w-auto py-3 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
                  >
                    <span>Sign In as Customer</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/customer/register?redirect=/checkout"
                    className="btn-secondary w-full sm:w-auto py-3 px-6 text-xs sm:text-sm font-bold flex items-center justify-center bg-white border-slate-200"
                  >
                    <span>Create Free Account</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: Delivery Address */}
                {step === 'address' && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Recipient Name *</label>
                    <input
                      type="text" name="recipientName" required value={form.recipientName}
                      onChange={handleChange} placeholder="Full Name"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                    <input
                      type="text" name="phone" required value={form.phone}
                      onChange={handleChange} placeholder="01X-XXXXXXXX"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Division</label>
                    <select name="division" value={form.division} onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <option>Sylhet</option>
                      <option>Dhaka</option>
                      <option>Chattogram</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">District</label>
                    <select name="district" value={form.district} onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <option>Moulvibazar</option>
                      <option>Sylhet</option>
                      <option>Habiganj</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Area / Upazila *</label>
                    <select name="area" value={form.area} onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <option>Kusumbag Point</option>
                      <option>Moulvibazar Sadar</option>
                      <option>Court Road Area</option>
                      <option>Sreemangal</option>
                      <option>Kamalganj</option>
                      <option>Rajnagar</option>
                      <option>Kulaura</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Landmark (Optional)</label>
                    <input
                      type="text" name="landmark" value={form.landmark}
                      onChange={handleChange} placeholder="e.g. Opposite Jame Masjid"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Street Address / House # *</label>
                    <input
                      type="text" name="addressLine" required value={form.addressLine}
                      onChange={handleChange} placeholder="House #, Road #, Building Name..."
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setStep('payment')}
                    disabled={!form.recipientName || !form.phone || !form.addressLine}
                    className="btn-primary w-full py-3 text-xs"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment Method */}
            {step === 'payment' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        form.paymentMethod === method.id
                          ? 'border-brand-500 bg-brand-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio" name="paymentMethod" value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={handleChange} className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          form.paymentMethod === method.id ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
                        }`}
                      >
                        {form.paymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-sm font-semibold text-slate-800">{method.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">Order Notes (Optional)</label>
                  <textarea
                    name="notes" value={form.notes} onChange={handleChange}
                    rows={2} placeholder="Special delivery instructions..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep('address')} className="btn-secondary text-xs py-2.5 flex-1">
                    Back
                  </button>
                  <button onClick={() => setStep('review')} className="btn-primary text-xs py-2.5 flex-1">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Confirm */}
            {step === 'review' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">Review &amp; Confirm</h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Delivery Address</h4>
                    <p><strong>{form.recipientName}</strong> &bull; {form.phone}</p>
                    <p>{form.addressLine}, {form.area}, {form.district}, {form.division}</p>
                    {form.landmark && <p className="text-slate-500">Landmark: {form.landmark}</p>}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Items Ordered</h4>
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                        <span className="line-clamp-1 flex-1 text-slate-700">{item.product.name} × {item.quantity}</span>
                        <span className="font-bold text-slate-900 pl-4">
                          ৳{((item.product.discountPrice ?? item.product.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Payment</h4>
                    <p>Method: <strong>{form.paymentMethod.replace(/_/g, ' ')}</strong></p>
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal</span><span className="font-bold">৳{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coupon Discount</span><span className="font-bold">-৳{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-700">
                      <span>Delivery</span><span className="font-bold">{deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 text-sm font-extrabold pt-1 border-t border-slate-200">
                      <span>Total</span><span className="text-brand-600">৳{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep('payment')} className="btn-secondary text-xs py-2.5 flex-1">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="btn-primary text-xs py-2.5 flex-1"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order Now'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

          {/* Right: Static Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 sticky top-24">
              <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Cart Summary
              </h3>
              <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const img = item.product.images?.[0] || '';
                  return (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={img} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ৳{((item.product.discountPrice ?? item.product.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700">Order Total</span>
                <span className="text-lg font-black text-brand-600">৳{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
