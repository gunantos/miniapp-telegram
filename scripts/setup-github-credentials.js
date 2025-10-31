#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting up GitHub credentials for auto-push...');

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

// Fungsi untuk setup credentials
function setupCredentials() {
    try {
        // Setup git credential helper
        console.log('📝 Setting up git credential helper...');
        const helperResult = runCommand('git config --global credential.helper store');
        if (!helperResult.success) {
            console.log('❌ Failed to setup credential helper');
            return false;
        }

        // Create .git-credentials file
        const homeDir = process.env.HOME || process.env.USERPROFILE;
        const credentialsPath = path.join(homeDir, '.git-credentials');
        
        console.log('📁 Creating credentials file...');
        
        // Check if credentials file exists
        if (fs.existsSync(credentialsPath)) {
            console.log('📋 Credentials file already exists');
        } else {
            // Create empty credentials file
            fs.writeFileSync(credentialsPath, '');
            console.log('✅ Created empty credentials file');
        }

        // Set proper permissions
        try {
            fs.chmodSync(credentialsPath, '600');
            console.log('🔒 Set proper permissions for credentials file');
        } catch (error) {
            console.log('⚠️  Could not set file permissions (this is normal in some environments)');
        }

        console.log('✅ GitHub credentials setup completed!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Create a GitHub Personal Access Token:');
        console.log('   - Go to GitHub → Settings → Developer settings → Personal access tokens');
        console.log('   - Generate new token with "repo" permissions');
        console.log('2. When you first run git push, enter:');
        console.log('   - Username: your GitHub username');
        console.log('   - Password: your Personal Access Token');
        console.log('');
        console.log('🚀 Your credentials will be saved for future auto-pushes!');

        return true;
        
    } catch (error) {
        console.log(`❌ Error setting up credentials: ${error.message}`);
        return false;
    }
}

// Jalankan setup
setupCredentials();