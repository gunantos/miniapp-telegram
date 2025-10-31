"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react"

interface VideoQualitySelectorProps {
  videoUrl: string
  onQualityChange: (quality: VideoQuality) => void
  currentQuality?: VideoQuality
  availableQualities?: VideoQuality[]
}

export interface VideoQuality {
  id: string
  label: string
  url: string
  width: number
  height: number
  bitrate: number
  size: string
  isAdaptive?: boolean
}

const defaultQualities: VideoQuality[] = [
  {
    id: 'auto',
    label: 'Auto (Adaptive)',
    url: '',
    width: 0,
    height: 0,
    bitrate: 0,
    size: 'Auto',
    isAdaptive: true
  },
  {
    id: '1080p',
    label: '1080p HD',
    url: '',
    width: 1920,
    height: 1080,
    bitrate: 5000,
    size: 'High'
  },
  {
    id: '720p',
    label: '720p HD',
    url: '',
    width: 1280,
    height: 720,
    bitrate: 2500,
    size: 'Medium'
  },
  {
    id: '480p',
    label: '480p SD',
    url: '',
    width: 854,
    height: 480,
    bitrate: 1000,
    size: 'Low'
  },
  {
    id: '360p',
    label: '360p SD',
    url: '',
    width: 640,
    height: 360,
    bitrate: 500,
    size: 'Very Low'
  }
]

export default function VideoQualitySelector({
  videoUrl,
  onQualityChange,
  currentQuality,
  availableQualities = defaultQualities
}: VideoQualitySelectorProps) {
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(currentQuality || availableQualities[0])
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string
    downlink?: number
    rtt?: number
    online: boolean
  }>({ online: true })
  const [isAuto, setIsAuto] = useState(true)

  // Detect network connection
  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          online: navigator.onLine
        })
      } else {
        setNetworkInfo({
          online: navigator.onLine
        })
      }
    }

    updateNetworkInfo()
    
    // Listen for network changes
    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  // Auto quality selection based on network and device
  const getAutoQuality = (): VideoQuality => {
    if (!networkInfo.online) {
      return availableQualities.find(q => q.id === '360p') || availableQualities[3]
    }

    const connection = networkInfo
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    // Based on network conditions
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return availableQualities.find(q => q.id === '360p') || availableQualities[3]
    }

    if (connection.effectiveType === '3g') {
      return availableQualities.find(q => q.id === '480p') || availableQualities[2]
    }

    if (connection.effectiveType === '4g') {
      // For 4G, consider screen resolution
      if (screenWidth >= 1920 && screenHeight >= 1080) {
        return availableQualities.find(q => q.id === '1080p') || availableQualities[1]
      }
      return availableQualities.find(q => q.id === '720p') || availableQualities[2]
    }

    // Default to 720p for unknown conditions
    return availableQualities.find(q => q.id === '720p') || availableQualities[2]
  }

  // Auto quality adjustment
  useEffect(() => {
    if (isAuto) {
      const autoQuality = getAutoQuality()
      setSelectedQuality(autoQuality)
      onQualityChange(autoQuality)
    }
  }, [networkInfo, isAuto, onQualityChange])

  const handleQualityChange = (qualityId: string) => {
    const quality = availableQualities.find(q => q.id === qualityId)
    if (quality) {
      setIsAuto(qualityId === 'auto')
      setSelectedQuality(quality)
      onQualityChange(quality)
    }
  }

  const getNetworkIcon = () => {
    if (!networkInfo.online) {
      return <WifiOff className="h-4 w-4 text-red-500" />
    }

    if (!networkInfo.effectiveType) {
      return <Wifi className="h-4 w-4 text-green-500" />
    }

    switch (networkInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return <SignalLow className="h-4 w-4 text-red-500" />
      case '3g':
        return <SignalMedium className="h-4 w-4 text-yellow-500" />
      case '4g':
        return <SignalHigh className="h-4 w-4 text-green-500" />
      default:
        return <Signal className="h-4 w-4 text-green-500" />
    }
  }

  const getNetworkText = () => {
    if (!networkInfo.online) {
      return 'Offline'
    }

    if (!networkInfo.effectiveType) {
      return 'Unknown'
    }

    return networkInfo.effectiveType.toUpperCase()
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg backdrop-blur-sm">
      {/* Network Status */}
      <div className="flex items-center gap-1 text-xs text-white/80">
        {getNetworkIcon()}
        <span>{getNetworkText()}</span>
        {networkInfo.downlink && (
          <span className="text-white/60">({networkInfo.downlink}Mbps)</span>
        )}
      </div>

      {/* Quality Selector */}
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-white/60" />
        <Select value={selectedQuality.id} onValueChange={handleQualityChange}>
          <SelectTrigger className="w-32 h-7 text-xs bg-black/40 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/20">
            {availableQualities.map((quality) => (
              <SelectItem
                key={quality.id}
                value={quality.id}
                className="text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <span>{quality.label}</span>
                  {quality.isAdaptive && isAuto && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300">
                      Auto
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Quality Info */}
      {selectedQuality && !selectedQuality.isAdaptive && (
        <div className="text-xs text-white/60">
          {selectedQuality.width}x{selectedQuality.height}
        </div>
      )}
    </div>
  )
}