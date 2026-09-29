# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY backend/package*.json ./
RUN npm install --omit=dev
COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3000
CMD ["npm", "start"]
