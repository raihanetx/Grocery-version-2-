'use client'

import React, { useState, useEffect } from 'react'
import { 
  InventoryItem, 
  Alert, 
  AdminReview, 
  Order, 
  Coupon, 
  CouponProduct, 
  CouponCategory, 
  AbandonedCheckout, 
  CustomerProfile, 
  Settings, 
  Credentials,
  Category,
  Product,
  AbandonedProduct,
  ProductVariety,
  ProductFaq
} from '@/types'

const AdminDashboard = ({ setView }: { setView: (v: string) => void }) => {
  const [dashView, setDashView] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: "Fresh Carrots", category: "Vegetables", image: "https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png", variants: [{ name: "250g", stock: 45, initialStock: 100 }, { name: "500g", stock: 32, initialStock: 80 }, { name: "1 KG", stock: 18, initialStock: 50 }], lastEdited: "Feb 25, 2026" },
    { id: 2, name: "Premium Potatoes", category: "Vegetables", image: "https://i.postimg.cc/d1vdTWyL/1000020583-removebg-preview.png", variants: [{ name: "500g", stock: 28, initialStock: 60 }, { name: "1 KG", stock: 55, initialStock: 100 }, { name: "2 KG", stock: 12, initialStock: 30 }], lastEdited: "Feb 24, 2026" },
    { id: 3, name: "Fresh Tomatoes", category: "Vegetables", image: "https://i.postimg.cc/mr7CkxtQ/1000020584-removebg-preview.png", variants: [{ name: "250g", stock: 8, initialStock: 40 }, { name: "500g", stock: 15, initialStock: 50 }, { name: "1 KG", stock: 22, initialStock: 60 }], lastEdited: "Feb 23, 2026" },
    { id: 4, name: "Red Apples", category: "Fruits", image: "https://i.postimg.cc/x1wL9jTV/IMG-20260228-163137.png", variants: [{ name: "500g", stock: 35, initialStock: 80 }, { name: "1 KG", stock: 48, initialStock: 100 }], lastEdited: "Feb 22, 2026" },
    { id: 5, name: "Fresh Bananas", category: "Fruits", image: "https://i.postimg.cc/bw71qYYK/IMG-20260228-163147.png", variants: [{ name: "6 pcs", stock: 42, initialStock: 80 }, { name: "1 Dozen", stock: 28, initialStock: 50 }], lastEdited: "Feb 21, 2026" },
    { id: 6, name: "Organic Spinach", category: "Vegetables", image: "https://i.postimg.cc/MG1VHkvz/1000020586-removebg-preview.png", variants: [{ name: "1 Bundle", stock: 5, initialStock: 25 }], lastEdited: "Feb 20, 2026" },
    { id: 7, name: "Sweet Oranges", category: "Fruits", image: "https://i.postimg.cc/mr7Ckxtx/IMG-20260228-163156.png", variants: [{ name: "500g", stock: 30, initialStock: 70 }, { name: "1 KG", stock: 45, initialStock: 80 }], lastEdited: "Feb 19, 2026" },
    { id: 8, name: "Grapes Green", category: "Fruits", image: "https://i.postimg.cc/htkVK4PD/IMG-20260228-163208.png", variants: [{ name: "250g", stock: 3, initialStock: 20 }, { name: "500g", stock: 18, initialStock: 40 }], lastEdited: "Feb 18, 2026" },
  ])
  const [expandedInventory, setExpandedInventory] = useState<number | null>(null)
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null)

  const [alerts] = useState<Alert[]>([
    { title: "Low Stock Alert", desc: "Sourdough Loaf is running low.", type: "danger" },
    { title: "Expiry Warning", desc: "3 items expire tomorrow.", type: "warning" },
    { title: "New Order", desc: "Order #402 placed online.", type: "info" },
  ])

  // Reviews Management State
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Fetch reviews from database
  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.success && data.reviews) {
        const formattedReviews: AdminReview[] = data.reviews.map((rev: {
          id: string
          customerName: string
          rating: number
          text: string
          createdAt: string
          product: {
            id: string
            name: string
            image: string | null
            category: { name: string } | null
          }
        }) => {
          const date = new Date(rev.createdAt)
          return {
            id: rev.id,
            product: rev.product?.name || 'Unknown Product',
            productCategory: rev.product?.category?.name || 'Uncategorized',
            productImg: rev.product?.image || '',
            customerName: rev.customerName,
            rating: rev.rating,
            text: rev.text,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          }
        })
        setAdminReviews(formattedReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  // Delete review from database
  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return
    
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showToastMsg('Review deleted successfully!')
        fetchReviews()
      } else {
        showToastMsg(data.error || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      showToastMsg('Failed to delete review')
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', stock: '' })

  // Category Management State
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Fetch categories from database
  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success && data.categories) {
        const formattedCategories: Category[] = data.categories.map((cat: {id: string; name: string; type: string; icon: string | null; image: string | null; status: string; createdAt: string}) => ({
          id: cat.id,
          name: cat.name,
          type: cat.type || 'icon',
          icon: cat.icon || '',
          image: cat.image || '',
          items: 0, // Will be calculated when products are added
          created: formatTimeAgo(cat.createdAt),
          status: cat.status === 'active' ? 'Active' : 'Hidden'
        }))
        setCategories(formattedCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      showToastMsg('Failed to load categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Format date to time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Just now'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return '1 week ago'
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews()
  }, [])

  // Fetch reviews when dashView changes to reviews
  useEffect(() => {
    if (dashView === 'reviews') {
      fetchReviews()
    }
  }, [dashView])

  // Product Management State
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [prodVarieties, setProdVarieties] = useState<ProductVariety[]>([])
  const [prodFaqs, setProdFaqs] = useState<ProductFaq[]>([])
  const [prodImages, setProdImages] = useState<string[]>([])
  const [prodRelated, setProdRelated] = useState<number[]>([])
  const [relatedSearch, setRelatedSearch] = useState('')

  // Fetch products from database
  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await fetch('/api/products?all=true')
      const data = await res.json()
      if (data.success && data.products) {
        const formattedProducts: Product[] = data.products.map((prod: {
          id: string;
          name: string;
          categoryId: string | null;
          category: { name: string } | null;
          image: string | null;
          shortDesc: string | null;
          longDesc: string | null;
          isOffer: boolean;
          status: string;
          varieties: { name: string; price: number; stock: number; discount: string | null }[];
        }) => {
          // Calculate price range
          const prices = prod.varieties?.map((v) => v.price) || []
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
          const priceStr = prices.length > 1 ? `TK${minPrice} – TK${maxPrice}` : prices.length === 1 ? `TK${minPrice}` : 'TK0'
          
          // Calculate discount
          const discounts = prod.varieties?.map((v) => v.discount).filter((d): d is string => Boolean(d)) || []
          const discountStr = discounts.length > 0 ? discounts[0] : '0%'

          return {
            id: prod.id,
            name: prod.name,
            category: prod.category?.name || 'Uncategorized',
            categoryId: prod.categoryId || undefined,
            image: prod.image || '',
            variants: `${prod.varieties?.length || 0} variant${(prod.varieties?.length || 0) !== 1 ? 's' : ''}`,
            price: priceStr,
            discount: discountStr,
            offer: prod.isOffer,
            status: prod.status || 'active',
            shortDesc: prod.shortDesc || '',
            longDesc: prod.longDesc || '',
            offerSwitch: prod.isOffer
          }
        })
        setProducts(formattedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      showToastMsg('Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])
  
  // Derive related products options from actual products in database
  const allRelatedOptions = products.map(p => ({
    id: parseInt(p.id?.toString().slice(-6) || '0', 16) || 0,
    name: p.name || '',
    category: p.category?.name || 'Uncategorized',
    price: p.varieties?.[0]?.price || 0,
    image: p.image || ''
  }))

  const handleAddProductInventory = (e: React.FormEvent) => {
    e.preventDefault()
    if(!newProduct.name || !newProduct.stock) return
    const qty = parseInt(newProduct.stock)
    const status = qty > 50 ? 'High' : (qty > 20 ? 'Med' : 'Low')
    const newItem: InventoryItem = { name: newProduct.name, stock: qty, status: status, trend: 'up' }
    setInventory([newItem, ...inventory])
    setNewProduct({ name: '', stock: '' })
    setIsModalOpen(false)
  }

  const chartData = [
    { day: 'Mon', height: '40%' }, { day: 'Tue', height: '65%', active: true }, { day: 'Wed', height: '55%' },
    { day: 'Thu', height: '80%' }, { day: 'Fri', height: '70%' }, { day: 'Sat', height: '90%' }, { day: 'Sun', height: '50%' }
  ]

  // Category Functions
  const openCategoryEdit = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory({ ...cat, type: cat.type })
    } else {
      setEditingCategory({
        id: '', name: '', type: 'icon', icon: '', image: '', items: 0, created: 'Just now', status: 'Active'
      })
    }
  }

  const handleSaveCategory = async () => {
    if (!editingCategory?.name) { showToastMsg('Please enter a category name'); return }
    
    const isNewCategory = !editingCategory.id || editingCategory.id === ''
    
    try {
      if (isNewCategory) {
        // Create new category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingCategory.name,
            type: editingCategory.type,
            icon: editingCategory.type === 'icon' ? editingCategory.icon : null,
            image: editingCategory.type === 'image' ? editingCategory.image : null,
            status: editingCategory.status === 'Active' ? 'active' : 'hidden'
          })
        })
        const data = await res.json()
        if (data.success) {
          showToastMsg('Category Created Successfully!')
          fetchCategories()
          setEditingCategory(null)
        } else {
          showToastMsg(data.error || 'Failed to create category')
        }
      } else {
        // Update existing category
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingCategory.name,
            type: editingCategory.type,
            icon: editingCategory.type === 'icon' ? editingCategory.icon : null,
            image: editingCategory.type === 'image' ? editingCategory.image : null,
            status: editingCategory.status === 'Active' ? 'active' : 'hidden'
          })
        })
        const data = await res.json()
        if (data.success) {
          showToastMsg('Category Updated Successfully!')
          fetchCategories()
          setEditingCategory(null)
        } else {
          showToastMsg(data.error || 'Failed to update category')
        }
      }
    } catch (error) {
      console.error('Error saving category:', error)
      showToastMsg('Failed to save category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return
    
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showToastMsg('Category Deleted Successfully!')
        fetchCategories()
      } else {
        showToastMsg(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      showToastMsg('Failed to delete category')
    }
  }

  // Handle category image upload
  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToastMsg('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToastMsg('Image size should be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setEditingCategory(prev => prev ? { ...prev, image: base64 } : null)
    }
    reader.onerror = () => {
      showToastMsg('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  // Product Functions
  const openProductEdit = async (prod: Product | null = null) => {
    if (prod) {
      // First set basic info from the list
      setEditingProduct({ 
        ...prod, 
        shortDesc: '', 
        longDesc: '', 
        offerSwitch: prod.offer 
      })
      setProdVarieties([])
      setProdFaqs([])
      setProdImages([])
      
      // Fetch product details including varieties, descriptions, FAQs
      try {
        const res = await fetch(`/api/products/${prod.id}`)
        const data = await res.json()
        if (data.success && data.product) {
          const productData = data.product
          
          // Update editingProduct with actual data from database
          setEditingProduct({
            id: productData.id,
            name: productData.name || '',
            category: productData.category?.name || 'Uncategorized',
            categoryId: productData.categoryId || undefined,
            image: productData.image || '',
            variants: `${productData.varieties?.length || 0} variant${(productData.varieties?.length || 0) !== 1 ? 's' : ''}`,
            price: 'TK0',
            discount: '0%',
            offer: productData.isOffer || false,
            status: productData.status || 'active',
            shortDesc: productData.shortDesc || '',
            longDesc: productData.longDesc || '',
            offerSwitch: productData.isOffer || false
          })
          
          // Load varieties from database
          if (productData.varieties && productData.varieties.length > 0) {
            setProdVarieties(productData.varieties.map((v: { id: string; name: string; price: number; stock: number; discount: string | null }) => ({
              id: parseInt(v.id.slice(-6), 16) || Date.now() + Math.random(),
              name: v.name || '',
              price: (v.price || 0).toString(),
              stock: (v.stock || 0).toString(),
              discount: v.discount || ''
            })))
          } else {
            setProdVarieties([])
          }
          
          // Load images from database
          if (productData.images && productData.images.length > 0) {
            setProdImages(productData.images.map((img: { url: string }) => img.url))
          } else if (productData.image) {
            setProdImages([productData.image])
          } else {
            setProdImages([])
          }
          
          // Load FAQs from database
          if (productData.faqs && productData.faqs.length > 0) {
            setProdFaqs(productData.faqs.map((f: { id: string; question: string; answer: string }) => ({
              id: parseInt(f.id.slice(-6), 16) || Date.now() + Math.random(),
              question: f.question || '',
              answer: f.answer || ''
            })))
          } else {
            setProdFaqs([])
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
        setProdVarieties([])
        setProdFaqs([])
        setProdImages([])
      }
    } else {
      setEditingProduct({
        id: '', name: '', category: '', categoryId: '', image: '', variants: '0 variants', price: 'TK0', discount: '0%', offer: false, status: 'active', shortDesc: '', longDesc: '', offerSwitch: false
      })
      setProdVarieties([])
      setProdFaqs([])
      setProdImages([])
      setProdRelated([])
    }
  }

  const handleSaveProduct = async () => {
    if (!editingProduct?.name) { showToastMsg('Please enter product name'); return }
    
    const isNewProduct = !editingProduct.id || editingProduct.id === ''
    
    // Prepare varieties data
    const varietiesData = prodVarieties.map(v => ({
      name: v.name,
      price: parseFloat(v.price) || 0,
      stock: parseInt(v.stock) || 0,
      discount: v.discount || null
    }))

    // Prepare FAQs data
    const faqsData = prodFaqs.map(f => ({
      question: f.question,
      answer: f.answer
    }))

    // Get category ID from categories list
    const selectedCategory = categories.find(c => c.name === editingProduct.category)
    const categoryId = selectedCategory?.id || null

    try {
      if (isNewProduct) {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingProduct.name,
            categoryId: categoryId,
            shortDesc: editingProduct.shortDesc,
            longDesc: editingProduct.longDesc,
            isOffer: editingProduct.offerSwitch,
            status: editingProduct.status || 'active',
            image: prodImages[0] || editingProduct.image || null,
            varieties: varietiesData,
            faqs: faqsData
          })
        })
        const data = await res.json()
        if (data.success) {
          showToastMsg('Product Created Successfully!')
          fetchProducts()
          setEditingProduct(null)
        } else {
          showToastMsg(data.error || 'Failed to create product')
        }
      } else {
        // Update existing product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingProduct.name,
            categoryId: categoryId,
            shortDesc: editingProduct.shortDesc,
            longDesc: editingProduct.longDesc,
            isOffer: editingProduct.offerSwitch,
            status: editingProduct.status,
            image: prodImages[0] || editingProduct.image || null,
            varieties: varietiesData,
            faqs: faqsData
          })
        })
        const data = await res.json()
        if (data.success) {
          showToastMsg('Product Updated Successfully!')
          fetchProducts()
          setEditingProduct(null)
        } else {
          showToastMsg(data.error || 'Failed to update product')
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      showToastMsg('Failed to save product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showToastMsg('Product Deleted Successfully!')
        fetchProducts()
      } else {
        showToastMsg(data.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showToastMsg('Failed to delete product')
    }
  }

  const toggleProdStatus = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p))
      } else {
        showToastMsg(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      showToastMsg('Failed to update status')
    }
  }

  // Handle product image upload
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed 5 images limit
    const currentCount = prodImages.length
    const newFiles = Array.from(files).slice(0, 5 - currentCount)
    
    if (currentCount >= 5) {
      showToastMsg('Maximum 5 images allowed')
      return
    }

    if (files.length > newFiles.length) {
      showToastMsg(`Only ${5 - currentCount} more image(s) can be added (max 5 total)`)
    }

    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToastMsg('Please select image files only')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        showToastMsg('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setProdImages(prev => {
          if (prev.length >= 5) return prev // Double check limit
          return [...prev, base64]
        })
        // Set first image as main product image
        if (prodImages.length === 0) {
          setEditingProduct(prev => prev ? { ...prev, image: base64 } : null)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeProductImage = (index: number) => {
    setProdImages(prev => prev.filter((_, i) => i !== index))
    // Update main image if first image is removed
    if (index === 0 && prodImages.length > 1) {
      setEditingProduct(prev => prev ? { ...prev, image: prodImages[1] } : null)
    } else if (prodImages.length === 1) {
      setEditingProduct(prev => prev ? { ...prev, image: '' } : null)
    }
  }

  const addVariety = () => setProdVarieties(prev => [...prev, { id: Date.now(), name: '', price: '', stock: '', discount: '' }])
  const removeVariety = (id: number) => setProdVarieties(prev => prev.filter(v => v.id !== id))
  const updateVariety = (id: number, field: keyof ProductVariety, value: string) => {
    setProdVarieties(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }
  const addFaq = () => setProdFaqs(prev => [...prev, { id: Date.now(), question: '', answer: '' }])
  const removeFaq = (id: number) => setProdFaqs(prev => prev.filter(f => f.id !== id))
  const updateFaq = (id: number, field: keyof ProductFaq, value: string) => {
    setProdFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }
  const toggleRelated = (id: number) => {
    if (prodRelated.includes(id)) setProdRelated(prodRelated.filter(i => i !== id))
    else if (prodRelated.length < 4) setProdRelated([...prodRelated, id])
  }

  const showToastMsg = (msg: string) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2200)
  }

  // Order Management State
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [currentOrderFilter, setCurrentOrderFilter] = useState<'all' | 'pending' | 'approved' | 'canceled'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Fetch orders from database
  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success && data.orders) {
        const formattedOrders: Order[] = data.orders.map((order: {
          id: string
          orderNumber: string
          customerName: string
          customerPhone: string
          customerAddress: string
          paymentMethod: string
          status: string
          courierStatus: string | null
          canceledBy: string | null
          subtotal: number
          deliveryCharge: number
          discount: number
          couponDiscount: number
          total: number
          notes: string | null
          createdAt: string
          items: { productName: string; varietyName: string | null; quantity: number; basePrice: number; offerDiscount: number; couponDiscount: number; totalPrice: number }[]
          couponCodes: { code: string; discount: number }[]
          consignmentId?: string | null
          trackingCode?: string | null
        }) => {
          const date = new Date(order.createdAt)
          return {
            id: order.orderNumber,
            databaseId: order.id,
            customer: order.customerName,
            phone: order.customerPhone,
            address: order.customerAddress,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: getTimeAgo(order.createdAt),
            paymentMethod: order.paymentMethod,
            status: order.status as 'pending' | 'approved' | 'canceled' | 'delivered',
            courierStatus: order.courierStatus || 'Processing',
            subtotal: order.subtotal,
            delivery: order.deliveryCharge,
            discount: order.discount,
            couponCodes: order.couponCodes?.map((c: { code: string }) => c.code) || [],
            couponAmount: order.couponDiscount || 0,
            total: order.total,
            canceledBy: order.canceledBy,
            consignmentId: order.consignmentId,
            trackingCode: order.trackingCode,
            items: order.items?.map((item: { productName: string; varietyName: string | null; quantity: number; basePrice: number; offerDiscount: number; couponDiscount: number; totalPrice: number }) => ({
              name: item.productName,
              variant: item.varietyName,
              qty: item.quantity,
              basePrice: item.basePrice,
              offerText: item.offerDiscount > 0 ? `${item.offerDiscount} off` : null,
              offerDiscount: item.offerDiscount,
              couponCode: null,
              couponDiscount: item.couponDiscount
            })) || []
          }
        })
        setOrders(formattedOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      showToastMsg('Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  // Helper function to get time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  // Fetch orders on component mount and when dashView changes to orders
  useEffect(() => {
    if (dashView === 'orders') {
      fetchOrders()
    }
  }, [dashView])

  const filteredOrders = currentOrderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === currentOrderFilter)

  const updateOrderStatus = async (id: string, status: 'approved' | 'canceled') => {
    const order = orders.find(o => o.id === id)
    if (!order) return

    try {
      const res = await fetch(`/api/orders/${order.databaseId || id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          canceledBy: status === 'canceled' ? 'Admin' : null
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        showToastMsg(data.message || `Order ${status} successfully!`)
        fetchOrders() // Refresh orders list
      } else {
        showToastMsg(data.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      showToastMsg('Failed to update order')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToastMsg('Number Copied!')
  }

  // Coupon Management State - derive products and categories from database
  const couponProducts: CouponProduct[] = products.map(p => ({
    id: p.id?.toString() || '',
    name: p.name || '',
    price: p.price || 'TK0',
    img: p.image || ''
  }))
  const couponCategories: CouponCategory[] = categories.map(c => ({
    name: c.name,
    color: '#16a34a'
  }))
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'pct' as 'pct' | 'fixed',
    value: '',
    expiry: '',
    scope: 'all' as 'all' | 'products' | 'categories',
  })
  const [pickedProducts, setPickedProducts] = useState<string[]>([])
  const [pickedCategories, setPickedCategories] = useState<string[]>([])

  // Fetch coupons from database
  const fetchCoupons = async () => {
    setCouponsLoading(true)
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      if (data.success && data.coupons) {
        setCoupons(data.coupons)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      showToastMsg('Failed to load coupons')
    } finally {
      setCouponsLoading(false)
    }
  }

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons()
  }, [])

  // Fetch coupons when dashView changes to coupons
  useEffect(() => {
    if (dashView === 'coupons') {
      fetchCoupons()
    }
  }, [dashView])

  const openCouponEdit = (coupon: Coupon | null = null) => {
    if (coupon && coupon.id) {
      setCouponForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        expiry: coupon.expiry || '',
        scope: coupon.scope,
      })
      setPickedProducts((coupon.selectedProducts || []).map(id => id.toString()))
      setPickedCategories(coupon.selectedCategories || [])
      setEditingCoupon(coupon)
    } else {
      setCouponForm({ code: '', type: 'pct', value: '', expiry: '', scope: 'all' })
      setPickedProducts([])
      setPickedCategories([])
      setEditingCoupon({ id: '', code: '', type: 'pct', value: 0, scope: 'all', expiry: '' })
    }
  }

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim()) { showToastMsg('Please enter a coupon code.'); return }
    if (!couponForm.value.trim()) { showToastMsg('Please enter a discount value.'); return }

    const couponData = {
      code: couponForm.code.toUpperCase(),
      type: couponForm.type,
      value: parseFloat(couponForm.value),
      scope: couponForm.scope,
      expiry: couponForm.expiry || null,
      selectedProducts: couponForm.scope === 'products' ? pickedProducts : undefined,
      selectedCategories: couponForm.scope === 'categories' ? pickedCategories : undefined,
    }

    try {
      const isNewCoupon = !editingCoupon?.id || editingCoupon.id === ''
      
      if (isNewCoupon) {
        // Create new coupon
        const res = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponData)
        })
        const data = await res.json()
        if (data.success) {
          showToastMsg('Coupon created successfully!')
          fetchCoupons()
          setEditingCoupon(null)
        } else {
          showToastMsg(data.error || 'Failed to create coupon')
        }
      } else {
        // Update existing coupon
        const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponData)
        })
        const data = await res.json()
        if (data.success) {
          showToastMsg('Coupon updated successfully!')
          fetchCoupons()
          setEditingCoupon(null)
        } else {
          showToastMsg(data.error || 'Failed to update coupon')
        }
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      showToastMsg('Failed to save coupon')
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showToastMsg('Coupon deleted successfully!')
        fetchCoupons()
      } else {
        showToastMsg(data.error || 'Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      showToastMsg('Failed to delete coupon')
    }
  }

  const toggleProductPick = (id: number | string) => {
    const idStr = id.toString()
    if (pickedProducts.includes(idStr)) {
      setPickedProducts(pickedProducts.filter(p => p !== idStr))
    } else {
      setPickedProducts([...pickedProducts, idStr])
    }
  }

  const toggleCategoryPick = (name: string) => {
    if (pickedCategories.includes(name)) {
      setPickedCategories(pickedCategories.filter(c => c !== name))
    } else {
      setPickedCategories([...pickedCategories, name])
    }
  }

  const formatExpiry = (expiry: string) => {
    if (!expiry) return '[No Expiry]'
    const d = new Date(expiry + 'T00:00:00')
    return `[${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}]`
  }

  // Abandoned Checkouts State
  const [abandonedCheckouts, setAbandonedCheckouts] = useState<AbandonedCheckout[]>([])
  const [abandonedLoading, setAbandonedLoading] = useState(false)

  // Fetch abandoned checkouts from API
  const fetchAbandonedCheckouts = async () => {
    setAbandonedLoading(true)
    try {
      const res = await fetch('/api/abandoned')
      const data = await res.json()
      if (data.success && data.abandonedCheckouts) {
        const formatted: AbandonedCheckout[] = data.abandonedCheckouts.map((item: {
          id: string
          customerName: string
          customerPhone: string
          customerAddress: string | null
          visitTime: string
          totalVisits: number
          history: Array<{
            id: string
            visitDate: string
            status: string
            total: number
            products: Array<{
              productName: string
              varietyLabel: string | null
              quantity: number
            }>
          }>
        }) => {
          const visitDate = new Date(item.visitTime)
          const completedOrders = item.history.filter((h: { status: string }) => h.status === 'completed').length
          
          return {
            id: item.id,
            name: item.customerName,
            phone: item.customerPhone,
            address: item.customerAddress || '',
            visitTime: getTimeAgo(item.visitTime),
            visitDate: `${visitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${visitDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
            totalVisits: item.totalVisits,
            completedOrders,
            history: item.history.map((h: {
              visitDate: string
              status: string
              total: number
              products: Array<{ productName: string; varietyLabel: string | null; quantity: number }>
            }) => {
              const hDate = new Date(h.visitDate)
              // Group products by name and combine variants
              const productMap = new Map<string, { label: string | null; qty: number }[]>()
              h.products.forEach((p) => {
                if (!productMap.has(p.productName)) {
                  productMap.set(p.productName, [])
                }
                productMap.get(p.productName)!.push({
                  label: p.varietyLabel,
                  qty: p.quantity
                })
              })
              const products = Array.from(productMap.entries()).map(([name, variants]) => ({
                name,
                variants
              }))
              
              return {
                date: hDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: hDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                timeAgo: getTimeAgo(h.visitDate),
                status: h.status as 'abandoned' | 'completed',
                products,
                total: h.total
              }
            })
          }
        })
        setAbandonedCheckouts(formatted)
      }
    } catch (error) {
      console.error('Error fetching abandoned checkouts:', error)
    } finally {
      setAbandonedLoading(false)
    }
  }

  // Fetch abandoned checkouts when dashView changes to abandoned
  useEffect(() => {
    if (dashView === 'abandoned') {
      fetchAbandonedCheckouts()
    }
  }, [dashView])

  const [expandedAbandoned, setExpandedAbandoned] = useState<string | null>(null)

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase()

  const buildEntries = (products: AbandonedProduct[]) => {
    const entries: { name: string; variant: string | null; qty: number }[] = []
    products.forEach(p => p.variants.forEach(v => entries.push({ name: p.name, variant: v.label, qty: v.qty })))
    return entries
  }

  const toggleAbandonedExpand = (id: string) => {
    setExpandedAbandoned(expandedAbandoned === id ? null : id)
  }

  // Customer Profile State
  const [customerProfiles] = useState<CustomerProfile[]>([
    {
      id: 1, name: 'Rafi Hossain', phone: '+8801712345678',
      address: '555 Park Ave, Dhaka',
      totalSpent: 450.50, totalOrders: 5,
      orders: [
        {
          date: 'Feb 24, 2026', time: '3:42 PM', timeAgo: '2 days ago', visitCount: 21,
          products: [
            { name: 'Organic Milk', variants: [{ label: '1L', qty: 2 }] },
            { name: 'Whole Wheat Bread', variants: [{ label: null, qty: 2 }] },
            { name: 'Farm Eggs', variants: [{ label: '12 pcs', qty: 1 }] },
          ],
          total: 45.92
        },
        {
          date: 'Feb 10, 2026', time: '5:10 PM', timeAgo: '2 weeks ago', visitCount: 15,
          products: [
            { name: 'Basmati Rice', variants: [{ label: '5kg', qty: 1 }] },
            { name: 'Soybean Oil', variants: [{ label: '2L', qty: 1 }] },
          ],
          total: 85.50
        },
      ]
    },
    {
      id: 2, name: 'Tariq Mahmud', phone: '+8801812345678',
      address: '888 River St, Chittagong',
      totalSpent: 1250.00, totalOrders: 12,
      orders: [
        {
          date: 'Feb 25, 2026', time: '10:00 AM', timeAgo: '5 hours ago', visitCount: 42,
          products: [
            { name: 'Beef Meat', variants: [{ label: '2kg', qty: 1 }] },
            { name: 'Chicken', variants: [{ label: 'Whole', qty: 2 }] },
            { name: 'Spices Mix', variants: [{ label: 'Pack', qty: 3 }] },
            { name: 'Onions', variants: [{ label: '5kg', qty: 1 }] },
          ],
          total: 320.00
        },
      ]
    },
    {
      id: 3, name: 'Sumaiya Akter', phone: '+8801912345678',
      address: '12 Green Rd, Sylhet',
      totalSpent: 85.00, totalOrders: 2,
      orders: [
        {
          date: 'Jan 20, 2026', time: '4:00 PM', timeAgo: '1 month ago', visitCount: 8,
          products: [
            { name: 'Face Wash', variants: [{ label: '100ml', qty: 1 }] },
            { name: 'Shampoo', variants: [{ label: '200ml', qty: 1 }] },
          ],
          total: 45.00
        }
      ]
    }
  ])
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null)

  const toggleCustomerExpand = (id: number) => {
    setExpandedCustomer(expandedCustomer === id ? null : id)
  }

  // Settings State
  const [settings, setSettings] = useState<Settings>({
    websiteName: 'GroceryHub',
    slogan: 'Freshness at your door',
    faviconUrl: '',
    insideDhakaDelivery: 60,
    outsideDhakaDelivery: 120,
    freeDeliveryMin: 1000,
    whatsappNumber: '',
    phoneNumber: '',
    facebookUrl: '',
    messengerUsername: '',
    aboutUs: '',
    termsConditions: '',
    refundPolicy: '',
    privacyPolicy: ''
  })

  const handleSaveSettings = () => {
    showToastMsg('Settings saved successfully!')
  }

  // Credentials State
  const [credentials, setCredentials] = useState<Credentials>({
    username: 'admin_main',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    apiKey: 'pk_test_8f7d6a5s4d3f2g1h',
    secretKey: 'sk_test_1a2b3c4d5e6f7g8h',
    webhookUrl: 'https://myshop.com/webhooks/delivery'
  })

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
      showToastMsg('Passwords do not match!')
      return
    }
    setCredentials({...credentials, currentPassword: '', newPassword: '', confirmPassword: ''})
    showToastMsg('Account settings saved successfully!')
  }

  const handleSaveApi = (e: React.FormEvent) => {
    e.preventDefault()
    showToastMsg('API configurations saved successfully!')
  }

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const copyToClipboardLocal = (text: string) => {
    navigator.clipboard.writeText(text)
    showToastMsg('Number copied!')
  }

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'orders', label: 'Orders', icon: 'ri-shopping-bag-line' },
    { id: 'products', label: 'Products', icon: 'ri-store-2-line' },
    { id: 'inventory', label: 'Inventory', icon: 'ri-archive-line' },
    { id: 'categories', label: 'Categories', icon: 'ri-folder-line' },
    { id: 'coupons', label: 'Coupons', icon: 'ri-ticket-2-line' },
    { id: 'reviews', label: 'Reviews', icon: 'ri-star-line' },
    { id: 'abandoned', label: 'Abandoned', icon: 'ri-alert-line' },
    { id: 'customers', label: 'Customers', icon: 'ri-user-line' },
  ]

  const configItems = [
    { id: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
    { id: 'credentials', label: 'Credentials', icon: 'ri-shield-keyhole-line' },
  ]

  const getPageTitle = () => {
    if (editingCategory) return 'Edit Category'
    if (editingProduct) return 'Edit Product'
    if (editingCoupon) return 'Edit Coupon'
    switch(dashView) {
      case 'overview': return 'Store Overview'
      case 'orders': return 'Order Management'
      case 'products': return 'Product Management'
      case 'inventory': return 'Inventory Management'
      case 'categories': return 'Category Management'
      case 'coupons': return 'Coupon Management'
      case 'reviews': return 'Review Management'
      case 'abandoned': return 'Abandoned Checkouts'
      case 'customers': return 'Customer History'
      case 'settings': return 'System Settings'
      case 'credentials': return 'Settings Configuration'
      default: return 'Dashboard'
    }
  }

  const getPageDesc = () => {
    if (editingCategory) return 'Modify category details and settings'
    if (editingProduct) return 'Update product information and variants'
    if (editingCoupon) return 'Adjust coupon rules and availability'
    switch(dashView) {
      case 'overview': return 'Performance metrics for October 24, 2023'
      case 'orders': return 'Detailed overview of all incoming requests'
      case 'products': return 'Manage your store items and inventory'
      case 'inventory': return 'Track and manage product stock levels'
      case 'categories': return 'Organize your product categories'
      case 'coupons': return 'Manage discount coupons for your store'
      case 'reviews': return 'Manage customer reviews and feedback'
      case 'abandoned': return 'Customers who visited but didn\'t complete checkout'
      case 'customers': return 'Overview of customer orders and spending'
      case 'settings': return 'Configure your store preferences and policies'
      case 'credentials': return 'Manage your account credentials and system integrations'
      default: return ''
    }
  }

  return (
    <div className="admin-layout" style={{fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"}}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src="https://i.postimg.cc/4xZk3k2j/IMG-20260226-120143.png" alt="Logo" style={{width: '32px', height: '32px', objectFit: 'contain'}} />
          <h2>Krishi Bitan</h2>
        </div>
        <button className="admin-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <i className="ri-arrow-left-s-line"></i>
        </button>
        
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Main Menu</div>
            {navItems.map(item => (
              <div 
                key={item.id}
                className={`admin-nav-item ${dashView === item.id && !editingCategory && !editingProduct && !editingCoupon ? 'active' : ''}`}
                onClick={() => { setDashView(item.id); setEditingCategory(null); setEditingProduct(null); setEditingCoupon(null); }}
                data-tooltip={item.label}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="admin-nav-divider"></div>
          
          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Configuration</div>
            {configItems.map(item => (
              <div 
                key={item.id}
                className={`admin-nav-item ${dashView === item.id ? 'active' : ''}`}
                onClick={() => { setDashView(item.id); setEditingCategory(null); setEditingProduct(null); setEditingCoupon(null); }}
                data-tooltip={item.label}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </nav>
        
        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-add-btn" onClick={() => setIsModalOpen(true)} data-tooltip="Add Inventory">
            <i className="ri-add-line"></i>
            <span>Add Inventory</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Page Header with Back button for editing states */}
        <div className="admin-page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            {editingCategory || editingProduct || editingCoupon ? (
              <h1 style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}} onClick={() => { setEditingCategory(null); setEditingProduct(null); setEditingCoupon(null); }}>
                <i className="ri-arrow-left-line" style={{fontSize: '20px'}}></i>
                {getPageTitle()}
              </h1>
            ) : (
              <h1>{getPageTitle()}</h1>
            )}
            <p>{getPageDesc()}</p>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            {/* Action buttons for specific views */}
            {(dashView === 'categories' && !editingCategory) && (
              <button className="btn-admin-minimal btn-admin-primary" onClick={() => openCategoryEdit()}>+ Add Category</button>
            )}
            {(dashView === 'products' && !editingProduct) && (
              <button className="btn-admin-minimal btn-admin-primary" onClick={() => openProductEdit()}>+ Add Product</button>
            )}
            {(dashView === 'coupons' && !editingCoupon) && (
              <button className="btn-admin-minimal btn-admin-primary" onClick={() => openCouponEdit()}>+ Add Coupon</button>
            )}
          </div>
        </div>

      {/* OVERVIEW DASHBOARD */}
      {dashView === 'overview' && !editingCategory && !editingProduct && (
        <>
          <section className="metrics">
            <div className="metric-card"><div className="metric-label">Revenue</div><div className="metric-value">$42,590</div><div className="metric-change trend-pos">↑ 12.5% <span style={{color: 'var(--admin-text-tertiary)', fontWeight: 400}}>vs last week</span></div></div>
            <div className="metric-card"><div className="metric-label">Orders</div><div className="metric-value">1,284</div><div className="metric-change trend-pos">↑ 4.2% <span style={{color: 'var(--admin-text-tertiary)', fontWeight: 400}}>vs last week</span></div></div>
            <div className="metric-card"><div className="metric-label">Avg. Order</div><div className="metric-value">$33.17</div><div className="metric-change trend-neg">↓ 0.8% <span style={{color: 'var(--admin-text-tertiary)', fontWeight: 400}}>vs last week</span></div></div>
            <div className="metric-card"><div className="metric-label">Waste</div><div className="metric-value">12.4 kg</div><div className="metric-change trend-pos">↓ 2.1% <span style={{color: 'var(--admin-text-tertiary)', fontWeight: 400}}>improvement</span></div></div>
          </section>
          
          {/* Recent Orders - Full Width */}
          <section style={{marginBottom: '24px'}}>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Recent Orders</div>
                <div style={{fontSize: '12px', color: 'var(--admin-primary)', cursor: 'pointer', fontWeight: 500}} onClick={() => setDashView('orders')}>View All →</div>
              </div>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', fontSize: '13px'}}>
                  <thead style={{background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                    <tr>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Order</th>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Customer</th>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Items</th>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Payment</th>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total</th>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Status</th>
                      <th style={{textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} style={{borderBottom: '1px solid #f1f5f9'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          <span style={{fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#0f172a'}}>{order.id}</span>
                          <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '2px'}}>{order.time}</div>
                        </td>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          <div style={{fontWeight: 500, color: '#0f172a'}}>{order.customer}</div>
                          <div style={{fontSize: '11px', color: '#94a3b8'}}>{order.phone}</div>
                        </td>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          <div style={{fontSize: '12px', color: '#0f172a'}}>{order.items.length} items</div>
                        </td>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          <div style={{fontSize: '11px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em'}}>{order.paymentMethod}</div>
                        </td>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          <span style={{fontSize: '13px', fontWeight: 600, color: '#16a34a'}}>TK{order.total.toLocaleString()}</span>
                        </td>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          {order.status === 'pending' && (
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#d97706'}}>
                              <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#d97706'}}></span>
                              Pending
                            </span>
                          )}
                          {order.status === 'approved' && (
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#d1fae5', color: '#16a34a'}}>
                              <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a'}}></span>
                              Approved
                            </span>
                          )}
                          {order.status === 'canceled' && (
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#dc2626'}}>
                              <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626'}}></span>
                              Canceled
                            </span>
                          )}
                        </td>
                        <td style={{padding: '12px 16px', verticalAlign: 'middle'}}>
                          {order.status === 'pending' && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                              <span 
                                onClick={() => setOrders(orders.map(o => o.id === order.id ? {...o, status: 'approved'} : o))} 
                                style={{color: '#16a34a', fontWeight: 700, fontSize: '11px', cursor: 'pointer'}}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                              >Approve</span>
                              <span style={{color: '#cbd5e1', fontSize: '10px'}}>|</span>
                              <span 
                                onClick={() => setOrders(orders.map(o => o.id === order.id ? {...o, status: 'canceled'} : o))} 
                                style={{color: '#dc2626', fontWeight: 700, fontSize: '11px', cursor: 'pointer'}}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                              >Reject</span>
                            </div>
                          )}
                          {order.status === 'approved' && (
                            <div>
                              <div style={{color: '#16a34a', fontWeight: 700, fontSize: '11px'}}>Approved</div>
                              <div style={{fontSize: '10px', color: '#94a3b8'}}>by Admin</div>
                            </div>
                          )}
                          {order.status === 'canceled' && (
                            <div>
                              <div style={{color: '#dc2626', fontWeight: 700, fontSize: '11px'}}>Canceled</div>
                              <div style={{fontSize: '10px', color: '#94a3b8'}}>by Admin</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          
          {/* Product Stats Sections */}
          <section style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px'}}>
            {/* Most Selling Products */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <i className="ri-fire-line" style={{color: '#ef4444'}}></i>
                  Most Selling
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                {[
                  { name: 'Fresh Carrots', category: 'Vegetables', amount: '234', img: 'https://i.postimg.cc/B6sD1hKt/1000020579-removebg-preview.png' },
                  { name: 'Red Apples', category: 'Fruits', amount: '189', img: 'https://i.postimg.cc/x1wL9jTV/IMG-20260228-163137.png' },
                  { name: 'Fresh Bananas', category: 'Fruits', amount: '156', img: 'https://i.postimg.cc/bw71qYYK/IMG-20260228-163147.png' },
                ].map((item, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', transition: 'background 0.15s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <img src={item.img} alt={item.name} style={{width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', background: '#f8fafc'}} />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '12px', fontWeight: 600, color: '#0f172a'}}>{item.name}</div>
                      <div style={{fontSize: '10px', color: '#94a3b8'}}>{item.category}</div>
                    </div>
                    <span style={{fontSize: '13px', fontWeight: 700, color: '#ef4444'}}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Most Visited Products */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <i className="ri-eye-line" style={{color: '#3b82f6'}}></i>
                  Most Visited
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                {[
                  { name: 'Premium Potatoes', category: 'Vegetables', amount: '1,245', img: 'https://i.postimg.cc/d1vdTWyL/1000020583-removebg-preview.png' },
                  { name: 'Sweet Oranges', category: 'Fruits', amount: '1,089', img: 'https://i.postimg.cc/mr7Ckxtx/IMG-20260228-163156.png' },
                  { name: 'Mango Fresh', category: 'Fruits', amount: '956', img: 'https://i.postimg.cc/Z5G6JYKm/IMG-20260228-163217.png' },
                ].map((item, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', transition: 'background 0.15s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <img src={item.img} alt={item.name} style={{width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', background: '#f8fafc'}} />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '12px', fontWeight: 600, color: '#0f172a'}}>{item.name}</div>
                      <div style={{fontSize: '10px', color: '#94a3b8'}}>{item.category}</div>
                    </div>
                    <span style={{fontSize: '13px', fontWeight: 700, color: '#3b82f6'}}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Most Added to Cart */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <i className="ri-shopping-cart-2-line" style={{color: '#f59e0b'}}></i>
                  Most in Cart
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                {[
                  { name: 'Fresh Tomatoes', category: 'Vegetables', amount: '89', img: 'https://i.postimg.cc/mr7CkxtQ/1000020584-removebg-preview.png' },
                  { name: 'Grapes Green', category: 'Fruits', amount: '76', img: 'https://i.postimg.cc/htkVK4PD/IMG-20260228-163208.png' },
                  { name: 'Fresh Broccoli', category: 'Vegetables', amount: '64', img: 'https://i.postimg.cc/qR0nCm36/1000020611-removebg-preview.png' },
                ].map((item, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', transition: 'background 0.15s'}} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <img src={item.img} alt={item.name} style={{width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', background: '#f8fafc'}} />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '12px', fontWeight: 600, color: '#0f172a'}}>{item.name}</div>
                      <div style={{fontSize: '10px', color: '#94a3b8'}}>{item.category}</div>
                    </div>
                    <span style={{fontSize: '13px', fontWeight: 700, color: '#f59e0b'}}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Store Insights Dashboard */}
          <section style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px'}}>
            {/* Sales Performance Chart */}
            <div className="panel">
              <div className="panel-header"><div className="panel-title">Sales Performance (7 Days)</div></div>
              <div className="chart-area">
                {chartData.map((bar, i) => (
                  <div key={i} className="bar-group">
                    <div className={`bar ${bar.active ? 'active' : ''}`} style={{height: bar.height}}></div>
                    <span className="bar-label">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Revenue Breakdown */}
            <div className="panel">
              <div className="panel-header"><div className="panel-title">Revenue by Category</div></div>
              <div style={{padding: '16px'}}>
                {/* Donut Chart */}
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                  <div style={{width: '140px', height: '140px', position: 'relative'}}>
                    <svg viewBox="0 0 36 36" style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}}>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="4"></circle>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="35 65" strokeLinecap="round"></circle>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-35" strokeLinecap="round"></circle>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-60" strokeLinecap="round"></circle>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-80" strokeLinecap="round"></circle>
                    </svg>
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
                      <div style={{fontSize: '18px', fontWeight: 700, color: '#0f172a'}}>₹1.2L</div>
                      <div style={{fontSize: '10px', color: '#94a3b8'}}>Total</div>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {[
                    { name: 'Vegetables', percent: '35%', amount: '₹42,000', color: '#16a34a' },
                    { name: 'Fruits', percent: '25%', amount: '₹30,000', color: '#f59e0b' },
                    { name: 'Dairy', percent: '20%', amount: '₹24,000', color: '#ef4444' },
                    { name: 'Others', percent: '20%', amount: '₹24,000', color: '#3b82f6' },
                  ].map((item, i) => (
                    <div key={i} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div style={{width: '10px', height: '10px', borderRadius: '2px', background: item.color}}></div>
                      <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{fontSize: '12px', color: '#475569'}}>{item.name}</span>
                        <span style={{fontSize: '11px', fontWeight: 600, color: '#0f172a'}}>{item.percent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          {/* Key Metrics Cards */}
          <section style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px'}}>
            {[
              { label: 'Total Orders Today', value: '48', change: '+12%', positive: true, icon: 'ri-shopping-bag-line', color: '#16a34a' },
              { label: 'Avg. Order Value', value: '₹856', change: '+8%', positive: true, icon: 'ri-money-dollar-circle-line', color: '#f59e0b' },
              { label: 'New Customers', value: '23', change: '+5%', positive: true, icon: 'ri-user-add-line', color: '#3b82f6' },
              { label: 'Pending Orders', value: '7', change: '-15%', positive: true, icon: 'ri-time-line', color: '#ef4444' },
            ].map((metric, i) => (
              <div key={i} className="panel" style={{padding: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                  <div style={{width: '40px', height: '40px', borderRadius: '10px', background: `${metric.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <i className={metric.icon} style={{fontSize: '20px', color: metric.color}}></i>
                  </div>
                  <span style={{fontSize: '11px', fontWeight: 600, color: metric.positive ? '#10b981' : '#ef4444', background: metric.positive ? '#d1fae5' : '#fee2e2', padding: '2px 8px', borderRadius: '12px'}}>{metric.change}</span>
                </div>
                <div style={{fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px'}}>{metric.value}</div>
                <div style={{fontSize: '12px', color: '#94a3b8'}}>{metric.label}</div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* CATEGORY MANAGEMENT VIEW */}
      {dashView === 'categories' && (
        <div className="cat-mgmt-wrapper">
          {editingCategory ? (
            <div className="cat-edit-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)'}}>
              {/* Category Card with New UI */}
              <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}>
                {/* Card Header */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                    {categories.find(c => c.id === editingCategory.id) ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button 
                    onClick={() => setEditingCategory(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      fontSize: '20px'
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
                
                {/* Card Body */}
                <div style={{padding: '1.5rem'}}>
                  {/* Category Type */}
                  <div style={{marginBottom: '1.25rem'}}>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1e293b'}}>
                      Category Type
                    </label>
                    <div style={{display: 'flex', gap: '1.5rem'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                        <input 
                          type="radio" 
                          name="catType" 
                          value="icon" 
                          checked={editingCategory.type === 'icon'} 
                          onChange={() => setEditingCategory({...editingCategory, type: 'icon'})}
                          style={{accentColor: '#16a34a', width: '16px', height: '16px'}}
                        />
                        <span style={{fontSize: '14px', color: '#475569'}}>Icon</span>
                      </label>
                      <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                        <input 
                          type="radio" 
                          name="catType" 
                          value="image" 
                          checked={editingCategory.type === 'image'} 
                          onChange={() => setEditingCategory({...editingCategory, type: 'image'})}
                          style={{accentColor: '#16a34a', width: '16px', height: '16px'}}
                        />
                        <span style={{fontSize: '14px', color: '#475569'}}>Image</span>
                      </label>
                    </div>
                  </div>

                  {/* Category Name */}
                  <div style={{marginBottom: '1.25rem'}}>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1e293b'}}>
                      Category Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter category name" 
                      value={editingCategory.name} 
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1e293b',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#16a34a';
                        e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Icon Input Group - Show when type is 'icon' */}
                  {editingCategory.type === 'icon' && (
                    <div style={{marginBottom: '1.25rem'}}>
                      <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1e293b'}}>
                        Icon Code (Remix Icon)
                      </label>
                      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        <input 
                          type="text" 
                          placeholder="e.g., ri-leaf-line" 
                          value={editingCategory.icon || ''} 
                          onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#1e293b',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#16a34a';
                            e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: editingCategory.icon && editingCategory.icon.startsWith('ri-') ? 'rgba(22, 163, 74, 0.1)' : '#f8fafc',
                          border: `1px solid ${editingCategory.icon && editingCategory.icon.startsWith('ri-') ? '#16a34a' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: editingCategory.icon && editingCategory.icon.startsWith('ri-') ? '#16a34a' : '#94a3b8'
                        }}>
                          <i className={editingCategory.icon && editingCategory.icon.startsWith('ri-') ? editingCategory.icon : 'ri-cursor-line'} style={{fontSize: '20px'}}></i>
                        </div>
                      </div>
                      <p style={{fontSize: '12px', color: '#64748b', marginTop: '6px'}}>
                        Use Remix Icon codes. Example: ri-leaf-line, ri-shopping-basket-line
                      </p>
                    </div>
                  )}

                  {/* Image Upload Group - Show when type is 'image' */}
                  {editingCategory.type === 'image' && (
                    <div style={{marginBottom: '1.25rem'}}>
                      <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1e293b'}}>
                        Category Image
                      </label>
                      <div 
                        onClick={() => document.getElementById('catImgUp')?.click()}
                        style={{
                          border: '2px dashed #e2e8f0',
                          borderRadius: '12px',
                          padding: editingCategory.image ? '1rem' : '2rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: '#f8fafc'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#16a34a';
                          e.currentTarget.style.background = 'rgba(22, 163, 74, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                      >
                        <input type="file" id="catImgUp" style={{display: 'none'}} accept="image/*" onChange={handleCategoryImageUpload} />
                        {editingCategory.image ? (
                          <img src={editingCategory.image} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}} alt="Category preview" />
                        ) : (
                          <>
                            <i className="ri-upload-cloud-2-line" style={{fontSize: '2rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block'}}></i>
                            <p style={{color: '#64748b', fontSize: '0.875rem'}}>Click or drag to upload image</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div style={{display: 'flex', gap: '12px', marginTop: '2rem'}}>
                    <button 
                      onClick={() => setEditingCategory(null)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        color: '#475569',
                        flex: 1
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveCategory}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: 'none',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: '#fff',
                        flex: 1,
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      <i className="ri-check-line"></i>
                      Save Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="cat-container">
              <div className="order-card table-header">
                <div className="order-grid-row"><div>Category</div><div>Source</div><div>Products</div><div>Created</div><div>Status</div><div>Manage</div></div>
              </div>
              {categoriesLoading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                  <i className="ri-loader-4-line" style={{fontSize: '24px', animation: 'spin 1s linear infinite'}}></i>
                  <p style={{marginTop: '8px'}}>Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                  <i className="ri-folder-line" style={{fontSize: '32px'}}></i>
                  <p style={{marginTop: '8px'}}>No categories found. Click "Add Category" to create one.</p>
                </div>
              ) : (
                categories.map((cat) => (
                <div key={cat.id} className="order-card category-row">
                  <div className="order-grid-row">
                    <div className="category-name-cell">
                      <div style={{width: '36px', height: '36px', border: cat.type === 'icon' ? '1px solid #e2e8f0' : 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: cat.type === 'image' ? 'hidden' : 'visible'}}>
                        {cat.type === 'icon' ? <i className={cat.icon}></i> : (cat.image ? <img src={cat.image} style={{width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px'}} alt={cat.name} /> : <i className="ri-image-line" style={{color: '#94a3b8'}}></i>)}
                      </div>
                      <span>{cat.name}</span>
                    </div>
                    <div>{cat.type === 'icon' ? 'Icon Library' : 'Image Upload'}</div>
                    <div>{cat.items} Items</div>
                    <div>{cat.created}</div>
                    <div><span className={`status-bracket ${cat.status === 'Active' ? 'active' : 'hidden-status'}`}>[{cat.status}]</span></div>
                    <div className="manage-col">
                      <i className="ri-pencil-line" onClick={() => openCategoryEdit(cat)}></i>
                      <i className="ri-delete-bin-line" onClick={() => handleDeleteCategory(cat.id)}></i>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT MANAGEMENT VIEW */}
      {dashView === 'products' && (
        <div className="prod-mgmt-wrapper">
          {editingProduct ? (
            <div className="prod-edit-wrapper">
              <div className="max-w-3xl mx-auto" style={{padding: '0 16px'}}>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }}>
                  <div className="ep-card">
                    <h2 style={{fontSize: '16px', fontWeight: 600, marginBottom: '20px'}}>Basic Information</h2>
                    <div style={{marginBottom: '18px'}}>
                      <label style={{display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px'}}>Product Name</label>
                      <input type="text" className="form-input" placeholder="e.g., Organic Red Apples" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div style={{marginBottom: '18px'}}>
                      <label style={{display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px'}}>Category</label>
                      <select className="form-input" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}>
                        <option value="">Select Category</option>
                        {categories.filter(c => c.status === 'Active').map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{background: '#f9fafb', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div><label style={{fontSize: '13px', fontWeight: 500, display: 'block'}}>Offer Product</label><p style={{fontSize: '12px', color: '#64748b'}}>Toggle if this product is currently on sale</p></div>
                      <div className={`switch-lg ${editingProduct.offerSwitch ? 'active' : ''}`} onClick={() => setEditingProduct({...editingProduct, offerSwitch: !editingProduct.offerSwitch})}></div>
                    </div>
                  </div>

                  <div className="ep-card">
                    <h2 style={{fontSize: '16px', fontWeight: 600, marginBottom: '20px'}}>Descriptions</h2>
                    <div style={{marginBottom: '18px'}}>
                      <label style={{display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px'}}>Short Description</label>
                      <input type="text" className="form-input" placeholder="Fresh and organic" value={editingProduct.shortDesc || ''} onChange={(e) => setEditingProduct({...editingProduct, shortDesc: e.target.value})} />
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px'}}>Long Description</label>
                      <textarea className="form-input" rows={4} placeholder="Describe the product..." value={editingProduct.longDesc || ''} onChange={(e) => setEditingProduct({...editingProduct, longDesc: e.target.value})}></textarea>
                    </div>
                  </div>

                  <div className="ep-card">
                    <h2 style={{fontSize: '16px', fontWeight: 600, marginBottom: '20px'}}>Product Images</h2>
                    <input type="file" id="prodImgUp" style={{display: 'none'}} accept="image/*" multiple onChange={handleProductImageUpload} />
                    <div className="upload-zone-prod" onClick={() => prodImages.length < 5 && document.getElementById('prodImgUp')?.click()} style={{cursor: prodImages.length >= 5 ? 'not-allowed' : 'pointer', opacity: prodImages.length >= 5 ? 0.6 : 1}}>
                      <i className="ri-upload-cloud-2-line" style={{fontSize: '2rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block'}}></i>
                      <p style={{color: '#64748b'}}>{prodImages.length >= 5 ? 'Maximum 5 images reached' : `Click to upload images (${prodImages.length}/5)`}</p>
                    </div>
                    {prodImages.length > 0 && (
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px'}}>
                        {prodImages.map((img, i) => (
                          <div key={i} style={{position: 'relative'}}>
                            <img src={img} style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px'}} alt={`Product image ${i+1}`} />
                            <button type="button" onClick={() => removeProductImage(i)} style={{position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              <i className="ri-close-line" style={{fontSize: '12px'}}></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ep-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                      <div><h2 style={{fontSize: '16px', fontWeight: 600}}>Varieties & Pricing</h2><p style={{fontSize: '12px', color: '#64748b'}}>Add different sizes or options</p></div>
                      <button type="button" onClick={addVariety} style={{color: '#16a34a', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer'}}>+ Add Variety</button>
                    </div>
                    {prodVarieties.length === 0 && <div style={{textAlign: 'center', padding: '24px', color: '#64748b', border: '1px dashed #e2e8e0', borderRadius: '8px'}}>No varieties added.</div>}
                    {prodVarieties.map(v => (
                      <div key={v.id} style={{background: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '12px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 100px', gap: '12px', alignItems: 'end'}}>
                          <div>
                            <label style={{display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px'}}>Variety Name</label>
                            <input type="text" className="form-input" placeholder="e.g. 500g, 1KG" value={v.name} onChange={(e) => updateVariety(v.id, 'name', e.target.value)} />
                          </div>
                          <div>
                            <label style={{display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px'}}>Price (TK)</label>
                            <input type="number" className="form-input" placeholder="e.g. 80" value={v.price} onChange={(e) => updateVariety(v.id, 'price', e.target.value)} />
                          </div>
                          <div>
                            <label style={{display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px'}}>Stock</label>
                            <input type="number" className="form-input" placeholder="e.g. 50" value={v.stock} onChange={(e) => updateVariety(v.id, 'stock', e.target.value)} />
                          </div>
                          <div>
                            <label style={{display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px'}}>Discount</label>
                            <input type="text" className="form-input" placeholder="10 or 10%" value={v.discount} onChange={(e) => updateVariety(v.id, 'discount', e.target.value)} />
                          </div>
                          <div>
                            <button type="button" onClick={() => removeVariety(v.id)} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '12px', cursor: 'pointer'}}><i className="ri-delete-bin-line"></i> Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ep-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                      <div><h2 style={{fontSize: '16px', fontWeight: 600}}>FAQs</h2></div>
                      <button type="button" onClick={addFaq} style={{color: '#16a34a', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer'}}>+ Add FAQ</button>
                    </div>
                    {prodFaqs.length === 0 && <div style={{textAlign: 'center', padding: '24px', color: '#64748b', border: '1px dashed #e2e8e0', borderRadius: '8px'}}>No FAQs added.</div>}
                    {prodFaqs.map(f => (
                      <div key={f.id} style={{background: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '12px'}}>
                        <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                          <input type="text" className="form-input" placeholder="Question" style={{flex: 1}} value={f.question} onChange={(e) => updateFaq(f.id, 'question', e.target.value)} />
                          <button type="button" onClick={() => removeFaq(f.id)} style={{padding: '10px 16px', border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap'}}>Remove</button>
                        </div>
                        <textarea className="form-input" rows={2} placeholder="Answer" value={f.answer} onChange={(e) => updateFaq(f.id, 'answer', e.target.value)}></textarea>
                      </div>
                    ))}
                  </div>

                  <div className="ep-card">
                    <label style={{display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px'}}>Related Products</label>
                    <div style={{position: 'relative', marginBottom: '12px'}}>
                      <i className="ri-search-line" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}></i>
                      <input type="text" className="form-input" placeholder="Search products..." value={relatedSearch} onChange={(e) => setRelatedSearch(e.target.value)} style={{paddingLeft: '36px'}} />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px'}}>
                      {allRelatedOptions.filter(p => p.name.toLowerCase().includes(relatedSearch.toLowerCase()) || p.category.toLowerCase().includes(relatedSearch.toLowerCase())).map(p => (
                        <div key={p.id} className={`related-product-card ${prodRelated.includes(p.id) ? 'selected' : ''}`} onClick={() => toggleRelated(p.id)}>
                          <img src={p.image} alt={p.name} />
                          <div style={{flex: 1}}><p style={{fontSize: '12px', fontWeight: 600}}>{p.name}</p><span style={{fontSize: '10px', color: '#64748b'}}>{p.category}</span> · <span style={{fontSize: '11px', color: '#16a34a'}}>${p.price}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '12px', marginTop: '8px', marginBottom: '40px'}}>
                    <button type="button" className="btn-cancel-prod" style={{flex: 1}} onClick={() => setEditingProduct(null)}>Cancel</button>
                    <button type="submit" className="btn-primary-prod" style={{flex: 1}}>Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="prod-container">
              <div style={{marginBottom: '20px', fontSize: '18px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans'"}}>Product Management</div>
              <div className="prod-table-header">
                <div className="prod-grid-row">
                  <div>Product Details</div><div>Variants</div><div>Price Range</div><div>Discount</div><div>Offer</div><div>Status</div><div style={{textAlign: 'right'}}>Action</div>
                </div>
              </div>
              {productsLoading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                  <i className="ri-loader-4-line" style={{fontSize: '24px', animation: 'spin 1s linear infinite'}}></i>
                  <p style={{marginTop: '8px'}}>Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                  <i className="ri-store-2-line" style={{fontSize: '32px'}}></i>
                  <p style={{marginTop: '8px'}}>No products found. Click "Add Product" to create one.</p>
                </div>
              ) : (
                products.map((prod) => (
                  <div key={prod.id} className="prod-order-card product-row">
                    <div className="prod-grid-row">
                      <div className="product-cell">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} />
                        ) : (
                          <div style={{width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <i className="ri-image-line" style={{color: '#94a3b8', fontSize: '18px'}}></i>
                          </div>
                        )}
                        <div className="product-info"><span className="product-name">{prod.name}</span><span className="product-cat">{prod.category}</span></div>
                      </div>
                      <div>{prod.variants}</div>
                      <div>{prod.price}</div>
                      <div className="bracket-text text-red">[{prod.discount}]</div>
                      <div className={`bracket-text ${prod.offer ? 'text-blue' : 'text-muted-val'}`}>[{prod.offer ? 'Yes' : 'No'}]</div>
                      <div><div className={`switch-sm ${prod.status === 'active' ? 'active' : ''}`} onClick={() => toggleProdStatus(prod.id as string)}></div></div>
                      <div className="prod-manage-col">
                        <i className="ri-pencil-line" onClick={() => openProductEdit(prod)}></i>
                        <i className="ri-delete-bin-line" onClick={() => handleDeleteProduct(prod.id as string)}></i>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ORDER MANAGEMENT VIEW */}
      {dashView === 'orders' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'Inter', sans-serif", backgroundColor: '#eef0f4', color: '#1c2333', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1c2333] tracking-tight">Order Management</h1>
              <p className="text-[#8a96a8] text-sm mt-1">Detailed overview of all incoming requests</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-[#3f72f5]/10 text-[#3f72f5] text-[13px] font-bold uppercase tracking-wider rounded-lg">
                {orders.filter(o => o.status === 'pending').length} Pending
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <button onClick={() => setCurrentOrderFilter('all')} 
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#e4e7ee] transition-colors ${currentOrderFilter === 'all' ? 'bg-[#1c2333] text-white' : 'bg-white text-[#8a96a8] hover:bg-[#f5f6f9]'}`}>
              All Orders
            </button>
            <button onClick={() => setCurrentOrderFilter('pending')} 
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#e4e7ee] transition-colors ${currentOrderFilter === 'pending' ? 'bg-[#f59e0b] text-white' : 'bg-white text-[#8a96a8] hover:bg-[#f5f6f9]'}`}>
              Pending
            </button>
            <button onClick={() => setCurrentOrderFilter('approved')} 
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#e4e7ee] transition-colors ${currentOrderFilter === 'approved' ? 'bg-[#18a87a] text-white' : 'bg-white text-[#8a96a8] hover:bg-[#f5f6f9]'}`}>
              Approved
            </button>
            <button onClick={() => setCurrentOrderFilter('canceled')} 
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#e4e7ee] transition-colors ${currentOrderFilter === 'canceled' ? 'bg-[#ef4444] text-white' : 'bg-white text-[#8a96a8] hover:bg-[#f5f6f9]'}`}>
              Canceled
            </button>
          </div>

          {/* Main Table Card */}
          <div className="bg-white border border-[#e4e7ee] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#e4e7ee] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1c2333]">Orders List</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-[#f5f6f9] border-b border-[#e4e7ee]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider w-1/6">Order Details</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider w-1/6">Customer</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider w-1/6">Payment Info</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider w-1/6">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider w-1/6">Courier Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e7ee]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#f5f6f9]/50 transition-colors group">
                      {/* Col 1: Order Details */}
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono text-sm font-medium text-[#1c2333]">{order.id}</span>
                        <div className="text-[11px] text-[#8a96a8] mt-0.5">{order.time}</div>
                      </td>
                      
                      {/* Col 2: Customer */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#1c2333]">{order.customer}</span>
                          <span className="text-[11px] text-[#8a96a8]">{order.phone}</span>
                        </div>
                      </td>

                      {/* Col 3: Payment & Address */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-[#1c2333] uppercase tracking-wide">{order.paymentMethod}</span>
                          <span className="text-[11px] text-[#8a96a8] truncate max-w-[150px]">{order.address}</span>
                        </div>
                      </td>

                      {/* Col 4: Status */}
                      <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-0.5">
                          {order.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <span onClick={() => updateOrderStatus(order.id, 'approved')} className="text-[#18a87a] font-bold text-[11px] cursor-pointer hover:underline">Approve</span>
                              <span className="text-[#8a96a8] text-[10px]">|</span>
                              <span onClick={() => updateOrderStatus(order.id, 'canceled')} className="text-[#ef4444] font-bold text-[11px] cursor-pointer hover:underline">Reject</span>
                            </div>
                          )}
                          {order.status === 'approved' && (
                            <div className="flex flex-col">
                              <span className="text-[#18a87a] font-bold text-[11px]">Approved</span>
                              <span className="text-[10px] text-[#8a96a8]">by Admin</span>
                            </div>
                          )}
                          {order.status === 'canceled' && (
                            <div className="flex flex-col">
                              <span className="text-[#ef4444] font-bold text-[11px]">Canceled</span>
                              <span className="text-[10px] text-[#8a96a8]">by {order.canceledBy || 'System'}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col 5: Courier Status */}
                      <td className="px-4 py-3 align-middle text-left">
                        <span className="text-[11px] font-medium text-[#8a96a8]">[{order.courierStatus}]</span>
                      </td>

                      {/* Col 6: Actions */}
                      <td className="px-4 py-3 align-middle text-left">
                        <span onClick={() => setSelectedOrder(order)} 
                          className="text-[13px] font-medium text-[#8a96a8] hover:text-[#3f72f5] cursor-pointer transition-colors">
                          View
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c2333]/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
              <div className="bg-white w-full max-w-[680px] border border-[#e4e7ee] flex flex-col p-6 gap-3 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header Section */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#1c2333] uppercase">{selectedOrder.id}</span>
                      <span className="text-[#e4e7ee]">|</span>
                      <span className="text-[12px] text-[#8a96a8]">{selectedOrder.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#1c2333] uppercase tracking-wide">
                      {selectedOrder.paymentMethod}
                    </div>
                    <div className="text-[11px] text-[#8a96a8] flex items-center gap-1 max-w-[350px]">
                      <i className="ri-map-pin-line text-[12px] shrink-0"></i>
                      <span className="truncate">{selectedOrder.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => window.open('tel:' + selectedOrder.phone)} title="Call" 
                      className="h-[28px] w-[28px] rounded-md flex items-center justify-center text-[#8a96a8] hover:text-[#3f72f5] transition-colors bg-white border border-[#e4e7ee] shadow-sm">
                      <i className="ri-phone-fill text-[16px]"></i>
                    </button>
                    <button onClick={() => window.open('https://wa.me/' + selectedOrder.phone.replace(/[^0-9]/g, ''))} title="WhatsApp" 
                      className="h-[28px] w-[28px] rounded-md flex items-center justify-center text-[#8a96a8] hover:text-[#18a87a] transition-colors bg-white border border-[#e4e7ee] shadow-sm">
                      <i className="ri-whatsapp-line text-[16px]"></i>
                    </button>
                    <button onClick={() => copyToClipboard(selectedOrder.phone)} title="Copy" 
                      className="h-[28px] w-[28px] rounded-md flex items-center justify-center text-[#8a96a8] hover:text-[#1c2333] transition-colors bg-white border border-[#e4e7ee] shadow-sm">
                      <i className="ri-file-copy-line text-[16px]"></i>
                    </button>

                    <div className="h-[20px] w-[1px] bg-[#e4e7ee] mx-1"></div>

                    <button onClick={() => setSelectedOrder(null)} className="w-[30px] h-[30px] rounded-lg bg-white border border-[#e4e7ee] flex items-center justify-center text-[#8a96a8] hover:bg-[#f5f6f9] cursor-pointer transition-colors">
                      <i className="ri-close-line text-[18px]"></i>
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="w-full border-collapse bg-[#f5f6f9] rounded-lg overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e4e7ee]">
                        <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-[#8a96a8] tracking-wide w-[50%]">Item</th>
                        <th className="py-2 px-3 text-center text-[11px] font-bold uppercase text-[#8a96a8] tracking-wide w-[20%]">Qty</th>
                        <th className="py-2 px-3 text-right text-[11px] font-bold uppercase text-[#8a96a8] tracking-wide w-[30%]">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#e4e7ee] last:border-0">
                          <td className="py-2 px-3 align-middle">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[#1c2333]">{item.name}</span>
                              {item.variant && <span className="text-[#8a96a8] text-[12px] font-medium">({item.variant})</span>}
                              {item.offerText && <span className="text-[#ef4444] text-[11px] font-bold">[{item.offerText}]</span>}
                              {item.couponCode && <span className="text-[#18a87a] text-[11px] font-bold">[{item.couponCode}]</span>}
                            </div>
                          </td>

                          <td className="py-2 px-3 text-center align-middle font-medium text-[#1c2333]">
                            <div className="flex flex-col items-center">
                              <span>{item.qty} item{item.qty > 1 ? 's' : ''}</span>
                              <span className="text-[11px] font-medium text-[#8a96a8]">TK {item.basePrice}/pc</span>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-right align-middle">
                            <div className="flex flex-col items-end gap-0.5">
                              <div className={`text-[#8a96a8] text-[12px] ${item.offerDiscount > 0 || item.couponDiscount > 0 ? 'line-through decoration-[#ef4444]/30' : ''}`}>
                                TK {item.basePrice * item.qty}
                              </div>

                              {item.offerDiscount > 0 && (
                                <div className="text-[#ef4444] text-[11px] font-medium">
                                  -TK {item.offerDiscount * item.qty}
                                </div>
                              )}

                              {item.couponDiscount > 0 && (
                                <div className="text-[#18a87a] text-[11px] font-medium">
                                  -TK {item.couponDiscount * item.qty}
                                </div>
                              )}

                              <div className="font-bold text-[#1c2333] text-[13px]">
                                TK {(item.basePrice * item.qty) - (item.offerDiscount * item.qty) - (item.couponDiscount * item.qty)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation */}
                <div className="bg-[#f5f6f9] rounded-lg p-3">
                  <div className="flex items-center justify-between text-[12px] w-full flex-wrap gap-2">
                    <div className="font-semibold text-[#8a96a8] italic" 
                         style={{visibility: selectedOrder.discount === 0 && (!selectedOrder.couponCodes || selectedOrder.couponCodes.length === 0) ? 'visible' : 'hidden'}}>
                      Order Calculation
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-[#8a96a8]">Subtotal :</span>
                        <span className="font-bold text-[#1c2333]">TK {selectedOrder.subtotal}</span>
                      </div>

                      <div className="w-[1px] h-3 bg-[#e4e7ee]"></div>

                      {selectedOrder.discount > 0 && (
                        <>
                          <div className="flex items-center gap-1 text-[#ef4444]">
                            <span className="font-medium">Discount :</span>
                            <span className="font-bold">TK {selectedOrder.discount}</span>
                          </div>
                          <div className="w-[1px] h-3 bg-[#e4e7ee]"></div>
                        </>
                      )}

                      {selectedOrder.couponCodes && selectedOrder.couponCodes.length > 0 && (
                        <>
                          <div className="flex items-center gap-1 text-[#18a87a]">
                            <span className="font-medium">Coupon ({selectedOrder.couponCodes.join(', ')}):</span>
                            <span className="font-bold">-TK {selectedOrder.couponAmount}</span>
                          </div>
                          <div className="w-[1px] h-3 bg-[#e4e7ee]"></div>
                        </>
                      )}

                      <div className="flex items-center gap-1">
                        <span className="font-medium text-[#8a96a8]">Delivery :</span>
                        <span className="font-bold text-[#1c2333]">{selectedOrder.delivery === 0 ? 'Free' : 'TK ' + selectedOrder.delivery}</span>
                      </div>

                      <div className="w-[1px] h-3 bg-[#e4e7ee] mx-1"></div>

                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#8a96a8] uppercase tracking-wide">Total :</span>
                        <span className="font-extrabold text-[#1c2333]">TK {selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COUPON MANAGEMENT VIEW */}
      {dashView === 'coupons' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'IBM Plex Sans', sans-serif", backgroundColor: '#f4f7fa', color: '#1e293b', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {editingCoupon ? (
            <div className="max-w-[560px] mx-auto px-6">
              {/* Back Header */}
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setEditingCoupon(null)} className="bg-none border-none cursor-pointer p-0 flex items-center">
                  <i className="ri-arrow-left-line text-xl text-[#64748b]"></i>
                </button>
                <div>
                  <div className="text-lg font-bold font-sans">{editingCoupon.id ? 'Edit Coupon' : 'Add Coupon'}</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">Configure your discount coupon</div>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveCoupon(); }}>
                {/* Coupon Details Card */}
                <div className="bg-white border border-[#e2e8e0] rounded-xl p-6 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-4">Coupon Details</div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#64748b] mb-1.5">Coupon Code</label>
                    <input type="text" 
                      className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8e0] rounded-lg text-sm outline-none focus:border-[#16a34a] transition-colors"
                      style={{textTransform: 'uppercase', letterSpacing: '0.6px'}}
                      placeholder="e.g., SUMMER20"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-[#64748b] mb-1.5">Coupon Type</label>
                      <div className="relative">
                        <select 
                          className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8e0] rounded-lg text-sm outline-none appearance-none cursor-pointer focus:border-[#16a34a] transition-colors"
                          value={couponForm.type}
                          onChange={(e) => setCouponForm({...couponForm, type: e.target.value as 'pct' | 'fixed'})}>
                          <option value="pct">% Percentage Off</option>
                          <option value="fixed">$ Fixed Amount Off</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                        {couponForm.type === 'pct' ? 'Discount Percentage' : 'Discount Amount (TK)'}
                      </label>
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${couponForm.type === 'pct' ? 'text-[#d97706]' : 'text-[#2563eb]'}`}>
                          {couponForm.type === 'pct' ? '%' : 'TK'}
                        </span>
                        <input type="number" 
                          className="w-full px-3.5 py-2.5 pl-10 bg-white border border-[#e2e8e0] rounded-lg text-sm outline-none focus:border-[#16a34a] transition-colors"
                          placeholder={couponForm.type === 'pct' ? '20' : '100'}
                          value={couponForm.value}
                          onChange={(e) => setCouponForm({...couponForm, value: e.target.value})}
                          min="1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                      Expiry Date <span className="text-[#cbd5e1] text-[11px] font-normal ml-1">(optional)</span>
                    </label>
                    <input type="date" 
                      className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8e0] rounded-lg text-sm outline-none focus:border-[#16a34a] transition-colors"
                      value={couponForm.expiry}
                      onChange={(e) => setCouponForm({...couponForm, expiry: e.target.value})} />
                  </div>
                </div>

                {/* Applies To Card */}
                <div className="bg-white border border-[#e2e8e0] rounded-xl p-6 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-4">Applies To</div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#64748b] mb-1.5">Scope</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8e0] rounded-lg text-sm outline-none appearance-none cursor-pointer focus:border-[#16a34a] transition-colors"
                        value={couponForm.scope}
                        onChange={(e) => setCouponForm({...couponForm, scope: e.target.value as 'all' | 'products' | 'categories'})}>
                        <option value="all">All Products</option>
                        <option value="products">Specific Products</option>
                        <option value="categories">Specific Categories</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"></i>
                    </div>
                  </div>

                  {/* Product Picker */}
                  {couponForm.scope === 'products' && (
                    <div className="pt-4 border-t border-[#f1f5f9]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Select Products</div>
                      <div className="grid grid-cols-2 gap-2">
                        {couponProducts.map(p => {
                          const isSelected = pickedProducts.includes(p.id.toString())
                          return (
                          <div key={p.id} 
                            className={`flex items-center gap-2.5 p-2.5 border-[1.5px] rounded-lg cursor-pointer transition-all ${isSelected ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e2e8e0] bg-white hover:border-[#94a3b8]'}`}
                            onClick={() => toggleProductPick(p.id)}>
                            <img src={p.img} alt={p.name} className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate">{p.name}</div>
                              <div className="text-[11px] text-[#16a34a] font-semibold">{p.price}</div>
                            </div>
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#16a34a] border-[#16a34a]' : 'border-[1.5px] border-[#cbd5e1]'}`}>
                              {isSelected && <span className="text-white text-[10px]">✓</span>}
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  )}

                  {/* Category Picker */}
                  {couponForm.scope === 'categories' && (
                    <div className="pt-4 border-t border-[#f1f5f9]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Select Categories</div>
                      <div className="flex flex-wrap gap-2">
                        {couponCategories.map(cat => (
                          <div key={cat.name}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 border-[1.5px] rounded-lg cursor-pointer text-xs font-medium transition-all ${pickedCategories.includes(cat.name) ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e2e8e0] bg-white hover:border-[#94a3b8]'}`}
                            onClick={() => toggleCategoryPick(cat.name)}>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: cat.color}}></span>
                            <span className={pickedCategories.includes(cat.name) ? 'text-[#16a34a]' : ''}>{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={() => setEditingCoupon(null)} className="flex-1 py-3 bg-white text-[#64748b] border-[1.5px] border-[#e2e8e0] rounded-lg text-sm font-medium hover:bg-[#f8faf8] transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-[#16a34a] text-white border-none rounded-lg text-sm font-semibold hover:bg-[#15803d] transition-all">Save Coupon</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="max-w-full px-0">
              {/* Page Header */}
              <div className="flex justify-between items-center mb-7">
                <div className="text-lg font-bold font-sans">Coupon Management</div>
                <button onClick={() => openCouponEdit()} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#16a34a] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#15803d] transition-colors">
                  <i className="ri-add-line text-base"></i>
                  Add Coupon
                </button>
              </div>

              {/* Table */}
              <div className="flex flex-col gap-2">
                {/* Header Row */}
                <div className="grid grid-cols-6 pb-3 border-b border-[#f1f5f9] mb-1">
                  <div className="px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Code</div>
                  <div className="px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Type</div>
                  <div className="px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Discount</div>
                  <div className="px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Applies To</div>
                  <div className="px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748b] text-right">Expiry</div>
                  <div className="px-6 text-[11px] font-bold uppercase tracking-wider text-[#64748b] text-right">Action</div>
                </div>

                {/* Loading State */}
                {couponsLoading && (
                  <div className="py-12 text-center text-[#94a3b8]">
                    <i className="ri-loader-4-line animate-spin text-2xl mb-2"></i>
                    <p className="text-sm">Loading coupons...</p>
                  </div>
                )}

                {/* Empty State */}
                {!couponsLoading && coupons.length === 0 && (
                  <div className="py-12 text-center text-[#94a3b8]">
                    <i className="ri-coupon-3-line text-4xl mb-3"></i>
                    <p className="text-sm font-medium">No coupons yet</p>
                    <p className="text-xs mt-1">Click "Add Coupon" to create your first coupon</p>
                  </div>
                )}

                {/* Data Rows */}
                {!couponsLoading && coupons.map((coupon) => (
                  <div key={coupon.id} className="grid grid-cols-6 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_#f1f5f9] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.07),0_0_0_1px_#e2e8f0] transition-shadow">
                    <div className="px-6 py-5 border-r border-[#eef2f6] flex items-center">
                      <span className="text-[13px] font-bold tracking-[0.7px] truncate">{coupon.code}</span>
                    </div>
                    <div className="px-6 py-5 border-r border-[#eef2f6] flex items-center">
                      <span className={`text-[13px] font-medium ${coupon.type === 'pct' ? 'text-[#d97706]' : 'text-[#2563eb]'}`}>
                        [{coupon.type === 'pct' ? '% Percentage' : 'Fixed Amount'}]
                      </span>
                    </div>
                    <div className="px-6 py-5 border-r border-[#eef2f6] flex items-center">
                      <span className={`text-[13px] font-medium ${coupon.type === 'pct' ? 'text-[#d97706]' : 'text-[#2563eb]'}`}>
                        [{coupon.type === 'pct' ? `${coupon.value}% Off` : `TK${coupon.value} Off`}]
                      </span>
                    </div>
                    <div className="px-6 py-5 border-r border-[#eef2f6] flex items-center">
                      <span className={`text-[13px] font-medium ${coupon.scope === 'all' ? 'text-[#16a34a]' : 'text-[#2563eb]'}`}>
                        [{coupon.scope === 'all' ? 'All Products' : coupon.scope === 'products' ? 'Specific Products' : 'Specific Categories'}]
                      </span>
                    </div>
                    <div className="px-6 py-5 border-r border-[#eef2f6] flex items-center justify-end">
                      <span className="text-[13px] font-medium text-[#94a3b8]">{formatExpiry(coupon.expiry)}</span>
                    </div>
                    <div className="px-6 py-5 flex items-center justify-end">
                      <div className="flex gap-3.5">
                        <i className="ri-pencil-line text-[17px] text-[#94a3b8] cursor-pointer hover:text-[#1e293b] transition-colors" onClick={() => openCouponEdit(coupon)}></i>
                        <i className="ri-delete-bin-line text-[17px] text-[#94a3b8] cursor-pointer hover:text-[#ef4444] transition-colors" onClick={() => deleteCoupon(coupon.id)}></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABANDONED CHECKOUTS VIEW */}
      {dashView === 'abandoned' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#0f172a', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {/* Card */}
          <div style={{background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            {/* Card Header */}
            <div style={{padding: '1.1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontSize: '1rem', fontWeight: 600, color: '#0f172a'}}>Abandoned Checkouts</div>
                <div style={{fontSize: '0.76rem', color: '#64748b', marginTop: '2px'}}>Customers who visited but didn't complete checkout</div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.18rem',
                padding: '0.3rem 0.7rem', fontSize: '0.7rem', fontWeight: 600,
                borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em',
                background: '#fef3c7', color: '#d97706'
              }}>
                <i className="ri-error-warning-line"></i> {abandonedCheckouts.length} Active
              </span>
            </div>
            
            {/* Table */}
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr>
                    <th style={{width: '25%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Customer</th>
                    <th style={{width: '30%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Address</th>
                    <th style={{width: '25%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Last Visit</th>
                    <th style={{width: '20%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {abandonedCheckouts.map((ab) => (
                    <React.Fragment key={ab.id}>
                      {/* Main Row */}
                      <tr 
                        style={{cursor: 'pointer', transition: 'background 0.15s'}}
                        onClick={() => toggleAbandonedExpand(ab.id)}
                        onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '#f8fafc')}
                        onMouseLeave={(e) => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'transparent')}>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                              background: '#d1fae5', border: '1.5px solid #16a34a',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.75rem', color: '#16a34a'
                            }}>{getInitials(ab.name)}</div>
                            <div>
                              <div style={{fontWeight: 600, fontSize: '0.875rem', color: '#0f172a'}}>{ab.name}</div>
                              <div style={{fontSize: '0.72rem', color: '#64748b', marginTop: '2px'}}>{ab.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.83rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle', color: '#475569'}}>{ab.address}</td>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                          <div style={{fontWeight: 500, fontSize: '0.83rem', color: '#0f172a'}}>{ab.visitTime}</div>
                          <div style={{fontSize: '0.71rem', color: '#64748b', marginTop: '2px'}}>{ab.visitDate}</div>
                        </td>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                          <div style={{display: 'inline-flex', alignItems: 'center', gap: '1.5rem'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                              <span style={{fontWeight: 600, fontSize: '0.83rem', color: '#0f172a'}}>{ab.totalVisits}</span>
                              <span style={{fontSize: '0.71rem', color: '#64748b'}}>visits</span>
                              <span style={{width: '1px', height: '10px', background: '#cbd5e1', display: 'inline-block', margin: '0 0.12rem'}}></span>
                              <span style={{fontWeight: 600, fontSize: '0.83rem', color: '#16a34a'}}>{ab.completedOrders}</span>
                              <span style={{fontSize: '0.71rem', color: '#64748b'}}>done</span>
                            </div>
                            <i className="ri-arrow-down-s-line" style={{
                              transition: 'transform 0.25s ease', fontSize: '1.2rem', color: '#64748b',
                              transform: expandedAbandoned === ab.id ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}></i>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expand Row */}
                      {expandedAbandoned === ab.id && (
                        <tr>
                          <td colSpan={4} style={{padding: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0'}}>
                            <div style={{padding: '1.2rem 1.4rem'}}>
                              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <tbody>
                                  {ab.history.map((h, idx) => {
                                    const isComp = h.status === 'completed'
                                    const priceColor = isComp ? '#16a34a' : '#ef4444'
                                    const entries = buildEntries(h.products)
                                    const totalItems = entries.reduce((acc, e) => acc + e.qty, 0)
                                    
                                    return (
                                      <tr key={idx} style={{cursor: 'pointer'}} onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '#f8fafc')}>
                                        <td style={{width: '20%', whiteSpace: 'nowrap', padding: '0.95rem 1rem', fontSize: '0.82rem', borderBottom: idx === ab.history.length - 1 ? 'none' : '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                                          <div style={{fontSize: '0.82rem', fontWeight: 600, color: '#0f172a'}}>{h.date}</div>
                                          <div style={{fontSize: '0.7rem', color: '#64748b', marginTop: '3px'}}>{h.time} · {h.timeAgo}</div>
                                        </td>
                                        <td style={{padding: '0.95rem 1rem', fontSize: '0.82rem', borderBottom: idx === ab.history.length - 1 ? 'none' : '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                                          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 0, lineHeight: 1.6}}>
                                            {entries.map((e, i) => {
                                              const isLast = i === entries.length - 1
                                              const variantText = e.variant ? ` (${e.variant})` : ''
                                              return (
                                                <span key={i} style={{display: 'inline-flex', alignItems: 'baseline', gap: 0, fontSize: '0.81rem', color: '#475569'}}>
                                                  <span style={{color: '#0f172a', fontWeight: 500}}>{e.name}</span>
                                                  {e.variant && <span style={{color: '#64748b', fontSize: '0.75rem'}}>{variantText}</span>}
                                                  <span style={{color: '#16a34a', fontWeight: 700, fontSize: '0.75rem', marginLeft: '0.15rem'}}> ×{e.qty}</span>
                                                  {!isLast && <span style={{color: '#cbd5e1', margin: '0 0.6rem', fontSize: '0.8rem', opacity: 0.6}}>|</span>}
                                                </span>
                                              )
                                            })}
                                          </div>
                                        </td>
                                        <td style={{width: '15%', textAlign: 'right', padding: '0.95rem 1rem', fontSize: '0.82rem', borderBottom: idx === ab.history.length - 1 ? 'none' : '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                                          <div style={{fontWeight: 700, fontSize: '0.9rem', color: priceColor}}>${h.total.toFixed(2)}</div>
                                          <div style={{fontSize: '0.68rem', color: '#64748b', marginTop: '2px'}}>(Total {totalItems} items)</div>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE VIEW */}
      {dashView === 'customers' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#0f172a', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {/* Card */}
          <div style={{background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            {/* Card Header */}
            <div style={{padding: '1.1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontSize: '1rem', fontWeight: 600, color: '#0f172a'}}>Customer Order History</div>
                <div style={{fontSize: '0.76rem', color: '#64748b', marginTop: '2px'}}>Overview of customer orders and spending</div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.18rem',
                padding: '0.3rem 0.7rem', fontSize: '0.7rem', fontWeight: 600,
                borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em',
                background: '#d1fae5', color: '#16a34a'
              }}>
                <i className="ri-user-follow-line"></i> {customerProfiles.length} Active
              </span>
            </div>
            
            {/* Table */}
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr>
                    <th style={{width: '25%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Customer</th>
                    <th style={{width: '25%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Address</th>
                    <th style={{width: '25%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Overview</th>
                    <th style={{width: '25%', textAlign: 'left', padding: '0.75rem 1.2rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerProfiles.map((cust) => (
                    <React.Fragment key={cust.id}>
                      {/* Main Row */}
                      <tr 
                        style={{cursor: 'pointer', transition: 'background 0.15s'}}
                        onClick={() => toggleCustomerExpand(cust.id)}
                        onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '#f8fafc')}
                        onMouseLeave={(e) => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'transparent')}>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                              background: '#d1fae5', border: '1.5px solid #16a34a',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.75rem', color: '#16a34a'
                            }}>{getInitials(cust.name)}</div>
                            <div>
                              <div style={{fontWeight: 600, fontSize: '0.875rem', color: '#0f172a'}}>{cust.name}</div>
                              <div style={{fontSize: '0.72rem', color: '#64748b', marginTop: '2px'}}>{cust.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.83rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle', color: '#475569'}}>{cust.address}</td>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                          <div style={{fontWeight: 500, fontSize: '0.83rem', color: '#0f172a'}}>Total {cust.totalOrders} Orders</div>
                          <div style={{fontSize: '0.71rem', color: '#64748b', marginTop: '2px'}}>Spent ${cust.totalSpent.toFixed(2)}</div>
                        </td>
                        <td style={{padding: '0.9rem 1.2rem', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '0.5rem'}}>
                            {/* Action Buttons */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                              <button onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${cust.phone}`; }} 
                                style={{width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#475569', background: '#f1f5f9', cursor: 'pointer', transition: 'all 0.2s', border: 'none'}}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.color = '#16a34a'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                                <i className="ri-phone-line"></i>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboardLocal(cust.phone); }}
                                style={{width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#475569', background: '#f1f5f9', cursor: 'pointer', transition: 'all 0.2s', border: 'none'}}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                                <i className="ri-file-copy-line"></i>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${cust.phone.replace('+', '')}`, '_blank'); }}
                                style={{width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#475569', background: '#f1f5f9', cursor: 'pointer', transition: 'all 0.2s', border: 'none'}}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.color = '#16a34a'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                                <i className="ri-whatsapp-line"></i>
                              </button>
                            </div>
                            <i className="ri-arrow-down-s-line" style={{
                              transition: 'transform 0.25s ease', fontSize: '1.2rem', color: '#64748b',
                              transform: expandedCustomer === cust.id ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}></i>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expand Row */}
                      {expandedCustomer === cust.id && (
                        <tr>
                          <td colSpan={4} style={{padding: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0'}}>
                            <div style={{padding: '1.2rem 1.4rem'}}>
                              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <tbody>
                                  {cust.orders.map((o, idx) => {
                                    const entries = buildEntries(o.products)
                                    const totalItems = entries.reduce((acc, e) => acc + e.qty, 0)
                                    
                                    return (
                                      <tr key={idx} style={{cursor: 'pointer'}} onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '#f8fafc')}>
                                        <td style={{width: '20%', whiteSpace: 'nowrap', padding: '0.95rem 1rem', fontSize: '0.82rem', borderBottom: idx === cust.orders.length - 1 ? 'none' : '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                                          <div style={{fontSize: '0.82rem', fontWeight: 600, color: '#0f172a'}}>{o.date}</div>
                                          <div style={{fontSize: '0.7rem', color: '#64748b', marginTop: '3px'}}>
                                            Placed on <span style={{color: '#16a34a', fontWeight: 600}}>{o.visitCount}{getOrdinal(o.visitCount)}</span> visit
                                          </div>
                                        </td>
                                        <td style={{padding: '0.95rem 1rem', fontSize: '0.82rem', borderBottom: idx === cust.orders.length - 1 ? 'none' : '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                                          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 0, lineHeight: 1.6}}>
                                            {entries.map((e, i) => {
                                              const isLast = i === entries.length - 1
                                              const variantText = e.variant ? ` (${e.variant})` : ''
                                              return (
                                                <span key={i} style={{display: 'inline-flex', alignItems: 'baseline', gap: 0, fontSize: '0.81rem', color: '#475569'}}>
                                                  <span style={{color: '#0f172a', fontWeight: 500}}>{e.name}</span>
                                                  {e.variant && <span style={{color: '#64748b', fontSize: '0.75rem'}}>{variantText}</span>}
                                                  <span style={{color: '#16a34a', fontWeight: 700, fontSize: '0.75rem', marginLeft: '0.15rem'}}> ×{e.qty}</span>
                                                  {!isLast && <span style={{color: '#cbd5e1', margin: '0 0.6rem', fontSize: '0.8rem', opacity: 0.6}}>|</span>}
                                                </span>
                                              )
                                            })}
                                          </div>
                                        </td>
                                        <td style={{width: '15%', textAlign: 'right', padding: '0.95rem 1rem', fontSize: '0.82rem', borderBottom: idx === cust.orders.length - 1 ? 'none' : '1px solid #e2e8f0', verticalAlign: 'middle'}}>
                                          <div style={{fontWeight: 700, fontSize: '0.9rem', color: '#16a34a'}}>${o.total.toFixed(2)}</div>
                                          <div style={{fontSize: '0.68rem', color: '#64748b', marginTop: '2px'}}>(Total {totalItems} items)</div>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY MANAGEMENT VIEW */}
      {dashView === 'inventory' && (
        <div className="prod-mgmt-wrapper">
          <div style={{marginBottom: '20px', fontSize: '18px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans'"}}>Inventory Management</div>
          
          {/* Stats Cards */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px'}}>
            <div className="prod-order-card" style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '8px', background: '#3b82f615', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <i className="ri-archive-line" style={{color: '#3b82f6', fontSize: '20px'}}></i>
              </div>
              <div>
                <div style={{fontSize: '11px', color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Products</div>
                <div style={{fontSize: '20px', fontWeight: 700, color: '#1c2333'}}>{inventory.length}</div>
              </div>
            </div>
            <div className="prod-order-card" style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '8px', background: '#8b5cf615', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <i className="ri-stack-line" style={{color: '#8b5cf6', fontSize: '20px'}}></i>
              </div>
              <div>
                <div style={{fontSize: '11px', color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Varieties</div>
                <div style={{fontSize: '20px', fontWeight: 700, color: '#1c2333'}}>{inventory.reduce((acc, i) => acc + i.variants.length, 0)}</div>
              </div>
            </div>
            <div className="prod-order-card" style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '8px', background: '#16a34a15', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <i className="ri-checkbox-circle-line" style={{color: '#16a34a', fontSize: '20px'}}></i>
              </div>
              <div>
                <div style={{fontSize: '11px', color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Stock</div>
                <div style={{fontSize: '20px', fontWeight: 700, color: '#16a34a'}}>{inventory.reduce((acc, i) => acc + i.variants.reduce((vAcc, v) => vAcc + v.stock, 0), 0)}</div>
              </div>
            </div>
            <div className="prod-order-card" style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '8px', background: '#ef444415', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <i className="ri-alert-line" style={{color: '#ef4444', fontSize: '20px'}}></i>
              </div>
              <div>
                <div style={{fontSize: '11px', color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Low Stock</div>
                <div style={{fontSize: '20px', fontWeight: 700, color: '#ef4444'}}>{inventory.filter(i => i.variants.some(v => v.stock < 10)).length}</div>
              </div>
            </div>
          </div>

          {/* Inventory Table - Matching Product Section Design */}
          <div className="prod-container">
            <div className="inv-table-header">
              <div className="inv-grid-row">
                <div>Product Name</div>
                <div>Varieties</div>
                <div>Stock</div>
                <div>Last Edited</div>
                <div>Action</div>
              </div>
            </div>
            {inventory.map((item) => {
              const totalStock = item.variants.reduce((acc, v) => acc + v.stock, 0)
              const totalInitialStock = item.variants.reduce((acc, v) => acc + v.initialStock, 0)
              const isExpanded = expandedInventory === item.id
              
              return (
                <React.Fragment key={item.id}>
                  <div 
                    className="prod-order-card product-row"
                    style={{cursor: 'pointer'}}
                    onClick={() => setExpandedInventory(isExpanded ? null : item.id)}
                  >
                    <div className="inv-grid-row">
                      <div className="product-cell" style={{justifyContent: 'center'}}>
                        <img src={item.image} alt={item.name} className="inv-product-img" />
                        <div className="product-info">
                          <span className="product-name">{item.name}</span>
                          <span className="product-cat">{item.category}</span>
                        </div>
                      </div>
                      <div className="bracket-text text-blue">[{item.variants.length} varieties]</div>
                      <div className="bracket-text text-muted-val">[{totalStock} of {totalInitialStock}]</div>
                      <div className="text-muted-val">{item.lastEdited}</div>
                      <div className="inv-action-btns">
                        <button className="inv-btn-edit" onClick={(e) => { e.stopPropagation(); setEditingInventoryItem(item); }}>Edit</button>
                        <button className="inv-btn-delete" onClick={(e) => { e.stopPropagation(); setInventory(inventory.filter(i => i.id !== item.id)); }}>Delete</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Variants */}
                  {isExpanded && (
                    <div className="prod-order-card" style={{background: '#f8fafc', padding: '16px 20px 16px 70px'}}>
                      <div style={{fontSize: '11px', fontWeight: 600, color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px'}}>Varieties Stock Details</div>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px'}}>
                        {item.variants.map((variant, vIndex) => (
                          <div 
                            key={vIndex}
                            style={{padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e4e7ee'}}
                          >
                            <div style={{fontSize: '11px', color: '#64748b', marginBottom: '4px'}}>{variant.name}</div>
                            <div style={{fontSize: '13px', fontWeight: 600, color: '#1c2333'}}>
                              {variant.stock} <span style={{fontSize: '11px', fontWeight: 400, color: '#8a96a8'}}>of {variant.initialStock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
          
          {/* Inventory Edit Modal */}
          {editingInventoryItem && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingInventoryItem(null)}></div>
              <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#1c2333]">Edit Stock - {editingInventoryItem.name}</h3>
                  <button onClick={() => setEditingInventoryItem(null)} className="text-[#8a96a8] hover:text-[#1c2333]">
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editingInventoryItem.variants.map((variant, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg">
                      <div>
                        <div className="font-medium text-[#1c2333]">{variant.name}</div>
                        <div className="text-[11px] text-[#8a96a8]">Variety: {variant.initialStock}</div>
                      </div>
                      <input 
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const newVariants = [...editingInventoryItem.variants];
                          newVariants[idx].stock = parseInt(e.target.value) || 0;
                          setEditingInventoryItem({...editingInventoryItem, variants: newVariants});
                        }}
                        className="w-20 px-3 py-2 border border-[#e4e7ee] rounded-lg text-center focus:outline-none focus:border-[#16a34a]"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setEditingInventoryItem(null)}
                    className="flex-1 px-4 py-2 border border-[#e4e7ee] text-[#8a96a8] rounded-lg font-semibold hover:bg-[#f5f6f9] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setInventory(inventory.map(i => i.id === editingInventoryItem.id ? editingInventoryItem : i));
                      setEditingInventoryItem(null);
                      showToastMsg('Stock updated successfully!');
                    }}
                    className="flex-1 px-4 py-2 bg-[#16a34a] text-white rounded-lg font-semibold hover:bg-[#15803d] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVIEW MANAGEMENT VIEW */}
      {dashView === 'reviews' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'Inter', sans-serif", backgroundColor: '#eef0f4', color: '#1c2333', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1c2333] tracking-tight">Review Management</h1>
              <p className="text-[#8a96a8] text-sm mt-1">Manage customer reviews and feedback</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-[#16a34a]/10 text-[#16a34a] text-[13px] font-bold rounded-lg">
                {adminReviews.filter(r => r.rating >= 4).length} Positive
              </span>
              <span className="px-4 py-1.5 bg-[#ef4444]/10 text-[#ef4444] text-[13px] font-bold rounded-lg">
                {adminReviews.filter(r => r.rating < 3).length} Negative
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-[#e4e7ee] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-[#f59e0b] text-xl"></i>
                </div>
                <div>
                  <div className="text-[11px] text-[#8a96a8] uppercase tracking-wider">Total Reviews</div>
                  <div className="text-xl font-bold text-[#1c2333]">{adminReviews.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#e4e7ee] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#16a34a]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-star-fill text-[#16a34a] text-xl"></i>
                </div>
                <div>
                  <div className="text-[11px] text-[#8a96a8] uppercase tracking-wider">Avg Rating</div>
                  <div className="text-xl font-bold text-[#16a34a]">
                    {(adminReviews.reduce((acc, r) => acc + r.rating, 0) / adminReviews.length).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#e4e7ee] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#16a34a]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-thumb-up-line text-[#16a34a] text-xl"></i>
                </div>
                <div>
                  <div className="text-[11px] text-[#8a96a8] uppercase tracking-wider">5 Star</div>
                  <div className="text-xl font-bold text-[#16a34a]">{adminReviews.filter(r => r.rating === 5).length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#e4e7ee] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ef4444]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-thumb-down-line text-[#ef4444] text-xl"></i>
                </div>
                <div>
                  <div className="text-[11px] text-[#8a96a8] uppercase tracking-wider">1-2 Star</div>
                  <div className="text-xl font-bold text-[#ef4444]">{adminReviews.filter(r => r.rating <= 2).length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white border border-[#e4e7ee] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#e4e7ee] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1c2333]">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-[#e4e7ee] rounded-lg text-sm focus:outline-none focus:border-[#16a34a] text-[#8a96a8]">
                  <option>All Ratings</option>
                  <option>5 Stars</option>
                  <option>4 Stars</option>
                  <option>3 Stars</option>
                  <option>2 Stars</option>
                  <option>1 Star</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-[#f5f6f9] border-b border-[#e4e7ee]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider">Review</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#8a96a8] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e7ee]">
                  {reviewsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#8a96a8]">
                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                        <p className="mt-2 text-sm">Loading reviews...</p>
                      </td>
                    </tr>
                  ) : adminReviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#8a96a8]">
                        <i className="ri-chat-delete-line text-3xl"></i>
                        <p className="mt-2 text-sm">No reviews yet</p>
                      </td>
                    </tr>
                  ) : (
                    adminReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-[#f5f6f9]/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-[#1c2333]">{review.product}</div>
                          <div className="text-[11px] text-[#8a96a8]">{review.productCategory}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-[#1c2333]">{review.customerName}</div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(star => (
                              <i 
                                key={star} 
                                className={`ri-star-${star <= review.rating ? 'fill' : 'line'} ${star <= review.rating ? 'text-[#f59e0b]' : 'text-[#e4e7ee]'}`}
                                style={{fontSize: '12px'}}
                              ></i>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#64748b] text-[12px] max-w-[280px] truncate">{review.text}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[#1c2333] text-[12px]">{review.date}</div>
                        <div className="text-[#8a96a8] text-[11px]">{review.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => deleteReview(review.id as string)}
                          className="px-3 py-1.5 text-[11px] font-semibold text-[#ef4444] border border-[#ef4444] rounded-lg hover:bg-[#ef4444]/10 transition-colors"
                        >
                          <i className="ri-delete-bin-line mr-1"></i>Delete
                        </button>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS VIEW */}
      {dashView === 'settings' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#0f172a', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {/* Page content */}
          <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem'}}>
              {/* Left Column: Branding & Links */}
              <div>
                {/* Branding Card */}
                <div style={{background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <i className="ri-medal-line"></i> Store Branding
                  </h3>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Website Name</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-global-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="e.g. GroceryHub" value={settings.websiteName}
                        onChange={(e) => setSettings({...settings, websiteName: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}} 
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Slogan</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-chat-quote-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="e.g. Freshness at your door" value={settings.slogan}
                        onChange={(e) => setSettings({...settings, slogan: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{marginBottom: '0'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Favicon URL</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-image-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="https://link-to-favicon.ico" value={settings.faviconUrl}
                        onChange={(e) => setSettings({...settings, faviconUrl: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                </div>

                {/* Delivery Card */}
                <div style={{background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <i className="ri-truck-line"></i> Delivery Settings
                  </h3>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                    <div>
                      <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Inside Dhaka (TK)</label>
                      <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                        <i className="ri-map-pin-user-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                        <input type="number" value={settings.insideDhakaDelivery}
                          onChange={(e) => setSettings({...settings, insideDhakaDelivery: parseInt(e.target.value) || 0})}
                          style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                          onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                      </div>
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Outside Dhaka (TK)</label>
                      <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                        <i className="ri-map-pin-2-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                        <input type="number" value={settings.outsideDhakaDelivery}
                          onChange={(e) => setSettings({...settings, outsideDhakaDelivery: parseInt(e.target.value) || 0})}
                          style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                          onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                      </div>
                    </div>
                  </div>
                  <div style={{marginBottom: '0'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Free Delivery Minimum Amount (TK)</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-gift-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="number" placeholder="e.g. 1000" value={settings.freeDeliveryMin}
                        onChange={(e) => setSettings({...settings, freeDeliveryMin: parseInt(e.target.value) || 0})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div style={{background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <i className="ri-links-line"></i> Social & Contact
                  </h3>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>WhatsApp Number</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-whatsapp-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="+8801xxxxxxxxx" value={settings.whatsappNumber}
                        onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Phone Number</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-phone-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="+8801xxxxxxxxx" value={settings.phoneNumber}
                        onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Facebook Page URL</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-facebook-circle-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="https://facebook.com/yourpage" value={settings.facebookUrl}
                        onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div style={{marginBottom: '0'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Messenger Username</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <i className="ri-messenger-line" style={{position: 'absolute', left: '12px', color: '#64748b', fontSize: '1rem'}}></i>
                      <input type="text" placeholder="e.g. groceryhub.bd" value={settings.messengerUsername}
                        onChange={(e) => setSettings({...settings, messengerUsername: e.target.value})}
                        style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem 0.6rem 2.5rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none'}}
                        onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Content Pages */}
              <div>
                <div style={{background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <i className="ri-file-text-line"></i> Page Content (About & Policy)
                  </h3>

                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>About Us</label>
                    <textarea placeholder="Write about your company..." value={settings.aboutUs}
                      onChange={(e) => setSettings({...settings, aboutUs: e.target.value})}
                      style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none', minHeight: '120px', resize: 'vertical'}}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}></textarea>
                  </div>

                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Terms & Conditions</label>
                    <textarea placeholder="Company terms and rules..." value={settings.termsConditions}
                      onChange={(e) => setSettings({...settings, termsConditions: e.target.value})}
                      style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none', minHeight: '120px', resize: 'vertical'}}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}></textarea>
                  </div>

                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Refund Policy</label>
                    <textarea placeholder="Refund and return rules..." value={settings.refundPolicy}
                      onChange={(e) => setSettings({...settings, refundPolicy: e.target.value})}
                      style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none', minHeight: '120px', resize: 'vertical'}}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}></textarea>
                  </div>

                  <div style={{marginBottom: '0'}}>
                    <label style={{display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 500}}>Privacy Policy</label>
                    <textarea placeholder="How you handle customer data..." value={settings.privacyPolicy}
                      onChange={(e) => setSettings({...settings, privacyPolicy: e.target.value})}
                      style={{width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#0f172a', fontSize: '0.9rem', transition: 'border-color 0.2s', outline: 'none', minHeight: '120px', resize: 'vertical'}}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}></textarea>
                  </div>
                </div>

                {/* Save Button */}
                <button onClick={handleSaveSettings}
                  style={{background: '#16a34a', color: '#ffffff', fontWeight: 700, padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContentContent: 'center', gap: '0.5rem', transition: 'transform 0.2s, opacity 0.2s', border: 'none', width: '100%', fontSize: '0.95rem'}}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <i className="ri-save-line"></i> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS VIEW */}
      {dashView === 'credentials' && (
        <div className="p-4 md:p-8" style={{fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#0f172a', margin: '0', minHeight: 'calc(100vh - 80px)'}}>
          {/* Main Content */}
          <div style={{width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
            {/* Page Header */}
            <div style={{marginBottom: '32px'}}>
              <h1 style={{fontSize: '28px', fontWeight: 600, marginBottom: '8px'}}>Settings</h1>
              <p style={{color: '#64748b', fontSize: '15px'}}>Manage your account credentials and system integrations.</p>
            </div>

            {/* Account Security Card */}
            <div style={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
              <div style={{marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0'}}>
                <h2 style={{fontSize: '18px', fontWeight: 600, color: '#0f172a'}}>Account Security</h2>
                <p style={{fontSize: '14px', color: '#64748b', marginTop: '4px'}}>Update your admin username and password here.</p>
              </div>

              <form onSubmit={handleSaveAccount}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>Admin Username</label>
                  <input type="text" placeholder="e.g. admin_john" value={credentials.username} required
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                    onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>Current Password</label>
                  <input type="password" placeholder="Enter current password" value={credentials.currentPassword} required
                    onChange={(e) => setCredentials({...credentials, currentPassword: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                    onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>New Password</label>
                    <input type="password" placeholder="Enter new password" value={credentials.newPassword}
                      onChange={(e) => setCredentials({...credentials, newPassword: e.target.value})}
                      style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                      onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" value={credentials.confirmPassword}
                      onChange={(e) => setCredentials({...credentials, confirmPassword: e.target.value})}
                      style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                      onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '12px'}}>
                  <button type="submit"
                    style={{backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}>
                    Save Account Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Courier API Integration Card */}
            <div style={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', marginBottom: '0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
              <div style={{marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0'}}>
                <h2 style={{fontSize: '18px', fontWeight: 600, color: '#0f172a'}}>Courier Service API</h2>
                <p style={{fontSize: '14px', color: '#64748b', marginTop: '4px'}}>Configure your logistics provider keys and webhook URL.</p>
              </div>

              <form onSubmit={handleSaveApi}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>API Key</label>
                  <input type="text" placeholder="pk_live_xxxxxxxxxxxxxxxxxxxx" value={credentials.apiKey} required
                    onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                    onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>Secret Key</label>
                  <input type="password" placeholder="sk_live_xxxxxxxxxxxxxxxxxxxx" value={credentials.secretKey} required
                    onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                    onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '8px'}}>Webhook Endpoint URL</label>
                  <input type="url" placeholder="https://yourdomain.com/api/webhooks/courier" value={credentials.webhookUrl} required
                    onChange={(e) => setCredentials({...credentials, webhookUrl: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'all 0.2s', outline: 'none'}}
                    onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 4px rgba(15, 118, 110, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '12px'}}>
                  <button type="submit"
                    style={{backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}>
                    Save API Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal" onClick={(e) => { if((e.target as HTMLElement).classList.contains('admin-modal')) setIsModalOpen(false); }}>
          <div className="admin-modal-content">
            <h3 style={{marginBottom: '24px', fontWeight: 600}}>Add Inventory</h3>
            <form onSubmit={handleAddProductInventory}>
              <div className="input-group"><label>Product Name</label><input type="text" required placeholder="e.g. Greek Yogurt" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
              <div className="input-group"><label>Stock Level</label><input type="number" required placeholder="50" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} /></div>
              <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                <button type="button" className="btn-admin-minimal" onClick={() => setIsModalOpen(false)} style={{flex: 1}}>Cancel</button>
                <button type="submit" className="btn-admin-minimal btn-admin-primary" style={{flex: 1}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`cat-toast ${showToast ? 'show' : ''}`}>
        <i className="ri-check-double-line" style={{color: '#16a34a', fontSize: '16px'}}></i>
        <span>{toastMsg}</span>
      </div>
      </main>
    </div>
  )
}

export default AdminDashboard
