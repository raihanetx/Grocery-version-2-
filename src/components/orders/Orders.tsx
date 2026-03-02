'use client'

import React, { useState, useEffect } from 'react'

interface OrderData {
  id: string
  orderNumber: string
  customerName: string
  customerAddress: string
  total: number
  status: string
  courierStatus: string | null
  createdAt: string
  items: {
    productName: string
    varietyName: string | null
    quantity: number
    totalPrice: number
  }[]
}

const Orders = ({ orders, setView, lastOrderId }: { 
  orders: { id: string }[]
  setView: (v: string) => void
  lastOrderId: string | null
}) => {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!lastOrderId) {
        setLoading(false)
        return
      }

      try {
        // Fetch order by order number
        const res = await fetch(`/api/orders?limit=1`)
        const data = await res.json()
        if (data.success && data.orders && data.orders.length > 0) {
          // Find the most recent order
          setOrderData(data.orders[0])
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [lastOrderId])

  if (orders.length === 0 || !orderData) {
    return (
      <main className="flex flex-col items-center justify-center h-[calc(100vh-120px)] px-6 space-y-20 bg-white font-inter">
        <div className="flex flex-col items-center gap-1.5">
          <i className="ri-todo-line text-[56px] text-zinc-100"></i>
          <div className="text-center">
            <h1 className="text-xl font-medium tracking-tight text-zinc-900">No orders yet</h1>
            <p className="text-sm text-zinc-400 font-light max-w-[220px] mx-auto leading-relaxed">Your past orders will appear here. Start shopping to place your first order.</p>
            <button onClick={()=>setView('shop')} className="mt-4 px-6 py-2 bg-[#16a34a] text-white rounded-lg text-sm font-medium">Shop Now</button>
          </div>
        </div>
      </main>
    )
  }

  // Calculate status display
  const getStatusInfo = () => {
    const status = orderData.status
    const courierStatus = orderData.courierStatus

    if (status === 'pending') {
      return { 
        label: 'Pending', 
        color: '#F97316', 
        step: 1,
        icon: 'ri-time-line'
      }
    }
    if (status === 'approved') {
      if (courierStatus === 'Delivered') {
        return { label: 'Delivered', color: '#16a34a', step: 4, icon: 'ri-check-line' }
      }
      if (courierStatus === 'Shipping') {
        return { label: 'Shipping', color: '#3B82F6', step: 3, icon: 'ri-truck-line' }
      }
      return { label: 'Processing', color: '#F97316', step: 2, icon: 'ri-loader-4-line' }
    }
    if (status === 'canceled') {
      return { label: 'Canceled', color: '#EF4444', step: 0, icon: 'ri-close-line' }
    }
    if (status === 'delivered') {
      return { label: 'Delivered', color: '#16a34a', step: 4, icon: 'ri-check-line' }
    }
    return { label: status, color: '#6B7280', step: 1, icon: 'ri-information-line' }
  }

  const statusInfo = getStatusInfo()
  const deliveryCharge = 60 // Default
  const subtotal = orderData.total - deliveryCharge

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gray-100 p-6 font-print antialiased text-[#111827] relative">
      <div className="w-full max-w-[340px] bg-white rounded-[5px] border border-[#111827]/20 flex flex-col overflow-hidden shadow-sm z-10">
        <div className="px-6 pt-7 pb-3 flex items-start gap-4">
          <div className="relative">
            <div className="absolute -top-[2px] -left-[2px] w-2 h-2 border-t-2 border-l-2 border-[#111827]"></div>
            <div className="absolute -top-[2px] -right-[2px] w-2 h-2 border-t-2 border-r-2 border-[#111827]"></div>
            <div className="absolute -bottom-[2px] -left-[2px] w-2 h-2 border-b-2 border-l-2 border-[#111827]"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-2 h-2 border-b-2 border-r-2 border-[#111827]"></div>
            <div className="w-14 h-14 bg-white p-1">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderData.orderNumber}&color=111827`} 
                className="w-full h-full object-contain" 
                alt="Order QR" 
              />
            </div>
          </div>
          <div className="flex flex-col pt-1">
            <span className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest mb-0.5">Order Confirmed</span>
            <h2 className="text-sm font-bold tracking-tight uppercase">ID: #{orderData.orderNumber.split('-').slice(-1)}</h2>
            <div className="flex items-center gap-1.5 mt-2" style={{ color: statusInfo.color }}>
              <i className={`${statusInfo.icon} text-xs`}></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="relative flex items-center justify-between z-0">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#111827]/10 -z-10 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-[2px] -z-10 rounded-full transition-all"
              style={{ 
                width: `${(statusInfo.step / 4) * 100}%`, 
                backgroundColor: statusInfo.color 
              }}
            ></div>
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={`bg-white ${step === 1 ? 'pr-1' : step === 4 ? 'pl-1' : 'px-1'}`}>
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${
                    step < statusInfo.step 
                      ? '' 
                      : step === statusInfo.step 
                        ? 'ring-2 ring-opacity-20' 
                        : 'bg-[#111827]/10'
                  }`}
                  style={{
                    backgroundColor: step <= statusInfo.step ? statusInfo.color : undefined,
                    borderColor: step === statusInfo.step ? statusInfo.color : undefined,
                    borderWidth: step === statusInfo.step ? 2 : 0,
                    ringColor: step === statusInfo.step ? statusInfo.color : undefined
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-bold mt-2 uppercase text-[#111827]/40">
            <span style={{ color: statusInfo.step >= 1 ? statusInfo.color : undefined }}>Taken</span>
            <span style={{ color: statusInfo.step >= 2 ? statusInfo.color : undefined }}>Packed</span>
            <span style={{ color: statusInfo.step >= 3 ? statusInfo.color : undefined }}>Ship</span>
            <span style={{ color: statusInfo.step >= 4 ? statusInfo.color : undefined }}>Done</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <i className="ri-map-pin-fill text-sm text-[#111827]/30 mt-0.5"></i>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest mb-1">Shipping Details</span>
                <span className="text-xs font-bold text-[#111827] uppercase">{orderData.customerName}</span>
                <span className="text-xs font-bold text-[#111827]/60 mt-0.5 leading-snug uppercase">{orderData.customerAddress}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ri-timer-fill text-sm text-[#F97316]"></i>
              <span className="text-xs font-bold text-[#F97316] uppercase tracking-tight">Est: 1 - 3 Days</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 border-t border-dashed border-[#111827]/10 bg-gray-50/50">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[3px] bg-gray-100 flex-shrink-0 overflow-hidden border border-[#111827]/10 flex items-center justify-center">
                <i className="ri-shopping-bag-line text-gray-400"></i>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold tracking-tight uppercase text-[#111827]">{item.productName}</p>
                <p className="text-[9px] text-[#111827]/40 mt-0.5 uppercase">
                  Qty: {item.quantity} {item.varietyName && `• ${item.varietyName}`}
                </p>
              </div>
              <span className="text-xs font-bold text-[#111827]">TK{item.totalPrice}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-8 pt-5 border-t border-dashed border-[#111827]/20">
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#111827]/40 uppercase">Sub-Total</span>
              <span className="text-[#111827]">TK{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#111827]/40 uppercase">Delivery</span>
              <span className="text-[#111827]">TK{deliveryCharge}</span>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#111827]/10 mb-5"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-[#111827]/80">Payable Amount</span>
              <span className="text-[10px] font-bold text-[#111827]/40 uppercase mt-1">(Cash on Delivery)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tighter text-[#111827]">TK{orderData.total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button 
            onClick={() => setView('shop')} 
            className="w-full py-3 bg-[#16a34a] text-white rounded-lg text-sm font-bold uppercase"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default Orders
