import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all customers with order stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = db.from('customers').select(`
      id,
      name,
      phone,
      address,
      email,
      created_at,
      orders (
        id,
        total,
        status,
        courier_status,
        created_at
      )
    `, { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    // Calculate stats for each customer
    const customersWithStats = (customers || []).map((customer: {
      id: string
      name: string
      phone: string
      address: string | null
      email: string | null
      created_at: string
      orders: Array<{
        id: string
        total: number
        status: string
        courier_status: string | null
        created_at: string
      }>
    }) => {
      const orders = customer.orders || []
      const totalOrders = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const completedOrders = orders.filter(o => o.status === 'delivered' || o.courier_status === 'Delivered').length
      const lastOrderDate = orders.length > 0 
        ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
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
        createdAt: customer.created_at
      }
    })

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
