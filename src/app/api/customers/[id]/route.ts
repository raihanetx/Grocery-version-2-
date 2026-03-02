import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single customer with full order history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: true,
            couponCodes: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const totalOrders = customer.orders.length
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)
    const completedOrders = customer.orders.filter(o => o.status === 'delivered' || o.courierStatus === 'Delivered').length
    const pendingOrders = customer.orders.filter(o => o.status === 'pending').length
    const canceledOrders = customer.orders.filter(o => o.status === 'canceled').length

    // Format orders for display
    const formattedOrders = customer.orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      courierStatus: order.courierStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      discount: order.discount,
      couponDiscount: order.couponDiscount,
      total: order.total,
      items: order.items.map(item => ({
        name: item.productName,
        variety: item.varietyName,
        quantity: item.quantity,
        basePrice: item.basePrice,
        offerDiscount: item.offerDiscount,
        couponDiscount: item.couponDiscount,
        totalPrice: item.totalPrice
      })),
      couponCodes: order.couponCodes.map(c => ({
        code: c.code,
        discount: c.discount
      }))
    }))

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        email: customer.email || '',
        totalOrders,
        totalSpent,
        completedOrders,
        pendingOrders,
        canceledOrders,
        orders: formattedOrders,
        createdAt: customer.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, address, email } = body

    // Check if phone is already used by another customer
    if (phone) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          phone,
          NOT: { id }
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { success: false, error: 'Phone number already in use by another customer' },
          { status: 400 }
        )
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        email: email || undefined
      }
    })

    return NextResponse.json({
      success: true,
      customer,
      message: 'Customer updated successfully'
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if customer has orders
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Instead of deleting, we can just remove the customer link from orders
    // Or we can prevent deletion if there are orders
    if (customer.orders.length > 0) {
      // Unlink customer from orders but keep the orders
      await db.order.updateMany({
        where: { customerId: id },
        data: { customerId: null }
      })
    }

    // Delete the customer
    await db.customer.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
