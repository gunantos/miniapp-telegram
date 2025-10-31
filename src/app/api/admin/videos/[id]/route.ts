import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin authentication middleware
async function authenticateAdmin(request: NextRequest): Promise<boolean> {
  const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '')
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token'
  
  return adminToken === expectedToken
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await authenticateAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const videoId = parseInt(params.id)
    
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        serialParts: {
          orderBy: { partNumber: 'asc' }
        },
        _count: {
          select: {
            serialParts: true,
            videoLikes: true,
            comments: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: video
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await authenticateAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const videoId = parseInt(params.id)
    const body = await request.json()
    const {
      title,
      description,
      thumbnailUrl,
      category,
      videoSource,
      videoUrl,
      telegramFileId,
      status,
      isActive
    } = body

    // Check if video exists
    const existingVideo = await db.video.findUnique({
      where: { id: videoId }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    // Update video
    const updatedVideo = await db.video.update({
      where: { id: videoId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(category && { category: category.toUpperCase() }),
        ...(videoSource && { videoSource }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(telegramFileId !== undefined && { telegramFileId }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        serialParts: {
          orderBy: { partNumber: 'asc' }
        },
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
      data: updatedVideo
    })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await authenticateAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const videoId = parseInt(params.id)

    // Check if video exists
    const existingVideo = await db.video.findUnique({
      where: { id: videoId }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    // Delete video (cascade will handle related records)
    await db.video.delete({
      where: { id: videoId }
    })

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}