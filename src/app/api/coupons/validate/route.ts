import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Validate and calculate coupon discount
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, cartItems } = body

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a coupon code' },
        { status: 400 }
      )
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Find the coupon
    const coupon = await db.coupon.findUnique({
      where: { 
        code: code.trim().toUpperCase(),
        isActive: true
      },
      include: {
        selectedProducts: true,
        selectedCategories: true
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 400 }
      )
    }

    // Check expiry date
    if (coupon.expiry) {
      const expiryDate = new Date(coupon.expiry)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (expiryDate < today) {
        return NextResponse.json(
          { success: false, error: 'This coupon has expired' },
          { status: 400 }
        )
      }
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum: number, item: { price: number; quantity?: number }) => 
      sum + (item.price * (item.quantity || 1)), 0
    )

    let discountAmount = 0
    let applicableItems: { name: string; discount: number }[] = []

    // Calculate discount based on scope
    if (coupon.scope === 'all') {
      // Apply to all products
      if (coupon.type === 'pct') {
        discountAmount = subtotal * (coupon.value / 100)
      } else {
        discountAmount = Math.min(coupon.value, subtotal)
      }
      
      applicableItems = cartItems.map((item: { name: string; price: number; quantity?: number }) => {
        const itemTotal = item.price * (item.quantity || 1)
        const itemDiscount = coupon.type === 'pct' 
          ? itemTotal * (coupon.value / 100)
          : (itemTotal / subtotal) * coupon.value
        return { name: item.name, discount: Math.round(itemDiscount * 100) / 100 }
      })
    } else if (coupon.scope === 'products') {
      // Apply only to selected products
      const selectedProductIds = coupon.selectedProducts.map(p => p.productId)
      
      // Filter cart items that match selected products
      const matchingItems = cartItems.filter((item: { productId?: string }) => 
        item.productId && selectedProductIds.includes(item.productId)
      )

      if (matchingItems.length === 0) {
        return NextResponse.json(
          { success: false, error: 'This coupon is not applicable to any items in your cart' },
          { status: 400 }
        )
      }

      const matchingSubtotal = matchingItems.reduce((sum: number, item: { price: number; quantity?: number }) => 
        sum + (item.price * (item.quantity || 1)), 0
      )

      if (coupon.type === 'pct') {
        discountAmount = matchingSubtotal * (coupon.value / 100)
      } else {
        discountAmount = Math.min(coupon.value, matchingSubtotal)
      }

      applicableItems = matchingItems.map((item: { name: string; price: number; quantity?: number }) => {
        const itemTotal = item.price * (item.quantity || 1)
        const itemDiscount = coupon.type === 'pct' 
          ? itemTotal * (coupon.value / 100)
          : (itemTotal / matchingSubtotal) * coupon.value
        return { name: item.name, discount: Math.round(itemDiscount * 100) / 100 }
      })
    } else if (coupon.scope === 'categories') {
      // Apply only to selected categories
      const selectedCategoryNames = coupon.selectedCategories.map(c => c.categoryName)
      
      // Get product details with categories
      const productIds = cartItems
        .filter((item: { productId?: string }) => item.productId)
        .map((item: { productId?: string }) => item.productId)

      const products = await db.product.findMany({
        where: {
          id: { in: productIds }
        },
        include: {
          category: true
        }
      })

      // Filter cart items that match selected categories
      const matchingItems = cartItems.filter((item: { productId?: string }) => {
        const product = products.find(p => p.id === item.productId)
        return product?.category?.name && selectedCategoryNames.includes(product.category.name)
      })

      if (matchingItems.length === 0) {
        return NextResponse.json(
          { success: false, error: 'This coupon is not applicable to any items in your cart' },
          { status: 400 }
        )
      }

      const matchingSubtotal = matchingItems.reduce((sum: number, item: { price: number; quantity?: number }) => 
        sum + (item.price * (item.quantity || 1)), 0
      )

      if (coupon.type === 'pct') {
        discountAmount = matchingSubtotal * (coupon.value / 100)
      } else {
        discountAmount = Math.min(coupon.value, matchingSubtotal)
      }

      applicableItems = matchingItems.map((item: { name: string; price: number; quantity?: number }) => {
        const itemTotal = item.price * (item.quantity || 1)
        const itemDiscount = coupon.type === 'pct' 
          ? itemTotal * (coupon.value / 100)
          : (itemTotal / matchingSubtotal) * coupon.value
        return { name: item.name, discount: Math.round(itemDiscount * 100) / 100 }
      })
    }

    // Round discount to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        scope: coupon.scope,
        discountAmount,
        applicableItems
      }
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
