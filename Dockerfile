# Stage 1: Build
FROM node:11.8.0 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build -- --prod

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist/libreria/ /usr/share/nginx/html/
