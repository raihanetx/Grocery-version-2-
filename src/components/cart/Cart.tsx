'use client'

import React from 'react'
import { CartItem } from '@/types'

const Cart = ({ setView, cartItems, setCartItems }: { setView: (v: string) => void; cartItems: CartItem[]; setCartItems: (items: CartItem[]) => void }) => {
  // Update quantity for an item
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const newItems = [...cartItems]
    newItems[index] = { ...newItems[index], quantity: newQuantity }
    setCartItems(newItems)
  }

  // Delete item
  const deleteItem = (index: number) => {
    const newItems = [...cartItems]
    newItems.splice(index, 1)
    setCartItems(newItems)
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center h-[calc(100vh-120px)] px-6 space-y-20 bg-white font-inter">
        <div className="flex flex-col items-center gap-1.5">
          <i className="ph ph-squares-four text-[56px] text-zinc-100"></i>
          <div className="text-center">
            <h1 className="text-xl font-medium tracking-tight text-zinc-900">Your cart is empty</h1>
            <p className="text-sm text-zinc-400 font-light max-w-[220px] mx-auto leading-relaxed">Add some fresh groceries to start your order.</p>
            <button onClick={()=>setView('shop')} className="mt-4 px-6 py-2 bg-[#16a34a] text-white rounded-lg text-sm font-medium">Shop Now</button>
          </div>
        </div>
      </main>
    )
  }

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const deliveryCharge = subtotal >= 1000 ? 0 : 60
  const total = subtotal + deliveryCharge

  return (
    <div className="cart-wrapper-container">
      <div className="cart-wrapper">
        <div className="cart-items-list">
          {cartItems.map((item, index) => (
            <div key={index} className="c12-item">
              <img src={item.img} className="c12-img" alt={item.name} />
              <div className="c12-info">
                <div className="c12-name-row"><span className="c12-name">{item.name}</span> <span className="c12-weight">({item.weight})</span></div>
                <div className="c12-action-row">
                  <div className="c12-price">TK {item.price * (item.quantity || 1)}</div>
                  <div className="c12-qty-group">
                    <button 
                      className="c12-qbtn" 
                      onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <i className="ph ph-minus"></i>
                    </button>
                    <span className="c12-qval">{item.quantity || 1}</span>
                    <button 
                      className="c12-qbtn"
                      onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                    >
                      <i className="ph ph-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              <button className="c12-del" onClick={() => deleteItem(index)}><i className="ph ph-trash"></i></button>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <div className="os-row"><span>Subtotal ({totalItems} items)</span><span>TK {subtotal.toFixed(2)}</span></div>
          <div className="os-row"><span>Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600 font-medium">FREE</span> : `TK ${deliveryCharge}`}</span></div>
          {subtotal < 1000 && (
            <div className="text-xs text-gray-400 mb-2">
              <i className="ri-information-line"></i> Free delivery on orders over TK1000
            </div>
          )}
          <div className="os-row total"><span>Total</span><span>TK {total.toFixed(2)}</span></div>
        </div>
        <div className="cart-buttons">
          <button className="cart-btn btn-continue" onClick={() => setView('shop')}>Continue</button>
          <button className="cart-btn btn-checkout" onClick={() => setView('checkout')}>Checkout</button>
        </div>
      </div>
    </div>
  )
}

export default Cart
