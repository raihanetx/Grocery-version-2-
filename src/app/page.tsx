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
import { SettingsProvider } from '@/contexts/SettingsContext'

// --- MAIN APP ENTRY ---
export default function Home() {
  const [view, setView] = useState('shop')
  const [cartItems, setCartItems] = useState<CartItem[]>([]) 
  const [orders, setOrders] = useState<{ id: string }[]>([]) 
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)

  // Add to cart - if item exists, increment quantity; otherwise add new item
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Check if item with same id and weight already exists
      const existingIndex = prevItems.findIndex(
        i => i.id === item.id && i.weight === item.weight
      )
      
      if (existingIndex >= 0) {
        // Item exists, increment quantity
        const newItems = [...prevItems]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: (newItems[existingIndex].quantity || 1) + 1
        }
        return newItems
      } else {
        // New item, add with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  // Calculate total items count (sum of quantities)
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  const handleConfirmOrder = (orderId: string) => {
    setLastOrderId(orderId)
    setOrders([{ id: orderId }])
    setCartItems([])
    setView('orders')
    window.scrollTo(0, 0)
  }

  return (
    <SettingsProvider>
      <div className="flex flex-col min-h-screen relative">
        <Header view={view} setView={setView} cartCount={cartCount} />
        <div className="flex-grow w-full">
          {view === 'shop' && <Shop setView={setView} addToCart={addToCart} setSelectedProductId={setSelectedProductId} />}
          {view === 'product' && <ProductDetail setView={setView} addToCart={addToCart} productId={selectedProductId} />}
          {view === 'cart' && <Cart setView={setView} cartItems={cartItems} setCartItems={setCartItems} />}
          {view === 'checkout' && <Checkout setView={setView} cartItems={cartItems} setCartItems={setCartItems} onConfirm={handleConfirmOrder} />}
          {view === 'orders' && <Orders orders={orders} setView={setView} lastOrderId={lastOrderId} />}
          {view === 'admin' && <AdminDashboard setView={setView} />}
        </div>
        <BottomNav view={view} setView={setView} />
      </div>
    </SettingsProvider>
  )
}
