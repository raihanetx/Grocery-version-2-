import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: { status?: string } = {}
    if (status && status !== 'all') {
      whereClause.status = status
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: true,
        couponCodes: true,
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await db.order.count({ where: whereClause })

    return NextResponse.json({ 
      success: true, 
      orders,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customerName, 
      customerPhone, 
      customerAddress,
      customerEmail,
      items,
      subtotal,
      deliveryCharge,
      discount,
      couponDiscount,
      couponCodes,
      total,
      notes,
      paymentMethod
    } = body

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, and address are required' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Check if customer exists, create if not
    let customer = null
    const existingCustomer = await db.customer.findUnique({
      where: { phone: customerPhone }
    })

    if (existingCustomer) {
      // Update customer address if provided
      if (customerAddress && existingCustomer.address !== customerAddress) {
        customer = await db.customer.update({
          where: { id: existingCustomer.id },
          data: { 
            address: customerAddress,
            name: customerName,
            email: customerEmail || existingCustomer.email
          }
        })
      } else {
        customer = existingCustomer
      }
    } else {
      // Create new customer
      customer = await db.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          email: customerEmail
        }
      })
    }

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer?.id || null,
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        status: 'pending',
        subtotal: parseFloat(subtotal) || 0,
        deliveryCharge: parseFloat(deliveryCharge) || 0,
        discount: parseFloat(discount) || 0,
        couponDiscount: parseFloat(couponDiscount) || 0,
        total: parseFloat(total) || 0,
        notes: notes || null,
        items: {
          create: items.map((item: { 
            productId?: string; 
            productName: string; 
            varietyName?: string; 
            quantity: number; 
            basePrice: number; 
            offerDiscount?: number; 
            couponDiscount?: number; 
            totalPrice: number 
          }) => ({
            productId: item.productId || null,
            productName: item.productName,
            varietyName: item.varietyName || null,
            quantity: item.quantity || 1,
            basePrice: item.basePrice || 0,
            offerDiscount: item.offerDiscount || 0,
            couponDiscount: item.couponDiscount || 0,
            totalPrice: item.totalPrice || 0
          }))
        },
        ...(couponCodes && couponCodes.length > 0 && {
          couponCodes: {
            create: couponCodes.map((code: { code: string; discount: number }) => ({
              code: code.code,
              discount: code.discount
            }))
          }
        })
      },
      include: {
        items: true,
        couponCodes: true,
        customer: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
