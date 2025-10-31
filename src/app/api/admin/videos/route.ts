import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin authentication middleware
async function authenticateAdmin(request: NextRequest): Promise<boolean> {
  const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '')
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token'
  
  return adminToken === expectedToken
}

export async function GET(request: NextRequest) {
  try {
    if (!await authenticateAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'ALL'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {}

    if (category !== 'ALL') {
      where.category = category.toUpperCase()
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Get videos with pagination
    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        include: {
          serialParts: {
            orderBy: { partNumber: 'asc' },
            take: 5 // Limit untuk performance
          },
          _count: {
            select: {
              serialParts: true,
              videoLikes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
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

export async function POST(request: NextRequest) {
  try {
    if (!await authenticateAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      thumbnailUrl,
      category,
      videoSource,
      videoUrl,
      telegramFileId
    } = body

    // Validate required fields
    if (!title || !category || !videoSource) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and video source are required' },
        { status: 400 }
      )
    }

    // Create video
    const video = await db.video.create({
      data: {
        title,
        description: description || '',
        thumbnailUrl,
        category: category.toUpperCase(),
        videoSource,
        videoUrl,
        telegramFileId,
        status: 'PUBLISH',
        viewCount: 0,
        isActive: true
      },
      include: {
        serialParts: true,
        _count: {
          select: {
            serialParts: true,
            videoLikes: true,
            comments: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: video
    })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    )
  }
}