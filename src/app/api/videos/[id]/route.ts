import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)

    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        serialParts: {
          orderBy: { partNumber: 'asc' }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await db.video.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } }
    })

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