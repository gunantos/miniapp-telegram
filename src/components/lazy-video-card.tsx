"use client"

import { useState, useRef, useEffect } from "react"
import VideoCard from "./video-card"

interface LazyVideoCardProps {
  video: {
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
  }
  onClick: () => void
  showProgress?: boolean
  placeholder?: React.ReactNode
}

export default function LazyVideoCard({ 
  video, 
  onClick, 
  showProgress = false,
  placeholder 
}: LazyVideoCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        root: null,
        rootMargin: '50px', // Start loading 50px before element comes into view
        threshold: 0.1
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Default placeholder skeleton
  const defaultPlaceholder = (
    <div className="cursor-pointer overflow-hidden border-0 shadow-sm">
      <div className="relative aspect-video bg-muted">
        <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 animate-pulse" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted animate-pulse rounded w-16" />
          <div className="h-3 bg-muted animate-pulse rounded w-12" />
        </div>
        <div className="h-3 bg-muted animate-pulse rounded w-20" />
      </div>
    </div>
  )

  return (
    <div ref={cardRef}>
      {isVisible ? (
        <VideoCard
          video={video}
          onClick={onClick}
          showProgress={showProgress}
        />
      ) : (
        placeholder || defaultPlaceholder
      )}
    </div>
  )
}