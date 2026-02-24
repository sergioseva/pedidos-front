# Stage 1: Build
FROM node:11.8.0 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build -- --prod

# Stage 2: Serve
FROM nginx:alpine
ARG BUILD_VERSION=dev
COPY --from=build /app/dist/libreria/ /usr/share/nginx/html/
RUN echo "{\"version\":\"$BUILD_VERSION\"}" > /usr/share/nginx/html/version.json
