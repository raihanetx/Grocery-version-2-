import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all categories
export async function GET() {
  try {
    const { data: categories, error } = await db
      .from('Category')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, icon, image, status } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category with same name already exists
    const { data: existingCategory } = await db
      .from('Category')
      .select('*')
      .eq('name', name.trim())
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      )
    }

    // Create category
    const { data: category, error } = await db
      .from('Category')
      .insert({
        name: name.trim(),
        type: type || 'icon',
        icon: type === 'icon' ? icon : null,
        image: type === 'image' ? image : null,
        status: status || 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
