import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'ALL'
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'latest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build where clause
    const where: any = {
      status: 'PUBLISH'
    }

    if (category !== 'ALL') {
      where.category = category.toUpperCase()
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'most_viewed':
        orderBy = { viewCount: 'desc' }
        break
      case 'least_viewed':
        orderBy = { viewCount: 'asc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get videos with pagination
    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        include: {
          serialParts: {
            orderBy: { partNumber: 'asc' }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      db.video.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}