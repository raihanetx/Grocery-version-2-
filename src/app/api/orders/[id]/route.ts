import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Steadfast Courier API configuration
const STEADFAST_BASE_URL = 'https://portal.packzy.com/api/v1'
const STEADFAST_API_KEY = process.env.STEADFAST_API_KEY || 'gq6fzbdpxr2tksotthtnvton70txsrxs'
const STEADFAST_SECRET_KEY = process.env.STEADFAST_SECRET_KEY || '9c0uygqcsv6zc8aayim162wc'

// Helper function to send order to Steadfast Courier
async function sendToSteadfast(order: {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  total: number
  notes: string | null
}) {
  try {
    const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': STEADFAST_API_KEY,
        'Secret-Key': STEADFAST_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoice: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: order.customerAddress,
        cod_amount: order.total,
        note: order.notes || ''
      })
    })

    const data = await response.json()
    
    if (response.ok && data.status === 200) {
      return {
        success: true,
        consignment_id: data.consignment?.consignment_id,
        tracking_code: data.consignment?.tracking_code,
        message: data.message
      }
    } else {
      return {
        success: false,
        error: data.message || 'Failed to create consignment',
        details: data
      }
    }
  } catch (error) {
    console.error('Steadfast API error:', error)
    return {
      success: false,
      error: 'Failed to connect to Steadfast Courier'
    }
  }
}

// GET - Fetch single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        couponCodes: true,
        customer: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT - Update order (including approval with Steadfast integration)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      status, 
      courierStatus, 
      canceledBy, 
      notes,
      consignmentId,
      trackingCode 
    } = body

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true, customer: true }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // If approving order, send to Steadfast Courier
    let steadfastResult = null
    let updatedData: {
      status?: string
      courierStatus?: string | null
      canceledBy?: string | null
      notes?: string | null
      consignmentId?: string
      trackingCode?: string
    } = {}

    if (status === 'approved' && existingOrder.status === 'pending') {
      // Send to Steadfast Courier
      steadfastResult = await sendToSteadfast({
        orderNumber: existingOrder.orderNumber,
        customerName: existingOrder.customerName,
        customerPhone: existingOrder.customerPhone,
        customerAddress: existingOrder.customerAddress,
        total: existingOrder.total,
        notes: existingOrder.notes
      })

      if (steadfastResult.success) {
        updatedData = {
          status: 'approved',
          courierStatus: 'Processing',
          consignmentId: steadfastResult.consignment_id?.toString(),
          trackingCode: steadfastResult.tracking_code
        }
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to send to Steadfast: ${steadfastResult.error}`,
            details: steadfastResult.details
          },
          { status: 400 }
        )
      }
    } else {
      // Just update the provided fields
      if (status) updatedData.status = status
      if (courierStatus !== undefined) updatedData.courierStatus = courierStatus
      if (canceledBy !== undefined) updatedData.canceledBy = canceledBy
      if (notes !== undefined) updatedData.notes = notes
      if (consignmentId !== undefined) updatedData.consignmentId = consignmentId
      if (trackingCode !== undefined) updatedData.trackingCode = trackingCode
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id },
      data: updatedData,
      include: {
        items: true,
        couponCodes: true,
        customer: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      steadfast: steadfastResult,
      message: steadfastResult 
        ? `Order approved and sent to Steadfast Courier. Tracking: ${steadfastResult.tracking_code}` 
        : 'Order updated successfully'
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Delete related data first
    await db.orderItem.deleteMany({
      where: { orderId: id }
    })

    await db.orderCoupon.deleteMany({
      where: { orderId: id }
    })

    // Delete order
    await db.order.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
