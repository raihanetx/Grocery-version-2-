'use client'

import React, { useState } from 'react'

const Checkout = ({ setView, onConfirm }: { setView: (v: string) => void; onConfirm: () => void }) => {
  const [address, setAddress] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isDeliveryKnown = address.length > 0
  const totalAmount = isDeliveryKnown ? 'TK140' : 'TK80'

  return (
    <div className="chk-bg">
      <div className="chk-container">
        {/* 1. Customer Information */}
        <div className="chk-section-header"><i className="ri-user-line"></i> Customer Information</div>
        <div className="chk-input-wrapper">
          <i className="ri-user-3-line chk-input-icon"></i>
          <input type="text" id="fullname" className="chk-clean-input" 
            onFocus={() => setFocusedField('fullname')} 
            onBlur={() => setFocusedField(null)} />
          <label htmlFor="fullname" className={`chk-input-label ${focusedField === 'fullname' ? 'active-label' : ''}`}>Full Name</label>
        </div>
        <div className="chk-input-wrapper">
          <i className="ri-smartphone-line chk-input-icon"></i>
          <input type="tel" id="phone" className="chk-clean-input" 
            onFocus={() => setFocusedField('phone')} 
            onBlur={() => setFocusedField(null)} />
          <label htmlFor="phone" className={`chk-input-label ${focusedField === 'phone' ? 'active-label' : ''}`}>Phone Number</label>
        </div>
        <div className="chk-input-wrapper">
          <i className="ri-map-pin-2-line chk-input-icon"></i>
          <input type="text" id="address" className="chk-clean-input" 
            onChange={(e)=>setAddress(e.target.value)} 
            onFocus={() => setFocusedField('address')} 
            onBlur={() => setFocusedField(null)} />
          <label htmlFor="address" className={`chk-input-label ${focusedField === 'address' ? 'active-label' : ''}`}>Full Address</label>
        </div>

        <hr className="chk-divider" />

        {/* 2. Order Summary */}
        <div className="chk-section-header"><i className="ri-shopping-bag-3-line"></i> Order Summary</div>
        <div className="chk-product-row">
          <img src="https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png" alt="Carrot" className="chk-prod-img" />
          <div className="chk-prod-info"><h4>Organic Carrots</h4><span>Qty: 1 KG</span></div>
          <div className="chk-prod-price">TK80</div>
        </div>
        <div className="chk-cost-row"><span>Subtotal</span><span>TK80.00</span></div>
        <div className="chk-cost-row"><span>Delivery Charge</span><span>{isDeliveryKnown ? 'TK60.00' : '?'}</span></div>
        <div className="chk-total-row"><span>Total Payable</span><span>{totalAmount}.00</span></div>

        {/* Coupon Code */}
        <div className="chk-coupon-wrapper">
          <div className="chk-input-wrapper">
            <i className="ri-ticket-2-line chk-input-icon"></i>
            <input type="text" id="coupon" className="chk-clean-input" 
              onFocus={() => setFocusedField('coupon')} 
              onBlur={() => setFocusedField(null)} />
            <label htmlFor="coupon" className={`chk-input-label ${focusedField === 'coupon' ? 'active-label' : ''}`}>Coupon Code</label>
          </div>
          <button className="chk-btn-apply">APPLY</button>
        </div>

        <hr className="chk-divider" />

        {/* 3. Payment Method */}
        <div className="chk-section-header"><i className="ri-secure-payment-line"></i> Payment Method</div>
        
        <div className="mt-4">
          <p style={{fontSize: '13px', color: '#475569', lineHeight: 1.6}}>
            This is a cash on delivery order. Please keep <b style={{color: '#0f172a'}}>{totalAmount}</b> ready to pay the rider when your order arrives.
          </p>
        </div>

        <hr className="chk-divider" />

        <div className="chk-legal-check"><input type="checkbox" id="save" /><label htmlFor="save">Save info for next time</label></div>
        <div className="chk-legal-check"><input type="checkbox" id="terms" /><label htmlFor="terms">I agree to the <a href="#" className="chk-link">Terms & Conditions</a></label></div>

        <div className="chk-btn-group">
          <button className="chk-btn-main chk-btn-cancel" onClick={() => setView('cart')}>Cancel</button>
          <button className="chk-btn-main chk-btn-confirm" onClick={onConfirm}>Confirm Order</button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
