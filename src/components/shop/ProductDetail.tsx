'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CartItem, Review } from '@/types'

const ProductDetail = ({ setView, addToCart }: { setView: (v: string) => void; addToCart: (item: CartItem) => void }) => {
  const [activeTab, setActiveTab] = useState('desc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([
    { id: 1, initials: 'JP', name: 'Joya P.', rating: 5, text: 'Super fresh! My kids loved them.', date: '2 Oct 2023' },
    { id: 2, initials: 'AR', name: 'Ahmed R.', rating: 4, text: 'Good quality but delivery took time.', date: '5 Oct 2023' }
  ])
  
  const imgRef = useRef<HTMLDivElement>(null)
  const detRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0,0)
  }, [])

  const handleSubmitReview = () => {
    const nameInput = document.getElementById('reviewName') as HTMLInputElement
    const textInput = document.getElementById('reviewText') as HTMLTextAreaElement
    const name = nameInput?.value || ''
    const text = textInput?.value || ''
    
    if(name && text && userRating > 0) {
      const initials = name.match(/(\b\S)?/g)?.join("").match(/(^\S|\S$)?/g)?.join("").toUpperCase() || name.substring(0, 2).toUpperCase()
      const newReview: Review = { id: Date.now(), initials, name, rating: userRating, text, date: 'Just now' }
      setReviews([newReview, ...reviews])
      setIsModalOpen(false)
      setUserRating(0)
    } else {
      alert("Please fill all fields and rate.")
    }
  }

  const sampleProduct: CartItem = { id: 99, name: 'Organic Premium Carrots', price: 80, oldPrice: 95, img: 'https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png', weight: '1 KG' }

  return (
    <div className="bg-white w-full py-6 md:py-10 px-[30px] md:px-[45px] max-w-5xl mx-auto min-h-[calc(100vh-120px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="flex flex-col w-full">
          <div ref={imgRef} className="flex-grow relative w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm min-h-[200px]">
            <div className="absolute top-3 left-3 bg-[#16a34a] text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-10 shadow-md">-15% OFF</div>
            <img src={sampleProduct.img} className="absolute inset-0 w-full h-full object-contain" alt="Carrots" />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 flex-shrink-0">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                <img src={sampleProduct.img} className="w-full h-full object-cover" alt="Product thumbnail" />
              </div>
            ))}
          </div>
        </div>
        <div ref={detRef} className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-bold text-[#1F2937] leading-tight mb-3">{sampleProduct.name}</h1>
          <div className="flex items-center flex-wrap gap-4 mb-5"> 
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#16a34a]">TK<span>{sampleProduct.price}</span></span>
              <span className="text-sm text-gray-300 line-through font-medium">TK{sampleProduct.oldPrice}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <span className="text-sm font-semibold text-[#1F2937]">(500g)</span>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-6 line-clamp-2">Farm-fresh organic carrots handpicked from local farms. Crisp, sweet, and perfect for salads, juices, or cooking. Rich in beta-carotene and essential vitamins.</p>
          
          {/* Quantity & Variant Section */}
          <div style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <span style={{fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Quantity</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px'}}>
                  <button style={{width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'}}><i className="ri-subtract-line"></i></button>
                  <span style={{fontSize: '16px', fontWeight: 700, color: '#0f172a', minWidth: '24px', textAlign: 'center'}}>1</span>
                  <button style={{width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'}}><i className="ri-add-line"></i></button>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <span style={{fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Variant</span>
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                  <button style={{padding: '6px 14px', borderRadius: '8px', border: '1px solid #16a34a', background: 'white', color: '#16a34a', fontSize: '12px', fontWeight: 600, cursor: 'pointer'}}>500g</button>
                  <button style={{padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '12px', fontWeight: 500, cursor: 'pointer'}}>1 KG</button>
                </div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0'}}>
              <span style={{fontSize: '13px', color: '#64748b'}}>Total</span>
              <span style={{fontSize: '18px', fontWeight: 700, color: '#0f172a'}}>TK80</span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button onClick={() => addToCart(sampleProduct)} className="btn-tap flex-1 border border-[#16a34a] text-[#16a34a] h-12 rounded-lg text-sm font-bold hover:bg-teal-50 uppercase flex items-center justify-center gap-2"><i className="ri-shopping-cart-line"></i> Add to Cart</button>
            <button onClick={() => setView('checkout')} className="btn-tap flex-1 bg-[#16a34a] text-white h-12 rounded-lg text-sm font-bold shadow-lg shadow-teal-100 uppercase flex items-center justify-center gap-2"><i className="ri-shopping-bag-line"></i> Buy Now</button>
          </div>
        </div>
      </div>
      
      <div ref={tabRef} className="mt-12">
        <div className="flex justify-center items-center gap-5 border-y border-gray-200 py-2.5 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap px-4 md:px-0">
          <button onClick={() => setActiveTab('desc')} className={`text-sm transition-colors ${activeTab === 'desc' ? 'text-[#1F2937] font-bold' : 'text-gray-400 font-medium'}`}>Description</button>
          <div className="w-px h-3 bg-gray-300 shrink-0"></div>
          <button onClick={() => setActiveTab('rev')} className={`text-sm transition-colors ${activeTab === 'rev' ? 'text-[#1F2937] font-bold' : 'text-gray-400 font-medium'}`}>Reviews</button>
          <div className="w-px h-3 bg-gray-300 shrink-0"></div>
          <button onClick={() => setActiveTab('qa')} className={`text-sm transition-colors ${activeTab === 'qa' ? 'text-[#1F2937] font-bold' : 'text-gray-400 font-medium'}`}>FAQ</button>
        </div>
        <div className="max-w-2xl mx-auto">
          {activeTab === 'desc' && (
            <div className="fade-in text-[0.9rem] text-[#6B7280] leading-7 text-center md:text-left">
              <p className="mb-4">These premium organic carrots are sourced directly from trusted local farms in Bangladesh. Known for their vibrant orange color, natural sweetness, and satisfying crunch, they are perfect for a variety of culinary uses - from fresh salads and healthy juices to hearty curries and stir-fries.</p>
              <p className="mb-4">Our carrots are harvested at peak maturity to ensure maximum flavor and nutritional value. They are carefully cleaned and packed to maintain freshness during delivery.</p>
              <ul className="inline-block text-left text-xs space-y-2 mt-4">
                <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> 100% Organic & Pesticide-Free</li>
                <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> Rich in Beta-Carotene & Vitamin A</li>
                <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> Sourced from Local BD Farms</li>
                <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> Delivered Fresh Within 24 Hours</li>
              </ul>
            </div>
          )}
          {activeTab === 'rev' && (
            <div className="fade-in">
              <div className="flex justify-center md:justify-start mb-6 cursor-pointer text-[#16a34a]" onClick={() => setIsModalOpen(true)}>
                <div className="flex items-center gap-2"><i className="ri-edit-circle-line text-lg"></i><span className="text-sm font-semibold underline decoration-dotted">Write a review</span></div>
              </div>
              <div className="flex flex-col gap-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 fade-in w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-[#16a34a] flex items-center justify-center text-xs font-bold">{rev.initials}</div>
                        <span className="text-sm font-bold text-[#1F2937]">{rev.name}</span>
                        <div className="flex text-yellow-400 text-[10px] ml-1">
                          {[1,2,3,4,5].map(i => <i key={i} className={`${i <= rev.rating ? 'ri-star-fill' : 'ri-star-line'}`}></i>)}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{rev.date}</span>
                    </div>
                    <div className="pl-[44px]">
                      <p className="text-xs text-[#6B7280] leading-relaxed">{rev.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'qa' && (
            <div className="fade-in">
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-bold text-[#1F2937] mb-1 flex items-center gap-2"><i className="ri-question-fill text-[#16a34a]"></i> Is this item fresh?</h4>
                  <p className="text-xs text-[#6B7280] pl-6">Yes, we harvest daily from local organic farms to ensure maximum freshness upon delivery.</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-bold text-[#1F2937] mb-1 flex items-center gap-2"><i className="ri-question-fill text-[#16a34a]"></i> What is the shelf life?</h4>
                  <p className="text-xs text-[#6B7280] pl-6">Typically lasts 7-10 days if refrigerated properly in a crisper drawer.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* You May Like Section */}
      <div style={{marginTop: '48px'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 style={{fontSize: '20px', fontWeight: 700, color: '#0f172a'}}>You May Like</h2>
          <button className="text-sm font-medium text-[#16a34a] hover:underline flex items-center gap-1">
            View All <i className="ri-arrow-right-line"></i>
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
          {[
            { id: 1, name: 'Fresh Carrots', price: 80, oldPrice: 95, img: 'https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png', weight: '500g', discount: 16, rating: 4.8, reviews: 124 },
            { id: 2, name: 'Premium Potatoes', price: 45, oldPrice: 55, img: 'https://i.postimg.cc/d1vdTWyL/1000020583-removebg-preview.png', weight: '1 KG', discount: 18, rating: 4.6, reviews: 89 },
            { id: 3, name: 'Fresh Tomatoes', price: 60, oldPrice: 75, img: 'https://i.postimg.cc/mr7CkxtQ/1000020584-removebg-preview.png', weight: '500g', discount: 20, rating: 4.9, reviews: 156 },
            { id: 4, name: 'Red Apples', price: 90, oldPrice: 110, img: 'https://i.postimg.cc/x1wL9jTV/IMG-20260228-163137.png', weight: '1 KG', discount: 18, rating: 4.7, reviews: 203 },
          ].map((item) => (
            <div 
              key={item.id} 
              onClick={() => setView('product')} 
              className="flex-shrink-0 w-[180px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100"
            >
              {/* Image Container with Gradient Overlay */}
              <div className="relative h-[140px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                  -{item.discount}%
                </div>
                {/* Wishlist Button */}
                <button 
                  className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white hover:text-red-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="ri-heart-line text-sm"></i>
                </button>
                {/* Product Image with Hover Effect */}
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-[100px] h-[100px] object-contain transition-transform duration-300 group-hover:scale-110" 
                  loading="lazy"
                />
              </div>
              
              {/* Product Info */}
              <div className="p-3">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <i 
                        key={star} 
                        className={`ri-star-${star <= Math.floor(item.rating) ? 'fill' : 'line'} text-yellow-400`}
                        style={{fontSize: '10px'}}
                      ></i>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">({item.reviews})</span>
                </div>
                
                {/* Product Name */}
                <h3 className="text-sm font-semibold text-gray-800 truncate mb-0.5 group-hover:text-[#16a34a] transition-colors">{item.name}</h3>
                
                {/* Weight */}
                <span className="text-[10px] text-gray-400 block mb-2">{item.weight}</span>
                
                {/* Price Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-[#16a34a]">TK{item.price}</span>
                    <span className="text-[10px] text-gray-400 line-through">TK{item.oldPrice}</span>
                  </div>
                  {/* Quick Add Button */}
                  <button 
                    className="w-8 h-8 bg-[#16a34a] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#15803d] transition-colors transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ id: item.id, name: item.name, price: item.price, oldPrice: item.oldPrice, img: item.img, weight: item.weight });
                    }}
                  >
                    <i className="ri-add-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="text-center text-lg font-bold text-[#1F2937] mb-4">Write a Review</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1,2,3,4,5].map(i => (
                <i key={i} className={`ri-star-${i <= userRating ? 'fill' : 'line'} text-2xl cursor-pointer transition-colors ${i <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} onClick={() => setUserRating(i)}></i>
              ))}
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Your Name</label>
                <input id="reviewName" type="text" className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#16a34a]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Review</label>
                <textarea id="reviewText" rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#16a34a] resize-none"></textarea>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSubmitReview} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#16a34a] shadow-lg hover:opacity-90">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
