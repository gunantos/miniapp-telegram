import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Telegram Bot Token - should be in environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const partId = searchParams.get('part') // For serial videos

    if (isNaN(videoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID' },
        { status: 400 }
      )
    }

    // Get video from database
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        serialParts: partId ? {
          where: { id: parseInt(partId) }
        } : true
      }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    // Determine the file ID to stream
    let fileId: string | null = null
    let fileName: string = ''

    if (video.category === 'SERIAL' && video.serialParts && video.serialParts.length > 0) {
      // For serial videos, use the specific part
      const targetPart = partId 
        ? video.serialParts.find(p => p.id === parseInt(partId))
        : video.serialParts[0] // Default to first part
      
      if (!targetPart) {
        return NextResponse.json(
          { success: false, error: 'Serial part not found' },
          { status: 404 }
        )
      }
      
      fileId = targetPart.videoFileId
      fileName = `${video.title} - Part ${targetPart.partNumber}`
    } else {
      // For regular videos
      fileId = video.telegramFileId
      fileName = video.title
    }

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'No file ID available for this video' },
        { status: 404 }
      )
    }

    // If we have a direct video URL, redirect to it
    if (video.videoUrl && video.videoSource === 'WEBSITE') {
      return NextResponse.redirect(video.videoUrl)
    }

    // For Telegram files, we need to get the file path from Telegram API
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Telegram bot token not configured' },
        { status: 500 }
      )
    }

    // Get file path from Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    )

    if (!telegramResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get file info from Telegram' },
        { status: 500 }
      )
    }

    const telegramData = await telegramResponse.json()
    
    if (!telegramData.ok || !telegramData.result) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from Telegram API' },
        { status: 500 }
      )
    }

    const filePath = telegramData.result.file_path
    
    // Construct the direct URL to the Telegram file
    const telegramFileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`

    // Stream the file from Telegram
    const fileResponse = await fetch(telegramFileUrl)
    
    if (!fileResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch file from Telegram' },
        { status: 500 }
      )
    }

    // Get file content type and size
    const contentType = fileResponse.headers.get('content-type') || 'video/mp4'
    const contentLength = fileResponse.headers.get('content-length')

    // Create response headers for streaming
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}.mp4"`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    })

    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }

    // Handle range requests for video streaming
    const range = request.headers.get('range')
    
    if (range) {
      const bytesPrefix = 'bytes='
      if (!range.startsWith(bytesPrefix)) {
        return new NextResponse('Invalid range header', { status: 400 })
      }

      const bytesRange = range.substring(bytesPrefix.length)
      const [startStr, endStr] = bytesRange.split('-')
      
      if (!startStr) {
        return new NextResponse('Invalid range header', { status: 400 })
      }

      const start = parseInt(startStr, 10)
      const end = endStr ? parseInt(endStr, 10) : (contentLength ? parseInt(contentLength, 10) - 1 : Infinity)
      
      if (isNaN(start) || isNaN(end) || start > end) {
        return new NextResponse('Invalid range header', { status: 400 })
      }

      headers.set('Content-Range', `bytes ${start}-${end}/${contentLength || '*'}`)
      headers.set('Content-Length', (end - start + 1).toString())

      // Get the file data for the specific range
      const fileBuffer = await fileResponse.arrayBuffer()
      const slicedBuffer = fileBuffer.slice(start, end + 1)

      return new NextResponse(slicedBuffer, {
        status: 206,
        headers,
      })
    }

    // If no range header, stream the entire file
    const fileBuffer = await fileResponse.arrayBuffer()
    
    return new NextResponse(fileBuffer, {
      headers,
    })

  } catch (error) {
    console.error('Error streaming video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to stream video' },
      { status: 500 }
    )
  }
}