FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)

RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy package files and install production only
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Hugging Face uses port 7860 by default
ENV PORT=7860
ENV NODE_ENV=production

# Expose port
EXPOSE 7860

# Run database migration and start server
CMD npx prisma migrate deploy && npm start
