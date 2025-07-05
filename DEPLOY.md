# Deploy para Produção

## Pré-requisitos na VPS Debian

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Criar usuário para deploy
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# Criar diretório do projeto
mkdir -p /opt/cardapio-20210
chown deploy:deploy /opt/cardapio-20210
```

## Configuração no GitHub

### Secrets necessários:
- `VPS_HOST`: IP ou domínio da VPS
- `VPS_USER`: usuário SSH (ex: deploy)
- `VPS_SSH_KEY`: chave privada SSH
- `VPS_PORT`: porta SSH (padrão: 22)

### Exemplo de configuração de secrets:
```bash
# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key

# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@your-vps-ip

# Adicionar chave privada como secret no GitHub
cat ~/.ssh/deploy_key
```

## Configuração na VPS

### 1. Clonar repositório
```bash
su - deploy
cd /opt/cardapio-20210
git clone https://github.com/seu-usuario/cardapio-20210.git .
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Criar rede nginx
```bash
docker network create nginx
```

### 4. Configurar proxy reverso (opcional)
Se você usar Traefik ou outro proxy reverso, configure-o para usar a rede `nginx`.

## Primeiro Deploy

```bash
# Fazer build manual primeiro
docker-compose build

# Subir containers
docker-compose up -d

# Executar migrations
docker-compose exec app npx prisma migrate deploy

# Seed do banco (se necessário)
docker-compose exec app npx prisma db seed
```

## Monitoramento

```bash
# Ver logs
docker-compose logs -f

# Status dos containers
docker-compose ps

# Logs específicos
docker-compose logs app
docker-compose logs db
docker-compose logs nginx
```

## Backup do Banco

```bash
# Criar backup
docker-compose exec db mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > backup.sql

# Restaurar backup
docker-compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} < backup.sql
```

## SSL/TLS

Configure SSL usando Let's Encrypt ou outro provedor:

```bash
# Exemplo com certbot
certbot certonly --webroot -w /opt/cardapio-20210/ssl -d seu-dominio.com
```

## Estrutura de Arquivos na VPS

```
/opt/cardapio-20210/
├── docker-compose.yml
├── nginx.conf
├── .env
├── ssl/
│   ├── cert.pem
│   └── key.pem
├── db-backup/
└── uploads/
```

## Troubleshooting

### Problema: Container não inicia
```bash
docker-compose logs app
```

### Problema: Banco não conecta
```bash
docker-compose exec db mysql -u root -p
```

### Problema: Nginx não consegue conectar
```bash
docker network inspect nginx
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker system prune -a
docker volume prune
``` 