"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

function AddVideo() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
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
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Clear form
        setFormData({
          title: '',
          description: '',
          thumbnailUrl: '',
          category: '',
          videoSource: '',
          videoUrl: '',
          telegramFileId: '',
          isActive: true
        })
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/videos')
        }, 1500)
      } else {
        setError(result.error || 'Failed to create video')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error creating video:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FILM': return <Film className="h-4 w-4" />
      case 'SERIAL': return <Tv className="h-4 w-4" />
      case 'KARTUN': return <Users className="h-4 w-4" />
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
            <h1 className="text-2xl font-bold">Tambah Video Baru</h1>
            <p className="text-muted-foreground">
              Tambahkan video baru ke database
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
              <span>Video berhasil ditambahkan! Mengalihkan ke halaman manajemen video...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informasi Video</CardTitle>
          <CardDescription>
            Isi informasi detail untuk video baru
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
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Batal
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Penting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold">Field yang wajib diisi:</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>Judul Video</li>
                <li>Kategori</li>
                <li>Sumber Video</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Sumber Video:</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li><strong>Telegram:</strong> Isi Telegram File ID jika video disimpan di Telegram</li>
                <li><strong>Website:</strong> Isi URL Video jika video dari website eksternal</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Kategori:</h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li><strong>Drama Pendek:</strong> Video pendek dengan durasi singkat</li>
                <li><strong>Film:</strong> Film layar lebar atau movie</li>
                <li><strong>Serial:</strong> Serial TV dengan multiple episode</li>
                <li><strong>Kartun:</strong> Animasi atau kartun</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AddVideoPage() {
  return (
    <AdminAuthProvider>
      <AddVideo />
    </AdminAuthProvider>
  )
}