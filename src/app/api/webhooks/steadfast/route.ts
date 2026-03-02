import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Handle Steadfast webhook callbacks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      notification_type,
      consignment_id,
      invoice,
      cod_amount,
      status,
      delivery_charge,
      tracking_message,
      updated_at
    } = body

    console.log('Steadfast Webhook Received:', {
      notification_type,
      consignment_id,
      invoice,
      status
    })

    // Validate required fields
    if (!invoice && !consignment_id) {
      return NextResponse.json(
        { status: 'error', message: 'Missing invoice or consignment_id' },
        { status: 400 }
      )
    }

    // Find order by order number (invoice) or consignment ID
    let order = null
    if (invoice) {
      order = await db.order.findUnique({
        where: { orderNumber: invoice }
      })
    }
    if (!order && consignment_id) {
      order = await db.order.findFirst({
        where: { consignmentId: consignment_id.toString() }
      })
    }

    if (!order) {
      console.log('Order not found for webhook:', { invoice, consignment_id })
      return NextResponse.json(
        { status: 'error', message: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order based on notification type
    if (notification_type === 'delivery_status') {
      // Map Steadfast status to our courier status
      let courierStatus = order.courierStatus
      let orderStatus = order.status

      switch (status?.toLowerCase()) {
        case 'pending':
          courierStatus = 'Processing'
          break
        case 'in_review':
          courierStatus = 'Processing'
          break
        case 'delivered':
        case 'delivered_approval_pending':
          courierStatus = 'Delivered'
          orderStatus = 'delivered'
          break
        case 'partial_delivered':
        case 'partial_delivered_approval_pending':
          courierStatus = 'Partial Delivered'
          break
        case 'cancelled':
        case 'cancelled_approval_pending':
          courierStatus = 'Canceled'
          orderStatus = 'canceled'
          break
        case 'hold':
          courierStatus = 'On Hold'
          break
        case 'unknown':
        case 'unknown_approval_pending':
          courierStatus = 'Unknown'
          break
        default:
          courierStatus = status
      }

      // Update order
      await db.order.update({
        where: { id: order.id },
        data: {
          courierStatus,
          status: orderStatus,
          updatedAt: new Date()
        }
      })

      console.log(`Order ${order.orderNumber} updated: courierStatus=${courierStatus}, status=${orderStatus}`)
    }

    if (notification_type === 'tracking_update') {
      // Just log tracking updates, could store in a tracking history table
      console.log(`Tracking update for order ${order.orderNumber}: ${tracking_message}`)
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Webhook received successfully' 
    })
  } catch (error) {
    console.error('Steadfast webhook error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Verify webhook endpoint is working
export async function GET() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Steadfast webhook endpoint is active' 
  })
}
