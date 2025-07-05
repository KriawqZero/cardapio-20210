# Use a imagem oficial do Node.js baseada em Debian
FROM node:18-bullseye-slim

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock ./

# Instalar dependências
RUN yarn install --frozen-lockfile

# Copiar o código da aplicação
COPY . .

# Gerar o cliente do Prisma
RUN yarn db:generate

# Construir a aplicação
RUN yarn build

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start"] 