"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Eye, 
  Calendar,
  Maximize,
  Minimize,
  RotateCcw,
  Settings
} from "lucide-react"
import { useWatchHistory } from "@/hooks/use-auth"
import VideoQualitySelector, { VideoQuality } from "./video-quality-selector"
import LikeButton from "./like-button"
import ShareButton from "./share-button"
import CommentSection from "./comment-section"

interface VideoPlayerProps {
  video: {
    id: number
    title: string
    description?: string
    thumbnailId?: string
    status: string
    createdAt: string
    viewCount: number
    category: string
    videoSource: string
    videoUrl?: string
    telegramFileId?: string
    serialParts?: any[]
  }
  onClose: () => void
  isOpen: boolean
}

export default function VideoPlayer({ video, onClose, isOpen }: VideoPlayerProps) {
  const [currentPart, setCurrentPart] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [videoOrientation, setVideoOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "comments">("info")
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const progressUpdateRef = useRef<NodeJS.Timeout>()
  
  const { addToHistory } = useWatchHistory()

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

  const handlePartChange = (partIndex: string) => {
    setCurrentPart(parseInt(partIndex))
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      
      // Update watch history progress (throttled)
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current)
      }
      
      progressUpdateRef.current = setTimeout(() => {
        updateWatchProgress()
      }, 2000) // Update every 2 seconds
    }
  }

  const updateWatchProgress = async () => {
    if (videoRef.current && duration > 0) {
      const progress = videoRef.current.currentTime
      const completed = progress >= duration * 0.95 // Consider completed if watched 95%
      
      const serialPartId = video.serialParts && video.serialParts[currentPart] 
        ? video.serialParts[currentPart].id 
        : undefined
      
      await addToHistory(
        video.id,
        serialPartId,
        progress,
        duration,
        completed
      )
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      // Detect video orientation
      const videoWidth = videoRef.current.videoWidth
      const videoHeight = videoRef.current.videoHeight
      setVideoOrientation(videoHeight > videoWidth ? 'portrait' : 'landscape')
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const handleQualityChange = (quality: VideoQuality) => {
    setCurrentQuality(quality)
    // In a real implementation, you would change the video source here
    // For now, we'll just update the state
    console.log('Quality changed to:', quality.label)
  }

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleVideoClick = () => {
    togglePlayPause()
    showControlsTemporarily()
  }

  const handleMouseMove = () => {
    showControlsTemporarily()
  }

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Reset state when video changes
  useEffect(() => {
    setCurrentPart(0)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setShowControls(true)
  }, [video])

  // Auto-hide controls when playing
  useEffect(() => {
    if (isPlaying) {
      showControlsTemporarily()
    } else {
      setShowControls(true)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  // Cleanup progress updates on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current)
      }
    }
  }, [])

  // Final progress update when video ends
  useEffect(() => {
    if (!isPlaying && currentTime > 0 && duration > 0) {
      updateWatchProgress()
    }
  }, [isPlaying, currentTime, duration])

  // Generate streaming URL based on video source
  const getStreamingUrl = () => {
    if (video.videoUrl) {
      return video.videoUrl
    }
    
    // For Drama Pendek from Telegram, use our streaming API
    if (video.category === 'DRAMA_PENDEK' && video.telegramFileId) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const serialPartId = video.serialParts && video.serialParts[currentPart] 
        ? video.serialParts[currentPart].id 
        : null
      
      const streamingUrl = `${baseUrl}/api/stream/${video.id}${serialPartId ? `?part=${serialPartId}` : ''}`
      return streamingUrl
    }
    
    // Fallback for other categories
    return video.videoUrl || ''
  }

  const currentVideoUrl = getStreamingUrl()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-screen p-0 m-0 bg-black border-0 rounded-none">
        <div 
          ref={containerRef}
          className="relative w-full h-screen flex flex-col"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Player Area */}
          <div className={`flex-1 relative bg-black ${videoOrientation === 'portrait' ? 'max-w-md mx-auto' : ''}`}>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={currentVideoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={handleVideoClick}
              onEnded={() => setIsPlaying(false)}
              playbackRate={playbackSpeed}
            />
            
            {/* Video Controls Overlay */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/60 text-white">
                      {getCategoryLabel(video.category)}
                    </Badge>
                    {videoOrientation === 'portrait' && (
                      <Badge variant="outline" className="border-white/50 text-white">
                        Portrait
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Center Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:text-white hover:bg-white/20 h-20 w-20 rounded-full"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-12 w-12" />
                  ) : (
                    <Play className="h-12 w-12 ml-1" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-white mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    
                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:text-white hover:bg-white/20"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info & Parts List - Only show in landscape mode or when not fullscreen */}
          {(videoOrientation === 'landscape' || !isFullscreen) && (
            <div className="w-full bg-background border-t max-h-96 overflow-y-auto">
              <div className="p-4 pt-2">
                {/* Quality and Speed Controls */}
                <div className="mb-3 flex items-center justify-between px-2 py-2 bg-muted/30 rounded-lg border">
                  {/* Video Quality Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Kualitas</span>
                    <div className="scale-75 origin-left">
                      <VideoQualitySelector
                        videoUrl={currentVideoUrl}
                        onQualityChange={handleQualityChange}
                        currentQuality={currentQuality}
                      />
                    </div>
                  </div>

                  <div className="h-4 w-px bg-border" />

                  {/* Playback Speed Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Kecepatan</span>
                    <Select value={playbackSpeed.toString()} onValueChange={(value) => handlePlaybackSpeedChange(parseFloat(value))}>
                      <SelectTrigger className="w-12 h-7 text-xs bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogHeader className="pb-3 pt-1">
                  <DialogTitle className="text-lg leading-tight">{video.title}</DialogTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(video.category)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {video.videoSource === 'TELEGRAM' ? 'Telegram' : 'Website'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatViewCount(video.viewCount)} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LikeButton 
                        videoId={video.id}
                        size="sm"
                        showCount={true}
                      />
                      <ShareButton 
                        video={video}
                        size="sm"
                      />
                    </div>
                  </div>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </DialogHeader>

                {/* Parts Selection */}
                {video.serialParts && video.serialParts.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-3">Episode</h3>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {video.serialParts.map((part: any, index: number) => (
                        <Button
                          key={part.id}
                          variant={currentPart === index ? "default" : "outline"}
                          size="sm"
                          className={`min-w-[36px] h-[36px] p-0 text-xs ${
                            currentPart === index 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handlePartChange(index.toString())}
                        >
                          {part.partNumber}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}