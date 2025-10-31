#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Auto-push script untuk GitHub
// Script ini akan otomatis commit dan push perubahan ke GitHub

console.log('🚀 Starting auto-push to GitHub...');

// Warna untuk output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

// Fungsi untuk log dengan warna
function logInfo(message) {
    console.log(`${colors.green}[INFO]${colors.reset} ${message}`);
}

function logWarning(message) {
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function logError(message) {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

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

// Fungsi utama
async function autoPush() {
    try {
        // Check jika ada perubahan
        const statusResult = runCommand('git status --porcelain');
        if (!statusResult.success) {
            logError('Failed to check git status');
            return;
        }

        if (!statusResult.output.trim()) {
            logInfo('No changes to commit. Working tree is clean.');
            return;
        }

        // Add semua perubahan
        logInfo('Adding all changes to git...');
        const addResult = runCommand('git add .');
        if (!addResult.success) {
            logError('Failed to add files to git');
            return;
        }

        // Check jika ada file yang ditambahkan
        const diffResult = runCommand('git diff --cached --name-only');
        if (!diffResult.success) {
            logError('Failed to check staged files');
            return;
        }

        if (!diffResult.output.trim()) {
            logInfo('No files to commit.');
            return;
        }

        // Buat commit message otomatis
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const commitMessage = `Auto-commit: Update at ${timestamp}`;

        // Commit perubahan
        logInfo('Committing changes...');
        const commitResult = runCommand(`git commit -m "${commitMessage}"`);
        if (!commitResult.success) {
            logError('Failed to commit changes');
            return;
        }

        // Push ke GitHub
        logInfo('Pushing to GitHub...');
        const pushResult = runCommand('git push origin master');
        
        if (pushResult.success) {
            logInfo('✅ Successfully pushed to GitHub!');
        } else {
            logError('❌ Failed to push to GitHub. Checking remote configuration...');
            
            // Check remote configuration
            const remoteResult = runCommand('git remote -v');
            if (!remoteResult.success || !remoteResult.output.includes('origin')) {
                logError('No remote "origin" configured.');
                logInfo('Setting up remote...');
                const setupResult = runCommand('git remote add origin https://github.com/gunantos/serial-mini-app.git');
                if (!setupResult.success) {
                    logError('Failed to setup remote repository');
                    return;
                }
            }
            
            // Try push again
            logInfo('Retrying push...');
            const retryResult = runCommand('git push origin master');
            if (retryResult.success) {
                logInfo('✅ Successfully pushed to GitHub on retry!');
            } else {
                logError('❌ Still failed to push. Please check your GitHub credentials.');
                logInfo('You may need to:');
                logInfo('1. Create a GitHub Personal Access Token');
                logInfo('2. Configure git credentials');
                logInfo('3. Or push manually using: git push origin master');
                return;
            }
        }

        logInfo('🎉 Auto-push completed successfully!');
        
    } catch (error) {
        logError(`Unexpected error: ${error.message}`);
    }
}

// Jalankan fungsi utama
autoPush();