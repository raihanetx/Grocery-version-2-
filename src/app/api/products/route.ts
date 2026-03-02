import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all products with their varieties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offerOnly = searchParams.get('offer') === 'true'
    const categoryId = searchParams.get('categoryId')

    const whereClause: {
      isOffer?: boolean
      categoryId?: string
      status: string
    } = { status: 'active' }

    if (offerOnly) {
      whereClause.isOffer = true
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        varieties: true,
        images: {
          orderBy: { order: 'asc' }
        },
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, categoryId, shortDesc, longDesc, isOffer, status, image, varieties } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Create product with varieties
    const product = await db.product.create({
      data: {
        name: name.trim(),
        categoryId: categoryId || null,
        shortDesc: shortDesc || null,
        longDesc: longDesc || null,
        isOffer: isOffer || false,
        status: status || 'active',
        image: image || null,
        varieties: varieties ? {
          create: varieties.map((v: { name: string; price: number; stock: number; discount: string | null }) => ({
            name: v.name,
            price: v.price,
            stock: v.stock || 0,
            discount: v.discount || null
          }))
        } : undefined
      },
      include: {
        varieties: true
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
