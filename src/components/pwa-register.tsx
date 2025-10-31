"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })

      // Handle updates
      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })

      // Check for updates
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update()
          }
        })
      }

      // Check for updates every 30 minutes
      const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000)

      // Cleanup
      return () => {
        clearInterval(updateInterval)
      }
    }
  }, [])

  return null
}