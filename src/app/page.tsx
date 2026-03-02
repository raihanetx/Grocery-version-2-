'use client'

import React, { useState } from 'react'
import { CartItem } from '@/types'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Shop from '@/components/shop/Shop'
import ProductDetail from '@/components/shop/ProductDetail'
import Cart from '@/components/cart/Cart'
import Checkout from '@/components/checkout/Checkout'
import Orders from '@/components/orders/Orders'
import AdminDashboard from '@/components/admin/AdminDashboard'

// --- MAIN APP ENTRY ---
export default function Home() {
  const [view, setView] = useState('shop')
  const [cartItems, setCartItems] = useState<CartItem[]>([]) 
  const [orders, setOrders] = useState<{ id: string }[]>([]) 

  const addToCart = (item: CartItem) => setCartItems([...cartItems, item])

  const handleConfirmOrder = () => {
    setOrders([{ id: 'ORD-45921' }])
    setCartItems([])
    setView('orders')
    window.scrollTo(0,0)
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header view={view} setView={setView} cartCount={cartItems.length} />
      <div className="flex-grow w-full">
        {view === 'shop' && <Shop setView={setView} addToCart={addToCart} />}
        {view === 'product' && <ProductDetail setView={setView} addToCart={addToCart} />}
        {view === 'cart' && <Cart setView={setView} cartItems={cartItems} setCartItems={setCartItems} />}
        {view === 'checkout' && <Checkout setView={setView} onConfirm={handleConfirmOrder} />}
        {view === 'orders' && <Orders orders={orders} setView={setView} />}
        {view === 'admin' && <AdminDashboard setView={setView} />}
      </div>
      <BottomNav view={view} setView={setView} />
    </div>
  )
}
