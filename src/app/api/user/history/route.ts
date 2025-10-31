import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple session validation (in real app, use proper JWT or session management)
async function validateSession(sessionToken: string): Promise<string | null> {
  // For demo purposes, we'll use a simple validation
  // In production, implement proper session validation
  if (sessionToken && sessionToken.length === 64) { // 32 bytes * 2 (hex)
    return 'demo-user-id' // Return user ID
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Missing session token' },
        { status: 401 }
      )
    }
    
    const userId = await validateSession(sessionToken)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session token' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const videoId = searchParams.get('videoId')
    
    // Build where clause
    const where: any = { userId }
    if (videoId) {
      where.videoId = parseInt(videoId)
    }
    
    // Get watch history with pagination
    const [history, total] = await Promise.all([
      db.watchHistory.findMany({
        where,
        include: {
          video: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailId: true,
              category: true,
              videoSource: true,
              duration: true
            }
          },
          serialPart: {
            select: {
              id: true,
              partNumber: true,
              videoFileId: true
            }
          }
        },
        orderBy: { watchedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.watchHistory.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching watch history:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Missing session token' },
        { status: 401 }
      )
    }
    
    const userId = await validateSession(sessionToken)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session token' },
        { status: 401 }
      )
    }
    
    const { videoId, serialPartId, progress, duration, completed } = await request.json()
    
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      )
    }
    
    // Check if video exists
    const video = await db.video.findUnique({
      where: { id: parseInt(videoId) }
    })
    
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }
    
    // Update or create watch history
    const history = await db.watchHistory.upsert({
      where: {
        userId_videoId_serialPartId: {
          userId,
          videoId: parseInt(videoId),
          serialPartId: serialPartId ? parseInt(serialPartId) : null
        }
      },
      update: {
        progress: progress || 0,
        duration: duration || undefined,
        completed: completed || false,
        watchedAt: new Date()
      },
      create: {
        userId,
        videoId: parseInt(videoId),
        serialPartId: serialPartId ? parseInt(serialPartId) : null,
        progress: progress || 0,
        duration: duration || undefined,
        completed: completed || false
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailId: true,
            category: true,
            videoSource: true
          }
        },
        serialPart: {
          select: {
            id: true,
            partNumber: true,
            videoFileId: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: history
    })
    
  } catch (error) {
    console.error('Error updating watch history:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Missing session token' },
        { status: 401 }
      )
    }
    
    const userId = await validateSession(sessionToken)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid session token' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const serialPartId = searchParams.get('serialPartId')
    
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      )
    }
    
    // Delete watch history
    await db.watchHistory.deleteMany({
      where: {
        userId,
        videoId: parseInt(videoId),
        serialPartId: serialPartId ? parseInt(serialPartId) : null
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Watch history deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting watch history:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}