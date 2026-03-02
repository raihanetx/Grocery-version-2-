import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all products with inventory/stock info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lowStockOnly = searchParams.get('lowStock') === 'true'

    const products = await db.product.findMany({
      where: {
        status: 'active'
      },
      include: {
        category: true,
        varieties: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Format for inventory view
    let inventoryItems = products.map(product => {
      const totalStock = product.varieties.reduce((sum, v) => sum + v.stock, 0)
      const lowStockVarieties = product.varieties.filter(v => v.stock < 10).length

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        image: product.image || '',
        varieties: product.varieties.map(v => ({
          id: v.id,
          name: v.name,
          stock: v.stock,
          price: v.price,
          discount: v.discount
        })),
        totalStock,
        lowStockVarieties,
        lastEdited: product.updatedAt.toISOString()
      }
    })

    // Filter for low stock only if requested
    if (lowStockOnly) {
      inventoryItems = inventoryItems.filter(item => item.lowStockVarieties > 0)
    }

    // Calculate stats
    const stats = {
      totalProducts: products.length,
      totalVarieties: products.reduce((sum, p) => sum + p.varieties.length, 0),
      totalStock: products.reduce((sum, p) => 
        sum + p.varieties.reduce((vSum, v) => vSum + v.stock, 0), 0
      ),
      lowStockCount: products.filter(p => 
        p.varieties.some(v => v.stock < 10)
      ).length
    }

    return NextResponse.json({
      success: true,
      inventory: inventoryItems,
      stats
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// PUT - Update stock for multiple varieties
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, varieties } = body

    if (!productId || !varieties || !Array.isArray(varieties)) {
      return NextResponse.json(
        { success: false, error: 'Product ID and varieties array are required' },
        { status: 400 }
      )
    }

    // Update each variety's stock
    const updatePromises = varieties.map((v: { id: string; stock: number }) =>
      db.productVariety.update({
        where: { id: v.id },
        data: { stock: Math.max(0, Number(v.stock) || 0) }
      })
    )

    await Promise.all(updatePromises)

    // Update product's updatedAt timestamp
    await db.product.update({
      where: { id: productId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully'
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}
