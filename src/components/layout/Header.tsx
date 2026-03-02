'use client'

import React, { useEffect, useState } from 'react'

interface HeaderProps {
  view: string
  setView: (v: string) => void
  cartCount: number
}

const Header = ({ view, setView, cartCount }: HeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string>('https://i.postimg.cc/4xZk3k2j/IMG-20260226-120143.png')

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings?.logoUrl) {
          setLogoUrl(data.settings.logoUrl)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  return (
  <header className="w-full bg-white border-b border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 md:px-[2rem] h-[70px] md:h-[100px] sticky top-0 z-[200]">
    <div className="flex items-center shrink-0 w-auto">
      {(view === 'product' || view === 'admin') && (
        <div className="mr-2 cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setView('shop')}>
          <i className="ri-arrow-left-line text-2xl md:text-3xl text-gray-700"></i>
        </div>
      )}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('shop')}>
        <img src={logoUrl} alt="Logo" className="h-[70px] w-[70px] md:h-[90px] md:w-[90px] object-contain" />
      </div>
    </div>

    <form className="hidden md:flex flex-1 justify-center mx-[1rem] max-w-2xl">
      <div className="flex items-center border border-gray-300 rounded-full px-6 w-full bg-transparent h-12 relative transition-all duration-200 focus-within:border-orange-500">
        <input type="text" name="search" placeholder="Search Product" className="w-full outline-none bg-transparent text-lg text-gray-700 placeholder-gray-400 pr-10" />
        <button type="button" className="absolute right-5 cursor-pointer hover:text-black transition-colors">
          <i className="ri-search-line text-gray-400 text-2xl"></i>
        </button>
      </div>
    </form>

    <form className="md:hidden flex items-center border border-gray-300 rounded-full px-3 bg-white h-[36px] flex-1 mr-4 ml-2 relative">
      <input type="text" name="search" placeholder="Search..." className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 pr-6 pb-[1px]" />
      <button type="button" className="absolute right-2">
        <i className="ri-search-line text-gray-400 text-base"></i>
      </button>
    </form>

    <div className="hidden md:flex items-center justify-end h-10 shrink-0 gap-0">
      <div className="px-5 border-r border-gray-200 cursor-pointer hover:text-orange-500 relative transition-colors h-full flex items-center" onClick={() => setView('cart')}>
        <div className="relative">
          <i className="ri-shopping-bag-line text-[28px] text-gray-600 leading-none"></i>
          {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border-2 border-white">{cartCount}</span>}
        </div>
      </div>
      <div className="px-5 border-r border-gray-200 cursor-pointer hover:text-orange-500 transition-colors h-full flex items-center" onClick={() => setView('orders')}>
        <i className="ri-file-list-3-line text-[28px] text-gray-600 leading-none"></i>
      </div>
      <div className="px-5 border-r border-gray-200 cursor-pointer hover:text-orange-500 transition-colors h-full flex items-center">
        <i className="ri-user-line text-[28px] text-gray-600 leading-none"></i>
      </div>
      <div className="pl-5 cursor-pointer hover:text-orange-500 transition-colors h-full flex items-center" onClick={() => setView('admin')}>
        <i className="ri-dashboard-line text-[28px] text-gray-600 leading-none"></i>
      </div>
    </div>

    <div className="md:hidden flex items-center justify-end h-10 shrink-0 gap-3">
      <div className="cursor-pointer hover:text-orange-500 relative transition-colors" onClick={() => setView('cart')}>
        <i className="ri-shopping-bag-line text-[24px] text-gray-600 leading-none"></i>
        {cartCount > 0 && <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border-2 border-white">{cartCount}</span>}
      </div>
      <div className="cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setView('admin')}>
        <i className="ri-dashboard-line text-[24px] text-gray-600 leading-none"></i>
      </div>
    </div>
  </header>
  )
}

export default Header
