import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No session token provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferences data is required' },
        { status: 400 }
      )
    }

    // Find user by session token (in a real app, you'd have a sessions table)
    // For now, we'll use a simple approach with the user's ID from the token
    const userId = sessionToken.split('_')[0] // Simple extraction for demo

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update or create user preferences
    const updatedPreferences = await db.userPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedPreferences
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No session token provided' },
        { status: 401 }
      )
    }

    // Find user by session token
    const userId = sessionToken.split('_')[0] // Simple extraction for demo

    const preferences = await db.userPreference.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      data: preferences || {
        theme: 'light',
        language: 'id',
        quality: 'auto',
        autoplay: true,
        notifications: true
      }
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}