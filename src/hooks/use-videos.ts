'use client'

import { useState, useEffect } from 'react'

interface Video {
  id: number
  title: string
  description?: string
  thumbnailId?: string
  thumbnailUrl?: string
  status: string
  createdAt: string
  updatedAt: string
  viewCount: number
  category: string
  videoSource: string
  videoUrl?: string
  telegramFileId?: string
  isActive?: boolean
  lastChecked?: string
  serialParts?: SerialPart[]
  likes?: number
  isLiked?: boolean
  commentsCount?: number
}

interface SerialPart {
  id: number
  serialId: number
  videoFileId: string
  partNumber: number
  title?: string
  thumbnailUrl?: string
  seasonNumber?: number
  episodeNumber?: number
  createdAt: string
  viewCount: number
}

interface ApiResponse {
  success: boolean
  data: Video[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useVideos(
  category: string = 'ALL',
  search: string = '',
  sortBy: string = 'latest',
  page: number = 1,
  limit: number = 12
) {
  const [data, setData] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          category,
          search,
          sortBy,
          page: page.toString(),
          limit: limit.toString()
        })

        const response = await fetch(`/api/videos?${params}`)
        const result: ApiResponse = await response.json()

        if (result.success) {
          setData(result.data)
          setPagination(result.pagination)
        } else {
          setError(result.error || 'Failed to fetch videos')
        }
      } catch (err) {
        setError('Network error')
        console.error('Error fetching videos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [category, search, sortBy, page, limit])

  return {
    videos: data,
    loading,
    error,
    pagination,
    refetch: () => {
      // Trigger refetch by updating state
      setLoading(true)
    },
    hasNextPage: pagination ? page < pagination.totalPages : false,
    hasPreviousPage: page > 1,
    totalPages: pagination ? pagination.totalPages : 1,
    currentPage: page,
    totalItems: pagination ? pagination.total : 0
  }
}

export function useVideo(id: number) {
  const [data, setData] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/videos/${id}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch video')
        }
      } catch (err) {
        setError('Network error')
        console.error('Error fetching video:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [id])

  return {
    video: data,
    loading,
    error
  }
}