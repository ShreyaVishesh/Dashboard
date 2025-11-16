# Multi-stage Dockerfile for Node.js Dashboard Monitoring Application
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
  dumb-init \
  curl \
  && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# ===========================
# Dependencies stage
# ===========================
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# ===========================
# Development stage  
# ===========================
FROM base AS development

# Install development dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs backups && \
  chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# ===========================
# Production stage
# ===========================
FROM base AS production

# Set environment
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p logs backups && \
  chown -R nodejs:nodejs logs backups

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "app.js"]
