import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        varieties: true,
        images: {
          orderBy: { order: 'asc' }
        },
        faqs: {
          orderBy: { order: 'asc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' }
        },
        category: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, categoryId, shortDesc, longDesc, isOffer, status, image, varieties, faqs } = body

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // If varieties provided, update them first
    if (varieties !== undefined) {
      // Delete existing varieties
      await db.productVariety.deleteMany({
        where: { productId: id }
      })

      // Create new varieties if array is not empty
      if (varieties && varieties.length > 0) {
        await db.productVariety.createMany({
          data: varieties.map((v: { name: string; price: number; stock: number; discount: string | null }) => ({
            productId: id,
            name: v.name?.trim() || '',
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            discount: v.discount || null
          }))
        })
      }
    }

    // If FAQs provided, update them
    if (faqs !== undefined) {
      // Delete existing FAQs
      await db.productFaq.deleteMany({
        where: { productId: id }
      })

      // Create new FAQs if array is not empty
      if (faqs && faqs.length > 0) {
        await db.productFaq.createMany({
          data: faqs.map((f: { question: string; answer: string }, index: number) => ({
            productId: id,
            question: f.question?.trim() || '',
            answer: f.answer?.trim() || '',
            order: index
          }))
        })
      }
    }

    // Update product
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(longDesc !== undefined && { longDesc }),
        ...(isOffer !== undefined && { isOffer }),
        ...(status && { status }),
        ...(image !== undefined && { image }),
      },
      include: {
        varieties: true,
        faqs: true,
        category: true
      }
    })

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete related data first
    await db.productVariety.deleteMany({
      where: { productId: id }
    })

    await db.productImage.deleteMany({
      where: { productId: id }
    })

    await db.productFaq.deleteMany({
      where: { productId: id }
    })

    // Delete product
    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
