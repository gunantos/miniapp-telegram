"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { AdminLogoutButton } from "@/components/admin-logout-button"
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Film, 
  Tv, 
  Edit,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"

interface VideoPart {
  id: number
  serialId: number
  videoFileId: string
  partNumber: number
  title?: string
  thumbnailUrl?: string
  seasonNumber?: number
  episodeNumber?: number
  createdAt: string
  viewCount: number
}

interface Video {
  id: number
  title: string
  category: string
  thumbnailUrl?: string
}

function VideoPartsManager() {
  const params = useParams()
  const router = useRouter()
  const videoId = parseInt(params.id as string)
  
  const [video, setVideo] = useState<Video | null>(null)
  const [parts, setParts] = useState<VideoPart[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [editingPart, setEditingPart] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ thumbnailUrl: string; title: string }>({ thumbnailUrl: '', title: '' })
  const [error, setError] = useState<string | null>(null)

  const fetchVideoParts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch video details
      const videoResponse = await fetch(`/api/videos/${videoId}`)
      const videoResult = await videoResponse.json()
      
      if (videoResult.success) {
        setVideo(videoResult.data)
      }

      // Fetch video parts
      const partsResponse = await fetch(`/api/admin/video-parts/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`
        }
      })
      
      const partsResult = await partsResponse.json()
      
      if (partsResult.success) {
        setParts(partsResult.data)
      } else {
        setError(partsResult.error || 'Failed to fetch video parts')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error fetching video parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPart = (part: VideoPart) => {
    setEditingPart(part.id)
    setEditForm({
      thumbnailUrl: part.thumbnailUrl || '',
      title: part.title || ''
    })
  }

  const handleSavePart = async (partId: number) => {
    try {
      setSaving(partId)
      
      const response = await fetch(`/api/admin/video-parts/${partId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setParts(prev => prev.map(part => 
          part.id === partId 
            ? { ...part, ...editForm }
            : part
        ))
        setEditingPart(null)
        setEditForm({ thumbnailUrl: '', title: '' })
      } else {
        setError(result.error || 'Failed to update video part')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error updating video part:', error)
    } finally {
      setSaving(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingPart(null)
    setEditForm({ thumbnailUrl: '', title: '' })
  }

  useEffect(() => {
    if (videoId) {
      fetchVideoParts()
    }
  }, [videoId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FILM': return <Film className="h-4 w-4" />
      case 'SERIAL': return <Tv className="h-4 w-4" />
      default: return <Film className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Manage Video Parts</h1>
            <p className="text-muted-foreground">
              {video ? `Edit parts for: ${video.title}` : 'Loading video details...'}
            </p>
          </div>
        </div>
        
        <AdminLogoutButton />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {video && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(video.category)}
              {video.title}
            </CardTitle>
            <CardDescription>
              {getCategoryLabel(video.category)} • {parts.length} parts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {video.thumbnailUrl && (
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Badge variant="outline">
                  {getCategoryLabel(video.category)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading video parts...</p>
        </div>
      ) : parts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No video parts found</h3>
            <p className="text-muted-foreground">
              This video doesn't have any parts yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parts.map((part) => (
            <Card key={part.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {part.thumbnailUrl ? (
                      <img 
                        src={part.thumbnailUrl} 
                        alt={part.title || `Part ${part.partNumber}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Part Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {editingPart === part.id ? (
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter title..."
                            className="w-64"
                          />
                        ) : (
                          part.title || `Part ${part.partNumber}`
                        )}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Part {part.partNumber}
                        </Badge>
                        {part.seasonNumber && (
                          <Badge variant="secondary">
                            Season {part.seasonNumber}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {editingPart === part.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Thumbnail URL</label>
                          <Input
                            value={editForm.thumbnailUrl}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                            placeholder="Enter thumbnail URL..."
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleSavePart(part.id)}
                            disabled={saving === part.id}
                            size="sm"
                          >
                            {saving === part.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <div>Views: {formatViewCount(part.viewCount)}</div>
                          <div>Created: {formatDate(part.createdAt)}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEditPart(part)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VideoPartsPage() {
  return (
    <AdminAuthProvider>
      <VideoPartsManager />
    </AdminAuthProvider>
  )
}