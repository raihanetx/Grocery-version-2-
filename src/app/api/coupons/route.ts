import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all coupons
export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      include: {
        selectedProducts: true,
        selectedCategories: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Transform to match frontend format
    const transformedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      scope: coupon.scope,
      expiry: coupon.expiry || '',
      isActive: coupon.isActive,
      selectedProducts: coupon.selectedProducts.map(p => p.productId),
      selectedCategories: coupon.selectedCategories.map(c => c.categoryName),
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt
    }))
    
    return NextResponse.json({ success: true, coupons: transformedCoupons })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, type, value, scope, expiry, selectedProducts, selectedCategories, isActive } = body

    // Validate required fields
    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    if (!value || value <= 0) {
      return NextResponse.json(
        { success: false, error: 'Discount value must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if coupon with same code already exists
    const existingCoupon = await db.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon with this code already exists' },
        { status: 400 }
      )
    }

    // Create coupon with related data
    const coupon = await db.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type: type || 'pct',
        value: parseFloat(value),
        scope: scope || 'all',
        expiry: expiry || null,
        isActive: isActive !== undefined ? isActive : true,
        // Add selected products if scope is 'products'
        ...(scope === 'products' && selectedProducts?.length > 0 && {
          selectedProducts: {
            create: selectedProducts.map((productId: string) => ({
              productId
            }))
          }
        }),
        // Add selected categories if scope is 'categories'
        ...(scope === 'categories' && selectedCategories?.length > 0 && {
          selectedCategories: {
            create: selectedCategories.map((categoryName: string) => ({
              categoryName
            }))
          }
        })
      },
      include: {
        selectedProducts: true,
        selectedCategories: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        scope: coupon.scope,
        expiry: coupon.expiry || '',
        isActive: coupon.isActive,
        selectedProducts: coupon.selectedProducts.map(p => p.productId),
        selectedCategories: coupon.selectedCategories.map(c => c.categoryName)
      }
    })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
