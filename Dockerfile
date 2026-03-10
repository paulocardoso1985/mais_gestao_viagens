# Build stage
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/*.cjs ./
# Database folder for persistence (volume mount point)
RUN mkdir -p /app/data

ENV NODE_ENV=production

CMD ["node", "server.cjs"]
