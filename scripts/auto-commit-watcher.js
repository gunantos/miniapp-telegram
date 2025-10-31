#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('👀 Starting auto-commit watcher...');

// Konfigurasi
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

// Fungsi untuk menjalankan command
function runCommand(command, options = {}) {
    try {
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe',
            ...options
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Fungsi untuk check jika file harus di-ignore
function shouldIgnoreFile(filePath) {
    return config.ignorePatterns.some(pattern => {
        if (pattern.endsWith('/')) {
            return filePath.startsWith(pattern);
        }
        return filePath.includes(pattern);
    });
}

// Fungsi untuk check perubahan
function checkForChanges() {
    const result = runCommand('git status --porcelain');
    if (!result.success) {
        console.log('❌ Failed to check git status');
        return false;
    }

    const lines = result.output.trim().split('\n').filter(line => line.trim());
    
    // Filter out ignored files
    const relevantChanges = lines.filter(line => {
        const filePath = line.substring(3); // Skip status prefix
        return !shouldIgnoreFile(filePath);
    });

    return relevantChanges.length > 0;
}

// Fungsi untuk auto-commit dan push
async function autoCommitAndPush() {
    console.log('🔍 Checking for changes...');
    
    if (!checkForChanges()) {
        console.log('✅ No relevant changes detected');
        return;
    }

    console.log('📝 Changes detected, committing...');
    
    // Add semua perubahan
    const addResult = runCommand('git add .');
    if (!addResult.success) {
        console.log('❌ Failed to add files');
        return;
    }

    // Buat commit message
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const commitMessage = `Auto-commit: ${timestamp}`;

    // Commit
    const commitResult = runCommand(`git commit -m "${commitMessage}"`);
    if (!commitResult.success) {
        console.log('❌ Failed to commit');
        return;
    }

    console.log('✅ Committed successfully');

    // Push jika autoPush diaktifkan
    if (config.autoPush) {
        console.log('🚀 Pushing to GitHub...');
        const pushResult = runCommand('git push origin master');
        
        if (pushResult.success) {
            console.log('✅ Pushed to GitHub successfully');
        } else {
            console.log('❌ Failed to push to GitHub');
            console.log('💡 You may need to setup GitHub credentials first');
            console.log('   Run: npm run github:setup');
        }
    }
}

// Fungsi utama watcher
function startWatcher() {
    console.log(`🕐 Auto-commit watcher started (interval: ${config.watchInterval/1000}s)`);
    console.log('📁 Watching for changes...');
    console.log('Press Ctrl+C to stop\n');

    // Check awal
    autoCommitAndPush();

    // Setup interval
    const interval = setInterval(() => {
        autoCommitAndPush();
    }, config.watchInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping auto-commit watcher...');
        clearInterval(interval);
        console.log('✅ Auto-commit watcher stopped');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Stopping auto-commit watcher...');
        clearInterval(interval);
        console.log('✅ Auto-commit watcher stopped');
        process.exit(0);
    });
}

// Jalankan watcher
startWatcher();