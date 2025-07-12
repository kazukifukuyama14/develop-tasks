include .env.local
export

COMPOSE = docker compose --env-file .env.local -f docker-compose.local.yml
COMPOSE_PROD  = docker compose --env-file .env.local -f docker-compose.prod.yml

.PHONY: up start down clean

up:
	$(COMPOSE) up --build

start:
	$(COMPOSE) up

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --volumes --rmi all --remove-orphans

prod-up:
	$(COMPOSE_PROD) up --build

prod-start:
	$(COMPOSE_PROD) up

prod-down:
	$(COMPOSE_PROD) down

prod-clean:
	$(COMPOSE_PROD) down --volumes --rmi all --remove-orphans