module.exports = {
  apps: [{
    name: 'cardapio-20210',
    script: 'yarn',
    args: 'start',
    cwd: '/home/deploy/cardapio-20210', // Ajuste o caminho conforme seu servidor
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.outerr.log',
    time: true
  }]
}; 