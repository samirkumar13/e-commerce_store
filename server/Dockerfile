# --- Build stage: install deps, generate Prisma client, compile TS ---
FROM node:20-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npx tsc

# --- Runtime stage ---
FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Copy installed deps (incl. generated Prisma client + prisma CLI for migrations)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# Directory for uploaded images (mount a volume to persist across restarts)
RUN mkdir -p /app/uploads

EXPOSE 5000

# Apply any pending migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
