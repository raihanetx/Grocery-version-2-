'use client'

import React from 'react'

const Orders = ({ orders, setView }: { orders: { id: string }[]; setView: (v: string) => void }) => {
  if (orders.length === 0) {
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
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Order:45921&color=111827" className="w-full h-full object-contain" alt="Order QR" />
            </div>
          </div>
          <div className="flex flex-col pt-1">
            <span className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest mb-0.5">Order History</span>
            <h2 className="text-sm font-bold tracking-tight uppercase">ID: #ORD-45921</h2>
            <div className="flex items-center gap-1.5 mt-2 text-[#F97316]">
              <i className="ph-bold ph-circle-notch text-xs"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Processing</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="relative flex items-center justify-between z-0">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#111827]/10 -z-10 rounded-full"></div>
            <div className="absolute top-1/2 left-0 w-[66%] h-[2px] bg-[#F97316] -z-10 rounded-full"></div>
            <div className="bg-white pr-1"><div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div></div>
            <div className="bg-white px-1"><div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div></div>
            <div className="bg-white px-1"><div className="w-2.5 h-2.5 rounded-full border-2 border-[#F97316] bg-white ring-2 ring-[#F97316]/20"></div></div>
            <div className="bg-white pl-1"><div className="w-2.5 h-2.5 rounded-full bg-[#111827]/10"></div></div>
          </div>
          <div className="flex justify-between text-[9px] font-bold mt-2 uppercase text-[#111827]/40">
            <span className="text-[#111827]/80">Taken</span><span className="text-[#111827]/80">Packed</span><span className="text-[#F97316]">Process</span><span>Done</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <i className="ph-fill ph-map-pin text-sm text-[#111827]/30 mt-0.5"></i>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest mb-1">Shipping Details</span>
                <span className="text-xs font-bold text-[#111827] uppercase">Anamul Haque</span>
                <span className="text-xs font-bold text-[#111827]/60 mt-0.5 leading-snug uppercase">House 42, Road 9, Mirpur DOHS</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ph-fill ph-timer text-sm text-[#F97316]"></i>
              <span className="text-xs font-bold text-[#F97316] uppercase tracking-tight">Est: 1 - 7 Days</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 border-t border-dashed border-[#111827]/10 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[3px] bg-white flex-shrink-0 overflow-hidden border border-[#111827]/10 p-[2px]">
              <img src="https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png" className="w-full h-full object-contain rounded-[2px]" alt="Carrot product" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-tight uppercase text-[#111827]">Miniket Rice (5kg)</p>
              <p className="text-[9px] text-[#111827]/40 mt-0.5 uppercase">Qty: 1 Pack</p>
            </div>
            <span className="text-xs font-bold text-[#111827]">420TK</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[3px] bg-white flex-shrink-0 overflow-hidden border border-[#111827]/10 p-[2px]">
              <img src="https://i.postimg.cc/d1vdTWyL/1000020583-removebg-preview.png" className="w-full h-full object-contain rounded-[2px]" alt="Potato product" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-tight uppercase text-[#111827]">Soybean Oil (2L)</p>
              <p className="text-[9px] text-[#111827]/40 mt-0.5 uppercase">Qty: 2 Bottles</p>
            </div>
            <span className="text-xs font-bold text-[#111827]">390TK</span>
          </div>
        </div>

        <div className="px-6 pb-8 pt-5 border-t border-dashed border-[#111827]/20">
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-[11px] font-bold"><span className="text-[#111827]/40 uppercase">Sub-Total</span><span className="text-[#111827]">810TK</span></div>
            <div className="flex justify-between text-[11px] font-bold"><span className="text-[#111827]/40 uppercase tracking-tighter">Discount (SAVE50)</span><span className="text-[#111827]">-50TK</span></div>
            <div className="flex justify-between text-[11px] font-bold"><span className="text-[#111827]/40 uppercase">Delivery</span><span className="text-[#111827]">60TK</span></div>
          </div>
          <div className="w-full h-[1px] bg-[#111827]/10 mb-5"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-[#111827]/80">Payable Amount</span>
              <span className="text-[10px] font-bold text-[#111827]/40 uppercase mt-1">(Cash on Delivery)</span>
            </div>
            <div className="text-right"><span className="text-2xl font-bold tracking-tighter text-[#111827]">820TK</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
