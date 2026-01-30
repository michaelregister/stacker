
# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
RUN apk add --no-cache nginx
WORKDIR /app

# Copy backend files
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY service-account-key.json ./
RUN mkdir data

# Copy frontend build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure Nginx to serve frontend and proxy API
RUN echo 'server { listen 80; server_name localhost; root /usr/share/nginx/html; index index.html; location / { try_files $uri /index.html; } location /api { proxy_pass http://127.0.0.1:3001; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_set_header Host $host; proxy_cache_bypass $http_upgrade; } }' > /etc/nginx/http.d/default.conf

# Create a script to start both servers
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx &' >> /app/start.sh && \
    echo 'node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 80 3001
CMD ["/app/start.sh"]


