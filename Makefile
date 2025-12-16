NAME = careerbridge_case3
COMPOSE_DIR = infra/compose
COMPOSE_FILE = $(COMPOSE_DIR)/docker-compose.yml
DOCKER_CMD = docker compose -f $(COMPOSE_FILE) --project-directory $(COMPOSE_DIR) -p $(NAME)

up:
	@$(DOCKER_CMD) up -d --build

build:
	@$(DOCKER_CMD) build

down:
	@$(DOCKER_CMD) down --remove-orphans

clean:
	@$(DOCKER_CMD) down -v --remove-orphans

logs:
	@$(DOCKER_CMD) logs -f

.PHONY: up build down clean logs