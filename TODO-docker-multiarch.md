# Multi-Architecture Docker Build Instructions

## Setup Buildx (one-time)
```
docker buildx create --name multiarch --driver docker-container --use
docker buildx inspect --bootstrap
```

## Local Multi-Arch Build & Test
```
docker buildx build --platform linux/amd64,linux/arm64 -t vito-app:multi .
docker run --rm -p 8080:80 --platform linux/amd64 vito-app:multi
```

## Production Push to Docker Hub (jayanth0124/vito-apps)
```
docker buildx build --platform linux/amd64,linux/arm64 \
  -t jayanth0124/vito-apps:latest \
  --push .
```

## docker-compose Multi-Arch
```
docker compose up --build
```
Platform auto-detected locally.
