'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CartItem, Review } from '@/types'

interface ProductDetailProps {
  setView: (v: string) => void
  addToCart: (item: CartItem) => void
  productId: string | null
}

interface ProductVariety {
  id: string
  name: string
  price: number
  stock: number
  discount: string | null
}

interface ProductFAQ {
  id: string
  question: string
  answer: string
}

interface ProductData {
  id: string
  name: string
  image: string | null
  shortDesc: string | null
  longDesc: string | null
  isOffer: boolean
  status: string
  varieties: ProductVariety[]
  faqs: ProductFAQ[]
  category: { id: string; name: string } | null
}

interface RelatedProduct {
  id: string
  name: string
  image: string | null
  varieties: ProductVariety[]
  status: string
}

const ProductDetail = ({ setView, addToCart, productId }: ProductDetailProps) => {
  const [activeTab, setActiveTab] = useState('desc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariety, setSelectedVariety] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  
  const imgRef = useRef<HTMLDivElement>(null)
  const detRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef<HTMLDivElement>(null)

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (data.success && data.product) {
          setProduct(data.product)
          // Reset variety selection when product changes
          setSelectedVariety(0)
          setQuantity(1)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
    window.scrollTo(0, 0)
  }, [productId])

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!productId) return
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const data = await res.json()
      if (data.success && data.reviews) {
        const formattedReviews: Review[] = data.reviews.map((rev: {
          id: string
          customerName: string
          rating: number
          text: string
          createdAt: string
        }) => {
          const initials = rev.customerName
            .match(/(\b\S)?/g)?.join('')
            .match(/(^\S|\S$)?/g)?.join('')
            .toUpperCase() || rev.customerName.substring(0, 2).toUpperCase()
          const date = new Date(rev.createdAt)
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          return {
            id: rev.id,
            initials,
            name: rev.customerName,
            rating: rev.rating,
            text: rev.text,
            date: dateStr
          }
        })
        setReviews(formattedReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  // Fetch reviews when product changes
  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId])

  // Fetch related products (other products from database, excluding current)
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data.success && data.products) {
          // Filter out current product and inactive products
          const otherProducts = data.products.filter(
            (p: RelatedProduct) => p.id !== productId && p.status === 'active'
          )
          setRelatedProducts(otherProducts.slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
      }
    }
    
    if (productId) {
      fetchRelatedProducts()
    }
  }, [productId])

  const handleSubmitReview = async () => {
    const nameInput = document.getElementById('reviewName') as HTMLInputElement
    const textInput = document.getElementById('reviewText') as HTMLTextAreaElement
    const name = nameInput?.value?.trim() || ''
    const text = textInput?.value?.trim() || ''
    
    if(name && text && userRating > 0) {
      setSubmittingReview(true)
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            customerName: name,
            rating: userRating,
            text
          })
        })
        const data = await res.json()
        if (data.success) {
          // Refresh reviews from API
          await fetchReviews()
          setIsModalOpen(false)
          setUserRating(0)
          // Clear form
          if (nameInput) nameInput.value = ''
          if (textInput) textInput.value = ''
        } else {
          alert(data.error || 'Failed to submit review. Please try again.')
        }
      } catch (error) {
        console.error('Error submitting review:', error)
        alert('Failed to submit review. Please try again.')
      } finally {
        setSubmittingReview(false)
      }
    } else {
      alert("Please fill all fields and rate.")
    }
  }

  // Helper to calculate discount percentage
  const calcDiscount = (variety: ProductVariety | undefined): number => {
    if (!variety || !variety.discount) return 0
    if (variety.discount.includes('%')) {
      return parseInt(variety.discount.replace('%', ''))
    }
    const fixedDiscount = parseFloat(variety.discount)
    return Math.round((fixedDiscount / variety.price) * 100)
  }

  // Helper to get old price
  const getOldPrice = (variety: ProductVariety | undefined): number => {
    if (!variety) return 0
    if (!variety.discount) return variety.price
    if (variety.discount.includes('%')) {
      const pct = parseInt(variety.discount.replace('%', '')) / 100
      return Math.round(variety.price / (1 - pct))
    }
    return variety.price + parseFloat(variety.discount)
  }

  // Get current variety
  const currentVariety = product?.varieties?.[selectedVariety]
  const discount = calcDiscount(currentVariety)
  const oldPrice = getOldPrice(currentVariety)
  const totalPrice = (currentVariety?.price || 0) * quantity

  // Convert product to cart item
  const productToCartItem = (): CartItem => {
    return {
      id: parseInt(product?.id?.slice(-6) || '0', 16) || Math.random() * 10000,
      productId: product?.id,
      name: product?.name || 'Unknown Product',
      price: currentVariety?.price || 0,
      oldPrice: oldPrice,
      img: product?.image || 'https://via.placeholder.com/150',
      weight: currentVariety?.name || 'Default',
      quantity: quantity
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      // Add the item 'quantity' times
      for (let i = 0; i < quantity; i++) {
        addToCart(productToCartItem())
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white w-full py-6 md:py-10 px-[30px] md:px-[45px] max-w-5xl mx-auto min-h-[calc(100vh-120px)]">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="h-[300px] bg-gray-100 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white w-full py-6 md:py-10 px-[30px] md:px-[45px] max-w-5xl mx-auto min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <i className="ri-shopping-bag-line text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-400">Product not found</p>
          <button 
            onClick={() => setView('shop')} 
            className="mt-4 px-6 py-2 bg-[#16a34a] text-white rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white w-full py-6 md:py-10 px-[30px] md:px-[45px] max-w-5xl mx-auto min-h-[calc(100vh-120px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="flex flex-col w-full">
          <div ref={imgRef} className="flex-grow relative w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm min-h-[200px]">
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-[#16a34a] text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-10 shadow-md">-{discount}% OFF</div>
            )}
            <img 
              src={product.image || 'https://via.placeholder.com/150'} 
              className="absolute inset-0 w-full h-full object-contain" 
              alt={product.name} 
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 flex-shrink-0">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src={product.image || 'https://via.placeholder.com/150'} 
                  className="w-full h-full object-cover" 
                  alt="Product thumbnail" 
                />
              </div>
            ))}
          </div>
        </div>
        <div ref={detRef} className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-bold text-[#1F2937] leading-tight mb-3">{product.name}</h1>
          <div className="flex items-center flex-wrap gap-4 mb-5"> 
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#16a34a]">TK<span>{currentVariety?.price || 0}</span></span>
              {oldPrice > (currentVariety?.price || 0) && (
                <span className="text-sm text-gray-300 line-through font-medium">TK{oldPrice}</span>
              )}
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <span className="text-sm font-semibold text-[#1F2937]">({currentVariety?.name || 'N/A'})</span>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-6 line-clamp-2">
            {product.shortDesc || 'No description available'}
          </p>
          
          {/* Quantity & Variant Section */}
          <div style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <span style={{fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Quantity</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px'}}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'}}
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span style={{fontSize: '16px', fontWeight: 700, color: '#0f172a', minWidth: '24px', textAlign: 'center'}}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'}}
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>
              {product.varieties && product.varieties.length > 1 && (
                <div style={{textAlign: 'right'}}>
                  <span style={{fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Variant</span>
                  <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                    {product.varieties.map((variety, idx) => (
                      <button 
                        key={variety.id}
                        onClick={() => setSelectedVariety(idx)}
                        style={{
                          padding: '6px 14px', 
                          borderRadius: '8px', 
                          border: `1px solid ${idx === selectedVariety ? '#16a34a' : '#e2e8f0'}`, 
                          background: 'white', 
                          color: idx === selectedVariety ? '#16a34a' : '#64748b', 
                          fontSize: '12px', 
                          fontWeight: idx === selectedVariety ? 600 : 500, 
                          cursor: 'pointer'
                        }}
                      >
                        {variety.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0'}}>
              <span style={{fontSize: '13px', color: '#64748b'}}>Total</span>
              <span style={{fontSize: '18px', fontWeight: 700, color: '#0f172a'}}>TK{totalPrice}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button onClick={handleAddToCart} className="btn-tap flex-1 border border-[#16a34a] text-[#16a34a] h-12 rounded-lg text-sm font-bold hover:bg-teal-50 uppercase flex items-center justify-center gap-2"><i className="ri-shopping-cart-line"></i> Add to Cart</button>
            <button onClick={() => { handleAddToCart(); setView('checkout'); }} className="btn-tap flex-1 bg-[#16a34a] text-white h-12 rounded-lg text-sm font-bold shadow-lg shadow-teal-100 uppercase flex items-center justify-center gap-2"><i className="ri-shopping-bag-line"></i> Buy Now</button>
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
              {product.longDesc ? (
                <div dangerouslySetInnerHTML={{ __html: product.longDesc.replace(/\n/g, '<br/>') }} />
              ) : (
                <>
                  <p className="mb-4">{product.shortDesc || 'No detailed description available for this product.'}</p>
                  <ul className="inline-block text-left text-xs space-y-2 mt-4">
                    <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> Fresh & Quality Assured</li>
                    <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> Sourced from Trusted Suppliers</li>
                    <li className="flex items-center gap-2"><i className="ri-check-line text-[#16a34a]"></i> Delivered with Care</li>
                  </ul>
                </>
              )}
            </div>
          )}
          {activeTab === 'rev' && (
            <div className="fade-in">
              <div className="flex justify-center md:justify-start mb-6 cursor-pointer text-[#16a34a]" onClick={() => setIsModalOpen(true)}>
                <div className="flex items-center gap-2"><i className="ri-edit-circle-line text-lg"></i><span className="text-sm font-semibold underline decoration-dotted">Write a review</span></div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No reviews yet. Be the first to review!</p>
              ) : (
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
              )}
            </div>
          )}
          {activeTab === 'qa' && (
            <div className="fade-in">
              {product.faqs && product.faqs.length > 0 ? (
                <div className="space-y-4">
                  {product.faqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-bold text-[#1F2937] mb-1 flex items-center gap-2"><i className="ri-question-fill text-[#16a34a]"></i> {faq.question}</h4>
                      <p className="text-xs text-[#6B7280] pl-6">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">No FAQs available for this product.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* You May Like Section */}
      {relatedProducts.length > 0 && (
        <div style={{marginTop: '48px'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 style={{fontSize: '20px', fontWeight: 700, color: '#0f172a'}}>You May Like</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
            {relatedProducts.map((item) => {
              const variety = item.varieties?.[0]
              const itemDiscount = calcDiscount(variety)
              const itemOldPrice = getOldPrice(variety)
              return (
                <div 
                  key={item.id} 
                  onClick={() => window.location.reload()} 
                  className="flex-shrink-0 w-[180px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100"
                >
                  {/* Image Container */}
                  <div className="relative h-[140px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                    {itemDiscount > 0 && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                        -{itemDiscount}%
                      </div>
                    )}
                    {/* Product Image */}
                    <img 
                      src={item.image || 'https://via.placeholder.com/100'} 
                      alt={item.name} 
                      className="w-[100px] h-[100px] object-contain transition-transform duration-300 group-hover:scale-110" 
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3">
                    {/* Product Name */}
                    <h3 className="text-sm font-semibold text-gray-800 truncate mb-0.5 group-hover:text-[#16a34a] transition-colors">{item.name}</h3>
                    
                    {/* Weight */}
                    <span className="text-[10px] text-gray-400 block mb-2">{variety?.name || 'N/A'}</span>
                    
                    {/* Price Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-[#16a34a]">TK{variety?.price || 0}</span>
                        {itemOldPrice > (variety?.price || 0) && (
                          <span className="text-[10px] text-gray-400 line-through">TK{itemOldPrice}</span>
                        )}
                      </div>
                      {/* Quick Add Button */}
                      <button 
                        className="w-8 h-8 bg-[#16a34a] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#15803d] transition-colors transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ 
                            id: parseInt(item.id.slice(-6), 16) || Math.random() * 10000, 
                            name: item.name, 
                            price: variety?.price || 0, 
                            oldPrice: itemOldPrice, 
                            img: item.image || '', 
                            weight: variety?.name || 'N/A' 
                          });
                        }}
                      >
                        <i className="ri-add-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
              <button onClick={handleSubmitReview} disabled={submittingReview} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#16a34a] shadow-lg hover:opacity-90 disabled:opacity-50">
                {submittingReview ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
