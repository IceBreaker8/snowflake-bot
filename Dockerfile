# Use Node.js 22 LTS on Alpine Linux for a minimal base image
FROM node:22-alpine

# Install pnpm via corepack (built into Node.js)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set production mode — skips dev dependencies and optimizes Node.js runtime
ENV NODE_ENV=production

# Create a non-root user/group (UID/GID 1001) to run the app securely
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set the working directory for all subsequent commands
WORKDIR /app

# Copy package and lockfile first to leverage Docker layer caching
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml ./

# Install production dependencies deterministically from lockfile
RUN pnpm install --frozen-lockfile --prod

# Copy application source code (after install so deps are cached unless package.json changes)
COPY --chown=appuser:appgroup src ./src

# Switch to non-root user — matches the k8s securityContext (runAsUser: 1001)
USER 1001

# Start the Discord bot
CMD ["node", "src/bot.js"]
