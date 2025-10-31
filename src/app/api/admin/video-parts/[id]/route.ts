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
    
    const videoParts = await db.serialPart.findMany({
      where: { serialId: videoId },
      orderBy: { partNumber: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: videoParts
    })
  } catch (error) {
    console.error('Error fetching video parts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video parts' },
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

    const partId = parseInt(params.id)
    const { thumbnailUrl, title } = await request.json()

    const updatedPart = await db.serialPart.update({
      where: { id: partId },
      data: {
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(title && { title })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedPart
    })
  } catch (error) {
    console.error('Error updating video part:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update video part' },
      { status: 500 }
    )
  }
}