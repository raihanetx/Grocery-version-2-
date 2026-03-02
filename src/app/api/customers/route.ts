import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all customers with order stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        phone?: { contains: string; mode: 'insensitive' }
      }>
    } = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get customers with their orders
    const customers = await db.customer.findMany({
      where: whereClause,
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Calculate stats for each customer
    const customersWithStats = customers.map(customer => {
      const totalOrders = customer.orders.length
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)
      const completedOrders = customer.orders.filter(o => o.status === 'delivered' || o.courierStatus === 'Delivered').length
      const lastOrderDate = customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : null

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address || '',
        email: customer.email || '',
        totalOrders,
        totalSpent,
        completedOrders,
        lastOrderDate,
        createdAt: customer.createdAt
      }
    })

    const total = await db.customer.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
