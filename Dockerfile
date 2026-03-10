# Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/*.cjs ./
# Database folder for persistence (volume mount point)
RUN mkdir -p /app/data

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "server.cjs"]
