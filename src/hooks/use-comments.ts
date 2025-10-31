"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

export interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    telegramPhotoUrl?: string
    telegramUsername?: string
  }
  replies?: Comment[]
}

interface CommentsResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useComments(videoId: number) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const { user } = useAuth()

  const fetchComments = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/comments?videoId=${videoId}&page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }
      
      const data: CommentsResponse = await response.json()
      setComments(data.comments)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const postComment = async (content: string, parentId?: string) => {
    if (!user) {
      setError("Please login to comment")
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ videoId, content, parentId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to post comment")
      }
      
      const data = await response.json()
      
      // Refresh comments to include the new one
      await fetchComments(pagination.page, pagination.limit)
      
      return data.comment
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchComments(pagination.page + 1, pagination.limit)
    }
  }

  useEffect(() => {
    if (videoId) {
      fetchComments()
    }
  }, [videoId])

  return {
    comments,
    loading,
    error,
    pagination,
    postComment,
    loadMore,
    refetch: () => fetchComments(pagination.page, pagination.limit)
  }
}