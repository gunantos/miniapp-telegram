"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, HeartCrack } from "lucide-react"
import { useLikes } from "@/hooks/use-likes"
import { useAuth } from "@/hooks/use-auth"

interface LikeButtonProps {
  videoId: number
  className?: string
  size?: "sm" | "md" | "lg"
  showCount?: boolean
}

export default function LikeButton({ 
  videoId, 
  className = "",
  size = "md",
  showCount = true 
}: LikeButtonProps) {
  const { user } = useAuth()
  const { likesCount, userLiked, loading, toggleLike } = useLikes(videoId)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = async () => {
    if (!user) {
      // You could show a login modal here
      return
    }

    setIsAnimating(true)
    await toggleLike()
    
    // Add animation effect
    setTimeout(() => setIsAnimating(false), 300)
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8 text-sm"
      case "lg":
        return "h-12 w-12 text-lg"
      default:
        return "h-10 w-10 text-base"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 16
      case "lg":
        return 24
      default:
        return 20
    }
  }

  const formatLikeCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={userLiked ? "default" : "outline"}
        size="sm"
        className={`
          ${getSizeClasses()}
          rounded-full
          transition-all duration-300
          ${userLiked ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-red-50 hover:text-red-500"}
          ${isAnimating ? "scale-110" : ""}
          ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={handleLike}
        disabled={loading}
      >
        {userLiked ? (
          <Heart 
            className={`h-${getIconSize() / 4} w-${getIconSize() / 4} fill-current`}
            fill="currentColor"
          />
        ) : (
          <Heart className={`h-${getIconSize() / 4} w-${getIconSize() / 4}`} />
        )}
      </Button>
      
      {showCount && (
        <span className={`text-sm font-medium ${userLiked ? "text-red-500" : "text-muted-foreground"}`}>
          {formatLikeCount(likesCount)}
        </span>
      )}
    </div>
  )
}