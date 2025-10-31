"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, MessageCircle, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  video: {
    id: number
    title: string
    description?: string
    category: string
    thumbnailUrl?: string
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function ShareButton({ 
  video, 
  className = "",
  size = "md"
}: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

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

  // Telegram channel configuration - replace with your actual channel
  const TELEGRAM_CHANNEL = "@your_channel" // Replace with your Telegram channel
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : ""

  const generateShareText = () => {
    const categoryMap: { [key: string]: string } = {
      'DRAMA_PENDEK': 'Drama Pendek',
      'FILM': 'Film',
      'SERIAL': 'Serial TV',
      'KARTUN': 'Kartun/Anime'
    }

    const category = categoryMap[video.category] || video.category
    const url = `${BASE_URL}/?video=${video.id}`
    
    return `🎬 ${video.title}\n\n` +
           `📺 Kategori: ${category}\n` +
           `🔗 Tonton disini: ${url}\n\n` +
           `✨ Dapatkan konten seru lainnya di ${TELEGRAM_CHANNEL}`
  }

  const shareToTelegram = () => {
    const text = generateShareText()
    const encodedText = encodeURIComponent(text)
    const telegramUrl = `https://t.me/share/url?url=&text=${encodedText}`
    
    window.open(telegramUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const shareToChannel = () => {
    const text = generateShareText()
    
    // Create a temporary textarea to copy the text
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    
    toast({
      title: "Teks disalin!",
      description: "Teks sudah disalin, sekarang paste di channel Telegram Anda",
      duration: 3000,
    })
    
    setShowShareMenu(false)
  }

  const copyLink = async () => {
    const url = `${BASE_URL}/?video=${video.id}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      
      toast({
        title: "Link disalin!",
        description: "Link video sudah disalin ke clipboard",
        duration: 2000,
      })
      
      setTimeout(() => setCopied(false), 2000)
      setShowShareMenu(false)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      
      setCopied(true)
      toast({
        title: "Link disalin!",
        description: "Link video sudah disalin ke clipboard",
        duration: 2000,
      })
      
      setTimeout(() => setCopied(false), 2000)
      setShowShareMenu(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className={`
          ${getSizeClasses()}
          rounded-full
          transition-all duration-300
          hover:bg-blue-50 hover:text-blue-500
        `}
        onClick={() => setShowShareMenu(!showShareMenu)}
      >
        <Share2 className={`h-${getIconSize() / 4} w-${getIconSize() / 4}`} />
      </Button>

      {showShareMenu && (
        <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-lg border-0">
          <CardContent className="p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm mb-3">Bagikan ke Telegram</h4>
              
              {/* Share to Telegram */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-sm"
                onClick={shareToTelegram}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share via Telegram
              </Button>
              
              {/* Share to Channel */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-sm"
                onClick={shareToChannel}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Copy Text for Channel
              </Button>
              
              {/* Copy Link */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-sm"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close on outside click */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  )
}