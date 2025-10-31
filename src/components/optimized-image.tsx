"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src?: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  fallback?: React.ReactNode
  videoTitle?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  placeholder = "blur",
  blurDataURL,
  fallback,
  videoTitle
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Generate placeholder based on video title if no image source
  const generatePlaceholder = () => {
    if (!videoTitle) return null
    
    // Generate consistent color based on title
    const colors = [
      "from-purple-500/20 to-blue-600/20",
      "from-emerald-500/20 to-cyan-600/20", 
      "from-rose-500/20 to-pink-600/20",
      "from-amber-500/20 to-orange-600/20",
      "from-indigo-500/20 to-purple-600/20"
    ]
    
    const colorIndex = videoTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-3xl mb-2">🎬</div>
          <div className="text-xs text-white/80 font-medium px-2 py-1 bg-black/30 rounded">
            {videoTitle.length > 20 ? videoTitle.substring(0, 20) + '...' : videoTitle}
          </div>
        </div>
      </div>
    )
  }

  // Default blur data URL
  const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  if (!src || imgError) {
    return fallback || generatePlaceholder() || (
      <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1">🎬</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`
          transition-all duration-300 ease-in-out
          ${isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'}
          hover:scale-105
        `}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onError={() => setImgError(true)}
        onLoadingComplete={() => setIsLoading(false)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}