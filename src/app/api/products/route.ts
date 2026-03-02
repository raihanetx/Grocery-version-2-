import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all products with their varieties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offerOnly = searchParams.get('offer') === 'true'
    const categoryId = searchParams.get('categoryId')
    const all = searchParams.get('all') === 'true' // For admin to get all products

    const whereClause: {
      isOffer?: boolean
      categoryId?: string
      status?: string
    } = {}

    // Only filter by status if not requesting all products (for admin)
    if (!all) {
      whereClause.status = 'active'
    }

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
    const { name, categoryId, shortDesc, longDesc, isOffer, status, image, varieties, faqs } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Create product with varieties and FAQs
    const product = await db.product.create({
      data: {
        name: name.trim(),
        categoryId: categoryId || null,
        shortDesc: shortDesc || null,
        longDesc: longDesc || null,
        isOffer: isOffer || false,
        status: status || 'active',
        image: image || null,
        varieties: varieties && varieties.length > 0 ? {
          create: varieties.map((v: { name: string; price: number; stock: number; discount: string | null }) => ({
            name: v.name.trim(),
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            discount: v.discount || null
          }))
        } : undefined,
        faqs: faqs && faqs.length > 0 ? {
          create: faqs.map((f: { question: string; answer: string }, index: number) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
            order: index
          }))
        } : undefined
      },
      include: {
        varieties: true,
        faqs: true,
        category: true
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
