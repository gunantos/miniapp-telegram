"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { AdminLogoutButton } from "@/components/admin-logout-button"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Film,
  Tv,
  Users
} from "lucide-react"

interface Video {
  id: number
  title: string
  description?: string
  thumbnailUrl?: string
  status: string
  category: string
  videoSource: string
  videoUrl?: string
  telegramFileId?: string
  isActive: boolean
  serialParts: any[]
  _count: {
    serialParts: number
    videoLikes: number
    comments: number
  }
}

function EditVideo() {
  const params = useParams()
  const router = useRouter()
  const videoId = parseInt(params.id as string)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [video, setVideo] = useState<Video | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    category: '',
    videoSource: '',
    videoUrl: '',
    telegramFileId: '',
    isActive: true
  })

  const categories = [
    { value: "DRAMA_PENDEK", label: "Drama Pendek" },
    { value: "FILM", label: "Film" },
    { value: "SERIAL", label: "Serial TV" },
    { value: "KARTUN", label: "Kartun/Anime" }
  ]

  const videoSources = [
    { value: "TELEGRAM", label: "Telegram" },
    { value: "WEBSITE", label: "Website" }
  ]

  const fetchVideo = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`
        }
      })

      const result = await response.json()

      if (result.success) {
        const videoData = result.data
        setVideo(videoData)
        setFormData({
          title: videoData.title,
          description: videoData.description || '',
          thumbnailUrl: videoData.thumbnailUrl || '',
          category: videoData.category,
          videoSource: videoData.videoSource,
          videoUrl: videoData.videoUrl || '',
          telegramFileId: videoData.telegramFileId || '',
          isActive: videoData.isActive
        })
      } else {
        setError(result.error || 'Failed to fetch video')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.category || !formData.videoSource) {
      setError('Judul, kategori, dan sumber video wajib diisi')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Update local state
        setVideo(result.data)
        
        // Show success message briefly then redirect
        setTimeout(() => {
          router.push('/admin/videos')
        }, 1500)
      } else {
        setError(result.error || 'Failed to update video')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error updating video:', error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FILM': return <Film className="h-4 w-4" />
      case 'SERIAL': return <Tv className="h-4 w-4" />
      case 'KARTUN': return <Users className="h-4 w-4" />
      default: return <Film className="h-4 w-4" />
    }
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading video data...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Video tidak ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Video yang Anda cari tidak ada atau telah dihapus.
            </p>
            <Button onClick={() => router.back()}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-2xl font-bold">Edit Video</h1>
            <p className="text-muted-foreground">
              Edit informasi video: {video.title}
            </p>
          </div>
        </div>
        
        <AdminLogoutButton />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Video berhasil diperbarui! Mengalihkan ke halaman manajemen video...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Video Saat Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">ID</div>
              <div className="font-medium">{video.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Kategori</div>
              <div className="flex items-center gap-2">
                {getCategoryIcon(video.category)}
                <span>{getCategoryLabel(video.category)}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                {video.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{video.isActive ? 'Aktif' : 'Non-aktif'}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Parts</div>
              <div className="font-medium">{video._count.serialParts}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Likes</div>
              <div className="font-medium">{video._count.videoLikes}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Comments</div>
              <div className="font-medium">{video._count.comments}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Informasi Video</CardTitle>
          <CardDescription>
            Perbarui informasi detail untuk video ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Video *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Masukkan judul video"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.value)}
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="videoSource">Sumber Video *</Label>
                  <Select value={formData.videoSource} onValueChange={(value) => handleInputChange('videoSource', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sumber video" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="thumbnailUrl">URL Thumbnail</Label>
                  <Input
                    id="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoUrl">URL Video (untuk Website)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    placeholder="https://example.com/video"
                  />
                </div>

                <div>
                  <Label htmlFor="telegramFileId">Telegram File ID (untuk Telegram)</Label>
                  <Input
                    id="telegramFileId"
                    value={formData.telegramFileId}
                    onChange={(e) => handleInputChange('telegramFileId', e.target.value)}
                    placeholder="File ID dari Telegram"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi video"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Video Aktif</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Terakhir diperbarui: {new Date(video.updatedAt).toLocaleString('id-ID')}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Batal
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(video.category === 'SERIAL' || video.category === 'KARTUN') && (
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push(`/admin/video-parts/${video.id}`)}
                variant="outline"
              >
                Manage Parts ({video._count.serialParts})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function EditVideoPage() {
  return (
    <AdminAuthProvider>
      <EditVideo />
    </AdminAuthProvider>
  )
}