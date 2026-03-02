// Cart Types
export interface CartItem {
  id: number
  name: string
  price: number
  oldPrice: number
  img: string
  weight: string
  quantity?: number
  productId?: string
}

// Review Types
export interface Review {
  id: number
  initials: string
  name: string
  rating: number
  text: string
  date: string
}

// Category Types
export interface Category {
  id: string
  name: string
  type: string
  icon: string
  image: string
  items: number
  created: string
  status: string
}

// Product Types
export interface Product {
  id: string | number
  name: string
  category: string
  categoryId?: string
  image: string
  variants: string
  price: string
  discount: string
  offer: boolean
  status: string
  shortDesc?: string
  longDesc?: string
  offerSwitch?: boolean
}

// Inventory Types
export interface InventoryItem {
  id: number
  name: string
  category: string
  image: string
  variants: { name: string; stock: number; initialStock: number }[]
  lastEdited: string
}

// Alert Types
export interface Alert {
  title: string
  desc: string
  type: string
}

// Admin Review Types
export interface AdminReview {
  id: number | string
  product: string
  productCategory: string
  productImg: string
  customerName: string
  rating: number
  text: string
  date: string
  time: string
}

// Order Types
export interface OrderItem {
  name: string
  variant: string | null
  qty: number
  basePrice: number
  offerText: string | null
  offerDiscount: number
  couponCode: string | null
  couponDiscount: number
}

export interface Order {
  id: string
  databaseId?: string
  customer: string
  phone: string
  address: string
  date: string
  time: string
  paymentMethod: string
  status: 'pending' | 'approved' | 'canceled' | 'delivered'
  courierStatus: string
  subtotal: number
  delivery: number
  discount: number
  couponCodes: string[]
  couponAmount: number
  total: number
  canceledBy: string | null
  consignmentId?: string | null
  trackingCode?: string | null
  items: OrderItem[]
}

// Coupon Types
export interface Coupon {
  id: string
  code: string
  type: 'pct' | 'fixed'
  value: number
  scope: 'all' | 'products' | 'categories'
  expiry: string
  isActive?: boolean
  selectedProducts?: string[]
  selectedCategories?: string[]
}

export interface CouponProduct {
  id: number | string
  name: string
  price: string
  img: string
}

export interface CouponCategory {
  name: string
  color: string
}

// Abandoned Checkout Types
export interface AbandonedVariant {
  label: string | null
  qty: number
}

export interface AbandonedProduct {
  name: string
  variants: AbandonedVariant[]
}

export interface AbandonedHistory {
  date: string
  time: string
  timeAgo: string
  status: 'abandoned' | 'completed'
  products: AbandonedProduct[]
  total: number
}

export interface AbandonedCheckout {
  id: number | string
  name: string
  phone: string
  address: string
  visitTime: string
  visitDate: string
  totalVisits: number
  completedOrders: number
  history: AbandonedHistory[]
}

// Customer Types
export interface CustomerOrder {
  id: string
  orderNumber: string
  date: string
  time: string
  timeAgo: string
  status: string
  courierStatus: string | null
  paymentMethod: string
  subtotal: number
  deliveryCharge: number
  discount: number
  couponDiscount: number
  total: number
  items: {
    name: string
    variety: string | null
    quantity: number
    basePrice: number
    offerDiscount: number
    couponDiscount: number
    totalPrice: number
  }[]
  couponCodes: {
    code: string
    discount: number
  }[]
}

export interface CustomerProfile {
  id: string
  name: string
  phone: string
  address: string
  email?: string
  totalSpent: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  canceledOrders: number
  lastOrderDate: string | null
  createdAt: string
  orders?: CustomerOrder[]
}

// Settings Types
export interface Settings {
  websiteName: string
  slogan: string
  faviconUrl: string
  insideDhakaDelivery: number
  outsideDhakaDelivery: number
  freeDeliveryMin: number
  whatsappNumber: string
  phoneNumber: string
  facebookUrl: string
  messengerUsername: string
  aboutUs: string
  termsConditions: string
  refundPolicy: string
  privacyPolicy: string
}

// Credentials Types
export interface Credentials {
  username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  apiKey: string
  secretKey: string
  webhookUrl: string
}

// Product Variety Types (for admin product management)
export interface ProductVariety {
  id: number
  name: string
  price: string
  stock: string
  discount: string
}

// Product FAQ Types (for admin product management)
export interface ProductFaq {
  id: number
  question: string
  answer: string
}
