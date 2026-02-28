# Use Node.js 22 LTS on Alpine Linux for a minimal base image
FROM node:22-alpine

# Set production mode — makes npm skip dev dependencies and optimizes Node.js runtime
ENV NODE_ENV=production

# Create a non-root user/group (UID/GID 1001) to run the app securely
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set the working directory for all subsequent commands
WORKDIR /app

# Copy package files first (separate from src) to leverage Docker layer caching
COPY --chown=appuser:appgroup package*.json ./

# Install production dependencies deterministically from lockfile, then purge npm cache to reduce image size
RUN npm ci && npm cache clean --force

# Copy application source code (after npm ci so deps are cached unless package.json changes)
COPY --chown=appuser:appgroup src ./src

# Switch to non-root user — matches the k8s securityContext (runAsUser: 1001)
USER 1001

# Start the Discord bot
CMD ["node", "src/bot.js"]
