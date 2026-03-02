'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CartItem } from '@/types'

interface AppliedCoupon {
  id: string
  code: string
  type: 'pct' | 'fixed'
  value: number
  discountAmount: number
}

interface CheckoutProps {
  setView: (v: string) => void
  cartItems: CartItem[]
  setCartItems: (items: CartItem[]) => void
  onConfirm: (orderId: string) => void
}

interface DeliverySettings {
  insideDhaka: number
  outsideDhaka: number
  freeDeliveryMin: number
  universalDelivery: number
  useUniversalDelivery: boolean
}

const Checkout = ({ setView, cartItems, setCartItems, onConfirm }: CheckoutProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Abandoned checkout tracking
  const [abandonedHistoryId, setAbandonedHistoryId] = useState<string | null>(null)
  const [abandonedCheckoutId, setAbandonedCheckoutId] = useState<string | null>(null)
  const hasTrackedAbandoned = useRef(false)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  // Delivery settings - fetch from API
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    insideDhaka: 60,
    outsideDhaka: 120,
    freeDeliveryMin: 1000,
    universalDelivery: 0,
    useUniversalDelivery: false
  })

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings) {
          setDeliverySettings({
            insideDhaka: data.settings.insideDhakaDelivery || 60,
            outsideDhaka: data.settings.outsideDhakaDelivery || 120,
            freeDeliveryMin: data.settings.freeDeliveryMin || 1000,
            universalDelivery: data.settings.universalDelivery || 0,
            useUniversalDelivery: data.settings.useUniversalDelivery || false
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  
  // Delivery calculation - use settings
  const { insideDhaka, outsideDhaka, freeDeliveryMin, universalDelivery, useUniversalDelivery } = deliverySettings
  const deliveryCharge = useUniversalDelivery 
    ? universalDelivery 
    : (subtotal >= freeDeliveryMin ? 0 : insideDhaka)
  
  // Total with coupon discount
  const couponDiscount = appliedCoupon?.discountAmount || 0
  const total = subtotal + deliveryCharge - couponDiscount

  // Track abandoned checkout when component mounts
  useEffect(() => {
    const trackAbandonedCheckout = async () => {
      // Only track once and only if there are cart items
      if (hasTrackedAbandoned.current || cartItems.length === 0) return
      hasTrackedAbandoned.current = true

      try {
        // Get existing customer info from localStorage if available
        const savedCustomerInfo = localStorage.getItem('customerInfo')
        let customerData = {
          customerName: '',
          customerPhone: '',
          customerAddress: ''
        }
        
        if (savedCustomerInfo) {
          customerData = JSON.parse(savedCustomerInfo)
        }

        const response = await fetch('/api/abandoned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerData.customerName || formData.fullName || '',
            customerPhone: customerData.customerPhone || formData.phone || '',
            customerAddress: customerData.customerAddress || formData.address || '',
            products: cartItems.map(item => ({
              name: item.name,
              variant: item.weight,
              qty: item.quantity || 1
            })),
            total: subtotal
          })
        })

        const data = await response.json()
        if (data.success) {
          setAbandonedHistoryId(data.historyId)
          setAbandonedCheckoutId(data.abandonedCheckout?.id)
        }
      } catch (err) {
        console.error('Error tracking abandoned checkout:', err)
      }
    }

    trackAbandonedCheckout()
  }, [])

  // Update abandoned checkout when customer fills form
  useEffect(() => {
    const updateAbandonedInfo = async () => {
      if (!abandonedCheckoutId) return
      
      // Save customer info to localStorage
      if (formData.phone) {
        localStorage.setItem('customerInfo', JSON.stringify({
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerAddress: formData.address
        }))
      }
    }
    
    updateAbandonedInfo()
  }, [formData, abandonedCheckoutId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    setError(null)
  }

  // Delete item from cart
  const handleDeleteItem = (index: number) => {
    const newItems = [...cartItems]
    newItems.splice(index, 1)
    setCartItems(newItems)
  }

  // Update item quantity
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const newItems = [...cartItems]
    newItems[index] = { ...newItems[index], quantity: newQuantity }
    setCartItems(newItems)
  }

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError(null)

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
          }))
        })
      })

      const data = await response.json()

      if (data.success && data.coupon) {
        setAppliedCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          discountAmount: data.coupon.discountAmount
        })
        setCouponCode('')
        setCouponError(null)
      } else {
        setCouponError(data.error || 'Invalid coupon code')
      }
    } catch (err) {
      console.error('Coupon validation error:', err)
      setCouponError('Failed to validate coupon. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
  }

  const handleConfirmOrder = async () => {
    // Validate form
    if (!formData.fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!formData.phone.trim() || formData.phone.length < 11) {
      setError('Please enter a valid phone number (11 digits)')
      return
    }
    if (!formData.address.trim()) {
      setError('Please enter your delivery address')
      return
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare order data
      const orderData = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerEmail: formData.email || null,
        notes: formData.notes || null,
        paymentMethod: 'Cash on Delivery',
        subtotal,
        deliveryCharge,
        discount: 0,
        couponDiscount: couponDiscount,
        couponCodes: appliedCoupon ? [{
          code: appliedCoupon.code,
          discount: appliedCoupon.discountAmount
        }] : [],
        total,
        items: cartItems.map(item => ({
          productName: item.name,
          varietyName: item.weight || null,
          quantity: item.quantity || 1,
          basePrice: item.price,
          offerDiscount: item.oldPrice > item.price ? item.oldPrice - item.price : 0,
          couponDiscount: 0,
          totalPrice: item.price * (item.quantity || 1)
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (data.success && data.order) {
        // Always track completed order in abandoned checkout section (will show with green amount)
        try {
          await fetch('/api/abandoned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: formData.fullName,
              customerPhone: formData.phone,
              customerAddress: formData.address,
              products: cartItems.map(item => ({
                name: item.name,
                variant: item.weight,
                qty: item.quantity || 1
              })),
              total: total,
              markAsCompleted: true // Mark as completed immediately for successful orders
            })
          })
        } catch (err) {
          console.error('Error tracking completed order:', err)
        }

        // Also update existing abandoned checkout if we have IDs
        if (abandonedCheckoutId && abandonedHistoryId) {
          try {
            await fetch(`/api/abandoned/${abandonedCheckoutId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                historyId: abandonedHistoryId,
                status: 'completed'
              })
            })
          } catch (err) {
            console.error('Error updating abandoned checkout:', err)
          }
        }

        // Clear customer info from localStorage after successful order
        localStorage.removeItem('customerInfo')

        onConfirm(data.order.orderNumber)
      } else {
        setError(data.error || 'Failed to place order. Please try again.')
      }
    } catch (err) {
      console.error('Order error:', err)
      setError('Failed to place order. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chk-bg">
      <div className="chk-container">
        {/* 1. Customer Information */}
        <div className="chk-section-header"><i className="ri-user-line"></i> Customer Information</div>
        <div className="chk-input-wrapper">
          <i className="ri-user-3-line chk-input-icon"></i>
          <input 
            type="text" 
            id="fullName" 
            className="chk-clean-input" 
            value={formData.fullName}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('fullName')} 
            onBlur={() => setFocusedField(null)} 
            placeholder=" "
          />
          <label htmlFor="fullName" className={`chk-input-label ${focusedField === 'fullName' || formData.fullName ? 'active-label' : ''}`}>Full Name *</label>
        </div>
        <div className="chk-input-wrapper">
          <i className="ri-smartphone-line chk-input-icon"></i>
          <input 
            type="tel" 
            id="phone" 
            className="chk-clean-input" 
            value={formData.phone}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('phone')} 
            onBlur={() => setFocusedField(null)} 
            placeholder=" "
            maxLength={11}
          />
          <label htmlFor="phone" className={`chk-input-label ${focusedField === 'phone' || formData.phone ? 'active-label' : ''}`}>Phone Number *</label>
        </div>
        <div className="chk-input-wrapper">
          <i className="ri-map-pin-2-line chk-input-icon"></i>
          <input 
            type="text" 
            id="address" 
            className="chk-clean-input" 
            value={formData.address}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('address')} 
            onBlur={() => setFocusedField(null)} 
            placeholder=" "
          />
          <label htmlFor="address" className={`chk-input-label ${focusedField === 'address' || formData.address ? 'active-label' : ''}`}>Full Address *</label>
        </div>

        <hr className="chk-divider" />

        {/* 2. Order Summary */}
        <div className="chk-section-header"><i className="ri-shopping-bag-3-line"></i> Order Summary</div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <i className="ri-shopping-cart-line text-3xl mb-2"></i>
            <p>Your cart is empty</p>
            <button 
              onClick={() => setView('shop')} 
              className="mt-4 px-6 py-2 bg-[#16a34a] text-white rounded-lg text-sm font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <div key={index} className="chk-product-row">
                <img src={item.img} alt={item.name} className="chk-prod-img" />
                <div className="chk-prod-info">
                  <h4>{item.name}</h4>
                  <span>{item.weight && `${item.weight}`}</span>
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => handleUpdateQuantity(index, (item.quantity || 1) - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <i className="ri-subtract-line text-xs"></i>
                    </button>
                    <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity || 1}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(index, (item.quantity || 1) + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <i className="ri-add-line text-xs"></i>
                    </button>
                  </div>
                </div>
                <div className="chk-prod-price">TK{item.price * (item.quantity || 1)}</div>
                {/* Delete Button */}
                <button 
                  onClick={() => handleDeleteItem(index)}
                  className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                >
                  <i className="ri-delete-bin-line text-lg"></i>
                </button>
              </div>
            ))}
          </>
        )}

        {/* Coupon Section */}
        <div className="mt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="ri-coupon-3-line text-green-600 text-lg"></i>
                <div>
                  <span className="font-semibold text-green-700">{appliedCoupon.code}</span>
                  <span className="text-green-600 text-sm ml-2">
                    -TK{appliedCoupon.discountAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleRemoveCoupon}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="chk-coupon-wrapper">
              <div className="chk-input-wrapper mb-0">
                <i className="ri-coupon-3-line chk-input-icon"></i>
                <input 
                  type="text" 
                  className="chk-clean-input" 
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase())
                    setCouponError(null)
                  }}
                  onFocus={() => setFocusedField('coupon')} 
                  onBlur={() => setFocusedField(null)} 
                  placeholder=" "
                />
                <label className={`chk-input-label ${focusedField === 'coupon' || couponCode ? 'active-label' : ''}`}>Coupon Code</label>
              </div>
              <button 
                className="chk-btn-apply"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          )}
          {couponError && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>
              {couponError}
            </p>
          )}
        </div>

        <div className="chk-cost-row">
          <span>Subtotal ({totalItems} items)</span>
          <span>TK{subtotal.toFixed(2)}</span>
        </div>
        <div className="chk-cost-row">
          <span>Delivery Charge</span>
          <span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `TK${deliveryCharge.toFixed(2)}`}</span>
        </div>
        {subtotal < freeDeliveryMin && (
          <div className="text-xs text-gray-400 mb-2">
            <i className="ri-information-line"></i> Free delivery on orders over TK{freeDeliveryMin}
          </div>
        )}
        {appliedCoupon && (
          <div className="chk-cost-row text-green-600">
            <span>Coupon Discount ({appliedCoupon.code})</span>
            <span>-TK{appliedCoupon.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="chk-total-row">
          <span>Total Payable</span>
          <span>TK{total.toFixed(2)}</span>
        </div>

        {/* Notes */}
        <div className="chk-input-wrapper mt-4">
          <i className="ri-file-text-line chk-input-icon"></i>
          <input 
            type="text" 
            id="notes" 
            className="chk-clean-input" 
            value={formData.notes}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('notes')} 
            onBlur={() => setFocusedField(null)} 
            placeholder=" "
          />
          <label htmlFor="notes" className={`chk-input-label ${focusedField === 'notes' || formData.notes ? 'active-label' : ''}`}>Order Notes (Optional)</label>
        </div>

        <hr className="chk-divider" />

        {/* 3. Payment Method */}
        <div className="chk-section-header"><i className="ri-secure-payment-line"></i> Payment Method</div>
        
        <div className="mt-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
            <div>
              <p className="font-semibold text-gray-800">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when you receive your order</p>
            </div>
          </div>
          <p style={{fontSize: '13px', color: '#475569', lineHeight: 1.6, marginTop: '12px'}}>
            Please keep <b style={{color: '#0f172a'}}>TK{total.toFixed(2)}</b> ready to pay the rider when your order arrives.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <i className="ri-error-warning-line"></i>
            {error}
          </div>
        )}

        <hr className="chk-divider" />

        <div className="chk-legal-check">
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">I agree to the <a href="#" className="chk-link">Terms & Conditions</a></label>
        </div>

        <div className="chk-btn-group">
          <button className="chk-btn-main chk-btn-cancel" onClick={() => setView('cart')} disabled={loading}>Cancel</button>
          <button 
            className="chk-btn-main chk-btn-confirm" 
            onClick={handleConfirmOrder} 
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                Processing...
              </span>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
