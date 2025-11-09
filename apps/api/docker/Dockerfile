# Use Node.js v20 Alpine base image
FROM node:20-alpine AS base

# Enable Corepack for Yarn v4
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Set working directory
WORKDIR /server

# Dependencies stage
FROM base AS deps

# Copy package manager configuration files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Final stage
FROM base AS runner

# Copy node_modules from deps stage
COPY --from=deps /server/node_modules ./node_modules
COPY --from=deps /server/.yarn ./.yarn

# Copy application files
COPY . .

# Expose Medusa port
EXPOSE 9000

# Make start script executable
RUN chmod +x start.sh

# Start with migrations and then the development server
CMD ["./start.sh"]
