'use client';

import React, { useState, useEffect } from 'react';
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
  Truck,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { BANGLADESH_DISTRICTS, DistrictData } from '@/lib/data/districts';

const BANGLADESH_DIVISIONS = [
  'Sylhet',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

const PAYMENT_METHODS = [
  { 
    id: 'CASH_ON_DELIVERY', 
    label: 'Cash on Delivery (Courier Doorstep)', 
    desc: 'Pay in cash to delivery agent after inspecting parcel.',
    icon: '💵' 
  },
  { 
    id: 'BKASH', 
    label: 'bKash Mobile Payment (Merchant 01733983752)', 
    desc: 'Send payment to official bKash Merchant and enter TrxID below.',
    icon: '📱' 
  },
  { 
    id: 'NAGAD', 
    label: 'Nagad Mobile Banking (01733983752)', 
    desc: 'Send payment via Nagad and provide your TrxID below.',
    icon: '📲' 
  },
  { 
    id: 'CARD', 
    label: 'Bank Card / Online Gateway', 
    desc: 'Visa, Mastercard, or direct bank transfer confirmation.',
    icon: '💳' 
  },
];

export default function CheckoutPage() {
  const { items, subtotal, discount, deliveryCharge, total, clearCart, deliveryDistrict, setDeliveryDistrict } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'address' | 'payment' | 'review' | 'done'>('address');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);

  const [form, setForm] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    division: 'Sylhet',
    district: 'Moulvibazar',
    upazila: 'Moulvibazar Sadar',
    area: 'Kusumbag Point',
    addressLine: '',
    landmark: '',
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentTrxId: '',
    notes: '',
  });

  // Filter districts belonging to the selected division
  const availableDistricts = BANGLADESH_DISTRICTS.filter(
    (d) => d.division.toLowerCase() === form.division.toLowerCase()
  );

  // Selected district info (for delivery window & coverage notes)
  const currentDistrictInfo: DistrictData | undefined = BANGLADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === form.district.toLowerCase()
  );

  useEffect(() => {
    if (user?.name && !form.recipientName) {
      setForm((prev) => ({ ...prev, recipientName: user.name || '' }));
    }
    if (user?.phone && !form.phone) {
      setForm((prev) => ({ ...prev, phone: user.phone || '' }));
    }
  }, [user]);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDivision = e.target.value;
    const firstDistrict = BANGLADESH_DISTRICTS.find(
      (d) => d.division.toLowerCase() === newDivision.toLowerCase()
    );
    const newDistrict = firstDistrict ? firstDistrict.name : 'Dhaka';
    setForm((prev) => ({
      ...prev,
      division: newDivision,
      district: newDistrict,
      upazila: `${newDistrict} Sadar`,
      area: `${newDistrict} Sadar`,
    }));
    setDeliveryDistrict(newDistrict);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setForm((prev) => ({
      ...prev,
      district: newDistrict,
      upazila: `${newDistrict} Sadar`,
      area: `${newDistrict} Sadar`,
    }));
    setDeliveryDistrict(newDistrict);
  };

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
          paymentTrxId: form.paymentTrxId ? form.paymentTrxId.trim() : undefined,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderResult(data.order);
        clearCart();
        setStep('done');
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch {
      alert('Network error while placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add laptops, CCTV systems, networking gear, or electrical accessories from our catalog to proceed.
        </p>
        <Link href="/shop" className="btn-primary text-xs py-3 px-6 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-brand-600">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">National Checkout</span>
      </nav>

      {/* Progress Steps */}
      {step !== 'done' && (
        <div className="flex items-center gap-3 text-xs font-bold">
          {['address', 'payment', 'review'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-1.5 ${
                  step === s ? 'text-brand-600 font-black' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s ? 'bg-brand-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="capitalize">{s === 'address' ? 'Delivery Address' : s}</span>
              </div>
              {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ORDER CONFIRMATION / TAX INVOICE SCREEN */}
      {step === 'done' && orderResult && (
        <div className="max-w-2xl mx-auto text-center py-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Order Confirmed &bull; NEED ELECTRO
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">Order Successfully Placed!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your official order reference has been registered with our courier dispatch department.
            </p>
            <p className="text-xl font-mono font-black text-brand-600 mt-2">{orderResult.orderNumber}</p>
          </div>

          {/* Printable Invoice Summary Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-xs text-left space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Official Order Summary</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Estimated Delivery: <strong>{currentDistrictInfo?.deliveryTimeDays || '2-4 Days'}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Delivery Destination:</p>
                <p>{orderResult.deliveryAddress?.recipientName} ({orderResult.deliveryAddress?.phone})</p>
                <p>{orderResult.deliveryAddress?.addressLine}</p>
                <p>{orderResult.deliveryAddress?.upazila}, {orderResult.deliveryAddress?.district}, {orderResult.deliveryAddress?.division}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Billing &amp; Payment:</p>
                <p>Method: <strong>{orderResult.paymentMethod?.replace(/_/g, ' ')}</strong></p>
                <p>Status: <strong className="text-emerald-600">{orderResult.paymentStatus}</strong></p>
                {orderResult.paymentTrxId && <p>TrxID: <span className="font-mono">{orderResult.paymentTrxId}</span></p>}
                <p className="font-bold text-slate-900 pt-1">
                  Total Amount: ৳{orderResult.totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
              <p>• Digital warranty is activated automatically upon delivery confirmation.</p>
              <p>• Our courier team will contact you prior to final delivery.</p>
              <p>• For any changes or urgent support, call <strong>01733 983752</strong>.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/customer/dashboard" className="btn-primary flex-1 text-xs py-3 justify-center">
              Track in Customer Dashboard
            </Link>
            <Link href="/shop" className="btn-secondary flex-1 text-xs py-3 justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* CHECKOUT FLOW */}
      {step !== 'done' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {!user ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900">Sign In to Complete Order</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Sign in to activate your digital warranty, receive SMS updates, and track doorstep courier delivery.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/customer/login?redirect=/checkout"
                    className="btn-primary w-full sm:w-auto py-2.5 px-6 text-xs font-bold"
                  >
                    Sign In as Customer
                  </Link>
                  <Link
                    href="/customer/register?redirect=/checkout"
                    className="btn-secondary w-full sm:w-auto py-2.5 px-6 text-xs font-bold"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: Delivery Address */}
                {step === 'address' && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">National Delivery Address</h2>
                          <p className="text-[11px] text-slate-500">Courier delivery available across all 64 districts in Bangladesh</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Recipient Name *</label>
                        <input
                          type="text"
                          name="recipientName"
                          required
                          value={form.recipientName}
                          onChange={handleChange}
                          placeholder="Full Name"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="01XXXXXXXXX"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
                        />
                      </div>

                      {/* Division Dropdown (8 Divisions) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Division *</label>
                        <select
                          name="division"
                          value={form.division}
                          onChange={handleDivisionChange}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          {BANGLADESH_DIVISIONS.map((div) => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>

                      {/* District Dropdown (Filtered 64 Districts) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">District *</label>
                        <select
                          name="district"
                          value={form.district}
                          onChange={handleDistrictChange}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                        >
                          {availableDistricts.map((d) => (
                            <option key={d.id} value={d.name}>{d.name} ({d.nameBn})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Thana / Upazila *</label>
                        <input
                          type="text"
                          name="upazila"
                          required
                          value={form.upazila}
                          onChange={handleChange}
                          placeholder="e.g. Moulvibazar Sadar / Dhanmondi"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Area / Neighborhood</label>
                        <input
                          type="text"
                          name="area"
                          value={form.area}
                          onChange={handleChange}
                          placeholder="e.g. Kusumbag / Mirpur-10"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Road / House / Flat Address *</label>
                        <input
                          type="text"
                          name="addressLine"
                          required
                          value={form.addressLine}
                          onChange={handleChange}
                          placeholder="House #, Road #, Sector / Village, Landmark..."
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* District Shipping & Delivery Window Notice */}
                    {currentDistrictInfo && (
                      <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-2xl flex items-center gap-3 text-xs text-brand-900">
                        <Truck className="w-5 h-5 text-brand-600 shrink-0" />
                        <div>
                          <p className="font-bold">
                            Courier window to {currentDistrictInfo.name}: {currentDistrictInfo.deliveryTimeDays}
                          </p>
                          <p className="text-[11px] text-brand-700">{currentDistrictInfo.serviceCoverageNote}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => setStep('payment')}
                        disabled={!form.recipientName || !form.phone || !form.addressLine}
                        className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
                      >
                        Continue to Payment Method
                        <ArrowRight className="w-4 h-4" />
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
                      <h2 className="text-base font-extrabold text-slate-900">Select Payment Method</h2>
                    </div>

                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                            form.paymentMethod === method.id
                              ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={form.paymentMethod === method.id}
                            onChange={handleChange}
                            className="mt-1 accent-brand-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{method.icon}</span>
                              <span className="font-bold text-xs text-slate-900">{method.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Online Transaction ID input for bKash/Nagad */}
                    {(form.paymentMethod === 'BKASH' || form.paymentMethod === 'NAGAD') && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          {form.paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          name="paymentTrxId"
                          value={form.paymentTrxId}
                          onChange={handleChange}
                          placeholder="e.g. BL99K3JHX1"
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono uppercase"
                        />
                        <p className="text-[10px] text-slate-500">
                          Send the total order amount to <strong>01733 983752</strong> (NEED ELECTRO Merchant/Personal) and copy your TrxID here.
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-700">Order Notes (Optional)</label>
                      <textarea
                        name="notes"
                        rows={2}
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Any special courier instructions or gate codes..."
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep('address')}
                        className="btn-secondary text-xs py-3 flex-1"
                      >
                        Back to Address
                      </button>
                      <button
                        onClick={() => setStep('review')}
                        className="btn-primary text-xs py-3 flex-1 flex items-center justify-center gap-1.5"
                      >
                        Review Order Summary
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Order Review */}
                {step === 'review' && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900">Review &amp; Confirm Order</h2>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs">
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Deliver To:</span>
                        <p className="font-bold text-slate-900 mt-0.5">{form.recipientName} ({form.phone})</p>
                        <p className="text-slate-600">{form.addressLine}, {form.upazila}, {form.district}, {form.division}</p>
                      </div>
                      <div className="border-t border-slate-200 pt-2">
                        <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Payment Method:</span>
                        <p className="font-bold text-slate-900 mt-0.5">{form.paymentMethod.replace(/_/g, ' ')}</p>
                        {form.paymentTrxId && <p className="text-slate-600 font-mono">TrxID: {form.paymentTrxId}</p>}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep('payment')}
                        className="btn-secondary text-xs py-3 flex-1"
                      >
                        Back to Payment
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={submitting}
                        className="btn-primary text-xs py-3 flex-1 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
                      >
                        {submitting ? 'Placing Order...' : `Confirm & Place Order (৳${total.toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Order Items ({items.length})</h3>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2.5">
                {items.map((item) => {
                  const price = item.product.discountPrice ?? item.product.price;
                  return (
                    <div key={item.product.id} className="pt-2.5 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-3">
                        <p className="font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity} &times; ৳{price.toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-slate-800">৳{(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({form.district})</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-brand-600">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 space-y-1">
                <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Official Warranty Protected
                </p>
                <p>Digital warranty records are generated automatically upon purchase.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
