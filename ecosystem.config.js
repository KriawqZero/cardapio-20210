module.exports = {
  apps: [{
    name: 'cardapio-20210',
    script: 'yarn',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3123
    }
    // PM2 vai usar logs padrão em ~/.pm2/logs/
  }]
}; 