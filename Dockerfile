# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
ARG BUILD_VERSION=dev
COPY --from=build /app/dist/libreria/ /usr/share/nginx/html/
RUN echo "{\"version\":\"$BUILD_VERSION\"}" > /usr/share/nginx/html/version.json
