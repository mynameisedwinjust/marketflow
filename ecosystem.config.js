// PM2 process file for the Linux VPS:  pm2 start ecosystem.config.js
module.exports = {
  apps: [{
    name: 'marketflow',
    script: 'src/server.js',
    instances: 1,            // keep 1 while data is in memory; raise later with a real database
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
