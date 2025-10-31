import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Telegram Bot Token - should be in environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_bot?: boolean
  photo_url?: string
}

interface TelegramInitData {
  query_id?: string
  user: TelegramUser
  auth_date: number
  hash: string
}

function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    // Parse the init data
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    
    if (!hash) {
      return false
    }
    
    // Remove hash from the data
    params.delete('hash')
    
    // Create data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')
    
    return calculatedHash === hash
  } catch (error) {
    console.error('Error validating Telegram init data:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json()
    
    if (!initData) {
      return NextResponse.json(
        { success: false, error: 'Missing init data' },
        { status: 400 }
      )
    }
    
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Telegram bot token not configured' },
        { status: 500 }
      )
    }
    
    // Validate the init data
    const isValid = validateTelegramInitData(initData, BOT_TOKEN)
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram init data' },
        { status: 401 }
      )
    }
    
    // Parse user data from init data
    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    
    if (!userStr) {
      return NextResponse.json(
        { success: false, error: 'User data not found in init data' },
        { status: 400 }
      )
    }
    
    const userData: TelegramUser = JSON.parse(userStr)
    
    // Find or create user
    let user = await db.user.findFirst({
      where: {
        OR: [
          { telegramId: userData.id },
          { email: userData.username ? `${userData.username}@telegram.user` : null }
        ]
      },
      include: {
        preferences: true
      }
    })
    
    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          telegramId: userData.id,
          telegramUsername: userData.username,
          telegramFirstName: userData.first_name,
          telegramLastName: userData.last_name,
          telegramIsBot: userData.is_bot || false,
          telegramLanguageCode: userData.language_code,
          telegramPhotoUrl: userData.photo_url,
          email: userData.username ? `${userData.username}@telegram.user` : null,
          name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
          preferences: {
            create: {
              theme: 'light',
              language: userData.language_code || 'id',
              quality: 'auto',
              autoplay: true,
              notifications: true
            }
          }
        },
        include: {
          preferences: true
        }
      })
    } else {
      // Update existing user data
      user = await db.user.update({
        where: { id: user.id },
        data: {
          telegramUsername: userData.username,
          telegramFirstName: userData.first_name,
          telegramLastName: userData.last_name,
          telegramIsBot: userData.is_bot || false,
          telegramLanguageCode: userData.language_code,
          telegramPhotoUrl: userData.photo_url,
          name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
          updatedAt: new Date()
        },
        include: {
          preferences: true
        }
      })
    }
    
    // Create session token (simple implementation)
    const sessionToken = crypto.randomBytes(32).toString('hex')
    
    // Store session token (in real app, use Redis or database)
    // For now, we'll return it and use it for subsequent requests
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          telegramId: user.telegramId,
          telegramUsername: user.telegramUsername,
          telegramPhotoUrl: user.telegramPhotoUrl,
          preferences: user.preferences
        },
        sessionToken
      }
    })
    
  } catch (error) {
    console.error('Error in Telegram auth:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
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
    
    // In real app, validate session token and get user
    // For now, we'll return a simple response
    return NextResponse.json({
      success: true,
      message: 'Session validation endpoint'
    })
    
  } catch (error) {
    console.error('Error validating session:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}