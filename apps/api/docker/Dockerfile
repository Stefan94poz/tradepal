FROM node:20-alpine AS base

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

WORKDIR /app

# Dependencies Stage
FROM base AS dependencies

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install all dependencies (allow lockfile modifications in container)
RUN yarn install

# Development Stage
FROM base AS development

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/.yarn ./.yarn

# Copy application source
COPY . .

# Expose Medusa port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start development server with migrations
CMD ["sh", "-c", "yarn medusa db:migrate && yarn dev"]
