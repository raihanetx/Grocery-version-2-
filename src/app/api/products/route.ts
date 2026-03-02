import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all products with their varieties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offerOnly = searchParams.get('offer') === 'true'
    const categoryId = searchParams.get('categoryId')
    const all = searchParams.get('all') === 'true'

    // Build query
    let query = db
      .from('Product')
      .select(`
        *,
        varieties:ProductVariety(*),
        images:ProductImage(*),
        category:Category(*)
      `)

    // Only filter by status if not requesting all products (for admin)
    if (!all) {
      query = query.eq('status', 'active')
    }

    if (offerOnly) {
      query = query.eq('isOffer', true)
    }

    if (categoryId) {
      query = query.eq('categoryId', categoryId)
    }

    const { data: products, error } = await query.order('createdAt', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Sort images by order for each product
    const processedProducts = (products || []).map(product => ({
      ...product,
      images: (product.images || []).sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    }))

    return NextResponse.json({ success: true, products: processedProducts })
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

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Create product
    const { data: product, error: productError } = await db
      .from('Product')
      .insert({
        name: name.trim(),
        categoryId: categoryId || null,
        shortDesc: shortDesc || null,
        longDesc: longDesc || null,
        isOffer: isOffer || false,
        status: status || 'active',
        image: image || null
      })
      .select()
      .single()

    if (productError) {
      console.error('Supabase error:', productError)
      throw productError
    }

    // Create varieties if provided
    if (varieties && varieties.length > 0) {
      const { error: varietiesError } = await db
        .from('ProductVariety')
        .insert(
          varieties.map((v: { name: string; price: number; stock: number; discount: string | null }) => ({
            productId: product.id,
            name: v.name?.trim() || '',
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            discount: v.discount || null
          }))
        )
      
      if (varietiesError) {
        console.error('Error creating varieties:', varietiesError)
      }
    }

    // Create FAQs if provided
    if (faqs && faqs.length > 0) {
      const { error: faqsError } = await db
        .from('ProductFaq')
        .insert(
          faqs.map((f: { question: string; answer: string }, index: number) => ({
            productId: product.id,
            question: f.question?.trim() || '',
            answer: f.answer?.trim() || '',
            order: index
          }))
        )
      
      if (faqsError) {
        console.error('Error creating FAQs:', faqsError)
      }
    }

    // Fetch the complete product with relations
    const { data: completeProduct, error: fetchError } = await db
      .from('Product')
      .select(`
        *,
        varieties:ProductVariety(*),
        faqs:ProductFaq(*),
        category:Category(*)
      `)
      .eq('id', product.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete product:', fetchError)
    }

    return NextResponse.json({ success: true, product: completeProduct || product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
