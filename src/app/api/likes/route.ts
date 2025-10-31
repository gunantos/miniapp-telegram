import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      )
    }

    // Get like count for video
    const likesCount = await db.videoLike.count({
      where: { videoId: parseInt(videoId) }
    })

    // Check if current user liked this video
    const session = await getServerSession(authOptions)
    let userLiked = false

    if (session?.user?.id) {
      const userLike = await db.videoLike.findUnique({
        where: {
          userId_videoId: {
            userId: session.user.id,
            videoId: parseInt(videoId)
          }
        }
      })
      userLiked = !!userLike
    }

    return NextResponse.json({
      likesCount,
      userLiked
    })
  } catch (error) {
    console.error("Error fetching likes:", error)
    return NextResponse.json(
      { error: "Failed to fetch likes" },
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

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      )
    }

    // Check if user already liked this video
    const existingLike = await db.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: parseInt(videoId)
        }
      }
    })

    if (existingLike) {
      // Unlike the video
      await db.videoLike.delete({
        where: {
          userId_videoId: {
            userId: session.user.id,
            videoId: parseInt(videoId)
          }
        }
      })

      // Get updated like count
      const likesCount = await db.videoLike.count({
        where: { videoId: parseInt(videoId) }
      })

      return NextResponse.json({
        liked: false,
        likesCount,
        message: "Video unliked successfully"
      })
    } else {
      // Like the video
      await db.videoLike.create({
        data: {
          userId: session.user.id,
          videoId: parseInt(videoId)
        }
      })

      // Get updated like count
      const likesCount = await db.videoLike.count({
        where: { videoId: parseInt(videoId) }
      })

      return NextResponse.json({
        liked: true,
        likesCount,
        message: "Video liked successfully"
      })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    )
  }
}