// scripts/push-to-github.js
// FuelNow — Push to GitHub via isomorphic-git (no git.exe required)

const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

async function pushToGitHub() {
  const args = process.argv.slice(2);
  const repoUrl = args[0] || process.env.GITHUB_REPO_URL;
  const token = args[1] || process.env.GITHUB_TOKEN;

  if (!repoUrl) {
    console.error('Usage: node scripts/push-to-github.js <REPO_URL> <GITHUB_PERSONAL_ACCESS_TOKEN>');
    console.error('Example: node scripts/push-to-github.js https://github.com/username/FuelNow.git ghp_xxxx');
    process.exit(1);
  }

  console.log(`[Git] Preparing to push to: ${repoUrl}`);

  try {
    // Add or update origin remote
    const remotes = await git.listRemotes({ fs, dir: '.' });
    const hasOrigin = remotes.some(r => r.remote === 'origin');
    
    if (hasOrigin) {
      await git.deleteRemote({ fs, dir: '.', remote: 'origin' });
    }
    await git.addRemote({ fs, dir: '.', remote: 'origin', url: repoUrl });
    console.log('[Git] Configured remote "origin"');

    console.log('[Git] Pushing branch "main"...');
    const pushResult = await git.push({
      fs,
      http,
      dir: '.',
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => {
        return {
          username: token || 'git',
          password: token || ''
        };
      }
    });

    console.log('[Git] Push succeeded! Result:', pushResult);
  } catch (error) {
    console.error('[Git] Push failed:', error.message);
    if (error.data) console.error('[Git] Details:', error.data);
    process.exit(1);
  }
}

pushToGitHub();
