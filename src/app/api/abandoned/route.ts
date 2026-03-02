import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all abandoned checkouts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'abandoned' or 'completed'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: { history?: { some: { status: string } } } = {}
    if (status && status !== 'all') {
      whereClause.history = { some: { status } }
    }

    const abandonedCheckouts = await db.abandonedCheckout.findMany({
      where: whereClause,
      include: {
        history: {
          include: {
            products: true
          },
          orderBy: {
            visitDate: 'desc'
          }
        }
      },
      orderBy: {
        visitTime: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await db.abandonedCheckout.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      abandonedCheckouts,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching abandoned checkouts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abandoned checkouts' },
      { status: 500 }
    )
  }
}

// POST - Track new abandoned checkout (when someone enters checkout page)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerAddress, products, total, markAsCompleted } = body

    // Determine the status - completed for successful orders, abandoned otherwise
    const status = markAsCompleted ? 'completed' : 'abandoned'

    // Validate required fields - phone is the key identifier
    if (!customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if this customer already exists (by phone)
    const existingCustomer = await db.abandonedCheckout.findFirst({
      where: { customerPhone },
      include: {
        history: {
          orderBy: { visitDate: 'desc' },
          take: 1
        }
      }
    })

    if (existingCustomer) {
      // Check if we need to update existing 'abandoned' entry or create new one
      const latestHistory = existingCustomer.history[0]

      // If this is a completed order and the latest history is abandoned with same total, update it
      if (markAsCompleted && latestHistory && latestHistory.status === 'abandoned' && Math.abs(latestHistory.total - (total || 0)) < 1) {
        const history = await db.abandonedHistory.update({
          where: { id: latestHistory.id },
          data: { status: 'completed' }
        })

        const updated = await db.abandonedCheckout.update({
          where: { id: existingCustomer.id },
          data: {
            customerName: customerName || existingCustomer.customerName,
            customerAddress: customerAddress || existingCustomer.customerAddress,
            visitTime: new Date()
          },
          include: {
            history: {
              include: { products: true },
              orderBy: { visitDate: 'desc' }
            }
          }
        })

        return NextResponse.json({
          success: true,
          abandonedCheckout: updated,
          historyId: history.id,
          message: 'Order marked as completed'
        })
      }

      // Customer exists - add new history entry
      const history = await db.abandonedHistory.create({
        data: {
          abandonedCheckoutId: existingCustomer.id,
          visitDate: new Date(),
          status: status,
          total: total || 0,
          products: {
            create: (products || []).map((p: { name: string; variant?: string; qty: number }) => ({
              productName: p.name,
              varietyLabel: p.variant || null,
              quantity: p.qty
            }))
          }
        }
      })

      // Update customer info and visit count (only increment for new visits, not completed orders)
      const updated = await db.abandonedCheckout.update({
        where: { id: existingCustomer.id },
        data: {
          customerName: customerName || existingCustomer.customerName,
          customerAddress: customerAddress || existingCustomer.customerAddress,
          visitTime: new Date(),
          totalVisits: markAsCompleted ? undefined : { increment: 1 }
        },
        include: {
          history: {
            include: { products: true },
            orderBy: { visitDate: 'desc' }
          }
        }
      })

      return NextResponse.json({
        success: true,
        abandonedCheckout: updated,
        historyId: history.id,
        message: markAsCompleted ? 'Completed order tracked' : 'Abandoned checkout tracked'
      })
    } else {
      // New customer - create new abandoned checkout with history
      const abandonedCheckout = await db.abandonedCheckout.create({
        data: {
          customerName: customerName || 'Unknown',
          customerPhone,
          customerAddress: customerAddress || null,
          visitTime: new Date(),
          history: {
            create: {
              visitDate: new Date(),
              status: status,
              total: total || 0,
              products: {
                create: (products || []).map((p: { name: string; variant?: string; qty: number }) => ({
                  productName: p.name,
                  varietyLabel: p.variant || null,
                  quantity: p.qty
                }))
              }
            }
          }
        },
        include: {
          history: {
            include: { products: true },
            orderBy: { visitDate: 'desc' }
          }
        }
      })

      return NextResponse.json({
        success: true,
        abandonedCheckout,
        historyId: abandonedCheckout.history[0]?.id,
        message: markAsCompleted ? 'Completed order created' : 'Abandoned checkout created'
      })
    }
  } catch (error) {
    console.error('Error tracking abandoned checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track abandoned checkout' },
      { status: 500 }
    )
  }
}
