/**
 * PM2 Ecosystem Configuration
 * 
 * This file configures PM2 to manage the Next.js application
 * With Next.js standalone output, server.js is in .next/standalone/
 */

const path = require('path');

// Determine the correct server.js path
// Next.js standalone output puts server.js in .next/standalone/
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
const fallbackPath = path.join(__dirname, 'server.js');

// Use standalone server if it exists, otherwise fallback to root
const scriptPath = require('fs').existsSync(serverPath) ? serverPath : fallbackPath;

module.exports = {
  apps: [
    {
      name: 'storefront',
      script: scriptPath,
      cwd: require('fs').existsSync(serverPath) ? path.join(__dirname, '.next', 'standalone') : __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
    },
  ],
};
