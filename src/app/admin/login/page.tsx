"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Default admin password - in production, this should be more secure
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"
      
      if (password === adminPassword) {
        // Set session storage for authentication
        sessionStorage.setItem('adminAuthenticated', 'true')
        sessionStorage.setItem('adminAuthTime', Date.now().toString())
        
        // Redirect to admin dashboard
        router.push('/admin')
      } else {
        setError("Password salah. Silakan coba lagi.")
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-300">
            Masuk ke dashboard admin untuk mengelola sistem scraping
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-white text-xl">Autentikasi Diperlukan</CardTitle>
            <CardDescription className="text-slate-300">
              Masukkan password admin untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password Admin
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white pr-10"
                    placeholder="Masukkan password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !password}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Halaman ini dilindungi. Akses tidak sah akan dilog.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            🔒 Koneksi aman | Session timeout: 30 menit
          </p>
        </div>
      </div>
    </div>
  )
}