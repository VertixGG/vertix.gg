// scripts/backup-bot-prisma.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the MongoDB connection string from .env
const dbUrl = process.env.BOT_PRISMA_DATABASE_URL;
if (!dbUrl) {
  console.error('BOT_PRISMA_DATABASE_URL not found in .env');
  process.exit(1);
}

// Prepare backup folder and filename
const backupDir = path.resolve(__dirname, '../_backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}`);

// Run mongodump
try {
  console.log(`Backing up to ${backupPath} ...`);
  execSync(`mongodump --uri="${dbUrl}" --out="${backupPath}"`, { stdio: 'inherit' });
  console.log('Backup completed successfully.');
} catch (err) {
  console.error('Backup failed:', err);
  process.exit(1);
}