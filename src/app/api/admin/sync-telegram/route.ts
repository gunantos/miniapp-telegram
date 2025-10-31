import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createTelegramBotService } from '@/lib/telegram-bot'

// Admin authentication middleware
async function authenticateAdmin(request: NextRequest): Promise<boolean> {
  const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '')
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token'
  
  return adminToken === expectedToken
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
    const { limit = 50, category } = body

    // Initialize Telegram bot service
    const botService = createTelegramBotService()

    // Get videos from Telegram channel
    const telegramVideos = await botService.getChannelVideos(limit, 0)

    let importedCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const telegramVideo of telegramVideos) {
      try {
        // Check if video already exists
        const existingVideo = await db.video.findFirst({
          where: {
            OR: [
              { telegramFileId: telegramVideo.file_id },
              { title: { contains: telegramVideo.file_id.substring(0, 8) } }
            ]
          }
        })

        if (existingVideo) {
          // Update existing video
          await db.video.update({
            where: { id: existingVideo.id },
            data: {
              status: 'PUBLISH',
              updatedAt: new Date()
            }
          })
          updatedCount++
          continue
        }

        // Extract metadata from video
        const metadata = await botService.extractVideoMetadata(telegramVideo)

        // Generate title based on file ID if no caption
        const title = `Video ${telegramVideo.file_id.substring(0, 8)}`
        const description = `Duration: ${metadata.duration}s, Size: ${(metadata.fileSize / 1024 / 1024).toFixed(2)}MB`

        // Determine category based on video characteristics or use provided category
        let videoCategory = category || 'DRAMA_PENDEK'
        if (metadata.duration < 300) { // Less than 5 minutes
          videoCategory = 'DRAMA_PENDEK'
        } else if (metadata.duration > 1800) { // More than 30 minutes
          videoCategory = 'FILM'
        }

        // Create new video record
        await db.video.create({
          data: {
            title,
            description,
            thumbnailId: telegramVideo.thumb?.file_id,
            status: 'PUBLISH',
            category: videoCategory.toUpperCase(),
            videoSource: 'TELEGRAM',
            telegramFileId: telegramVideo.file_id,
            viewCount: 0
          }
        })

        importedCount++
      } catch (error) {
        console.error('Error processing Telegram video:', error)
        skippedCount++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        total: telegramVideos.length
      },
      message: 'Telegram sync completed successfully'
    })

  } catch (error) {
    console.error('Error syncing Telegram videos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync Telegram videos' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!await authenticateAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get sync statistics
    const totalVideos = await db.video.count()
    const telegramVideos = await db.video.count({
      where: { videoSource: 'TELEGRAM' }
    })
    const publishedVideos = await db.video.count({
      where: { status: 'PUBLISH' }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalVideos,
        telegramVideos,
        publishedVideos,
        websiteVideos: totalVideos - telegramVideos,
        draftVideos: totalVideos - publishedVideos
      }
    })

  } catch (error) {
    console.error('Error getting sync statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get sync statistics' },
      { status: 500 }
    )
  }
}