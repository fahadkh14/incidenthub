.PHONY: build up down restart logs ps clean

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart: down up

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-mysql:
	docker compose logs -f mysql

logs-nginx:
	docker compose logs -f nginx

# DANGER: deletes the MySQL volume and all data
clean:
	docker compose down -v
