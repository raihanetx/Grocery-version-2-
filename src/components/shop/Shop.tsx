'use client'

import React, { useState, useEffect } from 'react'
import { CartItem } from '@/types'

interface ShopProps {
  setView: (v: string) => void
  addToCart: (item: CartItem) => void
  setSelectedProductId: (id: string) => void
}

interface CategoryData {
  id: string
  name: string
  type: string
  icon: string | null
  image: string | null
  status: string
}

interface ProductVariety {
  id: string
  name: string
  price: number
  stock: number
  discount: string | null
}

interface ProductData {
  id: string
  name: string
  image: string | null
  shortDesc: string | null
  isOffer: boolean
  status: string
  varieties: ProductVariety[]
  category: { id: string; name: string } | null
}

const Shop = ({ setView, addToCart, setSelectedProductId }: ShopProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [products, setProducts] = useState<ProductData[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [offerProducts, setOfferProducts] = useState<ProductData[]>([])
  
  // Banner images from settings
  const defaultHeroImages = [
    'https://i.postimg.cc/zfN3dyGV/Whisk-785426d5b3a55ac9f384abb1c653efdedr.jpg',
    'https://i.postimg.cc/QCFMB50H/Whisk-186f0227f2203638e6f4806f9343b15cdr.jpg',
    'https://i.postimg.cc/0jzN6mcM/Whisk-21cf4f35609655e91844ef8ae3c7f4c9dr.jpg',
    'https://i.postimg.cc/8c7CFWtv/Whisk-2215d2b37231bb1a2ec403753c88d38fdr.jpg',
    'https://i.postimg.cc/mkPrcM83/Whisk-6915ce64bba40ba9e924b2c9991fd1f7dr.jpg',
    'https://i.postimg.cc/x8XdkHtL/Whisk-7725ed9fada3d57b47746dad0037a667dr.jpg',
    'https://i.postimg.cc/j2DjWNZX/Whisk-92ca7933c1a594782e4409c2912ffaebdr.jpg',
    'https://i.postimg.cc/mkPrcM8P/Whisk-fca8a55bd19b6f9a49c4cafbfd6d5bd5dr.jpg',
  ]
  const [heroImages, setHeroImages] = useState<string[]>(defaultHeroImages)
  const [currentHero, setCurrentHero] = useState(0)

  // Fetch settings (banner images)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings?.bannerImages && data.settings.bannerImages.length > 0) {
          setHeroImages(data.settings.bannerImages)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success && data.categories) {
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

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data.success && data.products) {
          const activeProducts = data.products.filter(
            (prod: ProductData) => prod.status === 'active'
          )
          setProducts(activeProducts)
          // Filter offer products
          const offers = activeProducts.filter((p: ProductData) => p.isOffer)
          setOfferProducts(offers)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setProductsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Helper to calculate discount percentage
  const calcDiscount = (variety: ProductVariety): number => {
    if (!variety.discount) return 0
    if (variety.discount.includes('%')) {
      return parseInt(variety.discount.replace('%', ''))
    }
    // Fixed discount - calculate percentage
    const fixedDiscount = parseFloat(variety.discount)
    return Math.round((fixedDiscount / variety.price) * 100)
  }

  // Helper to get old price
  const getOldPrice = (variety: ProductVariety): number => {
    if (!variety.discount) return variety.price
    if (variety.discount.includes('%')) {
      const pct = parseInt(variety.discount.replace('%', '')) / 100
      return Math.round(variety.price / (1 - pct))
    }
    return variety.price + parseFloat(variety.discount)
  }

  // Convert product to cart item format
  const productToCartItem = (product: ProductData): CartItem => {
    const firstVariety = product.varieties[0] || { name: 'Default', price: 0, stock: 0, discount: null }
    return {
      id: parseInt(product.id.slice(-6), 16) || Math.random() * 10000,
      name: product.name,
      price: firstVariety.price,
      oldPrice: getOldPrice(firstVariety),
      img: product.image || 'https://via.placeholder.com/150',
      weight: firstVariety.name
    }
  }

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
              {categoriesLoading ? (
                // Loading skeleton
                [...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl border border-gray-300 bg-gray-100 animate-pulse"></div>
                    <div className="w-12 h-3 bg-gray-100 rounded mt-1 animate-pulse"></div>
                  </div>
                ))
              ) : categories.length === 0 ? (
                <p className="text-gray-400 text-sm">No categories available</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex-shrink-0 flex flex-col items-center group cursor-pointer">
                    <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl border border-gray-300 bg-white flex items-center justify-center text-gray-700 group-hover:text-[#16a34a] group-hover:border-[#16a34a] transition-colors duration-300 mb-1 overflow-hidden">
                      {cat.type === 'icon' ? (
                        <i className={`${cat.icon || 'ri-folder-line'} text-2xl md:text-4xl`}></i>
                      ) : cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <i className="ri-folder-line text-2xl md:text-4xl text-gray-400"></i>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                  </div>
                ))
              )}
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
            {productsLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[10px] flex items-center overflow-hidden border border-[#eee] shrink-0 w-[240px] h-[100px] animate-pulse">
                  <div className="w-[80px] h-full bg-gray-100"></div>
                  <div className="flex-1 p-3">
                    <div className="h-3 bg-gray-100 rounded mb-2 w-20"></div>
                    <div className="h-4 bg-gray-100 rounded mb-2 w-32"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : offerProducts.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">No offers available at the moment</p>
            ) : (
              offerProducts.slice(0, 5).map((product) => {
                const variety = product.varieties[0]
                const discount = variety ? calcDiscount(variety) : 0
                const oldPrice = variety ? getOldPrice(variety) : 0
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-[10px] flex items-center overflow-hidden border border-[#eee] transition-all shrink-0 w-[240px] h-[100px] cursor-pointer hover:shadow-md" 
                    onClick={() => {
                      setSelectedProductId(product.id)
                      setView('product')
                    }}
                  >
                    <div className="w-[80px] h-full flex justify-center items-center p-2 pl-6">
                      <img 
                        src={product.image || 'https://via.placeholder.com/80'} 
                        alt={product.name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <div className="w-[1px] h-[70%] bg-[#e0e0e0]"></div>
                    <div className="flex-1 py-2 px-3 flex flex-col justify-center">
                      <div className="text-[11px] text-[#ff4757] font-bold mb-1">Save {discount}% today</div>
                      <h2 className="text-[13px] font-semibold text-[#333] mb-1 truncate">{product.name}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#16a34a]">TK{variety?.price || 0}.00</span>
                        {oldPrice > (variety?.price || 0) && (
                          <span className="text-[10px] line-through text-[#aaa]">TK{oldPrice}.00</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-12 pt-2">
        <div className="container mx-auto px-4 md:px-6">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-3 shadow-sm border border-gray-200 rounded-2xl animate-pulse min-h-[250px]">
                  <div className="h-[140px] bg-gray-100 rounded mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded mb-2 w-1/2"></div>
                  <div className="h-8 bg-gray-100 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-shopping-bag-line text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-400">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((product) => {
                const variety = product.varieties[0]
                const discount = variety ? calcDiscount(variety) : 0
                const oldPrice = variety ? getOldPrice(variety) : 0
                const cartItem = productToCartItem(product)
                
                return (
                  <div 
                    key={product.id} 
                    onClick={() => {
                      setSelectedProductId(product.id)
                      setView('product')
                    }} 
                    className="bg-white p-3 shadow-sm relative cursor-pointer transition-all duration-300 flex flex-col w-full min-h-[250px] border border-gray-200 rounded-2xl hover:shadow-lg"
                  >
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-{discount}%</span>
                    )}
                    <div className="flex-grow flex items-center justify-center py-2">
                      <div className="w-full h-[140px] flex items-center justify-center">
                        <img 
                          src={product.image || 'https://via.placeholder.com/150'} 
                          alt={product.name} 
                          className="w-full h-full object-contain" 
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col mt-auto">
                      <h3 className="text-sm font-medium text-gray-900 truncate font-bangla">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2 mt-0.5">
                        <span className="text-sm font-semibold text-[#16a34a]">TK {variety?.price || 0}</span>
                        {oldPrice > (variety?.price || 0) && (
                          <span className="text-xs text-gray-500 line-through">TK {oldPrice}</span>
                        )}
                      </div>
                      <button 
                        className="w-full text-xs font-bold py-1.5 flex items-center justify-center gap-1 bg-[#16a34a] text-white rounded-full border-none cursor-pointer transition-transform duration-200 active:scale-95" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          addToCart(cartItem);
                        }}
                      >
                        <i className="ri-shopping-cart-line text-sm"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Shop
