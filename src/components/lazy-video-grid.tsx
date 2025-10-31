"use client"

import { useState, useEffect, useCallback } from "react"
import LazyVideoCard from "./lazy-video-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface LazyVideoGridProps {
  videos: Array<{
    id: number
    title: string
    description?: string
    thumbnailId?: string
    thumbnailUrl?: string
    status: string
    createdAt: string
    viewCount: number
    category: string
    videoSource: string
    serialParts?: any[]
    progress?: number
    duration?: number
    completed?: boolean
    likes?: number
    isLiked?: boolean
    commentsCount?: number
  }>
  onVideoClick: (video: any) => void
  showProgress?: boolean
  initialLoadCount?: number
  loadMoreCount?: number
  hasNextPage?: boolean
  onLoadMore?: () => void
  loading?: boolean
}

export default function LazyVideoGrid({
  videos,
  onVideoClick,
  showProgress = false,
  initialLoadCount = 12,
  loadMoreCount = 12,
  hasNextPage = false,
  onLoadMore,
  loading = false
}: LazyVideoGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialLoadCount)
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const newObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !loading) {
            onLoadMore?.()
          }
        })
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
      }
    )

    setObserver(newObserver)

    return () => {
      newObserver.disconnect()
    }
  }, [hasNextPage, loading, onLoadMore])

  // Observe load more trigger
  useEffect(() => {
    const trigger = document.getElementById('load-more-trigger')
    if (trigger && observer) {
      observer.observe(trigger)
    }

    return () => {
      if (trigger && observer) {
        observer.unobserve(trigger)
      }
    }
  }, [observer])

  const visibleVideos = videos.slice(0, visibleCount)

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      onLoadMore?.()
    } else {
      // Load more from current array if no pagination
      setVisibleCount(prev => prev + loadMoreCount)
    }
  }, [hasNextPage, loading, onLoadMore, loadMoreCount])

  return (
    <div className="space-y-6">
      {/* Video Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleVideos.map((video) => (
          <LazyVideoCard
            key={video.id}
            video={video}
            onClick={() => onVideoClick(video)}
            showProgress={showProgress}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div id="load-more-trigger" className="flex justify-center py-4">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more videos...</span>
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < videos.length && !hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="min-w-[120px]"
          >
            Load More
          </Button>
        </div>
      )}

      {/* No more videos */}
      {visibleCount >= videos.length && !hasNextPage && videos.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end</p>
        </div>
      )}
    </div>
  )
}