import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all coupons
export async function GET() {
  try {
    // Fetch coupons
    const { data: coupons, error } = await db
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch coupons' },
        { status: 500 }
      )
    }

    // Fetch related products and categories
    const { data: couponProducts } = await db
      .from('coupon_products')
      .select('*')

    const { data: couponCategories } = await db
      .from('coupon_categories')
      .select('*')

    // Transform to match frontend format
    const transformedCoupons = (coupons || []).map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      scope: coupon.scope || 'all',
      expiry: coupon.expiry || '',
      isActive: coupon.is_active,
      selectedProducts: (couponProducts || [])
        .filter(cp => cp.coupon_id === coupon.id)
        .map(cp => cp.product_id),
      selectedCategories: (couponCategories || [])
        .filter(cc => cc.coupon_id === coupon.id)
        .map(cc => cc.category_name),
      createdAt: coupon.created_at,
      updatedAt: coupon.updated_at
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
    const { data: existingCoupon } = await db
      .from('coupons')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .single()

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon with this code already exists' },
        { status: 400 }
      )
    }

    // Create coupon
    const { data: coupon, error: couponError } = await db
      .from('coupons')
      .insert({
        code: code.trim().toUpperCase(),
        type: type || 'pct',
        value: parseFloat(value),
        scope: scope || 'all',
        expiry: expiry || null,
        is_active: isActive !== undefined ? isActive : true
      })
      .select()
      .single()

    if (couponError || !coupon) {
      console.error('Error creating coupon:', couponError)
      return NextResponse.json(
        { success: false, error: 'Failed to create coupon' },
        { status: 500 }
      )
    }

    // Add selected products if scope is 'products'
    if (scope === 'products' && selectedProducts?.length > 0) {
      const productInserts = selectedProducts.map((productId: string) => ({
        coupon_id: coupon.id,
        product_id: productId
      }))
      
      await db.from('coupon_products').insert(productInserts)
    }

    // Add selected categories if scope is 'categories'
    if (scope === 'categories' && selectedCategories?.length > 0) {
      const categoryInserts = selectedCategories.map((categoryName: string) => ({
        coupon_id: coupon.id,
        category_name: categoryName
      }))
      
      await db.from('coupon_categories').insert(categoryInserts)
    }

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        scope: coupon.scope,
        expiry: coupon.expiry || '',
        isActive: coupon.is_active,
        selectedProducts: selectedProducts || [],
        selectedCategories: selectedCategories || []
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
