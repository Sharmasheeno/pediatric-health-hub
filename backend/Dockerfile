FROM node:22-alpine

RUN apk add --no-cache openssl
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/src ./src
ENV NODE_ENV=production PORT=3000
EXPOSE 3000

# The managed MySQL addon must be linked as DATABASE_URL before startup.
CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
