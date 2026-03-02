import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Mark abandoned checkout as completed (when order is placed)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { historyId, status } = body

    // If historyId is provided, update that specific history entry
    if (historyId) {
      const history = await db.abandonedHistory.update({
        where: { id: historyId },
        data: { status: status || 'completed' }
      })

      return NextResponse.json({
        success: true,
        history,
        message: 'History status updated'
      })
    }

    // Otherwise, find the most recent history for this abandoned checkout and update it
    const latestHistory = await db.abandonedHistory.findFirst({
      where: { abandonedCheckoutId: id },
      orderBy: { visitDate: 'desc' }
    })

    if (latestHistory) {
      const history = await db.abandonedHistory.update({
        where: { id: latestHistory.id },
        data: { status: status || 'completed' }
      })

      return NextResponse.json({
        success: true,
        history,
        message: 'History status updated'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No history found for this abandoned checkout'
    }, { status: 404 })
  } catch (error) {
    console.error('Error updating abandoned checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update abandoned checkout' },
      { status: 500 }
    )
  }
}

// DELETE - Delete abandoned checkout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if exists
    const existing = await db.abandonedCheckout.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Abandoned checkout not found' },
        { status: 404 }
      )
    }

    // Delete (cascade will handle history and products)
    await db.abandonedCheckout.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Abandoned checkout deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting abandoned checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete abandoned checkout' },
      { status: 500 }
    )
  }
}

// GET - Get single abandoned checkout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const abandonedCheckout = await db.abandonedCheckout.findUnique({
      where: { id },
      include: {
        history: {
          include: {
            products: true
          },
          orderBy: {
            visitDate: 'desc'
          }
        }
      }
    })

    if (!abandonedCheckout) {
      return NextResponse.json(
        { success: false, error: 'Abandoned checkout not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      abandonedCheckout
    })
  } catch (error) {
    console.error('Error fetching abandoned checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abandoned checkout' },
      { status: 500 }
    )
  }
}
