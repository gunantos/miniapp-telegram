"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar } from "lucide-react"
import OptimizedImage from "./optimized-image"
import LikeButton from "./like-button"
import ShareButton from "./share-button"

interface VideoCardProps {
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
}

export default function VideoCard({ video, onClick, showProgress = false }: VideoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'DRAMA_PENDEK': return 'Drama Pendek'
      case 'FILM': return 'Film'
      case 'SERIAL': return 'Serial TV'
      case 'KARTUN': return 'Kartun/Anime'
      default: return category
    }
  }

  return (
    <Card 
      className="cursor-pointer group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted">
        {/* Optimized Thumbnail */}
        <OptimizedImage
          src={video.thumbnailUrl}
          alt={video.title}
          width={320}
          height={180}
          className="w-full h-full object-cover"
          videoTitle={video.title}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white/90 rounded-full p-2">
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-black ml-0.5"></div>
          </div>
        </div>

        {/* Progress bar untuk watch history */}
        {showProgress && video.progress !== undefined && video.duration && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className={`h-full ${video.completed ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${(video.progress / video.duration) * 100}%` }}
            />
          </div>
        )}

        {/* Completed indicator */}
        {showProgress && video.completed && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="text-xs bg-green-500">
              ✓ Selesai
            </Badge>
          </div>
        )}

        {/* Part indicator untuk serial */}
        {video.serialParts && video.serialParts.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-xs bg-black/60 text-white">
              {video.serialParts.length} Part
              {video.serialParts.some(part => part.seasonNumber && part.seasonNumber > 1) && 
                ` • ${Math.max(...video.serialParts.map(part => part.seasonNumber || 1))} Season`
              }
            </Badge>
          </div>
        )}

        {/* Likes indicator */}
        {video.likes !== undefined && video.likes > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="text-xs bg-black/60 text-white border-white/20">
              ❤️ {video.likes}
            </Badge>
          </div>
        )}

        {/* Comments indicator */}
        {video.commentsCount !== undefined && video.commentsCount > 0 && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="text-xs bg-black/60 text-white border-white/20">
              💬 {video.commentsCount}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {video.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(video.category)}
            </Badge>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{formatViewCount(video.viewCount)}</span>
            </div>
          </div>

          {/* Serial parts info */}
          {video.serialParts && video.serialParts.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>• {video.serialParts.length} episode</span>
                {video.serialParts.some(part => part.seasonNumber && part.seasonNumber > 1) && (
                  <span>• {Math.max(...video.serialParts.map(part => part.seasonNumber || 1))} season</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total views: {formatViewCount(video.serialParts.reduce((sum, part) => sum + part.viewCount, 0))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(video.createdAt)}</span>
          </div>

          {/* Like and Share Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <LikeButton 
                videoId={video.id}
                size="sm"
                showCount={false}
              />
              <ShareButton 
                video={video}
                size="sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}