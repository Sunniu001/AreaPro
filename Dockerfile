FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies (production only)
RUN pnpm install --frozen-lockfile --prod

# Copy built app
COPY build ./build/

# Run database migration then start
RUN pnpm exec prisma generate

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node_modules/.bin/react-router-serve ./build/server/index.js"]
