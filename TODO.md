# Docker Setup Complete (Multi-Arch Ready)

See TODO-docker-multiarch.md for Buildx instructions.

## Steps Completed:
- ✅ Created Dockerfile (multi-stage Node build + Nginx serve)
- ✅ Created .dockerignore
- ✅ Created this TODO.md

## Next Steps:
1. Build the image: `docker build -t vito-app .`
2. Run the container: `docker run -p 8080:80 vito-app`
3. Access app at http://localhost:8080

## Optional:
- docker-compose.yml for local Supabase if needed (client-side auth handles env vars).
- Push to registry: `docker tag vito-app yourusername/vito-app && docker push ...`

