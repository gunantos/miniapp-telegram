"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { AdminLogoutButton } from "@/components/admin-logout-button"
import { 
  RefreshCw, 
  Database, 
  Film, 
  Tv, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  Shield
} from "lucide-react"

interface ScrapingStats {
  totalVideos: number
  activeVideos: number
  websiteVideos: number
  publishedVideos: number
  inactiveVideos: number
  categoryStats: Record<string, number>
  recentVideos: Array<{
    id: number
    title: string
    category: string
    lastChecked: string
    isActive: boolean
  }>
}

function AdminDashboard() {
  const [stats, setStats] = useState<ScrapingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [scrapingResult, setScrapingResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/scrape', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      
      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const runScraping = async () => {
    try {
      setScraping(true)
      setError(null)
      setScrapingResult(null)
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-secret-token'}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Scraping failed')
      }
      
      setScrapingResult(data.data)
      
      // Refresh stats after scraping
      await fetchStats()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setScraping(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      default: return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Kelola video, scraping, dan konten platform
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AdminLogoutButton />
          <Button 
            onClick={() => window.open('/admin/videos', '_blank')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Film className="h-4 w-4" />
            Manajemen Video
          </Button>
          <Button 
            onClick={runScraping} 
            disabled={scraping}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? 'Scraping...' : 'Run Scraping'}
          </Button>
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

      {scrapingResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Scraping Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scrapingResult.processed}
                </div>
                <div className="text-sm text-green-700">New Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {scrapingResult.updated}
                </div>
                <div className="text-sm text-blue-700">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {scrapingResult.skipped}
                </div>
                <div className="text-sm text-yellow-700">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {scrapingResult.total}
                </div>
                <div className="text-sm text-purple-700">Total Processed</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">
                  {scrapingResult.breakdown?.movies || 0}
                </div>
                <div className="text-sm text-blue-600">Movies</div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-700">
                  {scrapingResult.breakdown?.series || 0}
                </div>
                <div className="text-sm text-green-600">Series</div>
              </div>
              <div className="text-center p-3 bg-purple-100 rounded-lg">
                <div className="text-lg font-semibold text-purple-700">
                  {scrapingResult.breakdown?.anime || 0}
                </div>
                <div className="text-sm text-purple-600">Anime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading statistics...</p>
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                Videos in database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Videos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeVideos}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.activeVideos / stats.totalVideos) * 100)}% active rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Website Videos</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.websiteVideos}</div>
              <p className="text-xs text-muted-foreground">
                From external sources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedVideos}</div>
              <p className="text-xs text-muted-foreground">
                Published videos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Videos by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium">
                        {getCategoryLabel(category)}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {count} videos
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>
                Recently scraped videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats.recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(video.category)}
                      <div>
                        <div className="font-medium text-sm line-clamp-1">
                          {video.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getCategoryLabel(video.category)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {video.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(video.lastChecked)}
                      </div>
                      {(video.category === 'SERIAL' || video.category === 'KARTUN') && (
                        <Button
                          onClick={() => window.open(`/admin/video-parts/${video.id}`, '_blank')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Manage Parts
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scraping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Sources:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Film: https://tv10.idlixku.com/movie/</li>
                <li>• Serial TV: https://tv10.idlixku.com/tvseries/</li>
                <li>• Kartun/Anime: https://tv10.idlixku.com/genre/anime/</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What gets scraped:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Video metadata (title, description, thumbnail URL)</li>
                <li>• Streaming URLs (not the actual video files)</li>
                <li>• Category and genre information</li>
                <li>• Video availability status</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Automatic duplicate detection</li>
                <li>• Video availability checking</li>
                <li>• Rate limiting to prevent blocking</li>
                <li>• Error handling and retry logic</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminDashboard />
    </AdminAuthProvider>
  )
}