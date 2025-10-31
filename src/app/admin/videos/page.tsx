"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { AdminLogoutButton } from "@/components/admin-logout-button"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Film, 
  Tv, 
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Video {
  id: number
  title: string
  description?: string
  thumbnailUrl?: string
  status: string
  createdAt: string
  updatedAt: string
  viewCount: number
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

function VideoManagement() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const categories = [
    { value: "ALL", label: "Semua Kategori" },
    { value: "DRAMA_PENDEK", label: "Drama Pendek" },
    { value: "FILM", label: "Film" },
    { value: "SERIAL", label: "Serial" },
    { value: "KARTUN", label: "Kartun" }
  ]

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        category: selectedCategory,
        search: searchQuery,
        page: currentPage.toString(),
        limit: "20"
      })

      const response = await fetch(`/api/admin/videos?${params}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setVideos(result.data)
        setTotalPages(result.pagination.totalPages)
        setTotalItems(result.pagination.total)
      } else {
        setError(result.error || 'Failed to fetch videos')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus video ini? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      setDeletingId(videoId)
      
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`
        }
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the list
        await fetchVideos()
      } else {
        setError(result.error || 'Failed to delete video')
      }
    } catch (error) {
      setError('Network error')
      console.error('Error deleting video:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddVideo = () => {
    router.push('/admin/videos/add')
  }

  const handleEditVideo = (videoId: number) => {
    router.push(`/admin/videos/edit/${videoId}`)
  }

  useEffect(() => {
    fetchVideos()
  }, [selectedCategory, searchQuery, currentPage])

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
            <h1 className="text-2xl font-bold">Manajemen Video</h1>
            <p className="text-muted-foreground">
              Kelola video, tambah, edit, dan hapus konten
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleAddVideo}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Video
          </Button>
          
          <AdminLogoutButton />
        </div>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Video</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Video dalam database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {videos.filter(v => v.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Video aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-aktif</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {videos.filter(v => !v.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Video non-aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serial Parts</CardTitle>
            <Tv className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {videos.reduce((sum, v) => sum + v._count.serialParts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total episode/parts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Video</CardTitle>
          <CardDescription>
            Menampilkan {videos.length} dari {totalItems} video
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8">
              <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada video ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'ALL' 
                  ? 'Coba ubah filter atau pencarian'
                  : 'Mulai tambahkan video pertama Anda'
                }
              </p>
              <Button onClick={handleAddVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Video
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Statistik</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {video.thumbnailUrl && (
                              <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={video.thumbnailUrl} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium line-clamp-1 max-w-xs">
                                {video.title}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                                {video.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(video.category)}
                            <Badge variant="outline">
                              {getCategoryLabel(video.category)}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{formatViewCount(video.viewCount)}</span>
                            </div>
                            <div className="text-muted-foreground">
                              {video._count.videoLikes} likes • {video._count.comments} comments
                            </div>
                            {video._count.serialParts > 0 && (
                              <div className="text-muted-foreground">
                                {video._count.serialParts} parts
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {video.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant={video.isActive ? "default" : "secondary"}>
                              {video.isActive ? 'Aktif' : 'Non-aktif'}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(video.createdAt)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEditVideo(video.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              onClick={() => handleDeleteVideo(video.id)}
                              variant="outline"
                              size="sm"
                              disabled={deletingId === video.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              {deletingId === video.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {(video.category === 'SERIAL' || video.category === 'KARTUN') && (
                              <Button
                                onClick={() => router.push(`/admin/video-parts/${video.id}`)}
                                variant="outline"
                                size="sm"
                              >
                                Parts
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VideoManagementPage() {
  return (
    <AdminAuthProvider>
      <VideoManagement />
    </AdminAuthProvider>
  )
}