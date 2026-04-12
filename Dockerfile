# Multi-arch compatible base (node:20-alpine supports amd64/arm64)
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the app
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# Multi-arch compatible runtime (nginx:alpine supports amd64/arm64)
FROM --platform=$TARGETPLATFORM nginx:alpine AS production

# Copy built assets from builder (with env replacement if needed)
COPY --from=builder /app/dist /usr/share/nginx/html
# Create nginx.conf to support env vars in SPA (for vite-env.d.ts vars)
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Copy public assets
COPY public /usr/share/nginx/html

# Production optimizations
LABEL maintainer="jayanth0124/vito-apps" \
      org.opencontainers.image.source="https://github.com/jayanth0124/vito-apps"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Use existing nginx user (alpine has it pre-created, avoids group conflict)
USER 101

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
