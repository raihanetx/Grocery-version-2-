import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const coupon = await db.coupon.findUnique({
      where: { id },
      include: {
        selectedProducts: true,
        selectedCategories: true
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
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
        isActive: coupon.isActive,
        selectedProducts: coupon.selectedProducts.map(p => p.productId),
        selectedCategories: coupon.selectedCategories.map(c => c.categoryName)
      }
    })
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

// PUT - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, type, value, scope, expiry, selectedProducts, selectedCategories, isActive } = body

    // Check if coupon exists
    const existingCoupon = await db.coupon.findUnique({
      where: { id }
    })

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await db.coupon.findUnique({
        where: { code: code.toUpperCase() }
      })
      if (duplicateCoupon) {
        return NextResponse.json(
          { success: false, error: 'Coupon with this code already exists' },
          { status: 400 }
        )
      }
    }

    // Update coupon
    const coupon = await db.coupon.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : existingCoupon.code,
        type: type || existingCoupon.type,
        value: value !== undefined ? parseFloat(value) : existingCoupon.value,
        scope: scope || existingCoupon.scope,
        expiry: expiry !== undefined ? (expiry || null) : existingCoupon.expiry,
        isActive: isActive !== undefined ? isActive : existingCoupon.isActive,
      },
      include: {
        selectedProducts: true,
        selectedCategories: true
      }
    })

    // Handle selected products update
    if (scope === 'products' && selectedProducts) {
      // Delete existing selections
      await db.couponProduct.deleteMany({
        where: { couponId: id }
      })
      // Create new selections
      if (selectedProducts.length > 0) {
        await db.couponProduct.createMany({
          data: selectedProducts.map((productId: string) => ({
            couponId: id,
            productId
          }))
        })
      }
    }

    // Handle selected categories update
    if (scope === 'categories' && selectedCategories) {
      // Delete existing selections
      await db.couponCategory.deleteMany({
        where: { couponId: id }
      })
      // Create new selections
      if (selectedCategories.length > 0) {
        await db.couponCategory.createMany({
          data: selectedCategories.map((categoryName: string) => ({
            couponId: id,
            categoryName
          }))
        })
      }
    }

    // If scope changed to 'all', delete product and category selections
    if (scope === 'all') {
      await db.couponProduct.deleteMany({
        where: { couponId: id }
      })
      await db.couponCategory.deleteMany({
        where: { couponId: id }
      })
    }

    // Fetch updated coupon
    const updatedCoupon = await db.coupon.findUnique({
      where: { id },
      include: {
        selectedProducts: true,
        selectedCategories: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: updatedCoupon!.id,
        code: updatedCoupon!.code,
        type: updatedCoupon!.type,
        value: updatedCoupon!.value,
        scope: updatedCoupon!.scope,
        expiry: updatedCoupon!.expiry || '',
        isActive: updatedCoupon!.isActive,
        selectedProducts: updatedCoupon!.selectedProducts.map(p => p.productId),
        selectedCategories: updatedCoupon!.selectedCategories.map(c => c.categoryName)
      }
    })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// DELETE - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if coupon exists
    const existingCoupon = await db.coupon.findUnique({
      where: { id }
    })

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // Delete coupon (cascade will handle related records)
    await db.coupon.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Coupon deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
