# 🚀 Containerização e CI/CD - Cardápio 20210

## 📋 Resumo da Implementação

### ✅ Containerização Completa
- **Dockerfile** multi-stage otimizado para produção
- **docker-compose.yml** para produção (sem portas expostas)
- **docker-compose.dev.yml** para desenvolvimento
- **nginx.conf** com reverse proxy, rate limiting e cache
- **Healthchecks** para monitoramento

### ✅ CI/CD Automatizado
- **GitHub Actions** para build e deploy
- **Testes automáticos** antes do deploy
- **Build Docker** com cache otimizado
- **Deploy automático** na VPS Debian

### 🌐 Rede e Segurança
- **Rede nginx bridge** externa
- **Sem portas expostas** diretamente
- **Headers de segurança** configurados
- **Rate limiting** nas APIs
- **SSL/TLS** ready

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   VPS Debian    │    │   Docker        │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │  ┌─────────────┐│    │  ┌─────────────┐│
│  │   Actions   ││───▶│  │   Deploy    ││───▶│  │  Containers ││
│  │   CI/CD     ││    │  │   Script    ││    │  │             ││
│  └─────────────┘│    │  └─────────────┘│    │  └─────────────┘│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Arquivos Criados

### Docker
- `Dockerfile` - Imagem otimizada para produção
- `docker-compose.yml` - Orquestração para produção
- `docker-compose.dev.yml` - Ambiente de desenvolvimento
- `.dockerignore` - Otimização do build
- `nginx.conf` - Configuração do reverse proxy

### CI/CD
- `.github/workflows/deploy.yml` - Pipeline de deploy
- `DEPLOY.md` - Documentação de deploy
- `Makefile` - Comandos úteis

### Monitoramento
- `src/app/api/health/route.ts` - Health check endpoint
- Healthchecks configurados nos containers

### Configuração
- `.env.example` - Variáveis de ambiente
- `next.config.ts` - Configuração para build standalone

## 🚀 Como Usar

### Desenvolvimento Local
```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Subir ambiente de desenvolvimento
make dev

# Ou diretamente:
docker-compose -f docker-compose.dev.yml up -d
```

### Produção
```bash
# Criar rede nginx
docker network create nginx

# Subir produção
make prod

# Ou diretamente:
docker-compose up -d
```

### Comandos Úteis
```bash
make help          # Ver todos os comandos
make dev           # Desenvolvimento
make prod          # Produção
make logs          # Ver logs
make backup        # Backup do banco
make clean         # Limpar tudo
```

## 🔧 Configuração da VPS

### 1. Pré-requisitos
```bash
# Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com | sh
```

### 2. Configurar GitHub Secrets
- `VPS_HOST` - IP da VPS
- `VPS_USER` - Usuário SSH
- `VPS_SSH_KEY` - Chave privada SSH
- `VPS_PORT` - Porta SSH (22)

### 3. Estrutura na VPS
```
/opt/cardapio-20210/
├── docker-compose.yml
├── nginx.conf
├── .env
├── ssl/
├── db-backup/
└── uploads/
```

## 📊 Monitoramento

### Health Checks
- **App**: `http://localhost:3000/api/health`
- **Nginx**: `http://localhost/health`
- **Database**: Verificação automática

### Logs
```bash
# Todos os logs
docker-compose logs -f

# Logs específicos
docker-compose logs app
docker-compose logs db
docker-compose logs nginx
```

### Status
```bash
# Status dos containers
docker-compose ps

# Recursos utilizados
docker stats
```

## 🔄 Fluxo de Deploy

1. **Push para main** → Trigger GitHub Actions
2. **Testes** → Build e lint automáticos
3. **Build Docker** → Imagem otimizada
4. **Push Registry** → GitHub Container Registry
5. **Deploy VPS** → Pull e restart automático
6. **Migrations** → Banco atualizado
7. **Health Check** → Verificação de saúde

## 🛡️ Segurança

- **Containers** não privilegiados
- **Usuário** dedicado (nextjs)
- **Rede isolada** para banco
- **Headers de segurança** configurados
- **Rate limiting** nas APIs críticas
- **SSL/TLS** pronto para uso

## 📈 Performance

- **Build multi-stage** reduz tamanho da imagem
- **Cache Docker** otimizado
- **Gzip compression** no nginx
- **Static files** com cache de 1 ano
- **Health checks** para recuperação automática

## 🔧 Troubleshooting

Ver documentação completa em `DEPLOY.md`

```bash
# Verificar logs de erro
docker-compose logs app | grep ERROR

# Verificar health checks
docker-compose ps

# Reiniciar serviços
docker-compose restart app

# Limpar e recomeçar
make clean
make prod
```

## 📝 Próximos Passos

1. Configurar SSL com Let's Encrypt
2. Implementar backup automático
3. Adicionar alertas de monitoramento
4. Configurar logs centralizados
5. Implementar blue-green deployment 