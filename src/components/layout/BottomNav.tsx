'use client'

import React from 'react'

interface BottomNavProps {
  view: string
  setView: (v: string) => void
}

const BottomNav = ({ view, setView }: BottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_4px_rgba(0,0,0,0.08)] h-[60px] flex justify-around items-center md:hidden z-[200]">
    <div onClick={() => setView('shop')} className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${view==='shop'?'text-orange-500':'text-gray-500'}`}>
      <i className="ri-home-4-line text-[22px] mb-[1px] leading-none"></i>
      <span className="text-[10px] font-medium leading-none mt-1">Home</span>
    </div>
    <div onClick={() => setView('shop')} className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-gray-500 hover:text-orange-500 transition-colors">
      <i className="ri-store-line text-[22px] mb-[1px] leading-none"></i>
      <span className="text-[10px] font-medium leading-none mt-1">Shop</span>
    </div>
    <div onClick={() => setView('orders')} className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors ${view==='orders'?'text-orange-500':'text-gray-500'}`}>
      <i className="ri-todo-line text-[22px] mb-[1px] leading-none"></i>
      <span className="text-[10px] font-medium leading-none mt-1">Orders</span>
    </div>
  </div>
)

export default BottomNav
