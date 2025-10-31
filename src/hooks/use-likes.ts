"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

interface LikeData {
  likesCount: number
  userLiked: boolean
}

export function useLikes(videoId: number) {
  const [likesData, setLikesData] = useState<LikeData>({
    likesCount: 0,
    userLiked: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchLikes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/likes?videoId=${videoId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch likes")
      }
      
      const data = await response.json()
      setLikesData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async () => {
    if (!user) {
      setError("Please login to like videos")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ videoId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to toggle like")
      }
      
      const data = await response.json()
      setLikesData({
        likesCount: data.likesCount,
        userLiked: data.liked
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (videoId) {
      fetchLikes()
    }
  }, [videoId])

  return {
    likesCount: likesData.likesCount,
    userLiked: likesData.userLiked,
    loading,
    error,
    toggleLike,
    refetch: fetchLikes
  }
}