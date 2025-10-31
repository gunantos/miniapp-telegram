# 🚀 GitHub Auto-Push System

Dokumentasi lengkap untuk sistem auto-push ke GitHub yang telah diimplementasikan dalam proyek ini.

## 📋 **Overview**

Sistem ini memungkinkan otomatisasi commit dan push ke GitHub dengan berbagai metode:

1. **Manual Auto-Push** - Push on-demand
2. **Watcher Mode** - Auto-commit berdasarkan perubahan file
3. **GitHub Actions** - CI/CD otomatis
4. **Scheduled Commits** - Commit terjadwal

## 🛠 **Setup Awal**

### **1. Setup GitHub Credentials**

```bash
# Setup credentials untuk auto-push
npm run github:setup
```

Ini akan:
- Mengatur git credential helper
- Membuat file `.git-credentials`
- Mengatur permission yang tepat

### **2. Personal Access Token (PAT)**

Buat GitHub Personal Access Token:
1. Pergi ke GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token dengan permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)

### **3. First Authentication**

```bash
# Push pertama kali (akan diminta username dan token)
git push origin master

# Username: your-github-username
# Password: your-personal-access-token
```

## 📝 **Cara Penggunaan**

### **1. Manual Auto-Push**

```bash
# Push manual semua perubahan
npm run github:push

# Force push (hati-hati digunakan)
npm run github:push:force
```

### **2. Watcher Mode**

```bash
# Jalankan watcher untuk auto-commit setiap 30 detik
npm run github:watch
```

Watcher akan:
- Memantau perubahan file setiap 30 detik
- Auto-commit jika ada perubahan
- Auto-push ke GitHub
- Mengabaikan file di `node_modules/`, `.git/`, `*.log`, dll.

### **3. GitHub Actions**

#### **Auto-Deploy Workflow**
- Trigger pada push ke master
- Build aplikasi
- Deploy ke GitHub Pages

#### **Auto-Commit Workflow**
- Berjalan setiap jam
- Auto-commit perubahan
- Push ke repository

## 🔧 **Konfigurasi**

### **Watcher Configuration**

Edit `scripts/auto-commit-watcher.js`:

```javascript
const config = {
    watchInterval: 30000, // 30 detik
    autoPush: true,
    ignorePatterns: [
        'node_modules/',
        '.git/',
        'dist/',
        'build/',
        '*.log',
        '.env',
        '.env.local'
    ]
};
```

### **GitHub Actions Configuration**

Edit `.github/workflows/auto-deploy.yml`:

```yaml
on:
  push:
    branches: [ master ]
  schedule:
    # Run setiap jam
    - cron: '0 * * * *'
```

## 📁 **File Structure**

```
scripts/
├── auto-push.js              # Script auto-push manual
├── auto-commit-watcher.js    # Script watcher mode
└── setup-github-credentials.js # Setup credentials

.github/workflows/
├── auto-deploy.yml           # Workflow auto-deploy
└── auto-commit.yml           # Workflow auto-commit
```

## 🚨 **Troubleshooting**

### **Authentication Issues**

```bash
# Reset credentials
git config --global credential.helper store
rm -f ~/.git-credentials

# Setup ulang
npm run github:setup
```

### **Push Failed**

```bash
# Check remote configuration
git remote -v

# Setup remote jika belum ada
git remote add origin https://github.com/gunantos/serial-mini-app.git

# Force push (hati-hati)
git push origin master --force
```

### **Watcher Issues**

```bash
# Check jika ada perubahan
git status --porcelain

# Manual commit
git add .
git commit -m "Manual commit"
git push origin master
```

## 🎯 **Best Practices**

### **1. Development Workflow**

```bash
# 1. Jalankan watcher saat development
npm run github:watch

# 2. Atau jalankan manual saat perlu
npm run github:push

# 3. Atau gunakan GitHub Actions untuk otomatisasi penuh
```

### **2. Production Deployment**

```bash
# 1. Build aplikasi
npm run build

# 2. Push ke GitHub
npm run github:push

# 3. GitHub Actions akan auto-deploy
```

### **3. Security Best Practices**

- Jangan commit `.env` files
- Gunakan environment variables untuk sensitive data
- Rotate Personal Access Token secara berkala
- Gunakan GitHub Secrets untuk API keys

## 🔍 **Monitoring**

### **Check GitHub Actions**

1. Pergi ke repository GitHub
2. Klik tab "Actions"
3. Monitor workflow runs

### **Check Commit History**

```bash
# Lihat commit history
git log --oneline

# Lihat remote status
git remote -v

# Check jika ada unpushed commits
git log origin/master..HEAD
```

## 🎉 **Success Indicators**

- ✅ Auto-commit berjalan setiap ada perubahan
- ✅ Auto-push berhasil ke GitHub
- ✅ GitHub Actions berjalan tanpa error
- ✅ Deploy berhasil ke production
- ✅ Commit history terupdate otomatis

---

## 📞 **Support**

Jika mengalami masalah:
1. Check GitHub repository settings
2. Verify Personal Access Token
3. Check network connectivity
4. Review error messages di console
5. Check GitHub Actions logs

System ini dirancang untuk memudahkan development workflow dan memastikan kode selalu ter-backup di GitHub! 🚀