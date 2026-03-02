'use client'

import React, { useState, useEffect } from 'react'
import { CartItem } from '@/types'

interface ShopProps {
  setView: (v: string) => void
  addToCart: (item: CartItem) => void
}

interface CategoryData {
  id: string
  name: string
  type: string
  icon: string | null
  image: string | null
  status: string
}

const Shop = ({ setView, addToCart }: ShopProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const products: CartItem[] = [
    { id: 1, name: 'Fresh Organic Carrots', price: 80, oldPrice: 95, img: 'https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png', weight: '1 KG' },
    { id: 2, name: 'Premium Potatoes', price: 45, oldPrice: 55, img: 'https://i.postimg.cc/d1vdTWyL/1000020583-removebg-preview.png', weight: '1 KG' },
    { id: 3, name: 'Fresh Tomatoes', price: 60, oldPrice: 75, img: 'https://i.postimg.cc/mr7CkxtQ/1000020584-removebg-preview.png', weight: '500g' },
    { id: 4, name: 'Organic Spinach', price: 30, oldPrice: 40, img: 'https://i.postimg.cc/MG1VHkvz/1000020586-removebg-preview.png', weight: '1 Bundle' },
    { id: 5, name: 'Crisp Cucumbers', price: 50, oldPrice: 65, img: 'https://i.postimg.cc/TPng18pY/1000020587-removebg-preview.png', weight: '1 KG' },
    { id: 6, name: 'Fresh Onions', price: 35, oldPrice: 45, img: 'https://i.postimg.cc/1zDwXxfR/1000020590-removebg-preview.png', weight: '1 KG' },
    { id: 7, name: 'Green Peppers', price: 55, oldPrice: 70, img: 'https://i.postimg.cc/TPng18pL/1000020591-removebg-preview.png', weight: '500g' },
    { id: 8, name: 'Fresh Garlic', price: 40, oldPrice: 50, img: 'https://i.postimg.cc/mr7Ckxt4/1000020592-removebg-preview.png', weight: '250g' },
    { id: 9, name: 'Organic Ginger', price: 45, oldPrice: 55, img: 'https://i.postimg.cc/K86tmcvZ/1000020593-removebg-preview.png', weight: '200g' },
    { id: 10, name: 'Fresh Broccoli', price: 70, oldPrice: 85, img: 'https://i.postimg.cc/qR0nCm36/1000020611-removebg-preview.png', weight: '1 Piece' },
    { id: 11, name: 'Red Apples', price: 90, oldPrice: 110, img: 'https://i.postimg.cc/x1wL9jTV/IMG-20260228-163137.png', weight: '1 KG' },
    { id: 12, name: 'Fresh Bananas', price: 50, oldPrice: 60, img: 'https://i.postimg.cc/bw71qYYK/IMG-20260228-163147.png', weight: '1 Dozen' },
    { id: 13, name: 'Sweet Oranges', price: 80, oldPrice: 95, img: 'https://i.postimg.cc/mr7Ckxtx/IMG-20260228-163156.png', weight: '1 KG' },
    { id: 14, name: 'Grapes Green', price: 120, oldPrice: 140, img: 'https://i.postimg.cc/htkVK4PD/IMG-20260228-163208.png', weight: '500g' },
    { id: 15, name: 'Mango Fresh', price: 150, oldPrice: 180, img: 'https://i.postimg.cc/Z5G6JYKm/IMG-20260228-163217.png', weight: '1 KG' },
    { id: 16, name: 'Papaya Ripe', price: 60, oldPrice: 75, img: 'https://i.postimg.cc/vZJ5G8Hd/IMG-20260228-163228.png', weight: '1 Piece' }
  ]

  const heroImages = [
    'https://i.postimg.cc/zfN3dyGV/Whisk-785426d5b3a55ac9f384abb1c653efdedr.jpg',
    'https://i.postimg.cc/QCFMB50H/Whisk-186f0227f2203638e6f4806f9343b15cdr.jpg',
    'https://i.postimg.cc/0jzN6mcM/Whisk-21cf4f35609655e91844ef8ae3c7f4c9dr.jpg',
    'https://i.postimg.cc/8c7CFWtv/Whisk-2215d2b37231bb1a2ec403753c88d38fdr.jpg',
    'https://i.postimg.cc/mkPrcM83/Whisk-6915ce64bba40ba9e924b2c9991fd1f7dr.jpg',
    'https://i.postimg.cc/x8XdkHtL/Whisk-7725ed9fada3d57b47746dad0037a667dr.jpg',
    'https://i.postimg.cc/j2DjWNZX/Whisk-92ca7933c1a594782e4409c2912ffaebdr.jpg',
    'https://i.postimg.cc/mkPrcM8P/Whisk-fca8a55bd19b6f9a49c4cafbfd6d5bd5dr.jpg',
  ]
  const [currentHero, setCurrentHero] = useState(0)

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success && data.categories) {
          // Filter only active categories
          const activeCategories = data.categories.filter(
            (cat: CategoryData) => cat.status === 'active'
          )
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="flex-grow">
      {/* Hero Carousel */}
      <section className="w-full pb-4 md:pb-0">
        <div className="mx-6 mt-6 md:mx-6 md:mt-6 relative h-[172.5px] md:h-[260px] rounded-2xl overflow-hidden shadow-xl group">
          {heroImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${i === currentHero ? 'opacity-100' : 'opacity-0'}`}
              style={{backgroundImage: `url('${img}')`}}
            ></div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          {/* Carousel Indicators */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentHero(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentHero ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pt-2 pb-6 md:pt-10 md:pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 font-bangla">ক্যাটাগরি</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base font-bangla">আপনার প্রয়োজনীয় সবকিছু এখানেই পাবেন</p>
          </div>
          <div className="flex justify-center">
            <div className="flex gap-4 md:gap-5 overflow-x-auto md:flex-wrap md:justify-center pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
              {[
                { icon: 'ri-plant-line', name: 'Vegetables' },
                { icon: 'ri-apple-line', name: 'Fruits' },
                { icon: 'ri-drop-line', name: 'Dairy' },
                { icon: 'ri-cup-line', name: 'Beverages' },
                { icon: 'ri-restaurant-line', name: 'Meat' },
                { icon: 'ri-cookie-line', name: 'Snacks' },
              ].map((cat, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center group cursor-pointer">
                  <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl border border-gray-300 bg-white flex items-center justify-center text-gray-700 group-hover:text-[#16a34a] group-hover:border-[#16a34a] transition-colors duration-300 mb-1">
                    <i className={`${cat.icon} text-2xl md:text-4xl`}></i>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OFFER CARDS SECTION */}
      <section id="offers" className="pb-6 md:pb-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-4 text-left">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Offer Cards</h2>
            <p className="text-gray-500 mt-0.5 text-xs md:text-sm">Exclusive deals just for you</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="bg-white rounded-[10px] flex items-center overflow-hidden border border-[#eee] transition-all shrink-0 w-[240px] h-[100px] cursor-pointer" onClick={() => setView('product')}>
              <div className="w-[80px] h-full flex justify-center items-center p-2 pl-6">
                <img src="https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png" alt="Product" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-[1px] h-[70%] bg-[#e0e0e0]"></div>
              <div className="flex-1 py-2 px-3 flex flex-col justify-center">
                <div className="text-[11px] text-[#ff4757] font-bold mb-1">Save 16% today</div>
                <h2 className="text-[13px] font-semibold text-[#333] mb-1 truncate">Fresh Carrots</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#16a34a]">TK80.00</span>
                  <span className="text-[10px] line-through text-[#aaa]">TK95.00</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[10px] flex items-center overflow-hidden border border-[#eee] transition-all shrink-0 w-[240px] h-[100px] cursor-pointer" onClick={() => setView('product')}>
              <div className="w-[80px] h-full flex justify-center items-center p-2 pl-6">
                <img src="https://i.postimg.cc/d1vdTWyL/1000020583-removebg-preview.png" alt="Product" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-[1px] h-[70%] bg-[#e0e0e0]"></div>
              <div className="flex-1 py-2 px-3 flex flex-col justify-center">
                <div className="text-[11px] text-[#ff4757] font-bold mb-1">Flash Deal: 18%</div>
                <h2 className="text-[13px] font-semibold text-[#333] mb-1 truncate">Premium Potatoes</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#16a34a]">TK45.00</span>
                  <span className="text-[10px] line-through text-[#aaa]">TK55.00</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[10px] flex items-center overflow-hidden border border-[#eee] transition-all shrink-0 w-[240px] h-[100px] cursor-pointer" onClick={() => setView('product')}>
              <div className="w-[80px] h-full flex justify-center items-center p-2 pl-6">
                <img src="https://i.postimg.cc/x1wL9jTV/IMG-20260228-163137.png" alt="Product" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-[1px] h-[70%] bg-[#e0e0e0]"></div>
              <div className="flex-1 py-2 px-3 flex flex-col justify-center">
                <div className="text-[11px] text-[#ff4757] font-bold mb-1">Limited Stock</div>
                <h2 className="text-[13px] font-semibold text-[#333] mb-1 truncate">Red Apples</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#16a34a]">TK90.00</span>
                  <span className="text-[10px] line-through text-[#aaa]">TK110.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-12 pt-2">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((item) => (
              <div key={item.id} onClick={() => setView('product')} className="bg-white p-3 shadow-sm relative cursor-pointer transition-all duration-300 flex flex-col w-full min-h-[250px] border border-gray-200 rounded-2xl hover:shadow-lg">
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-15%</span>
                <div className="flex-grow flex items-center justify-center py-2">
                  <div className="w-full h-[140px] flex items-center justify-center">
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain" loading="lazy"/>
                  </div>
                </div>
                <div className="flex flex-col mt-auto">
                  <h3 className="text-sm font-medium text-gray-900 truncate font-bangla">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-2 mt-0.5">
                    <span className="text-sm font-semibold text-[#16a34a]">TK {item.price}</span>
                    <span className="text-xs text-gray-500 line-through">TK {item.oldPrice}</span>
                  </div>
                  <button className="w-full text-xs font-bold py-1.5 flex items-center justify-center gap-1 bg-[#16a34a] text-white rounded-full border-none cursor-pointer transition-transform duration-200 active:scale-95" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      addToCart(item);
                    }}>
                    <i className="ri-shopping-cart-line text-sm"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Shop
