"use client"

import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { X } from "lucide-react"

export default function ToastProvider() {
  const { toasts, dismiss } = useToast()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toasts.forEach((toast) => dismiss(toast.id))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toasts, dismiss])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md animate-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {toast.title && (
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {toast.title}
                </h4>
              )}
              {toast.description && (
                <p className="text-sm text-gray-600">{toast.description}</p>
              )}
              {toast.action && (
                <div className="mt-2">{toast.action}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}