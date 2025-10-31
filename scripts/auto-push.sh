#!/bin/bash

# Auto-push script untuk GitHub
# Script ini akan otomatis commit dan push perubahan ke GitHub

echo "🚀 Starting auto-push to GitHub..."

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fungsi untuk log dengan warna
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check jika ada perubahan
if [ -z "$(git status --porcelain)" ]; then
    log_info "No changes to commit. Working tree is clean."
    exit 0
fi

# Add semua perubahan
log_info "Adding all changes to git..."
git add .

# Check jika ada file yang ditambahkan
if [ -z "$(git diff --cached --name-only)" ]; then
    log_info "No files to commit."
    exit 0
fi

# Buat commit message otomatis
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MESSAGE="Auto-commit: Update at $TIMESTAMP"

# Commit perubahan
log_info "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Push ke GitHub
log_info "Pushing to GitHub..."
if git push origin master; then
    log_info "✅ Successfully pushed to GitHub!"
else
    log_error "❌ Failed to push to GitHub. Checking remote configuration..."
    
    # Check remote configuration
    if ! git remote -v | grep -q "origin"; then
        log_error "No remote 'origin' configured."
        log_info "Setting up remote..."
        git remote add origin https://github.com/gunantos/serial-mini-app.git
    fi
    
    # Try push again
    log_info "Retrying push..."
    if git push origin master; then
        log_info "✅ Successfully pushed to GitHub on retry!"
    else
        log_error "❌ Still failed to push. Please check your GitHub credentials."
        exit 1
    fi
fi

log_info "🎉 Auto-push completed successfully!"