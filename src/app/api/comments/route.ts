import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Get comments with user info
    const comments = await db.comment.findMany({
      where: { videoId: parseInt(videoId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            telegramPhotoUrl: true,
            telegramUsername: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                telegramPhotoUrl: true,
                telegramUsername: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    // Get total count
    const total = await db.comment.count({
      where: { videoId: parseInt(videoId) }
    })

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { videoId, content, parentId } = await request.json()

    if (!videoId || !content) {
      return NextResponse.json(
        { error: "Video ID and content are required" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment content cannot exceed 1000 characters" },
        { status: 400 }
      )
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        userId: session.user.id,
        videoId: parseInt(videoId),
        content: content.trim(),
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            telegramPhotoUrl: true,
            telegramUsername: true
          }
        }
      }
    })

    return NextResponse.json({
      comment,
      message: "Comment posted successfully"
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}