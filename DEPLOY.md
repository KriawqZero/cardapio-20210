# 🚀 Deploy Cardápio 20210

Sistema básico de CI/CD com PM2 para atualizações em tempo real.

## 📋 Pré-requisitos no Servidor

```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Yarn
npm install -g yarn

# Instalar PM2
npm install -g pm2

# Criar diretório de deploy
sudo mkdir -p /home/deploy
sudo chown $USER:$USER /home/deploy
```

## ⚙️ Configuração Inicial

### 1. No Servidor:
```bash
# Clonar repositório
cd /home/deploy
git clone [URL_DO_SEU_REPO] cardapio-20210
cd cardapio-20210

# Instalar dependências
yarn install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Gerar Prisma Client
yarn db:generate

# Sincronizar banco
yarn db:push

# Build inicial
yarn build

# Criar pasta de logs
mkdir -p logs

# Iniciar com PM2
yarn pm2:start
```

### 2. No GitHub (Secrets):
Adicione estes secrets no repositório:
- `HOST`: IP ou domínio do servidor
- `USERNAME`: usuário SSH (ex: ubuntu, deploy)
- `SSH_KEY`: chave privada SSH
- `PORT`: porta SSH (opcional, padrão 22)

## 🔄 Como Usar

### Deploy Automático:
- **Push para main**: Deploy automático via GitHub Actions
- **Manual**: Actions → Deploy Cardápio 20210 → Run workflow

### Deploy Manual no Servidor:
```bash
cd /home/deploy/cardapio-20210

# Deploy completo
yarn deploy

# Ou passo a passo:
git pull
yarn install
yarn build
yarn db:push
yarn pm2:restart
```

### Comandos PM2 Úteis:
```bash
# Status da aplicação
yarn pm2:status

# Ver logs em tempo real
yarn pm2:logs

# Reiniciar aplicação
yarn pm2:restart

# Parar aplicação
yarn pm2:stop

# Remover do PM2
yarn pm2:delete
```

## 🛠️ Solução de Problemas

### App não inicia:
```bash
# Verificar logs
yarn pm2:logs

# Reiniciar
yarn pm2:restart

# Se não resolver, deletar e recriar
yarn pm2:delete
yarn pm2:start
```

### Deploy falha:
```bash
# Verificar se tem alterações não commitadas
git status

# Forçar atualização
git stash
git pull origin main
yarn deploy
```

### Reverter deploy:
```bash
# Voltar para commit anterior
git log --oneline
git checkout [HASH_DO_COMMIT]
yarn deploy
```

## 📁 Estrutura de Arquivos

```
cardapio-20210/
├── ecosystem.config.js    # Configuração PM2
├── .github/workflows/
│   └── deploy.yml        # CI/CD GitHub Actions
├── logs/                 # Logs do PM2
└── DEPLOY.md            # Esta documentação
```

## 🎯 Fluxo de Deploy

1. **Push para main** → GitHub Actions triggered
2. **Build no runner** → Testa se compila
3. **SSH para servidor** → Executa deploy
4. **PM2 restart** → App atualizado sem downtime

**Tempo típico de deploy: 1-2 minutos** 