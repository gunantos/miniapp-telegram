"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, X, Smartphone } from "lucide-react"

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== "undefined") {
      const isInStandaloneMode = () =>
        "standalone" in window.navigator && (window.navigator as any).standalone

      setIsInstalled(isInStandaloneMode())

      // Listen for install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowPrompt(true)
      }

      // Listen for app installed
      const handleAppInstalled = () => {
        setIsInstalled(true)
        setShowPrompt(false)
        setDeferredPrompt(null)
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.addEventListener("appinstalled", handleAppInstalled)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setShowPrompt(false)
      
      if (outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
    
    // Don't show again for 7 days
    localStorage.setItem("pwaInstallDismissed", Date.now().toString())
  }

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("pwaInstallDismissed")
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="bg-white/20 p-2 rounded-lg">
                <Smartphone className="h-6 w-6" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">Install StreamApp</h3>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                  New
                </Badge>
              </div>
              
              <p className="text-xs text-white/80 mb-3 line-clamp-2">
                Install StreamApp on your device for faster access and offline viewing
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="bg-white text-purple-600 hover:bg-white/90 text-xs font-medium h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}