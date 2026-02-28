FROM node:22-alpine

ENV NODE_ENV=production

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=appuser:appgroup src ./src

USER 1001

CMD ["node", "src/bot.js"]
