.PHONY: help build dev prod down logs clean migrate seed backup

# Default target
help:
	@echo "Comandos disponíveis:"
	@echo "  dev         - Subir ambiente de desenvolvimento"
	@echo "  prod        - Subir ambiente de produção"
	@echo "  build       - Build da aplicação"
	@echo "  down        - Parar containers"
	@echo "  logs        - Ver logs"
	@echo "  clean       - Limpar containers e volumes"
	@echo "  migrate     - Executar migrações"
	@echo "  seed        - Executar seed do banco"
	@echo "  backup      - Fazer backup do banco"
	@echo "  test        - Executar testes"

# Desenvolvimento
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Aplicação rodando em: http://localhost:3000"
	@echo "Adminer rodando em: http://localhost:8080"

# Produção
prod:
	docker network create nginx 2>/dev/null || true
	docker-compose up -d

# Build
build:
	docker-compose build

# Parar containers
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

# Ver logs
logs:
	docker-compose logs -f

# Limpar tudo
clean:
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f
	docker volume prune -f

# Migrações
migrate:
	docker-compose exec app npx prisma migrate deploy

migrate-dev:
	docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Seed
seed:
	docker-compose exec app npx prisma db seed

seed-dev:
	docker-compose -f docker-compose.dev.yml exec app npx prisma db seed

# Backup
backup:
	docker-compose exec db mysqldump -u root -p$${DB_ROOT_PASSWORD} $${DB_NAME} > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Testes
test:
	yarn test

# Lint
lint:
	yarn lint

# Instalar dependências
install:
	yarn install

# Gerar Prisma client
generate:
	npx prisma generate

# Reset do banco
reset:
	docker-compose exec app npx prisma migrate reset --force

reset-dev:
	docker-compose -f docker-compose.dev.yml exec app npx prisma migrate reset --force 