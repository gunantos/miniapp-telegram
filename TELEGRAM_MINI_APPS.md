# Telegram Mini Apps Integration

## 🚀 **Overview**

Aplikasi video streaming ini telah diintegrasikan dengan **Telegram Mini Apps** sesuai dengan dokumentasi resmi Telegram. Implementasi ini memungkinkan aplikasi berjalan sebagai mini app di dalam Telegram dengan fitur autentikasi, tracking user, dan history tontonan.

## ✨ **Fitur-fitur yang Diimplementasikan**

### 🔐 **Telegram Authentication**
- **Auto-authentication** saat aplikasi dibuka dari Telegram
- **Data validation** menggunakan HMAC-SHA256 untuk keamanan
- **User management** dengan data lengkap dari Telegram
- **Session management** untuk user experience yang seamless

### 📺 **Video Streaming dengan History**
- **Watch history tracking** - mencatat video yang ditonton
- **Progress tracking** - menyimpan progress tontonan setiap user
- **Resume playback** - lanjutkan menonton dari posisi terakhir
- **Completed indicator** - tanda untuk video yang sudah selesai

### 🎨 **Telegram UI Integration**
- **Theme adaptation** - menyesuaikan tema dengan Telegram (light/dark)
- **Viewport handling** - optimalisasi tampilan untuk berbagai ukuran layar
- **Back button support** - integrasi dengan tombol back Telegram
- **Main button integration** - menggunakan main button Telegram untuk aksi

### 📱 **Responsive Design**
- **Mobile-first** - dioptimalkan untuk penggunaan di mobile
- **Touch-friendly** - kontrol yang mudah digunakan di layar sentuh
- **Orientation support** - mendukung portrait dan landscape video

## 🛠 **Setup & Konfigurasi**

### 1. **Telegram Bot Setup**

Buat bot melalui @BotFather di Telegram:

```
1. Buka Telegram dan cari @BotFather
2. Gunakan perintah /newbot
3. Ikuti instruksi untuk membuat bot
4. Copy BOT_TOKEN yang diberikan
```

### 2. **Environment Configuration**

Tambahkan bot token ke file `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 3. **Mini App Configuration**

Konfigurasi bot untuk mendukung Mini Apps:

```
1. Di @BotFather, gunakan /mybots
2. Pilih bot Anda
3. Pilih Bot Settings > Mini App Settings
4. Atur URL aplikasi Anda
```

## 📋 **Struktur Database**

### **User Model**
```typescript
model User {
  id                    String   @id @default(cuid())
  email                 String?  @unique
  name                  String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Telegram specific fields
  telegramId            Int?     @unique
  telegramUsername      String?
  telegramFirstName      String?
  telegramLastName       String?
  telegramIsBot         Boolean  @default(false)
  telegramLanguageCode  String?
  telegramPhotoUrl      String?
  
  // Relations
  watchHistory          WatchHistory[]
  preferences           UserPreference?
}
```

### **Watch History Model**
```typescript
model WatchHistory {
  id           String   @id @default(cuid())
  userId       String
  videoId      Int
  serialPartId Int?
  watchedAt    DateTime @default(now())
  progress     Float    @default(0)
  duration     Float?
  completed    Boolean  @default(false)
  
  // Relations
  user         User      @relation(fields: [userId], references: [id])
  video        Video     @relation(fields: [videoId], references: [id])
  serialPart   SerialPart? @relation(fields: [serialPartId], references: [id])
}
```

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/telegram` - Authenticate user dengan Telegram initData
- `GET /api/auth/telegram` - Validate session token

### **Watch History**
- `GET /api/user/history` - Get user watch history
- `POST /api/user/history` - Add/update watch history
- `DELETE /api/user/history` - Remove from history

## 🎯 **Cara Penggunaan**

### **Untuk User**

1. **Buka di Telegram**
   - Akses aplikasi melalui link atau bot yang sudah dikonfigurasi
   - Aplikasi akan otomatis mengautentikasi user

2. **Menonton Video**
   - Pilih video dari kategori yang tersedia
   - Progress tontonan akan otomatis disimpan
   - Buka halaman history untuk melihat video yang sudah ditonton

3. **Resume Playback**
   - Video yang sudah ditonton akan menunjukkan progress bar
   - Klik untuk melanjutkan dari posisi terakhir

### **Untuk Developer**

#### **Testing di Luar Telegram**

Untuk development, aplikasi bisa dijalankan di browser biasa:

```bash
npm run dev
```

Aplikasi akan menampilkan mode development dengan warning bahwa berjalan di luar Telegram.

#### **Testing di Telegram**

1. **Deploy aplikasi** ke hosting yang bisa diakses publik
2. **Konfigurasi URL** di @BotFather
3. **Test** dengan membuka mini app dari Telegram

## 📚 **Custom Hooks**

### **useTelegramWebApp**
```typescript
const {
  webApp,
  user,
  isLoading,
  error,
  isReady,
  authenticate,
  sendDataToBot,
  hapticImpact,
  hapticNotification,
  setMainButton,
  hideMainButton,
  showBackButton,
  hideBackButton,
  expand,
  close
} = useTelegramWebApp()
```

### **useAuth**
```typescript
const {
  user,
  sessionToken,
  isLoading,
  error,
  login,
  logout,
  updatePreferences
} = useAuth()
```

### **useWatchHistory**
```typescript
const {
  history,
  isLoading,
  error,
  addToHistory,
  removeFromHistory,
  getVideoProgress,
  refetch
} = useWatchHistory()
```

## 🔐 **Keamanan**

### **Init Data Validation**
- Menggunakan HMAC-SHA256 untuk validasi data dari Telegram
- Secret key dihasilkan dari bot token
- Data-check-string diurutkan dan di-hash untuk verifikasi

### **Session Management**
- Session token disimpan di localStorage
- Token divalidasi di setiap request ke API
- Auto-logout saat token tidak valid

## 🎨 **UI/UX Features**

### **Theme Support**
- Otomatis menyesuaikan dengan tema Telegram (light/dark)
- CSS variables untuk warna tema
- Smooth transitions antar tema

### **Progress Indicators**
- Progress bar pada video card di history
- Completed badge untuk video yang sudah selesai
- Real-time progress update saat menonton

### **Interactive Elements**
- Haptic feedback untuk interaksi
- Smooth animations dan transitions
- Touch-optimized controls

## 🚀 **Deployment**

### **Requirements**
- Node.js 18+
- Database (SQLite untuk development, PostgreSQL untuk production)
- Telegram Bot Token
- Hosting dengan HTTPS (wajib untuk Telegram Mini Apps)

### **Environment Variables**
```env
DATABASE_URL=your_database_url
TELEGRAM_BOT_TOKEN=your_bot_token
NEXTAUTH_URL=your_app_url
```

### **Build & Deploy**
```bash
# Build aplikasi
npm run build

# Start production server
npm start
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Authentication Failed**
   - Pastikan BOT_TOKEN benar di .env
   - Cek apakah initData valid dari Telegram
   - Verifikasi HMAC validation logic

2. **Progress Not Saving**
   - Pastikan user sudah terautentikasi
   - Cek network request ke API
   - Verifikasi database connection

3. **Theme Not Applied**
   - Pastikan Telegram WebApp script terload
   - Cek CSS variables implementation
   - Verifikasi theme params dari Telegram

### **Debug Mode**

Aktifkan debug mode dengan menambahkan ini di `.env`:

```env
DEBUG=telegram
```

## 📖 **Referensi**

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

🎉 **Selamat! Aplikasi Anda sekarang fully integrated dengan Telegram Mini Apps!**